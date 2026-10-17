import { describe, expect, it } from "bun:test";
import { calculateScores } from "../src/core/score-engine.ts";
import {
  evaluateSlaThreshold,
  computeSlaFromMeasurements,
} from "../src/core/sla-evaluator.ts";
import {
  normalizeAvailability,
  normalizePerformance,
  normalizeAccessibility,
} from "../src/core/normalizer.ts";
import { classifyIncident } from "../src/core/incident-engine.ts";

describe("Normalizador de Métricas Técnicas (RF-007, SDD-MOD-002)", () => {
  describe("Disponibilidad (normalizeAvailability)", () => {
    it("debe retornar 100 si disponible es true y status 200", () => {
      expect(normalizeAvailability(true, 200)).toBe(100);
    });

    it("debe retornar 0 si disponible es false", () => {
      expect(normalizeAvailability(false, 200)).toBe(0);
    });

    it("debe retornar 0 si status_code es error de cliente o servidor (>= 400)", () => {
      expect(normalizeAvailability(true, 404)).toBe(0);
      expect(normalizeAvailability(true, 500)).toBe(0);
      expect(normalizeAvailability(true, 503)).toBe(0);
    });

    it("debe retornar 0 si status_code es 0 (timeout o fallo de red)", () => {
      expect(normalizeAvailability(true, 0)).toBe(0);
    });
  });

  describe("Rendimiento Core Web Vitals (normalizePerformance)", () => {
    it("debe respetar el score nativo de Lighthouse si está presente", () => {
      expect(normalizePerformance(85, null)).toBe(85);
      expect(normalizePerformance(100, 15.0)).toBe(100);
      expect(normalizePerformance(0, 1.0)).toBe(0);
    });

    it("debe calcular score a partir de LCP <= 2.5s como 100 puntos (Bueno)", () => {
      expect(normalizePerformance(null, 1.2)).toBe(100);
      expect(normalizePerformance(null, 2.5)).toBe(100);
    });

    it("debe calcular score a partir de LCP >= 10.0s como 0 puntos (Pobre)", () => {
      expect(normalizePerformance(null, 10.0)).toBe(0);
      expect(normalizePerformance(null, 18.5)).toBe(0);
    });

    it("debe interpolar linealmente LCP entre 2.5s y 10.0s", () => {
      // Punto medio: 2.5 + (7.5 / 2) = 6.25s -> ~50 puntos
      const midScore = normalizePerformance(null, 6.25);
      expect(midScore).toBe(50);
    });

    it("debe retornar 50 (neutro) si no hay métricas disponibles", () => {
      expect(normalizePerformance(null, null)).toBe(50);
    });
  });

  describe("Accesibilidad (normalizeAccessibility)", () => {
    it("debe respetar el score de accesibilidad de Lighthouse", () => {
      expect(normalizeAccessibility(95)).toBe(95);
      expect(normalizeAccessibility(100)).toBe(100);
      expect(normalizeAccessibility(0)).toBe(0);
    });

    it("debe retornar 50 si es null", () => {
      expect(normalizeAccessibility(null)).toBe(50);
    });
  });
});

describe("Motor de Cálculo Ponderado 40/30/30 (RF-006, SDD-MOD-002)", () => {
  it("debe ponderar exactamente 40% Disponibilidad, 30% Rendimiento, 30% Accesibilidad", () => {
    const scores = calculateScores({
      disponible: true,
      status_code: 200,
      score_desempeno: 100,
      score_accesibilidad: 100,
    });
    expect(scores.scoreGlobal).toBe(100.0);
  });

  it("debe calcular 0.0 global si todos los sub-scores son cero", () => {
    const scores = calculateScores({
      disponible: false,
      status_code: 500,
      score_desempeno: 0,
      score_accesibilidad: 0,
    });
    expect(scores.scoreGlobal).toBe(0.0);
    expect(scores.scoreDisponibilidad).toBe(0);
    expect(scores.scoreDesempeno).toBe(0);
    expect(scores.scoreAccesibilidad).toBe(0);
  });

  it("debe redondear el score global a exactamente un decimal", () => {
    const scores = calculateScores({
      disponible: true,
      status_code: 200,
      score_desempeno: 77,
      score_accesibilidad: 83,
    });
    // 0.40*100 + 0.30*77 + 0.30*83 = 40 + 23.1 + 24.9 = 88.0
    expect(scores.scoreGlobal).toBe(88.0);
  });
});

