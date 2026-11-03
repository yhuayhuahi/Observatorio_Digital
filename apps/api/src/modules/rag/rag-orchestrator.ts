import { getGeminiClient, isGeminiConfigured } from "./gemini-client.ts";
import { textToSqlTool } from "./tools/text-to-sql.tool.ts";
import { vectorRetrieverTool } from "./tools/vector-retriever.tool.ts";
import { env } from "../../config/env.ts";
import type {
  ChatRequestDTO,
  ChatResponseDTO,
  NormativeCitationDTO,
  ToolExecutionTraceDTO,
} from "../../core/types.ts";

const SYSTEM_INSTRUCTIONS = `
Eres el Auditor Inteligente del Observatorio de Calidad Digital Pública del Perú, especializado en Gestión de Sistemas y Tecnologías de Información (GSTI).

ESQUEMA RELACIONAL EN POSTGRESQL PARA 'execute_telemetry_sql':
- entidades (id INT PRIMARY KEY, nombre VARCHAR, url VARCHAR, categoria VARCHAR, region VARCHAR, activa BOOLEAN)
  Categorías comunes: 'MINISTERIO', 'GOBIERNO_REGIONAL', 'ORGANISMO_AUTONOMO', 'EMPRESA_ESTATAL'.
- evaluaciones_sla (id BIGINT, entidad_id INT REFERENCES entidades(id), periodo VARCHAR [formato 'AAAA-MM', ej. '2026-10'], uptime_porcentaje FLOAT, latencia_promedio_ms FLOAT, total_incidentes INT, total_caida_minutos INT, estado_sla VARCHAR ['CUMPLE'|'INCUMPLE'], fecha_calculo TIMESTAMPTZ)
- incidentes (id BIGINT, entidad_id INT REFERENCES entidades(id), tipo_incidente VARCHAR, estado VARCHAR ['ABIERTO'|'RESUELTO'], severidad VARCHAR ['CRITICA'|'ALTA'|'MEDIA'|'BAJA'], fecha_inicio TIMESTAMPTZ, fecha_resolucion TIMESTAMPTZ, duracion_minutos INT, intentos_fallidos_consecutivos INT, causa_raiz_aparente TEXT)
- mediciones_crudas (id BIGINT, entidad_id INT REFERENCES entidades(id), fecha_captura TIMESTAMPTZ, status_code INT, tiempo_respuesta_ms FLOAT, disponible BOOLEAN, error_conexion TEXT, lcp_segundos FLOAT, fid_ms FLOAT, cls_score FLOAT, fcp_segundos FLOAT, ttfb_ms FLOAT, score_desempeno INT [0-100], score_accesibilidad INT [0-100], errores_accesibilidad JSONB)

TUS REGLAS INVIOLABLES DE COMPORTAMIENTO (RNF-012):
1. NUNCA inventes métricas de rendimiento, tiempos de carga, códigos de error ni nombres de entidades que no existan. Para conocer los datos reales de cualquier portal público, DEBES consultar la telemetría utilizando la herramienta 'execute_telemetry_sql'.
2. NUNCA inventes números de artículos de ley ni plazos regulatorios. Cita ÚNICAMENTE lo recuperado mediante la herramienta 'search_normative_base' (Leyes peruanas: D.L. 1412, D.S. 029-2021-PCM, R.SGTD 001-2025-PCM/SGTD, WCAG 2.1 AA, Core Web Vitals, ITIL v4).
3. Cuando diagnostiques una falla o bajo puntaje de una entidad, estructura tu dictamen en tres secciones claras:
   a) EVIDENCIA EMPÍRICA: El dato cuantitativo exacto con fecha y hora (ej. LCP de 14.2s, código 403, error de contraste).
   b) MARCO NORMATIVO VULNERADO: El artículo exacto de la ley peruana infringido y el criterio de éxito WCAG 2.1 o estándar Core Web Vitals.
   c) PLAN DE REMEDIACIÓN TÉCNICA: Instrucciones específicas y accionables en código HTML/CSS/servidor para que el equipo de TI de la entidad subsane la vulnerabilidad.
4. Si la base de datos no contiene mediciones para la entidad solicitada, declara con total transparencia: "No se registran mediciones para la entidad solicitada en el catálogo actual".
`;

