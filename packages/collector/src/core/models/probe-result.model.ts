// =============================================================================
// MODELO DE DOMINIO: Resultado de Sonda HTTP
// Telemetría cruda obtenida al verificar la disponibilidad de un portal.
// =============================================================================

export interface HttpProbeResult {
  /** Código de respuesta HTTP devuelto por el servidor (200, 404, 500, etc.) */
  statusCode: number | null;
  /** Tiempo total de respuesta en milisegundos */
  tiempoRespuestaMs: number | null;
  /** TRUE si el portal respondió satisfactoriamente (status 2xx o 3xx exitosa) */
  disponible: boolean;
  /** Mensaje de error en caso de fallo de red, timeout o excepción */
  errorConexion: string | null;
}
