import type { Incident, RawMeasurement } from "./types.ts";

/**
 * Motor de Detección de Incidentes ITIL v4 (RF-012, SDD-MOD-002)
 */
export function classifyIncident(
  measurement: Partial<RawMeasurement>
): { tipo: string; severidad: "CRITICA" | "MAYOR" | "MENOR"; causa: string } | null {
  const disponible = measurement.disponible ?? true;
  const statusCode = measurement.status_code ?? 200;
  const latencia = measurement.tiempo_respuesta_ms ?? 0;
  const errorConexion = measurement.error_conexion ?? "";

  // Caída total de disponibilidad
  if (!disponible || statusCode >= 500 || statusCode === 0) {
    let causa = "Error interno del servidor (HTTP " + statusCode + ")";
    if (errorConexion.includes("ENOTFOUND") || errorConexion.includes("DNS")) {
      causa = "Fallo de resolución de dominio institucional (DNS Failure)";
    } else if (statusCode === 0 || errorConexion.includes("timeout")) {
      causa = "Tiempo de espera de conexión agotado (Timeout > 10s)";
    } else if (statusCode === 502 || statusCode === 504) {
      causa = "Fallo de Gateway / Proxy Inverso (Bad Gateway / Gateway Timeout)";
    }

    return {
      tipo: "CAIDA_TOTAL",
      severidad: "CRITICA",
      causa,
    };
  }

  // Bloqueo WAF o 403
  if (statusCode === 403) {
    return {
      tipo: "BLOQUEO_WAF",
      severidad: "MAYOR",
      causa: "Portal público bloqueó la sonda de auditoría (HTTP 403 Forbidden / WAF Rule)",
    };
  }

  // Degradación severa de latencia
  if (latencia >= 8000) {
    return {
      tipo: "DEGRADACION_SEVERA",
      severidad: "MAYOR",
      causa: `Latencia extrema de red (${Math.round(latencia)} ms > 8000 ms)`,
    };
  }

  // Sin incidente
  return null;
}
