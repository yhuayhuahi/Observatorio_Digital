// =============================================================================
// ADAPTADOR: SupabaseMeasurementRepo
// Implementa IMeasurementRepository usando @supabase/supabase-js.
// Mapea el modelo de dominio RawMeasurement al esquema de mediciones_crudas.
// =============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IMeasurementRepository } from '../../core/ports/measurement-repository.port.ts';
import type { IEntityRepository } from '../../core/ports/entity-repository.port.ts';
import type { RawMeasurement } from '../../core/models/measurement.model.ts';
import type { Entity } from '../../core/models/entity.model.ts';

// SupabaseRepo implementa AMBOS repositorios en una sola conexión
export class SupabaseRepo implements IMeasurementRepository, IEntityRepository {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, serviceKey: string) {
    this.client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
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
  // ---------------------------------------------------------------------------
  async saveBatch(measurements: RawMeasurement[]): Promise<void> {
    if (measurements.length === 0) return;

    const rows = measurements.map((m) => ({
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
      throw new Error(`Error al insertar mediciones crudas: ${error.message}`);
    }
  }
}
