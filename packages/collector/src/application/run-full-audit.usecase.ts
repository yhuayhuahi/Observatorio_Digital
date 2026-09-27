// =============================================================================
// CASO DE USO: RunFullAuditUseCase
// Orquestador principal de la auditoría diaria de las 90 entidades.
// Coordina: lectura de entidades → sonda HTTP → auditoría PageSpeed → persistencia.
// =============================================================================

import type { IEntityRepository } from '../core/ports/entity-repository.port.ts';
import type { IMeasurementRepository } from '../core/ports/measurement-repository.port.ts';
import type { IHttpProbe } from '../core/ports/http-probe.port.ts';
import type { IAuditService } from '../core/ports/audit-service.port.ts';
import type { RawMeasurement } from '../core/models/measurement.model.ts';
import type { Entity } from '../core/models/entity.model.ts';
import { runInBatches } from './rate-limiter.ts';

export interface AuditSummary {
  totalEntidades: number;
  exitosas: number;
  conErrorHttp: number;
  conErrorPageSpeed: number;
  duracionMs: number;
}

export interface RunFullAuditOptions {
  /** Entidades en paralelo por lote (default: 3) */
  batchSize?: number;
  /** Pausa entre lotes en ms (default: 1500) */
  delayMs?: number;
  /** Si TRUE, omite la auditoría PageSpeed (solo probe HTTP). Útil para pruebas rápidas. */
  soloHttp?: boolean;
}

export class RunFullAuditUseCase {
  constructor(
    private readonly entityRepo: IEntityRepository,
    private readonly measurementRepo: IMeasurementRepository,
    private readonly httpProbe: IHttpProbe,
    private readonly auditService: IAuditService
  ) {}

  async execute(options: RunFullAuditOptions = {}): Promise<AuditSummary> {
    const { batchSize = 3, delayMs = 1500, soloHttp = false } = options;
    const startTime = performance.now();

    // 1. Cargar entidades activas del catálogo maestro
    console.log('\n📋 Leyendo entidades activas desde Supabase...');
    const entities = await this.entityRepo.getActiveEntities();
    console.log(`   ✅ ${entities.length} entidades activas cargadas.\n`);

    if (entities.length === 0) {
      console.warn('⚠️  No hay entidades activas. Abortando auditoría.');
      return { totalEntidades: 0, exitosas: 0, conErrorHttp: 0, conErrorPageSpeed: 0, duracionMs: 0 };
    }

    // 2. Construir tareas como funciones lazy para el rate limiter
    let exitosas = 0;
    let conErrorHttp = 0;
    let conErrorPageSpeed = 0;
    const measurementsToSave: RawMeasurement[] = [];

    const tasks = entities.map((entity) => async (): Promise<void> => {
      const measurement = await this.auditEntity(entity, soloHttp);
      measurementsToSave.push(measurement);

      if (!measurement.probe.disponible) {
        conErrorHttp++;
        console.log(`  ❌ [${entity.id}] ${entity.nombre} — HTTP ${measurement.probe.statusCode ?? 'ERR'} (${measurement.probe.errorConexion ?? 'no disponible'})`);
      } else if (measurement.audit?.errorAuditoria) {
        conErrorPageSpeed++;
        exitosas++;
        console.log(`  ⚠️  [${entity.id}] ${entity.nombre} — HTTP ✓ | PageSpeed Error: ${measurement.audit.errorAuditoria}`);
      } else {
        exitosas++;
        const perf = measurement.audit?.scoreDesempeno ?? '—';
        const a11y = measurement.audit?.scoreAccesibilidad ?? '—';
        const lcp = measurement.audit?.lcpSegundos != null ? `${measurement.audit.lcpSegundos}s` : '—';
        console.log(
          `  ✅ [${entity.id}] ${entity.nombre} — HTTP ${measurement.probe.statusCode} (${measurement.probe.tiempoRespuestaMs}ms) | Perf:${perf} A11y:${a11y} LCP:${lcp}`
        );
      }
    });

    // 3. Ejecutar en lotes controlados
    console.log(`🚀 Iniciando auditoría de ${entities.length} entidades (lotes de ${batchSize})...`);
    if (soloHttp) console.log('   ℹ️  Modo soloHttp: omitiendo auditoría PageSpeed.');
    console.log('');

    await runInBatches(tasks, { batchSize, delayBetweenBatchesMs: delayMs });

    // 4. Persistir todas las mediciones en un solo batch a Supabase
    console.log(`\n💾 Guardando ${measurementsToSave.length} mediciones en Supabase...`);
    await this.measurementRepo.saveBatch(measurementsToSave);
    console.log(`   ✅ Persistencia completada.`);

    const duracionMs = Math.round(performance.now() - startTime);

    return {
      totalEntidades: entities.length,
      exitosas,
      conErrorHttp,
      conErrorPageSpeed,
      duracionMs,
    };
  }

  private async auditEntity(entity: Entity, soloHttp: boolean): Promise<RawMeasurement> {
    const fechaCaptura = new Date();

    // Sonda HTTP siempre ejecuta
    const probe = await this.httpProbe.checkAvailability(entity.url);

    // Auditoría PageSpeed solo si el portal responde y no estamos en modo soloHttp
    let audit = null;
    if (!soloHttp && probe.disponible) {
      audit = await this.auditService.runAudit(entity.url);
    }

    return {
      entidadId: entity.id,
      fechaCaptura,
      probe,
      audit,
    };
  }
}
