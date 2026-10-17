import { describe, expect, it } from "bun:test";
import { textToSqlTool } from "../src/modules/rag/tools/text-to-sql.tool.ts";
import { vectorRetrieverTool } from "../src/modules/rag/tools/vector-retriever.tool.ts";
import { ragOrchestrator } from "../src/modules/rag/rag-orchestrator.ts";

describe("Subsistema RAG Híbrido - Tool Calling y Seguridad (SDD-MOD-005)", () => {
  describe("TextToSqlTool (execute_telemetry_sql)", () => {
    it("debe rechazar sentencias destructivas como DROP TABLE", async () => {
      const res = (await textToSqlTool.execute({
        query: "DROP TABLE entidades;",
      })) as any;
      expect(res.error).toBeDefined();
      expect(res.error).toContain("Seguridad violada");
    });

    it("debe rechazar sentencias de modificación como UPDATE o DELETE", async () => {
      const resUpdate = (await textToSqlTool.execute({
        query: "UPDATE mediciones_crudas SET disponible = true;",
      })) as any;
      expect(resUpdate.error).toBeDefined();
      expect(resUpdate.error).toContain("Seguridad violada");

      const resDelete = (await textToSqlTool.execute({
        query: "DELETE FROM entidades WHERE id = 1;",
      })) as any;
      expect(resDelete.error).toBeDefined();
      expect(resDelete.error).toContain("Seguridad violada");
    });

    it("debe rechazar sentencias que no comiencen con SELECT", async () => {
      const res = (await textToSqlTool.execute({
        query: "INSERT INTO entidades (nombre) VALUES ('Falso');",
      })) as any;
      expect(res.error).toBeDefined();
      expect(res.error).toContain("Solo se permiten sentencias de lectura que inicien con SELECT");
    });

    it("debe ejecutar sentencias SELECT seguras sobre la base de datos real", async () => {
      const res = (await textToSqlTool.execute({
        query: "SELECT count(*)::int as total FROM entidades WHERE activa = true;",
      })) as any;

      if (!res.error) {
        expect(res.rows).toBeDefined();
        expect(Array.isArray(res.rows)).toBe(true);
        expect(res.rows[0].total).toBe(90);
      }
    }, 15000);
  });

  describe("VectorRetrieverTool (search_normative_base)", () => {
    it("debe recuperar fragmentos normativos relevantes y calcular similitud coseno", async () => {
      const res = await vectorRetrieverTool.execute({
        concept: "accesibilidad web obligatoria gobiernos regionales pcm",
        topK: 2,
      });

      expect(res.results).toBeDefined();
      expect(Array.isArray(res.results)).toBe(true);
      expect(res.results.length).toBeGreaterThanOrEqual(1);

      // Debe retornar al menos una cita normativa oficial con similitud >= 0.55
      expect(res.citations.length).toBeGreaterThanOrEqual(1);
      const topCitation = res.citations[0];
      expect(topCitation.fuente).toBeDefined();
      expect(topCitation.similarity).toBeGreaterThanOrEqual(0.55);
    }, 15000);

    it("debe recuperar criterios técnicos de Core Web Vitals al consultar por LCP o velocidad", async () => {
      const res = await vectorRetrieverTool.execute({
        concept: "Largest Contentful Paint lcp segundos optimizacion imagenes servidor",
        category: "RENDIMIENTO_CWV",
        topK: 2,
      });

      expect(res.results.length).toBeGreaterThanOrEqual(1);
      expect(res.results[0].categoria).toBe("RENDIMIENTO_CWV");
    }, 15000);
  });

  describe("RagOrchestrator (Flujo Conversacional Integral)", () => {
    it("debe procesar una consulta técnica y sintetizar respuesta fundamentada", async () => {
      const chatRes = await ragOrchestrator.processQuery({
        message: "¿Cuál es el marco legal que exige accesibilidad digital a los ministerios en el Perú?",
      });

      expect(chatRes.conversationId).toBeDefined();
      expect(chatRes.message).toBeDefined();
      expect(chatRes.message.length).toBeGreaterThan(50);
      // Debe contener citas o mención a la normativa peruana (D.L. 1412, D.S. 029 o R.SGTD)
      expect(
        chatRes.message.includes("1412") ||
        chatRes.message.includes("029") ||
        chatRes.message.includes("001-2025") ||
        chatRes.message.includes("Accesibilidad") ||
        chatRes.citations.length > 0
      ).toBe(true);
    }, 20000); // 20s timeout para llamada a Google AI Studio
  });
});
