# Guía de Sustentación Oral y Estructura de Diapositivas

> **Proyecto:** Observatorio de Calidad Digital Pública del Perú  
> **Asignatura:** Gestión de Servicios de Tecnologías de la Información (GSTI)  
> **Institución:** Universidad Nacional de San Agustín de Arequipa (UNSA)  
> **Tiempo Estimado de Exposición:** 15 a 20 minutos + 5 minutos de preguntas  

---

## 1. Estructura Recomendada de Diapositivas (12 Slides)

```
[Slide 01: Carátula e Introducción]
[Slide 02: Planteamiento del Problema en el Estado Peruano]
[Slide 03: Marco Legal y Regulatorio Peruano]
[Slide 04: Marco de Gestión de Servicios TI (ITIL v4 & COBIT 2019)]
[Slide 05: Modelo de Calidad Ponderado 40/30/30 (ISO/IEC 25010)]
[Slide 06: Arquitectura Tecnológica del Sistema (C4 Container)]
[Slide 07: Pipeline del Colector y Cron Desatendido]
[Slide 08: DEMO 1: Tablero de Ranking Nacional y Filtros]
[Slide 09: DEMO 2: Gestión de Incidentes ITIL y Cumplimiento de SLAs]
[Slide 10: DEMO 3: Auditor IA con Arquitectura RAG Híbrida]
[Slide 11: Resultados Cuantitativos del Monitoreo a las 90 Entidades]
[Slide 12: Conclusiones y Aportes a la Gestión de TI]
```

---

## 2. Guion Detallado por Diapositiva (Speaker Notes)

### Diapositiva 1: Carátula e Información General
* **Título:** Observatorio de Calidad Digital Pública del Perú
* **Subtítulo:** Monitoreo Continuo de Disponibilidad, Rendimiento Core Web Vitals, Accesibilidad WCAG 2.1 AA y Gestión de SLAs ITIL v4 en 90 Portales del Estado.
* **Integrantes y Curso:** Gestión de Servicios de TI — Escuela Profesional de Ingeniería de Sistemas, UNSA.
* **Mensaje Clave:** Este proyecto no es solo un dashboard estético; es una plataforma integral de auditoría de servicios digitales que operacionaliza marcos de gobernanza y directivas legales reales.

---

### Diapositiva 2: Planteamiento del Problema
* **Puntos a Exponer:**
  * La transformación digital del Estado ha migrado trámites críticos (DNI, mesas de partes, pagos de impuestos, licencias) a canales web.
  * Sin embargo, la ciudadanía enfrenta frecuentemente: caídas inesperadas de servicio, demoras extremas de carga en redes móviles y barreras insalvables para personas con discapacidad visual.
  * **La brecha:** No existía un observatorio independiente que audite objetivamente si las 90 entidades públicas cumplen con los acuerdos de nivel de servicio (SLAs) exigidos por ley.

---

### Diapositiva 3: Marco Normativo Peruano
* **Puntos a Exponer:**
  * **Decreto Legislativo N° 1412 (Ley de Gobierno Digital):** Arts. 4 y 18 establecen la obligatoriedad de servicios digitales confiables, disponibles y accesibles.
  * **D.S. N° 029-2021-PCM (Reglamento):** Dispone que las sedes digitales del Estado deben cumplir obligatoriamente las pautas de accesibilidad *W3C WCAG 2.1 nivel AA* (Art. 52).
  * **Resolución SGTD N° 001-2025-PCM/SGTD:** Establece el lineamiento técnico de disponibilidad ininterrumpida ($24\times7$) de canales digitales institucionales.

---

### Diapositiva 4: Marco de Gestión de Servicios TI (ITIL v4 & COBIT 2019)
* **Puntos a Exponer:**
  * **Monitoring and Event Management:** Transformación de mediciones crudas de red en eventos informativos, advertencias y excepciones.
  * **Incident Management:** Registro de caídas en tiempo real, categorización por severidad y medición del **MTTR (Mean Time to Resolution)** con meta $\le 60$ minutos.
  * **Service Level Management (SLM):** Evaluación del SLA de disponibilidad mensual con meta $\ge 99.50\%$, clasificando en `CUMPLE`, `EN_RIESGO` o `INCUMPLE`.
  * **Problem Management (KEDB):** Base de errores conocidos para identificar causas raíz recurrentes (certificados TLS caducados, saturación de bases de datos).

---

### Diapositiva 5: Modelo de Calidad Ponderado (ISO/IEC 25010)
* **Fórmula:**
  $$\text{Score Global} = (0.40 \times \text{Disponibilidad}) + (0.30 \times \text{Rendimiento}) + (0.30 \times \text{Accesibilidad})$$
* **Defensa de las Ponderaciones:**
  1. **Disponibilidad (40%):** Confiabilidad operativa. Si el portal está fuera de línea, el servicio público se interrumpe por completo.
  2. **Rendimiento (30%):** Eficiencia de desempeño. Medido objetivamente mediante Core Web Vitals de Google (LCP $\le 2.5$s, CLS $\le 0.1$, INP $\le 200$ms).
  3. **Accesibilidad (30%):** Usabilidad universal. Medido mediante auditoría automática WCAG 2.1 AA (Axe-Core / Lighthouse). Es una obligación de derechos humanos e inclusión.

---

