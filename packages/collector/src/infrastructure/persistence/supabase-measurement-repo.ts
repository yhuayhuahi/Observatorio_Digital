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

export class SupabaseRepo implements IMeasurementRepository, IEntityRepository {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, serviceKey: string) {
    this.client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Aumentar timeout para consultas (opcional, pero útil)
      db: { connectionTimeout: 10000 }, // 10 segundos para conectar
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
  // **MODIFICADO: Insertar en lotes de 10 para evitar timeout**
  // ---------------------------------------------------------------------------
  async saveBatch(measurements: RawMeasurement[]): Promise<void> {
    if (measurements.length === 0) return;

    // Tamaño del lote (10 registros por inserción)
    const BATCH_SIZE = 10;

    // Procesar en lotes
    for (let i = 0; i < measurements.length; i += BATCH_SIZE) {
      const batch = measurements.slice(i, i + BATCH_SIZE);

      // Mapear a filas de Supabase
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

      // Insertar el lote
      const { error } = await this.client.from('mediciones_crudas').insert(rows);

      if (error) {
        console.error(`⚠️ Error al insertar lote ${i / BATCH_SIZE + 1}: ${error.message}`);
        // **Continuar con el siguiente lote** (no fallar todo por un error parcial)
        continue;
      } else {
        console.log(`✅ Lote ${i / BATCH_SIZE + 1} insertado (${batch.length} registros).`);
      }
    }
  }
}