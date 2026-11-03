import { getPostgresClient } from "../../../config/db.ts";
import { supabaseAdmin } from "../../../config/supabase.ts";

export interface TextToSqlInput {
  query: string;
}

export class TextToSqlTool {
  name = "execute_telemetry_sql";
  description =
    "Permite consultar métricas de disponibilidad, Core Web Vitals, errores WCAG 2.1 y rankings de los 90 portales públicos del Estado Peruano mediante sentencias SELECT seguras.";

  declaration = {
    name: this.name,
    description: this.description,
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description:
            "Sentencia SELECT parametrizada en PostgreSQL sobre las tablas: " +
            "entidades(id, nombre, url, categoria, region, activa), " +
            "evaluaciones_sla(id, entidad_id, periodo, uptime_porcentaje, latencia_promedio_ms, total_incidentes, total_caida_minutos, estado_sla, fecha_calculo), " +
            "incidentes(id, entidad_id, tipo_incidente, estado, severidad, fecha_inicio, fecha_resolucion, duracion_minutos, intentos_fallidos_consecutivos, causa_raiz_aparente), " +
            "mediciones_crudas(id, entidad_id, fecha_captura, status_code, tiempo_respuesta_ms, disponible, error_conexion, lcp_segundos, fid_ms, cls_score, fcp_segundos, ttfb_ms, score_desempeno, score_accesibilidad, errores_accesibilidad).",
        },
      },
      required: ["query"],
    },
  };

  async execute(input: TextToSqlInput): Promise<unknown> {
    const rawSql = input.query.trim();

    // 1. Validaciones estrictas de seguridad (Guardrails)
    if (!rawSql.toUpperCase().startsWith("SELECT")) {
      return {
        error: "Seguridad violada: Solo se permiten sentencias de lectura que inicien con SELECT.",
      };
    }

    const forbidden = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "GRANT", "TRUNCATE", ";--"];
    for (const term of forbidden) {
      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(rawSql)) {
        return {
          error: `Seguridad violada: Palabra clave prohibida detectada '${term}'. Operación abortada.`,
        };
      }
    }

    // Asegurar límite de filas (máximo 20) y remover punto y coma terminal si existiera
    let sanitizedSql = rawSql.replace(/;+\s*$/, "");
    if (!/\bLIMIT\b/i.test(sanitizedSql)) {
      sanitizedSql += " LIMIT 20";
    }

    // 2. Ejecución preferente mediante cliente postgres directo (IPv4 Pooler)
    const sql = getPostgresClient();
    if (sql) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout de consulta SQL (3000 ms)")), 3000)
        );
        const queryPromise = sql.unsafe(sanitizedSql);
        const result = (await Promise.race([queryPromise, timeoutPromise])) as unknown[];
        return {
          rowCount: result.length,
          rows: result.slice(0, 20),
        };
      } catch (err: any) {
        return { error: `Error en PostgreSQL: ${err.message || err}` };
      }
    }

    // Fallback: Si no hay conexión directa postgres, responder mediante consulta de fallback
    return {
      message: "Consulta SQL aceptada pero cliente directo no disponible. Utilice el repositorio de entidades.",
      query: sanitizedSql,
    };
  }
}

export const textToSqlTool = new TextToSqlTool();
