import { supabaseAdmin } from "../../config/supabase.ts";
import { calculateScores } from "../../core/score-engine.ts";
import type { RawMeasurement } from "../../core/types.ts";

export class ExportService {
  async exportData(options: {
    format: "csv" | "json";
    from?: string;
    to?: string;
    categoria?: string;
  }): Promise<{ content: string; contentType: string; filename: string }> {
    // 1. Obtener entidades
    let entQuery = supabaseAdmin
      .from("entidades")
      .select("id, nombre, categoria, region");

    if (options.categoria) {
      entQuery = entQuery.eq("categoria", options.categoria);
    }

    const { data: entities, error: errEnt } = await entQuery;
    if (errEnt) {
      throw new Error(`Error al exportar entidades: ${errEnt.message}`);
    }

    const entityMap = new Map<number, { nombre: string; categoria: string; region: string | null }>();
    for (const ent of entities || []) {
      entityMap.set(ent.id, {
        nombre: ent.nombre,
        categoria: ent.categoria,
        region: ent.region,
      });
    }

    // 2. Obtener mediciones (omitir JSONB de Lighthouse para máxima velocidad)
    let medQuery = supabaseAdmin
      .from("mediciones_crudas")
      .select(
        "id, entidad_id, fecha_captura, status_code, tiempo_respuesta_ms, disponible, lcp_segundos, cls_score, score_desempeno, score_accesibilidad"
      )
      .order("fecha_captura", { ascending: false });

    if (options.from) {
      medQuery = medQuery.gte("fecha_captura", options.from);
    } else {
      // Defecto últimos 30 días
      const d = new Date();
      d.setDate(d.getDate() - 30);
      medQuery = medQuery.gte("fecha_captura", d.toISOString());
    }

    if (options.to) {
      medQuery = medQuery.lte("fecha_captura", options.to);
    }

    const { data: measurements, error: errMed } = await medQuery;
    if (errMed) {
      throw new Error(`Error al exportar mediciones: ${errMed.message}`);
    }

    const timestamp = new Date().toISOString().substring(0, 10).replace(/-/g, "");

    // 3. Formato JSON
    if (options.format === "json") {
      const records = ((measurements || []) as RawMeasurement[])
        .filter((m) => entityMap.has(m.entidad_id))
        .map((m) => {
          const ent = entityMap.get(m.entidad_id)!;
          const scores = calculateScores(m);
          return {
            entidadId: m.entidad_id,
            nombreEntidad: ent.nombre,
            categoria: ent.categoria,
            region: ent.region,
            fechaCaptura: m.fecha_captura,
            statusCode: m.status_code,
            tiempoRespuestaMs: m.tiempo_respuesta_ms,
            disponible: m.disponible,
            lcpSegundos: m.lcp_segundos,
            clsScore: m.cls_score,
            scoreDesempeno: m.score_desempeno,
            scoreAccesibilidad: m.score_accesibilidad,
            scoreGlobal: scores.scoreGlobal,
          };
        });

      return {
        content: JSON.stringify(records, null, 2),
        contentType: "application/json; charset=utf-8",
        filename: `reporte_calidad_digital_${timestamp}.json`,
      };
    }

    // 4. Formato CSV
    const headers = [
      "entidad_id",
      "nombre_entidad",
      "categoria",
      "region",
      "fecha_captura",
      "status_code",
      "tiempo_respuesta_ms",
      "disponible",
      "lcp_segundos",
      "cls_score",
      "score_desempeno",
      "score_accesibilidad",
      "score_global",
    ];

    const lines: string[] = [headers.join(",")];

    for (const m of (measurements || []) as RawMeasurement[]) {
      const ent = entityMap.get(m.entidad_id);
      if (!ent) continue;

      const scores = calculateScores(m);
      const row = [
        m.entidad_id,
        `"${ent.nombre.replace(/"/g, '""')}"`,
        `"${ent.categoria}"`,
        `"${ent.region || ""}"`,
        m.fecha_captura,
        m.status_code,
        m.tiempo_respuesta_ms,
        m.disponible,
        m.lcp_segundos ?? "",
        m.cls_score ?? "",
        m.score_desempeno ?? "",
        m.score_accesibilidad ?? "",
        scores.scoreGlobal,
      ];
      lines.push(row.join(","));
    }

    return {
      content: lines.join("\n"),
      contentType: "text/csv; charset=utf-8",
      filename: `reporte_calidad_digital_${timestamp}.csv`,
    };
  }
}

export const exportService = new ExportService();
