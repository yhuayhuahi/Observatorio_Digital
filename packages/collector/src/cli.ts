// =============================================================================
// CLI ENTRYPOINT: packages/collector/src/cli.ts
// Punto de entrada para ejecución por GitHub Actions y terminal.
// Uso: bun run start
// Flags opcionales (variables de entorno):
//   AUDIT_BATCH_SIZE=3          → Entidades en paralelo (default: 3)
//   AUDIT_DELAY_MS=1500         → Pausa entre lotes en ms (default: 1500)
//   AUDIT_SOLO_HTTP=true        → Solo sonda HTTP, sin PageSpeed (debug)
// =============================================================================

import { loadConfig } from './infrastructure/config/env.config.ts';
import { SupabaseRepo } from './infrastructure/persistence/supabase-measurement-repo.ts';
import { FetchHttpProbe } from './infrastructure/http/fetch-http-probe.ts';
import { PageSpeedClient } from './infrastructure/google/pagespeed-client.ts';
import { RunFullAuditUseCase } from './application/run-full-audit.usecase.ts';

async function main() {
  const startedAt = new Date().toISOString();

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🇵🇪  OBSERVATORIO DE CALIDAD DIGITAL PÚBLICA DEL PERÚ       ║');
  console.log('║       Módulo de Captura Cruda — Fase 1                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n🕐 Inicio: ${startedAt}`);

  // 1. Cargar y validar configuración (falla rápido si faltan vars)
  let config;
  try {
    config = loadConfig();
    console.log('✅ Variables de entorno validadas.');
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // 2. Leer flags de ejecución desde variables de entorno
  const batchSize = parseInt(process.env.AUDIT_BATCH_SIZE ?? '3', 10);
  const delayMs = parseInt(process.env.AUDIT_DELAY_MS ?? '1500', 10);
  const soloHttp = process.env.AUDIT_SOLO_HTTP === 'true';

  // 3. Componer la arquitectura hexagonal (inyección de dependencias manual)
  const repo = new SupabaseRepo(config.supabaseUrl, config.supabaseServiceKey);
  const httpProbe = new FetchHttpProbe();
  const auditService = new PageSpeedClient(config.googlePageSpeedApiKey);

  const useCase = new RunFullAuditUseCase(repo, repo, httpProbe, auditService);

  // 4. Ejecutar auditoría completa
  try {
    const summary = await useCase.execute({ batchSize, delayMs, soloHttp });

    const endedAt = new Date().toISOString();
    const durMin = (summary.duracionMs / 60_000).toFixed(1);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  📊  RESUMEN DE AUDITORÍA                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`  Total entidades procesadas : ${summary.totalEntidades}`);
    console.log(`  ✅ Exitosas (HTTP + PageSpeed): ${summary.exitosas}`);
    console.log(`  ❌ Con error HTTP           : ${summary.conErrorHttp}`);
    console.log(`  ⚠️  Con error PageSpeed      : ${summary.conErrorPageSpeed}`);
    console.log(`  ⏱️  Duración total           : ${summary.duracionMs}ms (~${durMin} min)`);
    console.log(`  🕐 Finalizado               : ${endedAt}`);
    console.log('');

    // Exit code 0 = éxito (incluso si hay errores parciales de PageSpeed)
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error crítico durante la auditoría:');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
