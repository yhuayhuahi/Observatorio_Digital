// =============================================================================
// PUERTO: IAuditService
// Contrato de auditoría de Core Web Vitals y accesibilidad WCAG 2.1.
// =============================================================================

import type { PageSpeedAuditResult } from '../models/audit-result.model.ts';

export interface IAuditService {
  /**
   * Ejecuta una auditoría completa de una URL usando Google PageSpeed Insights API v5.
   * Extrae: LCP, FID/INP, CLS, FCP, TTFB, score_desempeno, score_accesibilidad,
   * errores_accesibilidad y el payload crudo completo.
   */
  runAudit(url: string): Promise<PageSpeedAuditResult>;
}
