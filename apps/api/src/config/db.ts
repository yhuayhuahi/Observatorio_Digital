import postgres from "postgres";
import { env } from "./env.ts";

let sqlInstance: postgres.Sql | null = null;

export function getPostgresClient(): postgres.Sql | null {
  if (sqlInstance) return sqlInstance;

  if (!env.DATABASE_URL) {
    return null;
  }

  try {
    const parsed = new URL(env.DATABASE_URL);
    const password = decodeURIComponent(parsed.password);
    const projectRef = "judgyvkljqsmxlvlxawg";
    const user = `postgres.${projectRef}`;
    const database = parsed.pathname.replace(/^\//, "") || "postgres";

    // Conexión mediante el IPv4 Connection Pooler de Supabase
    sqlInstance = postgres({
      host: "aws-0-ca-central-1.pooler.supabase.com",
      port: 5432,
      user,
      password,
      database,
      ssl: "require",
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    return sqlInstance;
  } catch (err) {
    console.warn("⚠️ No se pudo inicializar cliente directo de PostgreSQL:", err);
    return null;
  }
}