export class RagOrchestrator {
  async processQuery(
    request: ChatRequestDTO,
    onToken?: (token: string) => void,
    onToolEvent?: (event: "start" | "end", toolName: string, data?: unknown) => void
  ): Promise<ChatResponseDTO> {
    const conversationId = request.conversationId || crypto.randomUUID();
    const citations: NormativeCitationDTO[] = [];
    const toolTraces: ToolExecutionTraceDTO[] = [];

    // Verificación de configuración de API Key
    if (!isGeminiConfigured()) {
      const fallbackMsg =
        "ℹ️ **Modo Demostración / Clave Pendiente:**\n\n" +
        "Para habilitar el asistente inteligente interactivo con Google Gemini (Flash / Flash-Lite), configure su `GEMINI_API_KEY` en el archivo `apps/api/.env`.\n\n" +
        "Mientras tanto, los datos cuantitativos y rankings se encuentran plenamente operativos mediante los endpoints `/api/v1/entities` y `/api/v1/rankings`.";
      
      if (onToken) onToken(fallbackMsg);
      return {
        conversationId,
        message: fallbackMsg,
        citations: [],
        modelUsed: "mock-mode (no-api-key)",
      };
    }

    const ai = getGeminiClient()!;
    const modelName = env.GEMINI_MODEL || "gemini-3.5-flash";

    try {
      // 1. Inferencia inicial con Function Calling
      const chatHistory = (request.history || [])
        .filter((h) => h.content && h.content.trim() !== "")
        .map((h) => ({
          role: h.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: h.content }],
        }));

      const chat = ai.chats.create({
        model: modelName,
        history: chatHistory.length > 0 ? chatHistory : undefined,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          tools: [
            {
              functionDeclarations: [
                textToSqlTool.declaration as any,
                vectorRetrieverTool.declaration as any,
              ],
            },
          ],
        },
      });

      // Ejecutar turno con el mensaje del usuario
      let response = await chat.sendMessage({ message: request.message });

      // Manejo de llamadas a herramientas (Tool Calls) en bucle
      let iterations = 0;
      const MAX_ITERATIONS = 8;
      while (response.functionCalls && response.functionCalls.length > 0 && iterations < MAX_ITERATIONS) {
        iterations++;
        const functionCalls = response.functionCalls;
        const functionResponses = [];

        for (const functionCall of functionCalls) {
          const { name, args } = functionCall;

          if (onToolEvent) onToolEvent("start", name, args);

          const startTime = performance.now();
          let toolResult: unknown = null;

          try {
            if (name === textToSqlTool.name) {
              toolResult = await textToSqlTool.execute(args as any);
            } else if (name === vectorRetrieverTool.name) {
              const ret = await vectorRetrieverTool.execute(args as any);
              toolResult = ret.results;
              if (ret.citations && ret.citations.length > 0) {
                for (const cit of ret.citations) {
                  if (
                    !citations.some(
                      (c) =>
                        c.fuente === cit.fuente &&
                        c.titulo === cit.titulo &&
                        c.seccion === cit.seccion
                    )
                  ) {
                    citations.push(cit);
                  }
                }
              }
            } else {
              toolResult = { error: `Herramienta desconocida: ${name}` };
            }
          } catch (toolErr: any) {
            toolResult = { error: `Fallo al ejecutar herramienta ${name}: ${toolErr.message || toolErr}` };
          }

          const elapsed = Math.round(performance.now() - startTime);
          toolTraces.push({
            toolName: name,
            inputParams: args as any,
            outputResult: toolResult,
            executionTimeMs: elapsed,
          });

          if (onToolEvent) onToolEvent("end", name, toolResult);

          functionResponses.push({
            functionResponse: {
              name,
              response: { result: toolResult },
            },
          });
        }

        // Devolver el resultado de las funciones al modelo para que continúe sintetizando
        response = await chat.sendMessage({
          message: functionResponses,
        });
      }

      let replyText = response.text;
      if (!replyText || replyText.trim() === "") {
        try {
          const finalTurn = await chat.sendMessage({
            message: "Por favor presenta tu dictamen y análisis final estructurado con base en las evidencias y normativas recopiladas.",
          });
          replyText = finalTurn.text;
        } catch {}
      }

      replyText = replyText || "No se pudo generar respuesta para la consulta.";
      if (onToken) {
        onToken(replyText);
      }

      return {
        conversationId,
        message: replyText,
        citations,
        toolCalls: toolTraces,
        modelUsed: modelName,
      };
    } catch (err: any) {
      console.error("❌ Error en RagOrchestrator:", err);
      const errMsg = `Error al procesar consulta RAG: ${err.message || err}`;
      if (onToken) onToken(errMsg);
      return {
        conversationId,
        message: errMsg,
        citations: [],
        modelUsed: modelName,
      };
    }
  }
}

export const ragOrchestrator = new RagOrchestrator();
