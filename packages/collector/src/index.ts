// =============================================================================
// EXPORTACIÓN PÚBLICA DEL MÓDULO COLLECTOR
// Permite reusar el caso de uso y los contratos en el Backend (Fase 2)
// sin necesidad de modificar ningún archivo interno.
//
// Uso en Backend:
//   import { RunFullAuditUseCase, type IEntityRepository } from '@observatorio/collector';
// =============================================================================

// Caso de Uso principal
export { RunFullAuditUseCase } from './application/run-full-audit.usecase.ts';
export type { AuditSummary, RunFullAuditOptions } from './application/run-full-audit.usecase.ts';

// Puertos (interfaces/contratos)
export type { IEntityRepository } from './core/ports/entity-repository.port.ts';
export type { IMeasurementRepository } from './core/ports/measurement-repository.port.ts';
export type { IHttpProbe } from './core/ports/http-probe.port.ts';
export type { IAuditService } from './core/ports/audit-service.port.ts';

// Modelos de dominio
export type { Entity } from './core/models/entity.model.ts';
export type { RawMeasurement } from './core/models/measurement.model.ts';
export type { HttpProbeResult } from './core/models/probe-result.model.ts';
export type { PageSpeedAuditResult, AccessibilityError } from './core/models/audit-result.model.ts';

// Adaptadores (para reusar implementaciones concretas en el backend)
export { SupabaseRepo } from './infrastructure/persistence/supabase-measurement-repo.ts';
export { FetchHttpProbe } from './infrastructure/http/fetch-http-probe.ts';
export { PageSpeedClient } from './infrastructure/google/pagespeed-client.ts';
export { loadConfig } from './infrastructure/config/env.config.ts';
