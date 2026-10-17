import { z } from "zod";

// Decodificación transparente de claves de evaluación (si vienen codificadas)
if (!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY_B64) {
  try {
    process.env.GEMINI_API_KEY = Buffer.from(process.env.GEMINI_API_KEY_B64, "base64").toString("utf-8");
  } catch {}
}
if (!process.env.GOOGLE_PAGESPEED_API_KEY && process.env.GOOGLE_PAGESPEED_API_KEY_B64) {
  try {
    process.env.GOOGLE_PAGESPEED_API_KEY = Buffer.from(process.env.GOOGLE_PAGESPEED_API_KEY_B64, "base64").toString("utf-8");
  } catch {}
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Supabase
  SUPABASE_URL: z.string().url("SUPABASE_URL debe ser una URL válida"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY es requerida"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY es requerida"),
  DATABASE_URL: z.string().optional(),
  
  // Google Gemini AI
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  
  // Google PageSpeed
  GOOGLE_PAGESPEED_API_KEY: z.string().optional(),
  
  // Seguridad y Scheduler
  ENABLE_INTERNAL_SCHEDULER: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  ADMIN_API_KEY: z.string().default("dev-secret-key-2026"),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Error en variables de entorno:");
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    }
    // Si estamos en desarrollo, no tiramos el proceso para permitir configurar GEMINI_API_KEY
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
  return result.success ? result.data : (process.env as unknown as EnvConfig);
}

export const env = loadEnv();
