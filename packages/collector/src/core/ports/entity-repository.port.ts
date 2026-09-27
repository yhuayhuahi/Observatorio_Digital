// =============================================================================
// PUERTO: IEntityRepository
// Contrato de lectura del catálogo maestro de entidades.
// =============================================================================

import type { Entity } from '../models/entity.model.ts';

export interface IEntityRepository {
  /**
   * Retorna todas las entidades con `activa = TRUE` para procesar en la auditoría.
   */
  getActiveEntities(): Promise<Entity[]>;
}
