import { entitiesService } from "./modules/entities/entities.service.ts";
import { rankingsService } from "./modules/rankings/rankings.service.ts";
import { exportService } from "./modules/reports/export.service.ts";
import { incidentsService } from "./modules/reports/incidents.service.ts";
import { ragOrchestrator } from "./modules/rag/rag-orchestrator.ts";
import { supabaseAdmin } from "./config/supabase.ts";
import { env } from "./config/env.ts";

export function createServer(port: number = env.PORT) {
  const server = Bun.serve({
    port,
    async fetch(req: Request): Promise<Response> {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;
      const startTime = performance.now();

      // Cabeceras CORS estándar
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      };

      // Manejo de preflight OPTIONS
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const jsonResponse = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}) => {
        const elapsed = (performance.now() - startTime).toFixed(2);
        return new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Response-Time": `${elapsed}ms`,
            ...corsHeaders,
            ...extraHeaders,
          },
        });
      };

      try {
        // =====================================================================
        // 1. Healthcheck y Raíz
        // =====================================================================
        if (path === "/" || path === "/health" || path === "/api/v1/health") {
          return jsonResponse({
            success: true,
            status: "ONLINE",
            service: "Observatorio de Calidad Digital Pública (API)",
            version: "1.0.0",
            timestamp: new Date().toISOString(),
          });
        }

        // =====================================================================
        // 2. Endpoints de Entidades (/api/v1/entities)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/entities") {
          const categoria = url.searchParams.get("categoria") || undefined;
          const region = url.searchParams.get("region") || undefined;
          const activaParam = url.searchParams.get("activa");
          const activa = activaParam !== null ? activaParam === "true" : undefined;
          const page = Number(url.searchParams.get("page")) || 1;
          const pageSize = Number(url.searchParams.get("pageSize")) || 100;

          const result = await entitiesService.getEntities({
            categoria,
            region,
            activa,
            page,
            pageSize,
          });

          return jsonResponse({
            success: true,
            data: result.data,
            meta: {
              total: result.total,
              page: result.page,
              pageSize: result.pageSize,
            },
          });
        }

        // Detalle de entidad individual (/api/v1/entities/:id)
        const entityIdMatch = path.match(/^\/api\/v1\/entities\/(\d+)$/);
        if (method === "GET" && entityIdMatch) {
          const id = Number(entityIdMatch[1]);
          const detail = await entitiesService.getEntityDetail(id);
          if (!detail) {
            return jsonResponse(
              { success: false, error: { code: "NOT_FOUND", message: `Entidad con ID ${id} no encontrada.` } },
              404
            );
          }
          return jsonResponse({ success: true, data: detail });
        }

        // Historial de métricas (/api/v1/entities/:id/metrics)
        const metricsMatch = path.match(/^\/api\/v1\/entities\/(\d+)\/metrics$/);
        if (method === "GET" && metricsMatch) {
          const id = Number(metricsMatch[1]);
          const limit = Number(url.searchParams.get("limit")) || 30;
          const from = url.searchParams.get("from") || undefined;
          const to = url.searchParams.get("to") || undefined;

          const metrics = await entitiesService.getEntityMetrics(id, { limit, from, to });
          return jsonResponse({
            success: true,
            data: metrics,
            meta: { count: metrics.length, entidadId: id },
          });
        }

        // =====================================================================
        // 3. Endpoint de Rankings (/api/v1/rankings)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/rankings") {
          const categoria = url.searchParams.get("categoria") || undefined;
          const region = url.searchParams.get("region") || undefined;
          const orderBy = (url.searchParams.get("orderBy") as any) || "scoreGlobal";
          const format = url.searchParams.get("format");

          const rankings = await rankingsService.getRankings({ categoria, region, orderBy });

          if (format === "csv") {
            const headers = [
              "posicion",
              "entidad_id",
              "nombre",
              "url",
              "categoria",
              "region",
              "score_global",
              "score_disponibilidad",
              "score_desempeno",
              "score_accesibilidad",
              "estado_sla",
            ];
            const lines = [headers.join(",")];
            for (const r of rankings.data) {
              lines.push(
                [
                  r.posicion,
                  r.id,
                  `"${r.nombre.replace(/"/g, '""')}"`,
                  `"${r.url}"`,
                  `"${r.categoria}"`,
                  `"${r.region || ""}"`,
                  r.scoreGlobal,
                  r.scoreDisponibilidad,
                  r.scoreDesempeno,
                  r.scoreAccesibilidad,
                  r.estadoSla,
                ].join(",")
              );
            }
            return new Response(lines.join("\n"), {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="ranking_nacional_calidad_digital.csv"',
                ...corsHeaders,
              },
            });
          }

          return jsonResponse({
            success: true,
            data: rankings.data,
            meta: { total: rankings.total, orderBy },
          });
        }

        // =====================================================================
        // 4. Endpoint de Exportación de Reportes (/api/v1/reports/export)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/reports/export") {
          const format = url.searchParams.get("format") === "json" ? "json" : "csv";
          const from = url.searchParams.get("from") || undefined;
          const to = url.searchParams.get("to") || undefined;
          const categoria = url.searchParams.get("categoria") || undefined;

          const exportResult = await exportService.exportData({ format, from, to, categoria });

          return new Response(exportResult.content, {
            status: 200,
            headers: {
              "Content-Type": exportResult.contentType,
              "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
              ...corsHeaders,
            },
          });
        }

        // =====================================================================
        // 5. Historial de Incidentes ITIL v4 (/api/v1/reports/incidents)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/reports/incidents") {
          const estado = url.searchParams.get("estado") || undefined;
          const entidadIdParam = url.searchParams.get("entidadId");
          const limitParam = url.searchParams.get("limit");
          const format = url.searchParams.get("format") === "csv" ? "csv" : "json";

          const entidadId = entidadIdParam ? parseInt(entidadIdParam, 10) : undefined;
          const limit = limitParam ? parseInt(limitParam, 10) : undefined;

          const incidents = await incidentsService.getIncidents({ estado, entidadId, limit });

          if (format === "csv") {
            const csv = incidentsService.toCsv(incidents);
            const timestamp = new Date().toISOString().substring(0, 10).replace(/-/g, "");
            return new Response(csv, {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="reporte_incidentes_${timestamp}.csv"`,
                ...corsHeaders,
              },
            });
          }

          return jsonResponse({
            success: true,
            data: incidents,
            meta: { total: incidents.length },
          });
        }

        // =====================================================================
        // 6. Reporte de Cumplimiento SLA ITIL v4 (/api/v1/reports/sla)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/reports/sla") {
          const periodo = url.searchParams.get("periodo") || undefined;
          const format = url.searchParams.get("format") === "csv" ? "csv" : "json";

          const slas = await incidentsService.getSlaReports({ periodo });

          if (format === "csv") {
            const csv = incidentsService.toSlaCsv(slas);
            const periodKey = periodo || new Date().toISOString().substring(0, 7);
            return new Response(csv, {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="reporte_sla_${periodKey}.csv"`,
                ...corsHeaders,
              },
            });
          }

          return jsonResponse({
            success: true,
            data: slas,
            meta: { total: slas.length, periodo: periodo || new Date().toISOString().substring(0, 7) },
          });
        }

        // =====================================================================
        // 7. Reporte Consolidado de Accesibilidad WCAG 2.1 AA (/api/v1/reports/accessibility)
        // =====================================================================
        if (method === "GET" && path === "/api/v1/reports/accessibility") {
          const format = url.searchParams.get("format") === "csv" ? "csv" : "json";

          const { data: entities } = await supabaseAdmin.from("entidades").select("id, nombre, url");
          const entMap = new Map((entities || []).map((e) => [e.id, e]));

          const { data: measurements } = await supabaseAdmin
            .from("mediciones_crudas")
            .select("entidad_id, fecha_captura, score_accesibilidad, errores_accesibilidad")
            .not("errores_accesibilidad", "is", null)
            .order("fecha_captura", { ascending: false });

          const seen = new Set<number>();
          const violationsList: any[] = [];

          for (const m of measurements || []) {
            if (seen.has(m.entidad_id)) continue;
            seen.add(m.entidad_id);

            const ent = entMap.get(m.entidad_id);
            const errs = Array.isArray(m.errores_accesibilidad) ? m.errores_accesibilidad : [];

            for (const err of errs) {
              const selector = Array.isArray(err.elementosInfractores) && err.elementosInfractores[0]
                ? String(err.elementosInfractores[0]).substring(0, 150)
                : "Elemento no especificado";

              violationsList.push({
                entidadId: m.entidad_id,
                entidadNombre: ent?.nombre || `Entidad #${m.entidad_id}`,
                criterioWcag: err.id || "wcag-general",
                titulo: err.titulo || "Infracción de accesibilidad",
                descripcion: err.descripcion || "",
                selector,
                scoreAccesibilidad: m.score_accesibilidad,
                fechaAuditoria: m.fecha_captura,
              });
            }
          }

          if (format === "csv") {
            const headers = [
              "entidad_id",
              "entidad_nombre",
              "criterio_wcag",
              "titulo",
              "descripcion",
              "selector",
              "score_accesibilidad",
              "fecha_auditoria",
            ];
            const lines = [headers.join(",")];
            for (const v of violationsList) {
              lines.push(
                [
                  v.entidadId,
                  `"${v.entidadNombre.replace(/"/g, '""')}"`,
                  `"${v.criterioWcag.replace(/"/g, '""')}"`,
                  `"${v.titulo.replace(/"/g, '""')}"`,
                  `"${v.descripcion.replace(/"/g, '""')}"`,
                  `"${v.selector.replace(/"/g, '""')}"`,
                  v.scoreAccesibilidad,
                  v.fechaAuditoria,
                ].join(",")
              );
            }
            return new Response(lines.join("\n"), {
              status: 200,
              headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="auditoria_accesibilidad_wcag.csv"',
                ...corsHeaders,
              },
            });
          }

          return jsonResponse({
            success: true,
            data: violationsList,
            meta: { total: violationsList.length },
          });
        }

        // =====================================================================
        // 8. Endpoint de Chat RAG con Streaming SSE (/api/v1/chat)
        // =====================================================================
        if (method === "POST" && path === "/api/v1/chat") {
          const body = (await req.json().catch(() => ({}))) as any;
          if (!body.message || typeof body.message !== "string") {
            return jsonResponse(
              { success: false, error: { code: "BAD_REQUEST", message: "El campo 'message' es requerido." } },
              400
            );
          }

          const acceptHeader = req.headers.get("accept") || "";
          const wantsStream = acceptHeader.includes("text/event-stream");

          if (!wantsStream) {
            // Respuesta JSON estándar
            const result = await ragOrchestrator.processQuery({
              message: body.message,
              conversationId: body.conversationId,
              history: body.history,
            });
            return jsonResponse({ success: true, data: result });
          }

          // Respuesta con Server-Sent Events (SSE)
          const stream = new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();

              const sendEvent = (event: string, data: unknown) => {
                try {
                  if (controller.desiredSize !== null) {
                    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(payload));
                  }
                } catch {
                  // Conexión interrumpida por el cliente
                }
              };

              try {
                const result = await ragOrchestrator.processQuery(
                  {
                    message: body.message,
                    conversationId: body.conversationId,
                    history: body.history,
                  },
                  (token) => {
                    sendEvent("token", { delta: token });
                  },
                  (toolEvent, toolName, data) => {
                    sendEvent(toolEvent === "start" ? "tool_start" : "tool_end", {
                      tool: toolName,
                      payload: data,
                    });
                  }
                );

                sendEvent("done", {
                  conversationId: result.conversationId,
                  citations: result.citations,
                  modelUsed: result.modelUsed,
                });
                if (controller.desiredSize !== null) {
                  controller.close();
                }
              } catch (err: any) {
                sendEvent("error", { message: err.message || err });
                try {
                  if (controller.desiredSize !== null) {
                    controller.close();
                  }
                } catch {}
              }
            },
          });

          return new Response(stream, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              ...corsHeaders,
            },
          });
        }

        // =====================================================================
        // 6. Endpoint Administrativo de Disparo de Colector (/api/v1/collector/trigger)
        // =====================================================================
        if (method === "POST" && path === "/api/v1/collector/trigger") {
          const authHeader = req.headers.get("Authorization") || "";
          const token = authHeader.replace(/^Bearer\s+/i, "").trim();

          if (!token || token !== env.ADMIN_API_KEY) {
            return jsonResponse(
              { success: false, error: { code: "UNAUTHORIZED", message: "Credenciales de administrador inválidas." } },
              401
            );
          }

          return jsonResponse(
            {
              success: true,
              message: "Auditoría manual registrada. La recolección diaria corre de forma desacoplada en GitHub Actions.",
              jobId: `job-${Date.now()}`,
            },
            202
          );
        }

        // Ruta no encontrada
        return jsonResponse(
          { success: false, error: { code: "NOT_FOUND", message: `Ruta ${method} ${path} no encontrada.` } },
          404
        );
      } catch (err: any) {
        console.error(`💥 Error no capturado en ${method} ${path}:`, err);
        return jsonResponse(
          { success: false, error: { code: "INTERNAL_ERROR", message: err.message || "Error interno del servidor" } },
          500
        );
      }
    },
  });

  return server;
}
