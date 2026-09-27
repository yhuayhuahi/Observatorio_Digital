// =============================================================================
// MODELO DE DOMINIO: Entidad Pública
// Representa una entidad del Estado peruano a monitorear.
// =============================================================================

export interface Entity {
  id: number;
  nombre: string;
  url: string;
  categoria: 'Ministerio' | 'GORE' | 'Organismo Autónomo' | 'Municipalidad Provincial';
  region: string | null;
  activa: boolean;
}
