import { normalizeAvailability, normalizePerformance, normalizeAccessibility } from "./normalizer.ts";
import type { CalculatedScores, RawMeasurement } from "./types.ts";

/**
 * Motor de Cálculo del Score Compuesto de Calidad Digital (RF-006, SDD-MOD-002)
 * Ponderación Oficial:
 * - 40% Disponibilidad (Sonda HTTP / Uptime)
 * - 30% Rendimiento (Core Web Vitals / Lighthouse)
 * - 30% Accesibilidad (WCAG 2.1 AA / Lighthouse)
 */
export function calculateScores(measurement: Partial<RawMeasurement>): CalculatedScores {
  const disponible = measurement.disponible ?? true;
  const statusCode = measurement.status_code ?? 200;
  const scoreDisp = normalizeAvailability(disponible, statusCode);

  const scorePerf = normalizePerformance(
    measurement.score_desempeno ?? null,
    measurement.lcp_segundos ?? null
  );

  const scoreA11y = normalizeAccessibility(
    measurement.score_accesibilidad ?? null
  );

  const scoreGlobalRaw = 0.40 * scoreDisp + 0.30 * scorePerf + 0.30 * scoreA11y;
  const scoreGlobal = Math.round(scoreGlobalRaw * 10) / 10;

  return {
    scoreGlobal,
    scoreDisponibilidad: scoreDisp,
    scoreDesempeno: scorePerf,
    scoreAccesibilidad: scoreA11y,
  };
}
