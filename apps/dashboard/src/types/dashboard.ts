export interface RankingEntity {
  id: number;
  posicion: number;
  nombre: string;
  url: string;
  categoria: string;
  region: string | null;
  scoreGlobal: number;
  scoreDisponibilidad: number;
  scoreDesempeno: number;
  scoreAccesibilidad: number;
  estadoSla: 'CUMPLE' | 'EN_RIESGO' | 'INCUMPLE';
}

export interface GlobalStats {
  totalEntities: number;
  avgAvailability: number;
  avgLcp: number;
  avgAccessibility: number;
  activeIncidents: number;
  compliantCount: number;
  lastUpdated: string;
}

export interface Incident {
  id: number;
  entidadId: number;
  entidadNombre?: string;
  url?: string;
  estado: 'ABIERTO' | 'INVESTIGANDO' | 'RESUELTO';
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  causaRaiz: string;
  timestampInicio: string;
  timestampResolucion: string | null;
  tiempoIndisponibilidadMinutos: number | null;
}

export interface HistoricalMeasurement {
  timestamp: string;
  uptime: number; // percentage (0 - 100)
  responseTimeMs: number;
  lcp: number;
  cls: number;
  inp: number;
  accessibilityScore: number;
}

export interface WcagViolation {
  code: string;
  description: string;
  selector: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  legalRef: string;
  remediationAdvice: string;
}

export interface EntityDetail {
  id: number;
  nombre: string;
  url: string;
  categoria: string;
  region: string | null;
  estadoSla: 'CUMPLE' | 'EN_RIESGO' | 'INCUMPLE';
  scoreGlobal: number;
  scoreDisponibilidad: number;
  scoreDesempeno: number;
  scoreAccesibilidad: number;
  disponibilidadMensual: number; // e.g. 99.6
  slaMeta: number; // 99.5
  metrics: {
    lcp: number;
    cls: number;
    inp: number;
    fcp: number;
    ttfb: number;
  };
  violations: WcagViolation[];
  historical: HistoricalMeasurement[];
  lastChecked: string;
}

export interface ChatCitation {
  fuente: string;
  articulo?: string;
  seccion?: string;
  criterio?: string;
}

export interface ChatMessageUI {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'thinking' | 'streaming' | 'complete' | 'error';
  toolExecuting?: string;
  citations?: ChatCitation[];
}
