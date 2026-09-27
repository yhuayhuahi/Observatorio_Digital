-- =============================================================================
-- OBSERVATORIO DE CALIDAD DIGITAL PÚBLICA
-- Esquema de Base de Datos - Fase 1: Ingesta de Datos Crudos
-- Motor: PostgreSQL 14+ / Supabase / Neon
-- =============================================================================

-- 1. Tabla de Catálogo Maestro de Entidades
CREATE TABLE IF NOT EXISTS entidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL UNIQUE,
    categoria VARCHAR(50) NOT NULL CHECK (
        categoria IN ('Ministerio', 'GORE', 'Organismo Autónomo', 'Municipalidad Provincial')
    ),
    region VARCHAR(100),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Mediciones Crudas de Telemetría
CREATE TABLE IF NOT EXISTS mediciones_crudas (
    id BIGSERIAL PRIMARY KEY,
    entidad_id INTEGER NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
    fecha_captura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Telemetría de Disponibilidad HTTP
    status_code INTEGER,
    tiempo_respuesta_ms FLOAT,
    disponible BOOLEAN NOT NULL,
    error_conexion TEXT,
    
    -- Métricas de Desempeño (Core Web Vitals crudos de Google)
    lcp_segundos FLOAT,
    fid_ms FLOAT,
    cls_score FLOAT,
    fcp_segundos FLOAT,
    ttfb_ms FLOAT,
    score_desempeno INTEGER CHECK (score_desempeno BETWEEN 0 AND 100),
    
    -- Métricas de Accesibilidad (Lighthouse / WCAG 2.1)
    score_accesibilidad INTEGER CHECK (score_accesibilidad BETWEEN 0 AND 100),
    errores_accesibilidad JSONB,
    
    -- Respaldo crudo completo de la API
    raw_auditoria JSONB
);

-- 3. Índices de Rendimiento para Consultas Temporales
CREATE INDEX IF NOT EXISTS idx_mediciones_entidad_fecha 
    ON mediciones_crudas (entidad_id, fecha_captura DESC);

CREATE INDEX IF NOT EXISTS idx_mediciones_fecha_captura 
    ON mediciones_crudas (fecha_captura DESC);

CREATE INDEX IF NOT EXISTS idx_entidades_categoria_region 
    ON entidades (categoria, region);
