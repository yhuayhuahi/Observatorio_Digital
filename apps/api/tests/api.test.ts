import { describe, expect, it } from "bun:test";
import { createServer } from "../src/server.ts";

describe("Backend REST API HTTP Contracts (SDD-MOD-003)", () => {
  const server = createServer(0);
  const baseUrl = `http://localhost:${server.port}`;

  it("GET /api/v1/health debe responder 200 OK y estado ONLINE", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/health`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.status).toBe("ONLINE");
    expect(res.headers.get("X-Response-Time")).toBeDefined();
  });

  it("GET /api/v1/entities debe retornar el catálogo de 90 entidades desde Supabase", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/entities?pageSize=10`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeLessThanOrEqual(10);
    expect(json.meta.total).toBe(90);
  });

  it("GET /api/v1/entities con filtro de categoría debe acotar los resultados", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/entities?categoria=Ministerio`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    for (const ent of json.data) {
      expect(ent.categoria).toBe("Ministerio");
    }
  });

  it("GET /api/v1/entities/:id debe retornar la ficha técnica detallada de una entidad existente", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/entities/1`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(1);
    expect(json.data.nombre).toBeDefined();
    expect(json.data.scoreActual).toBeDefined();
    expect(json.data.slaMesActual).toBeDefined();
    expect(Array.isArray(json.data.ultimasMediciones)).toBe(true);
  });

  it("GET /api/v1/entities/:id debe retornar 404 NOT FOUND para un ID inexistente", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/entities/999999`));
    expect(res.status).toBe(404);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("GET /api/v1/entities/:id/metrics debe retornar la serie temporal de mediciones", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/entities/1/metrics?limit=5`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("GET /api/v1/rankings debe retornar las entidades ordenadas descendentemente por scoreGlobal", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/rankings`));
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(1);

    if (json.data.length >= 2) {
      expect(json.data[0].posicion).toBe(1);
      expect(json.data[0].scoreGlobal).toBeGreaterThanOrEqual(json.data[1].scoreGlobal);
    }
  }, 15000);

  it("GET /api/v1/rankings con ordenamiento por scoreDisponibilidad", async () => {
    const res = await server.fetch(
      new Request(`${baseUrl}/api/v1/rankings?orderBy=scoreDisponibilidad`)
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.meta.orderBy).toBe("scoreDisponibilidad");
  }, 15000);

  it("GET /api/v1/reports/export?format=csv debe retornar archivo CSV con columnas estándar", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/reports/export?format=csv`));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=");
    const csv = await res.text();
    expect(csv).toContain("entidad_id,nombre_entidad,categoria");
  }, 15000);

  it("GET /api/v1/reports/export?format=json debe retornar datos en formato JSON estructurado", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/reports/export?format=json`));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const json = (await res.json()) as any[];
    expect(Array.isArray(json)).toBe(true);
    if (json.length > 0) {
      expect(json[0].entidadId).toBeDefined();
      expect(json[0].scoreGlobal).toBeDefined();
    }
  }, 15000);

  it("POST /api/v1/collector/trigger debe rechazar peticiones no autorizadas con 401", async () => {
    const res = await server.fetch(
      new Request(`${baseUrl}/api/v1/collector/trigger`, { method: "POST" })
    );
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/collector/trigger debe aceptar peticiones con Bearer token válido (202)", async () => {
    const res = await server.fetch(
      new Request(`${baseUrl}/api/v1/collector/trigger`, {
        method: "POST",
        headers: { Authorization: "Bearer dev-secret-key-2026" },
      })
    );
    expect(res.status).toBe(202);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
  });

  it("POST /api/v1/chat debe rechazar payloads sin el campo 'message' con 400 Bad Request", async () => {
    const res = await server.fetch(
      new Request(`${baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/chat debe soportar streaming SSE con Accept: text/event-stream", async () => {
    const res = await server.fetch(
      new Request(`${baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: "¿Cuál es el objetivo del Observatorio de Calidad Digital?",
        }),
      })
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    
    // Leer el stream y verificar que contiene eventos SSE
    const reader = res.body?.getReader();
    expect(reader).toBeDefined();
    if (reader) {
      const { value } = await reader.read();
      const chunkText = new TextDecoder().decode(value);
      expect(chunkText.includes("event:") || chunkText.includes("data:")).toBe(true);
      reader.cancel();
    }
  }, 25000);

  it("GET /api/v1/reports/incidents debe retornar incidentes ITIL v4 reales en JSON y CSV", async () => {
    // JSON
    const resJson = await server.fetch(new Request(`${baseUrl}/api/v1/reports/incidents`));
    expect(resJson.status).toBe(200);
    const json = (await resJson.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0].id).toBeDefined();
      expect(json.data[0].entidadId).toBeDefined();
      expect(json.data[0].causaRaiz).toBeDefined();
      expect(json.data[0].estado).toBeDefined();
    }

    // CSV
    const resCsv = await server.fetch(new Request(`${baseUrl}/api/v1/reports/incidents?format=csv`));
    expect(resCsv.status).toBe(200);
    expect(resCsv.headers.get("Content-Type")).toContain("text/csv");
    const csv = await resCsv.text();
    expect(csv).toContain("id,entidad_id,entidad_nombre");
  });

  it("GET /api/v1/reports/sla debe retornar el consolidado de SLAs mensuales en JSON y CSV", async () => {
    // JSON
    const resJson = await server.fetch(new Request(`${baseUrl}/api/v1/reports/sla`));
    expect(resJson.status).toBe(200);
    const json = (await resJson.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0].periodo).toBeDefined();
      expect(json.data[0].uptimePorcentaje).toBeDefined();
      expect(json.data[0].estadoSla).toBeDefined();
    }

    // CSV
    const resCsv = await server.fetch(new Request(`${baseUrl}/api/v1/reports/sla?format=csv`));
    expect(resCsv.status).toBe(200);
    expect(resCsv.headers.get("Content-Type")).toContain("text/csv");
    const csv = await resCsv.text();
    expect(csv).toContain("periodo,entidad_id,nombre_entidad");
  });

  it("GET /api/v1/reports/accessibility debe retornar hallazgos WCAG 2.1 AA en JSON y CSV", async () => {
    // JSON
    const resJson = await server.fetch(new Request(`${baseUrl}/api/v1/reports/accessibility`));
    expect(resJson.status).toBe(200);
    const json = (await resJson.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    if (json.data.length > 0) {
      expect(json.data[0].criterioWcag).toBeDefined();
      expect(json.data[0].titulo).toBeDefined();
      expect(json.data[0].selector).toBeDefined();
    }

    // CSV
    const resCsv = await server.fetch(new Request(`${baseUrl}/api/v1/reports/accessibility?format=csv`));
    expect(resCsv.status).toBe(200);
    expect(resCsv.headers.get("Content-Type")).toContain("text/csv");
    const csv = await resCsv.text();
    expect(csv).toContain("entidad_id,entidad_nombre,criterio_wcag");
  });

  it("GET /api/v1/rankings?format=csv debe exportar el ranking nacional en CSV", async () => {
    const res = await server.fetch(new Request(`${baseUrl}/api/v1/rankings?format=csv`));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const csv = await res.text();
    expect(csv).toContain("posicion,entidad_id,nombre,url,categoria");
  });
});
