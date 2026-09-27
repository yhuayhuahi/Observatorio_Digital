# ADR 0006: Uso de APIs de Google (PageSpeed Insights y Lighthouse) para Métricas de Desempeño y Accesibilidad

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública tiene por mandato medir objetivamente el desempeño y la accesibilidad de 90 portales del Estado (Ministerios, GOREs, Organismos Autónomos y Municipalidades), según lo establecido en la Ley de Gobierno Digital (D.L. 1412) y los requerimientos funcionales RF-003 (medir velocidad de carga y Core Web Vitals: LCP, FID/INP, CLS) y RF-004 (evaluar accesibilidad según WCAG 2.1 nivel AA).

Asimismo, el requerimiento RNF-009 exige explícitamente: *"El sistema debe poder integrarse con APIs de monitoreo (PageSpeed Insights, Lighthouse) y exportar datos en formatos estándar (CSV, JSON). Criterio: Integración con al menos 2 APIs externas"*. Por último, la literatura académica de referencia (Ghattas et al., 2025; Adedoja, 2026; Uwase y Luhanga, 2026 citados en `contexto.md`) resalta la necesidad de emplear metodologías estandarizadas y auditables por terceros para que los hallazgos tengan validez científica e institucional.

## Decisión
Adoptar la **API REST oficial de Google PageSpeed Insights v5** (complementada, en caso de respaldo o pruebas locales en entorno de desarrollo, con la librería/CLI de Lighthouse) como el motor principal de auditoría automatizada externa para:
1. Extraer métricas estandarizadas de Core Web Vitals en entorno móvil y de escritorio (LCP, CLS, FCP, TTFB, INP).
2. Auditar el cumplimiento de accesibilidad bajo el estándar internacional **WCAG 2.1 (nivel AA)**, obteniendo los puntajes consolidados (0-100) y la lista estructurada de errores detectados (contraste de color, atributos alt en imágenes, estructura semántica ARIA).

## Alternativas Consideradas
* **Ejecución local exclusiva de Lighthouse (Puppeteer / Chromium headless en el runner):** Rechazado como método principal porque levantar instancias headless de Chrome en runners de GitHub Actions consume un volumen elevado de CPU y memoria RAM, genera throttling variable según la carga del servidor de CI y arroja resultados menos consistentes en comparación con la infraestructura controlada de Google PageSpeed.
* **WebPageTest API:** Rechazado debido a que sus planes gratuitos imponen cuotas estrictas de muy pocas ejecuciones diarias (insuficientes para auditar 90 entidades de forma constante) y sus planes comerciales incumplen la restricción de presupuesto mensual de RNF-011.
* **Servicios comerciales cerrados (Pingdom, GTmetrix, Siteimprove):** Rechazados por el elevado costo por URL monitoreada, falta de transparencia en los algoritmos internos de puntuación y dificultad de integración programática en comparación con la API abierta de PageSpeed Insights.

## Consecuencias

### Positivas
* Mediciones científicamente respaldadas y alineadas con el estándar de la industria adoptado globalmente para la evaluación de calidad web gubernamental.
* Cumplimiento directo y comprobable del requerimiento RNF-009 (integración con APIs de monitoreo).
* Cuota gratuita generosa provista por Google Cloud (hasta 25,000 solicitudes diarias con una API Key gratuita), cubriendo con holgura las 90 evaluaciones diarias y reintentos sin costo alguno (RNF-011).
* Retorno de datos en formato JSON exhaustivo y estructurado, permitiendo almacenar métricas clave y detalles de auditoría en PostgreSQL sin pasos de parseo intermedios.

### Negativas / Riesgos
* Cada análisis individual en PageSpeed Insights toma entre 10 y 30 segundos por portal, por lo que auditar 90 URLs requiere implementar una estrategia de procesamiento por lotes con retraso controlado (rate limiting) para no exceder las cuotas por minuto.
* La disponibilidad del servicio depende de la infraestructura externa de Google; ante caídas temporales de la API se deben implementar mecanismos de reintento exponencial y registro de incidentes en el script.
