// =============================================================================
// MODELO DE DOMINIO: Resultado de Auditoría PageSpeed (Core Web Vitals + WCAG)
// Datos crudos retornados por Google PageSpeed Insights API v5.
// =============================================================================

export interface PageSpeedAuditResult {
  // --- Core Web Vitals ---
  /** Largest Contentful Paint en segundos. Ideal: ≤ 2.5s */
  lcpSegundos: number | null;
  /** First Input Delay / INP en milisegundos. Ideal: ≤ 100ms */
  fidMs: number | null;
  /** Cumulative Layout Shift (0.0 – 1.0+). Ideal: ≤ 0.1 */
  clsScore: number | null;
  /** First Contentful Paint en segundos */
  fcpSegundos: number | null;
  /** Time to First Byte en milisegundos */
  ttfbMs: number | null;
  /** Puntaje de rendimiento Lighthouse (0–100) */
  scoreDesempeno: number | null;

  // --- Accesibilidad (WCAG 2.1) ---
  /** Puntaje de accesibilidad Lighthouse (0–100) */
  scoreAccesibilidad: number | null;
  /**
   * Lista estructurada de violaciones WCAG 2.1 detectadas por Lighthouse.
   * Cada elemento contiene: id, título, descripción y elementos infractores.
   */
  erroresAccesibilidad: AccessibilityError[] | null;

  /** Payload JSON completo de la API para trazabilidad y reprocesamiento futuro */
  rawAuditoria: Record<string, unknown> | null;

  /** Error producido durante la auditoría, si la API falló */
  errorAuditoria: string | null;
}

export interface AccessibilityError {
  id: string;
  titulo: string;
  descripcion: string;
  elementosInfractores: string[];
}
