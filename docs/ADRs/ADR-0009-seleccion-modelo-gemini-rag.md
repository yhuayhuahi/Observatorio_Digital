# ADR 0009: Selección de Modelos Google Gemini (3.5 Flash-Lite y 3.5 Flash) y Embeddings para el Sistema RAG de Auditoría

* **Estatus:** Aceptado
* **Fecha:** 2026-10-16
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública integra un componente de Inteligencia Artificial Generativa bajo el paradigma **RAG (Retrieval-Augmented Generation)** (RF-010). Este componente asume dos cargas de trabajo con requerimientos operacionales distintos:

1. **Evaluación Experimental y Pruebas del Artículo Científico:** Se requiere ejecutar baterías de cientos de pruebas automatizadas para medir cuantitativamente el desempeño del RAG (métricas de fidelidad factual *faithfulness*, relevancia de respuesta *answer relevance* y precisión de contexto con frameworks como RAGAS). Esta carga implica un alto volumen de transacciones que podría saturar fácilmente los límites de cuota por minuto (*rate limits*) de una API gratuita estándar.
2. **Funcionalidad Interactiva y Despliegue en Producción:** Interacción directa con usuarios finales (jefes de TI, auditores de PCM/Contraloría y ciudadanos) en el dashboard web, requiriendo traducción precisa de lenguaje natural a SQL (*Tool Calling / Text-to-SQL*), razonamiento prescriptivo profundo y redacción formal de dictámenes de cumplimiento de la Ley de Gobierno Digital (D.L. 1412 y D.S. 029-2021-PCM).

Todo esto debe operar bajo el principio de **costo operativo cero ($0 USD/mes)** fijado en el RNF-011.

## Decisión
Adoptar una **estrategia de dos modelos (Tiered Model Strategy)** de la familia **Google Gemini 3.x** a través de **Google AI Studio**, unificada con el modelo de embeddings nativo de Google:

1. **Modelo Primario para Pruebas Experimentales del Artículo y Desarrollo:** **`Gemini 3.5 Flash-Lite`** (endpoint: `gemini-3.5-flash-lite`).
   * *Rol:* Ejecución de pruebas unitarias, validaciones de prompts, generación sintética de preguntas y evaluación masiva de métricas del artículo científico.
   * *Propósito:* Su diseño ultraligero y de alta velocidad maximiza el rendimiento transaccional y minimiza el consumo de tokens y cuotas por minuto (RPM/TPM), evitando bloqueos durante las corridas de experimentación.
2. **Modelo Complementario para Funcionalidad Interactiva en Producción:** **`Gemini 3.5 Flash`** (endpoint: `gemini-3.5-flash`).
   * *Rol:* Atención de consultas interactivas complejas en el frontend del Observatorio.
   * *Propósito:* Dispone de mayor capacidad de razonamiento contextualizado y soporte refinado de llamadas a funciones (*Tool Calling*) para generar reportes prescriptivos formales a funcionarios públicos.
3. **Modelo de Embeddings Vectoriales:** **`gemini-embedding-001`**.
   * *Rol:* Generación de vectores densos en **768 dimensiones** para el corpus normativo y técnico (D.L. 1412, D.S. 029-2021-PCM, WCAG 2.1 e ITIL v4) almacenado en `pgvector` sobre Supabase ([ADR-0008](./ADR-0008-uso-de-pgvector-en-supabase.md)).
4. **Estrategia de Gestión de Cuotas y Claves de API:**
   * El sistema soportará configuración mediante variables de entorno para rotación de múltiples API Keys de Google AI Studio en caso de requerirse sesiones intensivas de evaluación para el artículo.

## Justificación Técnica
* **Disponibilidad Inmediata y Activa:** A diferencia de Gemini 2.5, los modelos `Gemini 3.5 Flash-Lite` y `Gemini 3.5 Flash` se encuentran plenamente vigentes y disponibles para nuevos proyectos en Google AI Studio sin restricciones de acceso previo.
* **Eficiencia Operativa para el Paper (Flash-Lite):** El modelo Flash-Lite permite correr las baterías de evaluación empírica exigidas por la investigación (cientos de consultas evaluadas contra ground-truth) de forma económica y veloz sin agotar la tasa de uso de la cuenta.
* **Capacidad de Inferencia y Tool Calling (Flash):** Gemini 3.5 Flash provee precisión de vanguardia en la generación de consultas SQL parametrizadas hacia Supabase y en la interpretación de violaciones WCAG 2.1 sin incurrir en alucinaciones normativas.
* **Ventana de Contexto de 1M+ Tokens:** Ambos modelos comparten una ventana de contexto de un millón de tokens, lo que permite pasar esquemas de base de datos completos y transcripciones normativas completas sin truncamiento.
* **Costo Cero ($0 USD/mes):** El acceso a través del nivel gratuito de Google AI Studio satisface estrictamente el RNF-011. La dimensionalidad compacta de 768d en `gemini-embedding-001` optimiza además el espacio de almacenamiento en Supabase a menos de 8 MB.

## Consecuencias

### Positivas
* Flexibilidad arquitectónica: el código del backend RAG abstrae el modelo mediante un parámetro de configuración (`MODEL_NAME`), permitiendo alternar entre `gemini-3.5-flash-lite` para tests automatizados y `gemini-3.5-flash` para producción con un solo cambio de variable de entorno.
* Blindaje contra saturación de cuotas gracias a la ligereza de Flash-Lite durante la fase experimental del artículo.
* Tiempos de respuesta inferiores a 1 segundo para el primer token, logrando una experiencia fluida en el chat del Observatorio.

### Negativas / Riesgos
* Se debe contemplar en el código del cliente RAG la captura del error `HTTP 429 Too Many Requests` con reintentos exponenciales (*exponential backoff*) y rotación de API Keys si se ejecutan corridas masivas en paralelo para el artículo.
