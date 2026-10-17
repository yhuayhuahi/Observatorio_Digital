-- =============================================================================
-- OBSERVATORIO DE CALIDAD DIGITAL PÚBLICA
-- Esquema de Base de Datos - Fase 3: Base de Conocimiento Vectorial (RAG)
-- Motor: PostgreSQL 14+ con extensión pgvector (Supabase)
-- Dimensionalidad: 768 (Modelo gemini-embedding-001) - ADR-0008, ADR-0009
-- =============================================================================

-- 1. Habilitar la extensión pgvector (disponible nativamente en Supabase)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla para fragmentos de conocimiento normativo y técnico (Knowledge Base)
CREATE TABLE IF NOT EXISTS documentos_normativos (
    id BIGSERIAL PRIMARY KEY,
    fuente VARCHAR(100) NOT NULL,           -- Ej: 'D.L. 1412', 'D.S. 029-2021-PCM', 'WCAG 2.1', 'ITIL v4', 'CORE_WEB_VITALS'
    categoria VARCHAR(50) NOT NULL CHECK (  -- Clasificación temática para filtrado híbrido
        categoria IN ('LEGISLACION_PERU', 'ACCESIBILIDAD_WCAG', 'RENDIMIENTO_CWV', 'GESTION_ITIL')
    ),
    titulo VARCHAR(255) NOT NULL,          -- Ej: 'Artículo 14 - Accesibilidad en plataformas digitales del Estado'
    seccion VARCHAR(100),                  -- Ej: 'Capítulo II, Art. 14' o 'Principio 1: Perceptible (Criterio 1.4.3)'
    contenido TEXT NOT NULL,               -- Texto completo del fragmento (chunk de 300-600 tokens)
    metadata JSONB DEFAULT '{}'::jsonb,    -- Metadatos adicionales: { "articulos": [14, 15], "nivel": "AA", "tags": ["contraste", "css"] }
    embedding vector(768) NOT NULL,        -- Vector denso de 768 dimensiones generado por Google Gemini
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Índices de Búsqueda Rápida

-- Índice HNSW (Hierarchical Navigable Small World) para distancia Coseno (<=>)
-- Parámetros optimizados para colecciones medianas (< 5,000 chunks): m=16, ef_construction=64
CREATE INDEX IF NOT EXISTS idx_documentos_normativos_embedding_hnsw
    ON documentos_normativos 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Índices B-Tree para filtrado relacional previo o híbrido
CREATE INDEX IF NOT EXISTS idx_documentos_normativos_categoria 
    ON documentos_normativos (categoria);

CREATE INDEX IF NOT EXISTS idx_documentos_normativos_fuente 
    ON documentos_normativos (fuente);

-- 4. Función de Búsqueda por Similitud Coseno (RPC para Supabase)
-- Esta función es invocable directamente desde @supabase/supabase-js o desde Python:
-- supabase.rpc('match_documentos_normativos', { query_embedding: [...], match_threshold: 0.65, match_count: 5 })
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

-- Comentario explicativo de uso:
COMMENT ON TABLE documentos_normativos IS 'Fragmentos de normas legales peruanas, estándares WCAG 2.1 y directivas ITIL v4 indexados con embeddings vectoriales de 768d para el agente RAG de auditoría.';