### Diapositiva 6: Arquitectura Tecnológica del Sistema
* **Diagrama de Componentes:**
  * **Colector Hexagonal:** `packages/collector` (sonda HTTP + PageSpeed Insights API).
  * **Base de Datos Híbrida:** Supabase PostgreSQL con extensión `pgvector` para embeddings.
  * **Backend REST:** `apps/api` con Bun runtime, endpoints de telemetría y chat SSE.
  * **Frontend Web:** `apps/dashboard` con Astro (Islands Architecture), Material Design 3 y cero dependencias pesadas.
  * **Motor RAG:** Google Gemini 2.5 Flash coordinando *Text-to-SQL* y búsqueda vectorial HNSW.

---

### Diapositiva 7: Automatización Desatendida (Cron CI/CD)
* **Puntos a Exponer:**
  * Flujo de trabajo en **GitHub Actions** (`daily-audit.yml`).
  * Cron programado a las **15:10 hora de Perú** (20:10 UTC), coincidiendo con el cierre de la jornada administrativa pública.
  * Procesamiento concurrente en lotes de 3 entidades con pausas para respetar cuotas de API sin costo de infraestructura ($0 USD).

---

### Diapositivas 8 a 10: DEMOSTRACIÓN EN VIVO (Live Demo)

#### Demo 1: Tablero de Ranking Nacional y Fichas Institucionales
* Mostrar el ordenamiento dinámico por Score Global, Disponibilidad, Rendimiento y Accesibilidad.
* Demostrar la **paginación interactiva** (15, 20, 30, Todas) y los filtros en tiempo real por categoría y región.
* Ingresar a la ficha de una entidad (ej. `/entidad/1`) mostrando el gráfico histórico interactivo SVG y el bloque de hallazgos WCAG con **código de remediación CSS/HTML**.

#### Demo 2: Tablero de Incidentes ITIL y Cumplimiento de SLAs
* Mostrar la página `/incidentes`:
  * Resaltar el **MTTR promedio calculado dinámicamente** sobre incidentes resueltos reales.
  * Mostrar la **causa raíz prevalente** calculada estadísticamente sobre los eventos.
  * Demostrar el **filtro interactivo en tiempo real** por severidad (Crítica, Alta), estado (Abierto, Resuelto) y búsqueda textual.
* Mostrar la página `/reportes` y descargar un dataset real en CSV.

#### Demo 3: Auditor IA Asistido por RAG
* Abrir `/auditor-ia` y realizar una pregunta combinada:
  * *"¿Por qué la entidad X incumple su SLA y qué norma peruana vulnera?"*
* Demostrar cómo el modelo ejecuta `execute_telemetry_sql` para extraer datos reales y `search_normative_base` para citar el artículo exacto del D.L. 1412 o D.S. 029-2021-PCM, emitiendo la respuesta mediante streaming SSE.

---

### Diapositiva 11: Resultados y Hallazgos Cuantitativos
* **Puntos a Exponer sobre los 90 Portales Evaluados:**
  * **Disponibilidad:** El promedio nacional bordea el 98.6%. Solo el ~78% de portales cumple formalmente la meta de 99.50% de SLA.
  * **Causas Críticas Detectadas:** Incidentes reales por DNS no configurado (`ENOTFOUND`), certificados TLS vencidos en portales regionales y bloqueos por WAF mal calibrados.
  * **Accesibilidad:** Criterios más vulnerados: contraste insuficiente en botones (`WCAG 1.4.3`) y falta de texto alternativo en carruseles institucionales (`WCAG 1.1.1`).

---

### Diapositiva 12: Conclusiones y Valor para la Gestión de TI
* **Puntos a Exponer:**
  1. **Alineamiento Real con ITIL v4:** Se demostró cómo los principios de SLM, Incident Management y Problem Management se implementan en un caso real del sector público.
  2. **Transparencia y Datos Abiertos:** La plataforma permite auditar sin sesgos ni estimaciones inventadas, proveyendo datasets interoperables.
  3. **Prescripción con IA Generativa:** La IA en GSTI no debe ser un juguete conversacional, sino una herramienta de *Grounding* normativo que genere valor acelerando la remediación de problemas técnicos.

---

## 3. Respuestas Preparadas para Preguntas Típicas del Jurado

* **Pregunta 1: ¿Por qué eligieron una ponderación 40/30/30 en lugar de 33/33/33?**  
  * *Respuesta:* Porque la Disponibilidad es un prerrequisito indispensable (confiabilidad ISO 25010). Un portal con excelente diseño o velocidad que está caído arroja valor cero para el ciudadano que necesita hacer un trámite urgente. El 40% asegura que la estabilidad sea el factor más determinante.

* **Pregunta 2: ¿Cómo garantizan que el chatbot RAG no invente artículos de ley?**  
  * *Respuesta:* Mediante la técnica de *Grounding* con embeddings densos en `pgvector`. El agente tiene instrucciones estrictas en su prompt de sistema para responder única y exclusivamente a partir de los fragmentos normativos recuperados con similitud coseno $\ge 0.60$, citando la fuente y el artículo verificado.

* **Pregunta 3: ¿Cómo manejan el riesgo de saturar los servidores de las entidades durante la auditoría?**  
  * *Respuesta:* El colector implementa arquitectura de lotes pequeños (3 entidades concurrentes) con retardos (*delays*) configurables de 1500 ms y se ejecuta en la ventana vespertina (15:10 PET), minimizando cualquier impacto en el tráfico del portal.

---

*Guía oficial de sustentación GSTI — Universidad Nacional de San Agustín de Arequipa (UNSA).*
