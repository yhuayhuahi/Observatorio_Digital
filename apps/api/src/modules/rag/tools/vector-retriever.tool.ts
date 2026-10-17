import { getGeminiClient } from "../gemini-client.ts";
import { supabaseAdmin } from "../../../config/supabase.ts";
import type { NormativeCitationDTO } from "../../../core/types.ts";

export interface VectorRetrieverInput {
  concept: string;
  category?: "LEGISLACION_PERU" | "ACCESIBILIDAD_WCAG" | "RENDIMIENTO_CWV" | "GESTION_ITIL";
  topK?: number;
}

export class VectorRetrieverTool {
  name = "search_normative_base";
  description =
    "Busca fragmentos semánticos en las leyes peruanas (D.L. 1412, D.S. 029-2021-PCM, R.SGTD 001-2025-PCM), directivas de accesibilidad WCAG 2.1 e ITIL v4.";

  declaration = {
    name: this.name,
    description: this.description,
    parameters: {
      type: "OBJECT",
      properties: {
        concept: {
          type: "STRING",
          description:
            "Términos conceptuales a buscar (ej: 'plazo obligatorio adecuacion accesibilidad', 'remediacion LCP lento', 'contraste minimo').",
        },
        category: {
          type: "STRING",
          enum: ["LEGISLACION_PERU", "ACCESIBILIDAD_WCAG", "RENDIMIENTO_CWV", "GESTION_ITIL"],
          description: "Filtro opcional para acotar el ámbito temático.",
        },
        topK: {
          type: "INTEGER",
          description: "Número de fragmentos más relevantes a retornar (defecto: 3).",
        },
      },
      required: ["concept"],
    },
  };

  async execute(input: VectorRetrieverInput): Promise<{
    results: Array<{
      fuente: string;
      categoria: string;
      titulo: string;
      seccion: string;
      contenido: string;
      similarity: number;
    }>;
    citations: NormativeCitationDTO[];
  }> {
    const ai = getGeminiClient();
    if (!ai) {
      return {
        results: [],
        citations: [],
      };
    }

    try {
      // 1. Generar embedding vectorial de 768d para el concepto de consulta
      const embedResponse = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: input.concept,
        config: {
          outputDimensionality: 768,
        },
      });

      const embeddingValues =
        embedResponse.embeddings?.[0]?.values || (embedResponse as any).embedding?.values || [];
      if (!embeddingValues || embeddingValues.length === 0) {
        return { results: [], citations: [] };
      }

      // 2. Invocar la función RPC en Supabase
      const { data, error } = await supabaseAdmin.rpc("match_documentos_normativos", {
        query_embedding: embeddingValues,
        match_threshold: 0.55,
        match_count: input.topK || 4,
        filtro_categoria: input.category || null,
      });

      if (error) {
        console.warn("⚠️ Error en RPC match_documentos_normativos:", error.message);
        return { results: [], citations: [] };
      }

      const rows = (data || []) as any[];
      const citations: NormativeCitationDTO[] = rows.map((r) => ({
        fuente: r.fuente,
        titulo: r.titulo,
        seccion: r.seccion,
        similarity: Math.round(r.similarity * 100) / 100,
      }));

      return {
        results: rows,
        citations,
      };
    } catch (err: any) {
      console.warn("⚠️ Error al ejecutar VectorRetrieverTool:", err.message || err);
      return { results: [], citations: [] };
    }
  }
}

export const vectorRetrieverTool = new VectorRetrieverTool();
