// =============================================================================
// ADAPTADOR: PageSpeedClient
// Implementa IAuditService consultando Google PageSpeed Insights API v5.
// - Extrae todos los Core Web Vitals (LCP, FID/INP, CLS, FCP, TTFB).
// - Extrae score de rendimiento y accesibilidad de Lighthouse.
// - Extrae lista estructurada de errores WCAG 2.1.
// - Persiste el raw completo para trazabilidad y reprocesamiento.
// - Reintentos automáticos con backoff exponencial ante errores 429/5xx.
// =============================================================================

import type { IAuditService } from '../../core/ports/audit-service.port.ts';
import type { PageSpeedAuditResult, AccessibilityError } from '../../core/models/audit-result.model.ts';

const PAGESPEED_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000;

export class PageSpeedClient implements IAuditService {
  constructor(private readonly apiKey: string) {}

  async runAudit(url: string): Promise<PageSpeedAuditResult> {
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.fetchPageSpeed(url);
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = msg;

        // Si es el último intento, romper
        if (attempt === MAX_RETRIES) break;

        // Backoff exponencial: 2s, 4s, 8s
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `  ⚠️  PageSpeed intento ${attempt}/${MAX_RETRIES} falló para ${url}: ${msg}. Reintentando en ${delay}ms...`
        );
        await sleep(delay);
      }
    }

    // Todos los intentos fallaron → retornar resultado vacío con error
    return this.emptyResult(`MaxRetriesExceeded: ${lastError}`);
  }

  private async fetchPageSpeed(url: string): Promise<PageSpeedAuditResult> {
    // Llamamos con las categorías de Performance y Accessibility en estrategia desktop
    const params = new URLSearchParams({
      url,
      key: this.apiKey,
      strategy: 'desktop',
      category: 'performance',
    });
    // Agregar segunda categoría
    params.append('category', 'accessibility');

    const endpoint = `${PAGESPEED_ENDPOINT}?${params.toString()}`;

    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
      const apiError = (errorBody as any)?.error;
      throw new Error(
        `HTTP ${response.status}: ${apiError?.message ?? response.statusText}`
      );
    }

    const data = await response.json() as Record<string, unknown>;
    return this.parseResponse(data);
  }

  private parseResponse(data: Record<string, unknown>): PageSpeedAuditResult {
    const lr = data.lighthouseResult as Record<string, unknown> | undefined;
    if (!lr) {
      return this.emptyResult('LighthouseResultMissing');
    }

    const audits = lr.audits as Record<string, any> | undefined;
    const categories = lr.categories as Record<string, any> | undefined;

    // --- Core Web Vitals ---
    const lcp = this.numericValue(audits?.['largest-contentful-paint']);
    const fid = this.numericValue(audits?.['max-potential-fid'] ?? audits?.['interaction-to-next-paint']);
    const cls = this.numericValue(audits?.['cumulative-layout-shift']);
    const fcp = this.numericValue(audits?.['first-contentful-paint']);
    const ttfb = this.numericValue(audits?.['server-response-time']);

    // LCP en segundos, FID/INP y TTFB en ms, CLS sin unidad
    const lcpSeg = lcp !== null ? parseFloat((lcp / 1000).toFixed(3)) : null;
    const fidMs = fid !== null ? parseFloat(fid.toFixed(1)) : null;
    const clsScore = cls !== null ? parseFloat(cls.toFixed(4)) : null;
    const fcpSeg = fcp !== null ? parseFloat((fcp / 1000).toFixed(3)) : null;
    const ttfbMs = ttfb !== null ? parseFloat(ttfb.toFixed(1)) : null;

    // --- Scores de Lighthouse ---
    const scoreDesempeno = this.lighthouseScore(categories?.performance);
    const scoreAccesibilidad = this.lighthouseScore(categories?.accessibility);

    // --- Errores de Accesibilidad WCAG 2.1 ---
    const erroresAccesibilidad = this.extractAccessibilityErrors(audits);

    return {
      lcpSegundos: lcpSeg,
      fidMs,
      clsScore,
      fcpSegundos: fcpSeg,
      ttfbMs,
      scoreDesempeno,
      scoreAccesibilidad,
      erroresAccesibilidad,
      rawAuditoria: data,
      errorAuditoria: null,
    };
  }

  /**
   * Extrae los errores de accesibilidad de las auditorías de Lighthouse
   * que hayan fallado (score !== 1) y tengan elementos afectados.
   */
  private extractAccessibilityErrors(
    audits: Record<string, any> | undefined
  ): AccessibilityError[] | null {
    if (!audits) return null;

    const errors: AccessibilityError[] = [];

    for (const [auditId, audit] of Object.entries(audits)) {
      // Solo incluir auditorías de accesibilidad fallidas con elementos afectados
      if (
        audit?.score !== null &&
        audit?.score < 1 &&
        audit?.details?.type === 'table' &&
        Array.isArray(audit?.details?.items) &&
        audit.details.items.length > 0
      ) {
        // Extraer selectores de los elementos infractores (hasta 10)
        const elementosInfractores: string[] = (audit.details.items as any[])
          .slice(0, 10)
          .flatMap((item: any) => {
            if (item?.node?.snippet) return [item.node.snippet as string];
            if (item?.node?.selector) return [item.node.selector as string];
            return [];
          });

        if (elementosInfractores.length > 0) {
          errors.push({
            id: auditId,
            titulo: audit.title ?? auditId,
            descripcion: audit.description ?? '',
            elementosInfractores,
          });
        }
      }
    }

    return errors.length > 0 ? errors : null;
  }

  /** Extrae el valor numérico (en ms o unidad nativa) de una auditoría de Lighthouse */
  private numericValue(audit: any): number | null {
    if (audit?.numericValue !== undefined && audit.numericValue !== null) {
      return audit.numericValue as number;
    }
    return null;
  }

  /** Convierte el score de Lighthouse (0.0–1.0) a entero (0–100) */
  private lighthouseScore(category: any): number | null {
    if (category?.score !== undefined && category.score !== null) {
      return Math.round((category.score as number) * 100);
    }
    return null;
  }

  private emptyResult(errorMsg: string): PageSpeedAuditResult {
    return {
      lcpSegundos: null,
      fidMs: null,
      clsScore: null,
      fcpSegundos: null,
      ttfbMs: null,
      scoreDesempeno: null,
      scoreAccesibilidad: null,
      erroresAccesibilidad: null,
      rawAuditoria: null,
      errorAuditoria: errorMsg,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