describe("Evaluador de SLAs ITIL v4 (RF-012, SDD-MOD-002)", () => {
  it("debe clasificar CUMPLE si el uptime es >= 99.50%", () => {
    expect(evaluateSlaThreshold(99.50)).toBe("CUMPLE");
    expect(evaluateSlaThreshold(99.99)).toBe("CUMPLE");
    expect(evaluateSlaThreshold(100.0)).toBe("CUMPLE");
  });

  it("debe clasificar EN_RIESGO si el uptime está entre 98.00% y 99.49%", () => {
    expect(evaluateSlaThreshold(99.49)).toBe("EN_RIESGO");
    expect(evaluateSlaThreshold(98.50)).toBe("EN_RIESGO");
    expect(evaluateSlaThreshold(98.00)).toBe("EN_RIESGO");
  });

  it("debe clasificar INCUMPLE si el uptime es < 98.00%", () => {
    expect(evaluateSlaThreshold(97.99)).toBe("INCUMPLE");
    expect(evaluateSlaThreshold(90.00)).toBe("INCUMPLE");
    expect(evaluateSlaThreshold(0.00)).toBe("INCUMPLE");
  });

  it("debe calcular agregados correctamente con computeSlaFromMeasurements", () => {
    const measurements = [
      { disponible: true, tiempo_respuesta_ms: 100, fecha_captura: "2026-10-01" },
      { disponible: true, tiempo_respuesta_ms: 200, fecha_captura: "2026-10-02" },
      { disponible: true, tiempo_respuesta_ms: 300, fecha_captura: "2026-10-03" },
      { disponible: false, tiempo_respuesta_ms: 0, fecha_captura: "2026-10-04" },
    ];
    const res = computeSlaFromMeasurements(measurements, "2026-10");
    expect(res.periodo).toBe("2026-10");
    expect(res.totalMediciones).toBe(4);
    expect(res.medicionesDisponibles).toBe(3);
    expect(res.uptimePorcentaje).toBe(75.0);
    expect(res.latenciaPromedioMs).toBe(150.0);
    expect(res.totalCaidaMinutos).toBe(60);
    expect(res.estadoSla).toBe("INCUMPLE");
  });

  it("debe manejar un arreglo vacío de mediciones sin arrojar error", () => {
    const res = computeSlaFromMeasurements([], "2026-10");
    expect(res.totalMediciones).toBe(0);
    expect(res.uptimePorcentaje).toBe(100.0);
    expect(res.estadoSla).toBe("CUMPLE");
  });
});

describe("Motor de Detección de Incidentes ITIL v4 (RF-012, SDD-MOD-002)", () => {
  it("debe retornar null cuando la medición es normal (200 OK y latencia baja)", () => {
    const incident = classifyIncident({
      disponible: true,
      status_code: 200,
      tiempo_respuesta_ms: 350,
    });
    expect(incident).toBeNull();
  });

  it("debe detectar CAIDA_TOTAL CRITICA ante error de servidor HTTP 500", () => {
    const incident = classifyIncident({
      disponible: false,
      status_code: 500,
      tiempo_respuesta_ms: 0,
    });
    expect(incident).not.toBeNull();
    expect(incident?.tipo).toBe("CAIDA_TOTAL");
    expect(incident?.severidad).toBe("CRITICA");
    expect(incident?.causa).toContain("HTTP 500");
  });

  it("debe detectar fallo DNS cuando el error de red contiene DNS o ENOTFOUND", () => {
    const incident = classifyIncident({
      disponible: false,
      status_code: 0,
      error_conexion: "getaddrinfo ENOTFOUND www.portal.gob.pe",
    });
    expect(incident).not.toBeNull();
    expect(incident?.tipo).toBe("CAIDA_TOTAL");
    expect(incident?.severidad).toBe("CRITICA");
    expect(incident?.causa).toContain("DNS");
  });

  it("debe detectar BLOQUEO_WAF ante un código HTTP 403 Forbidden", () => {
    const incident = classifyIncident({
      disponible: true,
      status_code: 403,
      tiempo_respuesta_ms: 200,
    });
    expect(incident).not.toBeNull();
    expect(incident?.tipo).toBe("BLOQUEO_WAF");
    expect(incident?.severidad).toBe("MAYOR");
    expect(incident?.causa).toContain("403 Forbidden");
  });

  it("debe detectar DEGRADACION_SEVERA si la latencia supera los 8000 ms", () => {
    const incident = classifyIncident({
      disponible: true,
      status_code: 200,
      tiempo_respuesta_ms: 9500,
    });
    expect(incident).not.toBeNull();
    expect(incident?.tipo).toBe("DEGRADACION_SEVERA");
    expect(incident?.severidad).toBe("MAYOR");
    expect(incident?.causa).toContain("Latencia extrema");
  });
});
