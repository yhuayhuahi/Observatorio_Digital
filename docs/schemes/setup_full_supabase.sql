-- =============================================================================
-- OBSERVATORIO DE CALIDAD DIGITAL PÚBLICA (PERÚ)
-- Script Maestro de Configuración y Migración DDL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query > Run
-- =============================================================================

-- 1. Habilitar extensión pgvector para el subsistema RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- -----------------------------------------------------------------------------
-- 2. Tabla: incidentes (Ciclo de Vida ITIL v4 - SDD-MOD-002 / SDD-MOD-006)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidentes (
    id BIGSERIAL PRIMARY KEY,
    entidad_id INTEGER NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
    tipo_incidente VARCHAR(50) NOT NULL, -- 'CAIDA_TOTAL', 'DEGRADACION_SEVERA', 'ERROR_SSL'
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('ABIERTO', 'RESUELTO')),
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('CRITICA', 'MAYOR', 'MENOR')),
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_resolucion TIMESTAMPTZ,
    duracion_minutos INTEGER,
    intentos_fallidos_consecutivos INTEGER NOT NULL DEFAULT 1,
    causa_raiz_aparente TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidentes_entidad_estado 
    ON incidentes (entidad_id, estado, fecha_inicio DESC);

-- -----------------------------------------------------------------------------
-- 3. Tabla: evaluaciones_sla (Consolidado Mensual de SLAs - Meta: 99.5%)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluaciones_sla (
    id BIGSERIAL PRIMARY KEY,
    entidad_id INTEGER NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
    periodo VARCHAR(7) NOT NULL, -- Formato 'YYYY-MM'
    uptime_porcentaje FLOAT NOT NULL CHECK (uptime_porcentaje BETWEEN 0.0 AND 100.0),
    latencia_promedio_ms FLOAT NOT NULL,
    total_incidentes INTEGER NOT NULL DEFAULT 0,
    total_caida_minutos INTEGER NOT NULL DEFAULT 0,
    estado_sla VARCHAR(20) NOT NULL CHECK (estado_sla IN ('CUMPLE', 'EN_RIESGO', 'INCUMPLE')),
    fecha_calculo TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sla_entidad_periodo UNIQUE (entidad_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_sla_periodo_entidad 
    ON evaluaciones_sla (periodo, entidad_id);

-- -----------------------------------------------------------------------------
-- 4. Tabla: documentos_normativos (Base de Conocimiento Vectorial 768d)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documentos_normativos (
    id BIGSERIAL PRIMARY KEY,
    fuente VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (
        categoria IN ('LEGISLACION_PERU', 'ACCESIBILIDAD_WCAG', 'RENDIMIENTO_CWV', 'GESTION_ITIL')
    ),
    titulo VARCHAR(255) NOT NULL,
    seccion VARCHAR(100),
    contenido TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índice HNSW optimizado para distancia Coseno
CREATE INDEX IF NOT EXISTS idx_documentos_normativos_embedding_hnsw
    ON documentos_normativos 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_documentos_normativos_categoria 
    ON documentos_normativos (categoria);

CREATE INDEX IF NOT EXISTS idx_documentos_normativos_fuente 
    ON documentos_normativos (fuente);

-- -----------------------------------------------------------------------------
-- 5. Procedimiento Almacenado / RPC: match_documentos_normativos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION match_documentos_normativos (
    query_embedding vector(768),
    match_threshold float DEFAULT 0.60,
    match_count int DEFAULT 5,
    filtro_categoria varchar DEFAULT NULL
)
RETURNS TABLE (
    id bigint,
    fuente varchar,
    categoria varchar,
    titulo varchar,
    seccion varchar,
    contenido text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.fuente,
        d.categoria,
        d.titulo,
        d.seccion,
        d.contenido,
        d.metadata,
        1 - (d.embedding <=> query_embedding) AS similarity
    FROM documentos_normativos d
    WHERE 
        (1 - (d.embedding <=> query_embedding) >= match_threshold)
        AND (filtro_categoria IS NULL OR d.categoria = filtro_categoria)
    ORDER BY d.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Índices Relacionales Adicionales para Acelerar Consultas (RNF-001)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mediciones_entidad_fecha 
    ON mediciones_crudas (entidad_id, fecha_captura DESC);

CREATE INDEX IF NOT EXISTS idx_mediciones_disponible 
    ON mediciones_crudas (disponible, fecha_captura DESC);

CREATE INDEX IF NOT EXISTS idx_entidades_categoria_region 
    ON entidades (categoria, region) WHERE activa = true;

-- -----------------------------------------------------------------------------
-- 7. Políticas de Seguridad RLS (Row Level Security)
-- -----------------------------------------------------------------------------
ALTER TABLE incidentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_sla ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_normativos ENABLE ROW LEVEL SECURITY;

-- Lectura pública para consumo del backend y dashboard
CREATE POLICY "Lectura publica de incidentes" 
    ON incidentes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Lectura publica de SLAs" 
    ON evaluaciones_sla FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Lectura publica de documentos normativos" 
    ON documentos_normativos FOR SELECT TO anon, authenticated USING (true);

-- Escritura reservada para service_role (workers/seeders)
CREATE POLICY "Escritura service_role incidentes" 
    ON incidentes FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Escritura service_role evaluaciones_sla" 
    ON evaluaciones_sla FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Escritura service_role documentos_normativos" 
    ON documentos_normativos FOR ALL TO service_role USING (true) WITH CHECK (true);
