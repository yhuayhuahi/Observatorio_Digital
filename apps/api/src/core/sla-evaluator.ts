import type { SlaStatus } from "./types.ts";

/**
 * Evaluador de Acuerdos de Nivel de Servicio (SLAs ITIL v4 - RF-012, SDD-MOD-002)
 * Umbrales Oficiales:
 * - >= 99.50% : CUMPLE
 * - 98.00% a 99.49% : EN_RIESGO
 * - < 98.00% : INCUMPLE
 */
export function evaluateSlaThreshold(uptimePorcentaje: number): SlaStatus {
  if (uptimePorcentaje >= 99.5) {
    return "CUMPLE";
  }
  if (uptimePorcentaje >= 98.0) {
    return "EN_RIESGO";
  }
  return "INCUMPLE";
}

export interface SlaCalculationResult {
  periodo: string;
  totalMediciones: number;
  medicionesDisponibles: number;
  uptimePorcentaje: number;
  latenciaPromedioMs: number;
  totalCaidaMinutos: number;
  estadoSla: SlaStatus;
}

export function computeSlaFromMeasurements(
  measurements: Array<{ disponible: boolean; tiempo_respuesta_ms: number; fecha_captura: string }>,
  periodo: string
): SlaCalculationResult {
  if (measurements.length === 0) {
    return {
      periodo,
      totalMediciones: 0,
      medicionesDisponibles: 0,
      uptimePorcentaje: 100.0,
      latenciaPromedioMs: 0,
      totalCaidaMinutos: 0,
      estadoSla: "CUMPLE",
    };
  }

  const total = measurements.length;
  const disponibles = measurements.filter((m) => m.disponible).length;
  const uptimeRaw = (disponibles / total) * 100;
  const uptimePorcentaje = Math.round(uptimeRaw * 100) / 100;

  const totalLatencia = measurements.reduce((acc, m) => acc + (m.tiempo_respuesta_ms || 0), 0);
  const latenciaPromedioMs = Math.round((totalLatencia / total) * 10) / 10;

  // Cada medición fallida en muestreo diario representa ~1440 min o ventana equivalente
  const fallidas = total - disponibles;
  const totalCaidaMinutos = fallidas * 60; // Estimación representativa en minutos

  const estadoSla = evaluateSlaThreshold(uptimePorcentaje);

  return {
    periodo,
    totalMediciones: total,
    medicionesDisponibles: disponibles,
    uptimePorcentaje,
    latenciaPromedioMs,
    totalCaidaMinutos,
    estadoSla,
  };
}
