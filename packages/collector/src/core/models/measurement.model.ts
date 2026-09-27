// =============================================================================
// MODELO DE DOMINIO: Medición Cruda Completa
// Agrega telemetría HTTP + auditoría PageSpeed de una entidad en un momento dado.
// Es la unidad de persistencia hacia la tabla `mediciones_crudas`.
// =============================================================================

import type { HttpProbeResult } from './probe-result.model.ts';
import type { PageSpeedAuditResult } from './audit-result.model.ts';

export interface RawMeasurement {
  entidadId: number;
  fechaCaptura: Date;
  probe: HttpProbeResult;
  audit: PageSpeedAuditResult | null;
}
