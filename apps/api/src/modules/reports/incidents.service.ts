import { supabaseAdmin } from "../../config/supabase.ts";
import { classifyIncident } from "../../core/incident-engine.ts";
import { computeSlaFromMeasurements } from "../../core/sla-evaluator.ts";
import type { Incident, SlaReportDTO } from "../../core/types.ts";

export interface IncidentReportDTO {
  id: number;
  entidadId: number;
  entidadNombre: string;
  url: string;
  tipoIncidente: string;
  estado: "ABIERTO" | "RESUELTO" | "INVESTIGANDO";
  severidad: "CRITICA" | "MAYOR" | "MENOR" | "ALTA" | "MEDIA" | "BAJA";
  causaRaiz: string;
  timestampInicio: string;
  timestampResolucion: string | null;
  tiempoIndisponibilidadMinutos: number | null;
  intentosFallidosConsecutivos: number;
}

export class IncidentsService {
  /**
   * Sincroniza y consolida incidentes y SLAs desde las mediciones crudas reales
   * hacia las tablas `incidentes` y `evaluaciones_sla` en Supabase.
   */
  async syncIncidentsAndSlas(): Promise<{ totalIncidentes: number; totalSlas: number }> {
    const { data: entities, error: errEnt } = await supabaseAdmin
      .from("entidades")
      .select("id, nombre, url");

    if (errEnt || !entities) {
      throw new Error(`Error al leer entidades: ${errEnt?.message}`);
    }

    const entMap = new Map(entities.map((e) => [e.id, e]));

    const { data: measurements, error: errMed } = await supabaseAdmin
      .from("mediciones_crudas")
      .select("id, entidad_id, fecha_captura, status_code, tiempo_respuesta_ms, disponible, error_conexion")
      .order("fecha_captura", { ascending: true });

    if (errMed || !measurements) {
      throw new Error(`Error al leer mediciones crudas: ${errMed?.message}`);
    }

    // 1. Agrupar mediciones por entidad
    const byEnt = new Map<number, typeof measurements>();
    for (const m of measurements) {
      const list = byEnt.get(m.entidad_id) || [];
      list.push(m);
      byEnt.set(m.entidad_id, list);
    }

    const incidentsToInsert: any[] = [];
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const slasToUpsert: any[] = [];

    for (const [entId, list] of byEnt.entries()) {
      let inIncident = false;
      let currentIncident: any = null;

      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const isFailure =
          !m.disponible || (m.status_code !== null && m.status_code >= 400) || (m.tiempo_respuesta_ms || 0) >= 8000;

        if (isFailure) {
          if (!inIncident) {
            inIncident = true;
            const diag = classifyIncident(m) || {
              tipo: "CAIDA_TOTAL",
              severidad: "CRITICA" as const,
              causa: m.error_conexion || `Fallo de conexión HTTP ${m.status_code}`,
            };

            if (m.error_conexion && m.error_conexion.includes("certificate has expired")) {
              diag.tipo = "ERROR_SSL";
              diag.severidad = "CRITICA";
              diag.causa = "Certificado TLS/SSL institucional vencido o revocado";
            }

            currentIncident = {
              entidad_id: entId,
              tipo_incidente: diag.tipo,
              estado: "ABIERTO",
              severidad: diag.severidad,
              fecha_inicio: m.fecha_captura,
              fecha_resolucion: null,
              duracion_minutos: null,
              intentos_fallidos_consecutivos: 1,
              causa_raiz_aparente: diag.causa,
            };
          } else {
            currentIncident.intentos_fallidos_consecutivos++;
          }
        } else {
          if (inIncident && currentIncident) {
            inIncident = false;
            currentIncident.estado = "RESUELTO";
            currentIncident.fecha_resolucion = m.fecha_captura;
            const start = new Date(currentIncident.fecha_inicio).getTime();
            const end = new Date(m.fecha_captura).getTime();
            currentIncident.duracion_minutos = Math.max(5, Math.round((end - start) / (1000 * 60)));
            incidentsToInsert.push(currentIncident);
            currentIncident = null;
          }
        }
      }

      if (inIncident && currentIncident) {
        const first = new Date(currentIncident.fecha_inicio).getTime();
        const last = new Date(list[list.length - 1].fecha_captura).getTime();
        currentIncident.duracion_minutos = Math.max(5, Math.round((last - first) / (1000 * 60)));
        incidentsToInsert.push(currentIncident);
      }

      // 2. Calcular SLA del mes para la entidad
      const sla = computeSlaFromMeasurements(list as any, currentPeriod);
      const totalCaidaMin = list
        .filter((x) => !x.disponible || (x.status_code && x.status_code >= 400))
        .reduce((acc, _) => acc + 5, 0); // Estimado de 5 min por muestra

      slasToUpsert.push({
        entidad_id: entId,
        periodo: currentPeriod,
        uptime_porcentaje: sla.uptimePorcentaje,
        latencia_promedio_ms: sla.latenciaPromedioMs,
        total_incidentes: incidentsToInsert.filter((i) => i.entidad_id === entId).length,
        total_caida_minutos: totalCaidaMin,
        estado_sla: sla.estadoSla,
      });
    }

    // Insertar en Supabase (limpiar previamente para sincronización limpia)
    await supabaseAdmin.from("incidentes").delete().neq("id", 0);
    if (incidentsToInsert.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("incidentes").insert(incidentsToInsert);
      if (insErr) {
        console.error("Error al insertar incidentes:", insErr);
      }
    }

