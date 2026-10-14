// =============================================================================
// ADAPTADOR: SupabaseMeasurementRepo
// Implementa IMeasurementRepository usando @supabase/supabase-js.
// **Modificado para evitar timeout en inserciones masivas.**
// =============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IMeasurementRepository } from '../../core/ports/measurement-repository.port.ts';
import type { IEntityRepository } from '../../core/ports/entity-repository.port.ts';
import type { RawMeasurement } from '../../core/models/measurement.model.ts';
import type { Entity } from '../../core/models/entity.model.ts';

const SUPABASE_REQUEST_TIMEOUT_MS = 120_000;
const INSERT_BATCH_SIZE = 10;

export class SupabaseRepo implements IMeasurementRepository, IEntityRepository {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, serviceKey: string) {
    this.client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { timeout: SUPABASE_REQUEST_TIMEOUT_MS },
    });
  }

  // ---------------------------------------------------------------------------
  // IEntityRepository: Leer entidades activas
  // ---------------------------------------------------------------------------
  async getActiveEntities(): Promise<Entity[]> {
    const { data, error } = await this.client
      .from('entidades')
      .select('id, nombre, url, categoria, region, activa')
      .eq('activa', true)
      .order('id', { ascending: true });

    if (error) {
      throw new Error(`Error al leer entidades activas: ${error.message}`);
    }

    return (data ?? []) as Entity[];
  }

  private mapMeasurementToRow(m: RawMeasurement) {
    return {
      entidad_id: m.entidadId,
      fecha_captura: m.fechaCaptura.toISOString(),

      // Telemetría HTTP
      status_code: m.probe.statusCode,
      tiempo_respuesta_ms: m.probe.tiempoRespuestaMs,
      disponible: m.probe.disponible,
      error_conexion: m.probe.errorConexion,

      // Core Web Vitals
      lcp_segundos: m.audit?.lcpSegundos ?? null,
      fid_ms: m.audit?.fidMs ?? null,
      cls_score: m.audit?.clsScore ?? null,
      fcp_segundos: m.audit?.fcpSegundos ?? null,
      ttfb_ms: m.audit?.ttfbMs ?? null,
      score_desempeno: m.audit?.scoreDesempeno ?? null,

      // Accesibilidad
      score_accesibilidad: m.audit?.scoreAccesibilidad ?? null,
      errores_accesibilidad: m.audit?.erroresAccesibilidad ?? null,
    };
  }

  private async insertRowsWithRetry(rows: any[], maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { error } = await this.client.from('mediciones_crudas').insert(rows);
        if (!error) return;

        console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló al insertar lote (${rows.length} registros): ${error.message}`);
        if (attempt === maxRetries) {
          throw new Error(error.message);
        }
      } catch (err: any) {
        if (attempt === maxRetries) throw err;
        console.warn(`⚠️ Intento ${attempt}/${maxRetries} arrojó excepción de red/gateway: ${err?.message ?? err}`);
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // ---------------------------------------------------------------------------
  // IMeasurementRepository: Persistir lote de mediciones crudas
  // Inserta en lotes de 10 registros limpios (sin raw_auditoria pesado).
  // Cada lote pesa apenas ~15 KB, garantizando inserción instantánea sin timeouts.
  // ---------------------------------------------------------------------------
  async saveBatch(measurements: RawMeasurement[]): Promise<void> {
    if (measurements.length === 0) return;

    const totalBatches = Math.ceil(measurements.length / INSERT_BATCH_SIZE);

    for (let offset = 0; offset < measurements.length; offset += INSERT_BATCH_SIZE) {
      const batch = measurements.slice(offset, offset + INSERT_BATCH_SIZE);
      const batchNumber = Math.floor(offset / INSERT_BATCH_SIZE) + 1;
      const rows = batch.map((m) => this.mapMeasurementToRow(m));

      try {
        await this.insertRowsWithRetry(rows);
        console.log(`✅ Lote ${batchNumber}/${totalBatches} insertado (${rows.length} registros).`);
      } catch (batchError: any) {
        console.warn(`⚠️ Lote ${batchNumber} falló en bloque (${batchError?.message}). Intentando inserción fila por fila como salvaguarda...`);
        for (const row of rows) {
          try {
            await this.insertRowsWithRetry([row], 2);
            console.log(`  ✅ Registro individual para entidad ${row.entidad_id} insertado con éxito.`);
          } catch (rowError: any) {
            console.error(`  ❌ Error insertando entidad ${row.entidad_id}:`, rowError?.message ?? rowError);
          }
        }
      }
    }
  }
}