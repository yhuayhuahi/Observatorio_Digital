# ADR 0003: Uso de PostgreSQL para Persistencia y Métricas Históricas

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública necesita almacenar y consultar las mediciones diarias de 90 entidades públicas a lo largo de al menos un año (RNF-003: capacidad para 90 entidades con retención histórica de 1 año). Cada registro contiene múltiples métricas cuantitativas y cualitativas: disponibilidad (`status_code`, uptime, tiempo de respuesta), velocidad (LCP, FID/INP, CLS, score 0-100), accesibilidad (nivel WCAG 2.1, listas de errores), puntajes globales normalizados e incidentes de servicio alineados con ITIL v4 (RF-002 a RF-009, RF-012).

Asimismo, el sistema requiere realizar agregaciones temporales, rankings ordenados por múltiples columnas, filtrado por categorías/regiones y generación de reportes estructurados en CSV/JSON (RF-013). Todo esto debe operar con alta disponibilidad bajo un presupuesto operativo mínimo (RNF-011: ≤ $50 USD/mes), aprovechando capas gratuitas de bases de datos serverless (ej. Supabase o Neon).

## Decisión
Adoptar **PostgreSQL** como el motor de base de datos relacional para el Observatorio. Se modelará un esquema relacional con tablas para entidades, mediciones diarias de métricas e incidentes de servicio, aprovechando sus tipos de datos nativos avanzados (`TIMESTAMP`, `BOOLEAN`, arrays `TEXT[]` para errores e incidentes, y `JSONB` para auditorías crudas detalladas).

## Alternativas Consideradas
* **Bases de datos de documentos NoSQL (MongoDB):** Rechazado porque los datos de las entidades y las evaluaciones diarias tienen una estructura tabular consistente; además, los cálculos de rankings ponderados, agregaciones por región y cumplimiento de SLAs se benefician enormemente de las garantías ACID y la expresividad analítica de SQL.
* **SQLite embebido:** Rechazado debido a que múltiples procesos concurrentes (el runner de GitHub Actions que inserta métricas diarias en la nube y los usuarios que consultan concurrentemente el dashboard en producción) generarían bloqueos a nivel de archivo (`database is locked`) y dificultades para el despliegue serverless.
* **MySQL / MariaDB:** Rechazado por contar con un soporte menos ergonómico para arrays nativos e indexación especializada de campos JSON/arrays en comparación con PostgreSQL, además de que los principales proveedores de backend serverless gratuitos preferidos por la comunidad moderna (Supabase, Neon) se basan de forma nativa en PostgreSQL.

## Consecuencias

### Positivas
* Integridad referencial estricta y consistencia transaccional garantizada para el cálculo de puntajes globales y detección de anomalías (RF-006 a RF-008).
* Soporte nativo de funciones analíticas de ventana (`OVER (PARTITION BY ...)`), agregaciones temporales y percentiles para evaluar los SLAs de ITIL v4 (RF-012).
* Compatibilidad directa con proveedores en la nube como Supabase y Neon, que ofrecen tiers gratuitos permanentes que satisfacen plenamente el criterio de sostenibilidad y costo mínimo de RNF-011.
* Integración fluida con herramientas de TypeScript modernas en el backend como Drizzle ORM o Kysely.

### Negativas / Riesgos
* Requiere implementar un sistema de control de migraciones estructurado para versionar la evolución del esquema en el repositorio.
* En despliegues serverless o con muchas funciones concurrentes, se debe gestionar adecuadamente el pool de conexiones (usando PgBouncer o el connection pooling provisto por el proveedor).
