# ADR 0008: Uso de la Extensión pgvector en PostgreSQL (Supabase) para la Base de Conocimiento Normativo y Técnico

* **Estatus:** Aceptado
* **Fecha:** 2026-10-16
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública está evolucionando de un tablero de métricas descriptivas hacia un sistema inteligente de observabilidad y auditoría asistido por RAG (Retrieval-Augmented Generation). Para que el agente conversacional pueda emitir diagnósticos normativos y prescribir correcciones técnicas (RF-010), se requiere almacenar y buscar semánticamente fragmentos de texto (*chunks*) correspondientes a:
1. **Marco Normativo Peruano:** Decreto Legislativo N.º 1412 (Ley de Gobierno Digital) y Decreto Supremo N.º 029-2021-PCM (Reglamento).
2. **Estándares Internacionales de Accesibilidad:** Criterios de éxito y técnicas de remediación de W3C WCAG 2.1 nivel AA.
3. **Gestión de Servicios de TI:** Prácticas de ITIL v4 (Gestión de Eventos, Gestión de Incidentes y SLAs) y métricas ISO/IEC 25010.

Este almacenamiento vectorial debe convivir con el esquema relacional existente de 90 entidades y telemetría histórica diaria, respetando estrictamente la restricción de **costo operativo cero ($0 USD/mes)** establecida en el RNF-011.

## Decisión
Habilitar y utilizar la extensión nativa **`pgvector`** directamente sobre la instancia existente de **PostgreSQL en Supabase**, consolidando tanto la telemetría relacional como la base de conocimiento vectorial en un único motor de base de datos.

Se creará una tabla dedicada (p. ej. `documentos_normativos`) con una columna de tipo `vector(768)` indexada mediante `hnsw` (Hierarchical Navigable Small World) con distancia coseno (`vector_cosine_ops`), almacenando el contenido textual, metadatos (norma, artículo, criterio WCAG, categoría) y el vector de incrustación semántica.

## Justificación Técnica y Análisis de Límites de Supabase (Free Tier)
Se evaluó exhaustivamente si la capa gratuita de Supabase es capaz de soportar esta carga sin riesgo de bloqueo o degradación:

1. **Límite de Almacenamiento (500 MB en Free Tier):**
   * **Volumen del Corpus Normativo:** El conjunto de leyes peruanas (D.L. 1412 y D.S. 029), directivas y guías WCAG 2.1 condensadas comprende entre 350 y 500 fragmentos de texto (*chunks* de ~500 tokens).
   * **Consumo Vectorial:** A una dimensionalidad de 768 (modelo de embedding de Gemini), cada vector ocupa aproximadamente 3.1 KB. Para 500 fragmentos, el almacenamiento de vectores es de ~1.6 MB. Con el índice HNSW y el texto plano, el total de la base vectorial no superará los **5 a 8 MB**.
   * **Volumen de Telemetría Relacional:** Las 90 entidades generan 90 registros/día. En un año completo (365 días), se acumulan ~33,000 registros, que representan ~35 a 45 MB con índices relacionales.
   * **Consumo Total Proyectado:** $\approx 50 \text{ MB}$, lo cual representa apenas el **10 % del límite de 500 MB** de Supabase.
2. **Mitigación del Pausado por Inactividad (Regla de 7 días de Supabase Free):**
   * Supabase pausa automáticamente proyectos gratuitos que no registran actividad durante 7 días continuos.
   * **Garantía Operativa:** El workflow de GitHub Actions (`.github/workflows/daily-audit.yml`) ejecuta la auditoría diaria a las 15:10 PET de lunes a domingo de forma automatizada, generando tráfico diario garantizado e impidiendo cualquier pausado del proyecto.

## Alternativas Consideradas
* **Bases de datos vectoriales dedicadas en la nube (Pinecone, Qdrant Cloud):**
  * *Rechazado:* Aunque ofrecen planes gratuitos, añaden un punto de falla externo adicional, requieren gestionar credenciales separadas y dividen la arquitectura en dos plataformas distintas.
* **Base vectorial embebida en memoria / archivo local (ChromaDB, SQLite-vec):**
  * *Rechazado:* Dificulta el despliegue serverless o desacoplado entre el colector de datos, la API del RAG y el dashboard web, además de carecer de una interfaz de administración unificada.
* **Separar en otra instancia de Postgres:**
  * *Rechazado:* Innecesario dado el bajo volumen de datos y el margen disponible (> 85 % libre) en el plan gratuito actual.

## Consecuencias

### Positivas
* **Arquitectura Unificada (Single Source of Truth):** Permite realizar consultas híbridas en una sola transacción SQL (ej. cruzar métricas numéricas de una entidad con artículos de leyes que infringen mediante `JOIN` o llamadas a procedimientos almacenados `rpc()`).
* **Costo Cero Garantizado (RNF-011):** No incrementa los costos del proyecto ni requiere tarjetas de crédito adicionales.
* **Búsqueda Vectorial Eficiente:** El índice HNSW provee búsquedas semánticas con latencias inferiores a 10 ms para colecciones de este tamaño.

### Negativas / Riesgos
* Al generar embeddings con modelos de alta dimensionalidad (p. ej. > 1536 dimensiones), el consumo de memoria para el índice HNSW aumentaría; por ello se adopta una dimensionalidad estándar de 768.
* Se debe documentar el script de migración SQL (`CREATE EXTENSION IF NOT EXISTS vector;`) para asegurar reproducibilidad en entornos de prueba locales.
