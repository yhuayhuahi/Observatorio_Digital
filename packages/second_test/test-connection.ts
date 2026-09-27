import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// SCRIPT DE PRUEBA DE CONEXIÓN A SUPABASE Y GOOGLE PAGESPEED API (CLI)
// Ejecución: bun run test-connection.ts
// ==============================================================================

async function main() {
  console.log("==================================================");
  console.log("🔍 INICIANDO PRUEBAS DE CONECTIVIDAD Y SERVICIOS");
  console.log("==================================================");

  // 1. Detección flexible de variables de Supabase (nombres clásicos y modernos)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const dbUrl = process.env.DATABASE_URL;
  
  // Detección de Google PageSpeed API
  const pagespeedKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY;

  console.log("\n📋 Estado de Variables de Entorno Detectadas (.env):");
  console.log(`   - Supabase URL:             ${supabaseUrl && !supabaseUrl.includes("tu-proyecto") ? "✅ Configurada" : "❌ No detectada o con valor por defecto"}`);
  console.log(`   - Supabase Anon/Publish:    ${anonKey && !anonKey.includes("tu_anon_key") ? "✅ Configurada" : "❌ No detectada"}`);
  console.log(`   - Supabase Service/Secret:  ${serviceKey && !serviceKey.includes("tu_service_role_key") ? "✅ Configurada" : "⚠️  No configurada (usando anon/publish)"}`);
  console.log(`   - PostgreSQL Database URL:  ${dbUrl && !dbUrl.includes("tu_ref") ? "✅ Configurada" : "⚠️  Opcional (no configurada)"}`);
  console.log(`   - Google PageSpeed API Key: ${pagespeedKey && !pagespeedKey.includes("TuClaveDeGoogle") ? "✅ Configurada" : "⚠️  No configurada"}`);

  // ----------------------------------------------------------------------------
  // PARTE 1: PRUEBA DE CONEXIÓN A SUPABASE
  // ----------------------------------------------------------------------------
  console.log("\n--------------------------------------------------");
  console.log("📦 PARTE 1: Verificación de Supabase");
  console.log("--------------------------------------------------");

  if (!supabaseUrl || supabaseUrl.includes("tu-proyecto")) {
    console.error("❌ ERROR: No se encontró una URL válida de Supabase.");
  } else {
    const activeKey = serviceKey && !serviceKey.includes("tu_service_role_key") ? serviceKey : anonKey;

    if (!activeKey || activeKey.includes("tu_anon_key")) {
      console.error("❌ ERROR: No se encontró una API Key (anon/publish o service/secret) válida para Supabase.");
    } else {
      const isService = activeKey === serviceKey;
      console.log(`🔑 Clave activa Supabase: ${isService ? "Service Role / Secret" : "Anon / Publishable"}`);

      try {
        const supabase = createClient(supabaseUrl, activeKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const startTime = performance.now();
        const { data, error, count } = await supabase
          .from("entidades")
          .select("id, nombre, url, categoria", { count: "exact" })
          .limit(5);

        const elapsed = (performance.now() - startTime).toFixed(2);

        if (error) {
          if (error.code === "42P01" || error.message.includes("does not exist")) {
            console.log(`⚠️  Conexión HTTP con Supabase EXITOSA (${elapsed} ms), pero la tabla 'entidades' aún no ha sido creada.`);
            console.log("👉 Recuerda ejecutar docs/schemes/schema_fase1.sql en el SQL Editor de Supabase.");
          } else {
            console.error(`❌ Error al consultar Supabase (${elapsed} ms):`, error.message);
            console.error("   Código:", error.code);
            console.error("   Detalle:", error.details || "Sin detalles adicionales");
          }
        } else {
          console.log(`✅ CONEXIÓN EXITOSA CON SUPABASE (${elapsed} ms)`);
          console.log(`   - Registros encontrados en 'entidades': ${count ?? data?.length ?? 0}`);
          if (data && data.length > 0) {
            console.log("   - Muestra de registros:");
            data.forEach((e) => console.log(`     • [${e.id}] ${e.nombre} (${e.categoria})`));
          } else {
            console.log("   - La tabla 'entidades' existe y está lista para el sembrado inicial.");
          }
        }
      } catch (err: any) {
        console.error("❌ Excepción de red al conectar con Supabase:", err.message || err);
      }
    }
  }

  // ----------------------------------------------------------------------------
  // PARTE 2: PRUEBA DE GOOGLE PAGESPEED INSIGHTS API
  // ----------------------------------------------------------------------------
  console.log("\n--------------------------------------------------");
  console.log("🌐 PARTE 2: Verificación de Google PageSpeed API");
  console.log("--------------------------------------------------");

  if (!pagespeedKey || pagespeedKey.includes("TuClaveDeGoogle")) {
    console.log("⚠️  GOOGLE_PAGESPEED_API_KEY no está configurada.");
    console.log("   (Puedes configurar GOOGLE_PAGESPEED_API_KEY o GOOGLE_API_KEY en .env si cuentas con una)");
  } else {
    console.log("⏳ Enviando solicitud de prueba a Google PageSpeed API...");
    console.log("   (Analizando https://www.gob.pe para verificar cuota y respuesta)...");

    const testUrl = "https://www.gob.pe";
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      testUrl
    )}&key=${encodeURIComponent(pagespeedKey)}&strategy=desktop&category=performance`;

    try {
      const startApiTime = performance.now();
      const response = await fetch(endpoint, {
        headers: { "Accept": "application/json" },
      });
      const apiElapsed = (performance.now() - startApiTime).toFixed(2);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`❌ Error en Google PageSpeed API (${apiElapsed} ms, Status ${response.status}):`);
        if (errorData?.error) {
          console.error(`   Mensaje: ${errorData.error.message}`);
          console.error(`   Causa: ${errorData.error.errors?.[0]?.reason || "Desconocida"}`);
        } else {
          console.error("   Respuesta no satisfactoria de Google.");
        }
      } else {
        const result: any = await response.json();
        const score = result.lighthouseResult?.categories?.performance?.score;
        const lcp = result.lighthouseResult?.audits?.["largest-contentful-paint"]?.displayValue;

        console.log(`✅ CONEXIÓN EXITOSA CON GOOGLE PAGESPEED API (${apiElapsed} ms)`);
        console.log(`   - Portal auditado de prueba: ${testUrl}`);
        console.log(`   - Score de Rendimiento recibido: ${score ? Math.round(score * 100) : "N/A"}/100`);
        console.log(`   - LCP detectado: ${lcp || "N/A"}`);
        console.log("   - Tu API Key está activa y con cuota habilitada.");
      }
    } catch (apiErr: any) {
      console.error("❌ Error de conexión al consultar Google PageSpeed API:", apiErr.message || apiErr);
    }
  }

  console.log("\n==================================================");
  console.log("🏁 RESUMEN DE PRUEBAS COMPLETADO");
  console.log("==================================================");
}

main();