    if (slasToUpsert.length > 0) {
      const { error: slaErr } = await supabaseAdmin.from("evaluaciones_sla").upsert(slasToUpsert, {
        onConflict: "entidad_id,periodo",
      });
      if (slaErr) {
        console.error("Error al upsert en evaluaciones_sla:", slaErr);
      }
    }

    return {
      totalIncidentes: incidentsToInsert.length,
      totalSlas: slasToUpsert.length,
    };
  }

  /**
   * Obtiene la lista de incidentes consolidados en la base de datos
   */
  async getIncidents(options?: {
    estado?: string;
    entidadId?: number;
    limit?: number;
  }): Promise<IncidentReportDTO[]> {
    let query = supabaseAdmin
      .from("incidentes")
      .select("id, entidad_id, tipo_incidente, estado, severidad, fecha_inicio, fecha_resolucion, duracion_minutos, intentos_fallidos_consecutivos, causa_raiz_aparente")
      .order("fecha_inicio", { ascending: false });

    if (options?.estado) {
      query = query.eq("estado", options.estado.toUpperCase());
    }
    if (options?.entidadId) {
      query = query.eq("entidad_id", options.entidadId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: rows, error } = await query;
    if (error) {
      throw new Error(`Error al consultar incidentes: ${error.message}`);
    }

    // Obtener catálogo para nombres y URLs
    const { data: entities } = await supabaseAdmin.from("entidades").select("id, nombre, url");
    const entMap = new Map(entities?.map((e) => [e.id, e]) || []);

    return (rows || []).map((row) => {
      const ent = entMap.get(row.entidad_id);
      return {
        id: Number(row.id),
        entidadId: row.entidad_id,
        entidadNombre: ent?.nombre || `Entidad Pública #${row.entidad_id}`,
        url: ent?.url || "https://www.gob.pe",
        tipoIncidente: row.tipo_incidente,
        estado: row.estado as any,
        severidad: row.severidad as any,
        causaRaiz: row.causa_raiz_aparente || "Fallo técnico en sonda de disponibilidad",
        timestampInicio: row.fecha_inicio,
        timestampResolucion: row.fecha_resolucion,
        tiempoIndisponibilidadMinutos: row.duracion_minutos,
        intentosFallidosConsecutivos: row.intentos_fallidos_consecutivos,
      };
    });
  }

  /**
   * Obtiene el reporte de SLAs mensuales
   */
  async getSlaReports(options?: { periodo?: string }): Promise<SlaReportDTO[]> {
    const periodo = options?.periodo || new Date().toISOString().substring(0, 7);

    const { data: rows, error } = await supabaseAdmin
      .from("evaluaciones_sla")
      .select("*")
      .eq("periodo", periodo)
      .order("uptime_porcentaje", { ascending: false });

    if (error) {
      throw new Error(`Error al consultar SLAs: ${error.message}`);
    }

    const { data: entities } = await supabaseAdmin.from("entidades").select("id, nombre");
    const entMap = new Map(entities?.map((e) => [e.id, e.nombre]) || []);

    return (rows || []).map((row) => ({
      periodo: row.periodo,
      entidadId: row.entidad_id,
      nombreEntidad: entMap.get(row.entidad_id) || `Entidad #${row.entidad_id}`,
      uptimePorcentaje: Number(row.uptime_porcentaje.toFixed(2)),
      latenciaPromedioMs: Number(row.latencia_promedio_ms.toFixed(1)),
      totalIncidentes: row.total_incidentes,
      totalCaidaMinutos: row.total_caida_minutos,
      estadoSla: row.estado_sla,
    }));
  }

  /**
   * Convierte una lista de incidentes a formato CSV
   */
  toCsv(incidents: IncidentReportDTO[]): string {
    const headers = [
      "id",
      "entidad_id",
      "entidad_nombre",
      "tipo_incidente",
      "estado",
      "severidad",
      "causa_raiz",
      "timestamp_inicio",
      "timestamp_resolucion",
      "duracion_minutos",
      "intentos_fallidos",
    ];

    const lines = [headers.join(",")];
    for (const inc of incidents) {
      lines.push(
        [
          inc.id,
          inc.entidadId,
          `"${inc.entidadNombre.replace(/"/g, '""')}"`,
          inc.tipoIncidente,
          inc.estado,
          inc.severidad,
          `"${(inc.causaRaiz || "").replace(/"/g, '""')}"`,
          inc.timestampInicio,
          inc.timestampResolucion || "",
          inc.tiempoIndisponibilidadMinutos ?? "",
          inc.intentosFallidosConsecutivos,
        ].join(",")
      );
    }
    return lines.join("\n");
  }

  /**
   * Convierte una lista de reportes SLA a formato CSV
   */
  toSlaCsv(slas: SlaReportDTO[]): string {
    const headers = [
      "periodo",
      "entidad_id",
      "nombre_entidad",
      "uptime_porcentaje",
      "latencia_promedio_ms",
      "total_incidentes",
      "total_caida_minutos",
      "estado_sla",
    ];

    const lines = [headers.join(",")];
    for (const sla of slas) {
      lines.push(
        [
          sla.periodo,
          sla.entidadId,
          `"${sla.nombreEntidad.replace(/"/g, '""')}"`,
          sla.uptimePorcentaje,
          sla.latenciaPromedioMs,
          sla.totalIncidentes,
          sla.totalCaidaMinutos,
          sla.estadoSla,
        ].join(",")
      );
    }
    return lines.join("\n");
  }
}

export const incidentsService = new IncidentsService();

