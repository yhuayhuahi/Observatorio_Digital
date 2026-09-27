// =============================================================================
// CONFIG: Validación y carga de variables de entorno
// Falla rápido con mensaje claro si falta alguna variable crítica.
// =============================================================================

export interface AppConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  googlePageSpeedApiKey: string;
}

export function loadConfig(): AppConfig {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  const googlePageSpeedApiKey =
    process.env.GOOGLE_PAGESPEED_API_KEY ||
    process.env.PAGESPEED_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const missing: string[] = [];

  if (!supabaseUrl || supabaseUrl.includes('tu-proyecto')) {
    missing.push('SUPABASE_URL');
  }
  if (!supabaseServiceKey || supabaseServiceKey.includes('tu_service')) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!googlePageSpeedApiKey || googlePageSpeedApiKey.includes('TuClave')) {
    missing.push('GOOGLE_PAGESPEED_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables de entorno faltantes o con valor por defecto:\n` +
        missing.map((v) => `   - ${v}`).join('\n') +
        `\n\nVerifica tu archivo .env en packages/collector/.env`
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseServiceKey: supabaseServiceKey!,
    googlePageSpeedApiKey: googlePageSpeedApiKey!,
  };
}
