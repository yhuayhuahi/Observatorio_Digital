import postgres from "postgres";
import fs from "fs";
import path from "path";

// ==============================================================================
// SCRIPT DE MIGRACIÓN COMPLETO (SOPORTE IPV4 POOLER + DDL)
// Ejecución: bun run setup
// ==============================================================================

async function main() {
  console.log("==================================================");
  console.log("🚀 MIGRACIÓN DE ESQUEMA EN SUPABASE POSTGRESQL");
  console.log("==================================================");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL no encontrada en .env");
    process.exit(1);
  }

  const parsed = new URL(dbUrl);
  const password = parsed.password;
  const projectRef = "judgyvkljqsmxlvlxawg";
  const user = `postgres.${projectRef}`;
  const database = parsed.pathname.replace(/^\//, "") || "postgres";

  console.log("📡 Conectando a Supabase mediante Connection Pooler IPv4 (ca-central-1)...");

  const sql = postgres({
    host: "aws-0-ca-central-1.pooler.supabase.com",
    port: 5432,
    user,
    password,
    database,
    ssl: "require",
    connect_timeout: 10,
    max: 1,
  });

  try {
    const schemaPath = path.resolve("../../docs/schemes/schema_fase1.sql");
    console.log("📄 Leyendo esquema DDL desde docs/schemes/schema_fase1.sql...");
    const ddl = fs.readFileSync(schemaPath, "utf-8");

    console.log("⚙️  Ejecutando DDL en la base de datos...");
    await sql.unsafe(ddl);
    console.log("✅ Tablas 'entidades' y 'mediciones_crudas' e índices verificados/creados.");

    const count = await sql`SELECT count(*)::int as total FROM entidades;`;
    console.log(`📊 Registros actuales en 'entidades': ${count[0].total}`);

    console.log("\n==================================================");
    console.log("🎉 BASE DE DATOS LISTA Y OPERATIVA");
    console.log("==================================================");
  } catch (error: any) {
    console.error("❌ Error:", error.message || error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
