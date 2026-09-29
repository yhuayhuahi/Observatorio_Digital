// =============================================================================
// UTILIDAD: Rate Limiter / Control de Concurrencia
// Procesa un array de tareas en lotes pequeños con pausa entre lotes.
// Crítico para no exceder la cuota por minuto de Google PageSpeed API.
// =============================================================================

export interface RateLimiterOptions {
  /** Número de tareas en paralelo por lote. Default: 3 */
  batchSize: number;
  /** Milisegundos de pausa entre lotes para respetar cuotas de API. Default: 1500 */
  delayBetweenBatchesMs: number;
}

const DEFAULTS: RateLimiterOptions = {
  batchSize: 3,
  delayBetweenBatchesMs: 1500,
};

/**
 * Ejecuta `tasks` en lotes de `batchSize` con una pausa de `delayBetweenBatchesMs`
 * entre cada lote. Retorna todos los resultados en el mismo orden que las tareas.
 *
 * @example
 * const results = await runInBatches(
 *   entities.map(e => () => processEntity(e)),
 *   { batchSize: 3, delayBetweenBatchesMs: 1500 }
 * );
 */
export async function runInBatches<T>(
  tasks: Array<() => Promise<T>>,
  options: Partial<RateLimiterOptions> = {}
): Promise<T[]> {
  const { batchSize, delayBetweenBatchesMs } = { ...DEFAULTS, ...options };
  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error(`batchSize debe ser un entero mayor que 0 (recibido: ${batchSize})`);
  }
  if (!Number.isFinite(delayBetweenBatchesMs) || delayBetweenBatchesMs < 0) {
    throw new Error(`delayBetweenBatchesMs debe ser un número no negativo (recibido: ${delayBetweenBatchesMs})`);
  }
  const results: T[] = [];

  const totalBatches = Math.ceil(tasks.length / batchSize);

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batchIndex = Math.floor(i / batchSize) + 1;
    const batch = tasks.slice(i, i + batchSize);

    console.log(
      `  🔄 Lote ${batchIndex}/${totalBatches} — procesando ${batch.length} entidad(es) en paralelo...`
    );

    const batchResults = await Promise.allSettled(batch.map((task) => task()));

    for (const settled of batchResults) {
      if (settled.status === 'fulfilled') {
        results.push(settled.value);
      } else {
        // Propagamos el error envuelto para no perder el índice
        throw settled.reason;
      }
    }

    // Pausa entre lotes, excepto después del último
    const isLastBatch = i + batchSize >= tasks.length;
    if (!isLastBatch) {
      await sleep(delayBetweenBatchesMs);
    }
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
