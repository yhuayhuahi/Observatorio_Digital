import { createServer } from "./server.ts";
import { env } from "./config/env.ts";
import { isGeminiConfigured } from "./modules/rag/gemini-client.ts";

const server = createServer();

console.log("==================================================");
console.log("🇵🇪 OBSERVATORIO DE CALIDAD DIGITAL PÚBLICA (API)");
console.log("==================================================");
console.log(`🚀 Servidor HTTP Bun escuchando en: http://localhost:${server.port}`);
console.log(`📡 Modo de Ejecución: ${env.NODE_ENV}`);
console.log(`📦 Supabase URL: ${env.SUPABASE_URL}`);
console.log(
  `🤖 Asistente RAG Gemini: ${
    isGeminiConfigured()
      ? `✅ Activo (${env.GEMINI_MODEL})`
      : "⚠️  Clave pendiente (Configure GEMINI_API_KEY en apps/api/.env)"
  }`
);
console.log(
  `⏱️  Scheduler Interno: ${
    env.ENABLE_INTERNAL_SCHEDULER
      ? "✅ Activo (15:10 PET)"
      : "ℹ️  Desactivado (Recolección autónoma delegada a GitHub Actions)"
  }`
);
console.log("--------------------------------------------------");
console.log("Rutas principales disponibles:");
console.log("  - GET  /api/v1/health");
console.log("  - GET  /api/v1/entities");
console.log("  - GET  /api/v1/entities/:id");
console.log("  - GET  /api/v1/entities/:id/metrics");
console.log("  - GET  /api/v1/rankings");
console.log("  - GET  /api/v1/reports/export?format=csv");
console.log("  - POST /api/v1/chat (SSE streaming disponible con Accept: text/event-stream)");
console.log("  - POST /api/v1/collector/trigger (Admin Bearer)");
console.log("==================================================");
