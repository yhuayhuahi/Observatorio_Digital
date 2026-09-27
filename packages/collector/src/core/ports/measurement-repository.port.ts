// =============================================================================
// PUERTO: IMeasurementRepository
// Contrato de escritura de mediciones crudas hacia la base de datos.
// =============================================================================

import type { RawMeasurement } from '../models/measurement.model.ts';

export interface IMeasurementRepository {
  /**
   * Persiste un lote de mediciones crudas en la tabla `mediciones_crudas`.
   * El lote puede ser de cualquier tamaño; la implementación maneja la transacción.
   */
  saveBatch(measurements: RawMeasurement[]): Promise<void>;
}
