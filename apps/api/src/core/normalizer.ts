/**
 * Normalizador determinista de métricas técnicas (RF-007, SDD-MOD-002)
 * Transforma métricas continuas de red y Lighthouse a una escala estándar 0-100.
 */

export function normalizeAvailability(disponible: boolean, statusCode: number): number {
  if (!disponible || statusCode >= 400 || statusCode === 0) {
    return 0;
  }
  return 100;
}

export function normalizePerformance(
  scoreDesempeno: number | null,
  lcpSegundos: number | null
): number {
  // Si Lighthouse generó un score nativo (0-100), se utiliza directamente
  if (scoreDesempeno !== null && !isNaN(scoreDesempeno) && scoreDesempeno >= 0) {
    return Math.min(100, Math.max(0, Math.round(scoreDesempeno)));
  }

  // Si solo tenemos LCP en segundos, normalizamos según umbrales de Google Core Web Vitals
  // Bueno <= 2.5s (100 pts) | Pobre >= 10.0s (0 pts)
  if (lcpSegundos !== null && !isNaN(lcpSegundos) && lcpSegundos > 0) {
    if (lcpSegundos <= 2.5) return 100;
    if (lcpSegundos >= 10.0) return 0;
    const normalized = 100 - ((lcpSegundos - 2.5) / 7.5) * 100;
    return Math.min(100, Math.max(0, Math.round(normalized)));
  }

  // Valor neutro si no hay telemetría de rendimiento
  return 50;
}

export function normalizeAccessibility(scoreAccesibilidad: number | null): number {
  if (scoreAccesibilidad !== null && !isNaN(scoreAccesibilidad) && scoreAccesibilidad >= 0) {
    return Math.min(100, Math.max(0, Math.round(scoreAccesibilidad)));
  }
  // Valor conservador si no se pudo auditar accesibilidad
  return 50;
}
