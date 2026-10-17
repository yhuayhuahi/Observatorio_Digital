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
      // Usamos el cliente oficial de Google GenAI
      const chat = ai.chats.create({
        model: modelName,
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
      while (response.functionCalls && response.functionCalls.length > 0 && iterations < 5) {
        iterations++;
        const functionCall = response.functionCalls[0];
        const { name, args } = functionCall;

        if (onToolEvent) onToolEvent("start", name, args);

        const startTime = performance.now();
        let toolResult: unknown = null;

        if (name === textToSqlTool.name) {
          toolResult = await textToSqlTool.execute(args as any);
        } else if (name === vectorRetrieverTool.name) {
          const ret = await vectorRetrieverTool.execute(args as any);
          toolResult = ret.results;
          if (ret.citations.length > 0) {
            citations.push(...ret.citations);
          }
        }

        const elapsed = Math.round(performance.now() - startTime);
        toolTraces.push({
          toolName: name,
          inputParams: args as any,
          outputResult: toolResult,
          executionTimeMs: elapsed,
        });

        if (onToolEvent) onToolEvent("end", name, toolResult);

        // Devolver el resultado de la función al modelo para que continúe sintetizando
        response = await chat.sendMessage({
          message: [
            {
              functionResponse: {
                name,
                response: { result: toolResult },
              },
            },
          ],
        });
      }

      const replyText = response.text || "No se pudo generar respuesta para la consulta.";
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
