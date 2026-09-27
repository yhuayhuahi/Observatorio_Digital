// =============================================================================
// PUERTO: IHttpProbe
// Contrato de verificación de disponibilidad y latencia HTTP.
// =============================================================================

import type { HttpProbeResult } from '../models/probe-result.model.ts';

export interface IHttpProbe {
  /**
   * Realiza una petición HTTP HEAD (o GET como fallback) a la URL indicada.
   * Debe capturar el código de estado, la latencia y cualquier error de red.
   * El timeout máximo es de 10 segundos.
   */
  checkAvailability(url: string): Promise<HttpProbeResult>;
}
