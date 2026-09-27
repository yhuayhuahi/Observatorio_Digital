import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ==============================================================================
// SCRIPT DE SEMBRADO DE LAS 90 ENTIDADES (VÍA SUPABASE HTTPS REST API)
// Ejecución: bun run seed-entities.ts
// ==============================================================================

interface EntityRow {
  nombre: string;
  url: string;
  categoria: string;
  region: string | null;
  activa: boolean;
}

function parseCsv(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values.map((v) => v.replace(/^"|"$/g, "").trim());
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = cols[idx];
      });
      rows.push(row);
    }
  }
  return rows;
}

async function main() {
  console.log("==================================================");
  console.log("🌱 SEMBRADO DE ENTIDADES - SUPABASE REST API");
  console.log("==================================================");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl) {
    console.error("❌ ERROR: SUPABASE_URL no está configurada.");
    process.exit(1);
  }

  const activeKey = serviceKey || anonKey;
  if (!activeKey) {
    console.error("❌ ERROR: No se encontró clave de API de Supabase.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, activeKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Cargar las 90 entidades desde los archivos CSV limpios
  console.log("\n📂 Leyendo archivos CSV de entidades limpias (scraping/filtered/)...");
  const baseDir = path.resolve("../../scraping/filtered");
  const allEntities: EntityRow[] = [];

  // Gobiernos Regionales (25)
  const goreRows = parseCsv(path.join(baseDir, "gobiernos_regionales.csv"));
  for (const r of goreRows) {
    const region = r.nombre.replace("Web de Gobierno Regional", "").trim();
    allEntities.push({
      nombre: r.nombre,
      url: r.url,
      categoria: "GORE",
      region: region.charAt(0).toUpperCase() + region.slice(1),
      activa: true,
    });
  }

  // Municipalidades Provinciales (30)
  const muniRows = parseCsv(path.join(baseDir, "municipalidades_provinciales_top30.csv"));
  for (const r of muniRows) {
    allEntities.push({
      nombre: r.nombre,
      url: r.url,
      categoria: "Municipalidad Provincial",
      region: r.region || null,
      activa: true,
    });
  }

  // Organismos Autónomos (15)
  const orgRows = parseCsv(path.join(baseDir, "organismos_autonomos.csv"));
  for (const r of orgRows) {
    allEntities.push({
      nombre: r.nombre,
      url: r.url,
      categoria: "Organismo Autónomo",
      region: null,
      activa: true,
    });
  }

  // Poder Ejecutivo (20: Presidencia + PCM + 18 Ministerios)
  const ejecRows = parseCsv(path.join(baseDir, "poder_ejecutivo.csv"));
  for (const r of ejecRows) {
    allEntities.push({
      nombre: r.nombre,
      url: r.url,
      categoria: "Ministerio",
      region: null,
      activa: true,
    });
  }

  console.log(`📊 Total de entidades procesadas: ${allEntities.length}`);

  // 2. Insertar / Actualizar en Supabase
  console.log("\n📡 Enviando entidades a Supabase mediante HTTPS...");
  const { data, error } = await supabase
    .from("entidades")
    .upsert(allEntities, { onConflict: "url" })
    .select("id, nombre, categoria, region, url");

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist") || error.code === "PGRST205") {
      console.error("\n❌ ERROR: La tabla 'entidades' aún no existe en Supabase.");
      console.log("👉 Por favor ingresa a tu Supabase Dashboard > SQL Editor, pega el contenido de docs/schemes/schema_fase1.sql y haz clic en RUN.");
    } else {
      console.error("\n❌ Error devuelto por Supabase:", error.message);
      console.error("   Código:", error.code);
    }
    process.exit(1);
  }

  console.log(`✅ ${data?.length ?? allEntities.length} entidades sembradas/actualizadas con éxito en Supabase.`);

  // 3. Verificación de conteos
  const { count } = await supabase
    .from("entidades")
    .select("*", { count: "exact", head: true });

  console.log(`\n🏆 Verificación final: ${count} registros confirmados en la tabla 'entidades'.`);
  console.log("==================================================");
  console.log("🎉 SEMBRADO COMPLETADO SATISFACTORIAMENTE");
  console.log("==================================================");
}

main();
