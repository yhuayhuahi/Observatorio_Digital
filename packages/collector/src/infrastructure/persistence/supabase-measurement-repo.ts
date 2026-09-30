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
      // La inserción incluye el raw de PageSpeed de todas las entidades.
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

  // ---------------------------------------------------------------------------
  // IMeasurementRepository: Persistir lote de mediciones crudas
  // Inserta bloques secuenciales para evitar el statement timeout de PostgreSQL
  // causado por el payload JSON completo de PageSpeed.
  // ---------------------------------------------------------------------------
  async saveBatch(measurements: RawMeasurement[]): Promise<void> {
    if (measurements.length === 0) return;

    for (let offset = 0; offset < measurements.length; offset += INSERT_BATCH_SIZE) {
      const batch = measurements.slice(offset, offset + INSERT_BATCH_SIZE);
      const batchNumber = Math.floor(offset / INSERT_BATCH_SIZE) + 1;
      const rows = batch.map((m) => ({
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

        // Raw completo para trazabilidad
        raw_auditoria: m.audit?.rawAuditoria ?? null,
      }));

      const { error } = await this.client.from('mediciones_crudas').insert(rows);
      if (error) {
        throw new Error(
          `Error al insertar lote ${batchNumber} (${rows.length} mediciones): ${error.message}`
        );
      }

      console.log(
        `✅ Lote ${batchNumber}/${Math.ceil(measurements.length / INSERT_BATCH_SIZE)} insertado (${rows.length} registros).`
      );
    }
  }
}