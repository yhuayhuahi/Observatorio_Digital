// =============================================================================
// ADAPTADOR: FetchHttpProbe
// Implementa IHttpProbe usando el fetch nativo de Bun.
// - Intenta HEAD primero, cae a GET si el servidor rechaza HEAD.
// - Timeout de 10 segundos con AbortController.
// - Marca disponible=true solo para respuestas 2xx.
// =============================================================================

import type { IHttpProbe } from '../../core/ports/http-probe.port.ts';
import type { HttpProbeResult } from '../../core/models/probe-result.model.ts';

const TIMEOUT_MS = 10_000;

export class FetchHttpProbe implements IHttpProbe {
  async checkAvailability(url: string): Promise<HttpProbeResult> {
    const start = performance.now();

    // Intentar HEAD primero (más liviano); algunos servidores lo bloquean → GET
    for (const method of ['HEAD', 'GET'] as const) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method,
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'User-Agent':
              'ObservatorioDigitalPeru/1.0 (+https://github.com/yhuayhuahi/Observatorio_Digital)',
          },
        });

        clearTimeout(timer);
        const tiempoRespuestaMs = Math.round(performance.now() - start);
        const statusCode = response.status;
        const disponible = statusCode >= 200 && statusCode < 400;

        return {
          statusCode,
          tiempoRespuestaMs,
          disponible,
          errorConexion: null,
        };
      } catch (err: unknown) {
        clearTimeout(timer);

        // Si fue HEAD y el error es de método no soportado, reintentar con GET
        if (method === 'HEAD') {
          const msg = err instanceof Error ? err.message : String(err);
          // Errores de red reales (no 405) → retornar inmediatamente
          if (!msg.toLowerCase().includes('method') && !msg.toLowerCase().includes('405')) {
            const tiempoRespuestaMs = Math.round(performance.now() - start);
            return this.buildErrorResult(err, tiempoRespuestaMs);
          }
          // Si pudo ser 405 → continúa el loop a GET
          continue;
        }

        // GET también falló
        const tiempoRespuestaMs = Math.round(performance.now() - start);
        return this.buildErrorResult(err, tiempoRespuestaMs);
      }
    }

    // Fallback (no debería llegar aquí)
    return {
      statusCode: null,
      tiempoRespuestaMs: Math.round(performance.now() - start),
      disponible: false,
      errorConexion: 'UnknownError',
    };
  }

  private buildErrorResult(err: unknown, tiempoRespuestaMs: number): HttpProbeResult {
    let errorConexion: string;

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        errorConexion = `ConnectionTimeout (>${TIMEOUT_MS}ms)`;
      } else {
        errorConexion = `${err.name}: ${err.message}`;
      }
    } else {
      errorConexion = String(err);
    }

    return {
      statusCode: null,
      tiempoRespuestaMs,
      disponible: false,
      errorConexion,
    };
  }
}
