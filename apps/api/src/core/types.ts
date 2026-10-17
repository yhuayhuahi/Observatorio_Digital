export type EntityCategory =
  | "Ministerio"
  | "GORE"
  | "Organismo Autónomo"
  | "Municipalidad Provincial";

export type SlaStatus = "CUMPLE" | "EN_RIESGO" | "INCUMPLE";

export interface Entity {
  id: number;
  nombre: string;
  url: string;
  categoria: EntityCategory;
  region: string | null;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface RawMeasurement {
  id: number;
  entidad_id: number;
  fecha_captura: string;
  status_code: number;
  tiempo_respuesta_ms: number;
  disponible: boolean;
  error_conexion: string | null;
  lcp_segundos: number | null;
  fid_ms: number | null;
  cls_score: number | null;
  fcp_segundos: number | null;
  ttfb_ms: number | null;
  score_desempeno: number | null;
  score_accesibilidad: number | null;
  errores_accesibilidad: unknown[];
}

export interface CalculatedScores {
  scoreGlobal: number;
  scoreDisponibilidad: number;
  scoreDesempeno: number;
  scoreAccesibilidad: number;
}

export interface EntitySummaryDTO {
  id: number;
  nombre: string;
  url: string;
  categoria: EntityCategory;
  region: string | null;
  activa: boolean;
  ultimoScore?: {
    scoreGlobal: number;
    scoreDisponibilidad: number;
    scoreDesempeno: number;
    scoreAccesibilidad: number;
    fecha: string;
  };
}

export interface EntityDetailDTO {
  id: number;
  nombre: string;
  url: string;
  categoria: EntityCategory;
  region: string | null;
  activa: boolean;
  scoreActual: {
    scoreGlobal: number;
    scoreDisponibilidad: number;
    scoreDesempeno: number;
    scoreAccesibilidad: number;
    posicionRanking: number;
  };
  slaMesActual: {
    periodo: string;
    uptimePorcentaje: number;
    estadoSla: SlaStatus;
  };
  incidentesActivos: number;
  ultimasMediciones: RawMeasurement[];
  erroresAccesibilidad?: any[];
  metrics?: {
    lcp: number;
    cls: number;
    inp: number;
    fcp: number;
    ttfb: number;
  };
}

export interface RankingItemDTO {
  posicion: number;
  entidadId: number;
  nombre: string;
  url: string;
  categoria: EntityCategory;
  region: string | null;
  scoreGlobal: number;
  scoreDisponibilidad: number;
  scoreDesempeno: number;
  scoreAccesibilidad: number;
  estadoSla: SlaStatus;
  fechaMedicion: string;
}

export interface Incident {
  id: number;
  entidad_id: number;
  tipo_incidente: string;
  estado: "ABIERTO" | "RESUELTO";
  severidad: "CRITICA" | "MAYOR" | "MENOR";
  fecha_inicio: string;
  fecha_resolucion: string | null;
  duracion_minutos: number | null;
  intentos_fallidos_consecutivos: number;
  causa_raiz_aparente: string | null;
}

export interface SlaReportDTO {
  periodo: string;
  entidadId: number;
  nombreEntidad: string;
  uptimePorcentaje: number;
  latenciaPromedioMs: number;
  totalIncidentes: number;
  totalCaidaMinutos: number;
  estadoSla: SlaStatus;
}

// -----------------------------------------------------------------------------
// DTOs para el Chatbot Conversacional RAG (SDD-MOD-005)
// -----------------------------------------------------------------------------

export interface ChatMessageDTO {
  role: "user" | "model" | "assistant" | "system";
  content: string;
}

export interface ChatRequestDTO {
  message: string;
  conversationId?: string;
  history?: ChatMessageDTO[];
}

export interface NormativeCitationDTO {
  fuente: string;
  articulo?: string;
  seccion?: string;
  titulo?: string;
  criterio?: string;
  similarity?: number;
}

export interface ToolExecutionTraceDTO {
  toolName: string;
  inputParams: Record<string, unknown>;
  outputResult: unknown;
  executionTimeMs: number;
}

export interface ChatResponseDTO {
  conversationId: string;
  message: string;
  citations: NormativeCitationDTO[];
  toolCalls?: ToolExecutionTraceDTO[];
  modelUsed: string;
}
