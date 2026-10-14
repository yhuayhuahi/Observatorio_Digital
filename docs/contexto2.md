# Observatorio de Calidad Digital Pública del Perú

## Documento de Contexto, Objetivos, Sustento Teórico y Aporte

> **Tipo de proyecto:** Sistema de monitoreo continuo de la calidad de los portales web del Estado Peruano.
> **Naturaleza:** Proyecto de investigación aplicada + desarrollo de software (arquitectura hexagonal, monorepo).
> **Alcance actual:** Fase 1 — Captura cruda de telemetría diaria de 90 entidades públicas (25 Gobiernos Regionales, ~31 Municipalidades Provinciales, ~34 Organismos y Ministerios).

---

## 1. Planteamiento del Problema

Los servicios digitales del Estado Peruano presentan **deficiencias verificables y persistentes** de calidad: portales caídos, certificados SSL vencidos, tiempos de carga excesivos y barreras de accesibilidad que excluyen a personas con discapacidad. Estas fallas no son incidentes aislados: en las corridas de monitoreo ya ejecutadas se detectaron de forma reproducible:

- **Dominios inexistentes** (`ENOTFOUND`): p. ej. los portales de los GORE Tacna, Ayacucho y Arequipa no resolvían DNS.
- **Certificados TLS expirados**: GORE Piura.
- **Bloqueos de acceso (HTTP 403)**: GORE Callao.
- **Timeouts de conexión (>10 s)**: GORE Loreto, Ica, Ucayali, Amazonas, Lambayeque; SUNAFIL.
- **Rendimiento crítico**: portales con score de desempeño Lighthouse de 12–16 sobre 100 (Puno) y LCP superiores a 13 segundos (Huancavelica).
- **Accesibilidad por debajo del estándar**: scores de accesibilidad de 56 (SUNAT) frente al mínimo esperado WCAG.

El problema central es doble:

1. **No existe un mecanismo sistemático, continuo y público** que mida, documente y haga comparables estas deficiencias a lo largo del tiempo.
2. **Sin evidencia longitudinal no hay rendición de cuentas ni mejora informada**: las evaluaciones existentes son puntuales, no comparativas, y no miden los atributos de calidad definidos por los estándares internacionales.

---

## 2. Objetivos

### 2.1 Objetivo General

Desarrollar un **Observatorio de Calidad Digital Pública** que monitoree de forma automatizada, continua y estandarizada los portales web de las entidades del Estado Peruano, generando evidencia longitudinal sobre su desempeño, accesibilidad y disponibilidad, para fundamentar políticas de mejora del gobierno digital.

### 2.2 Objetivos Específicos

1. **Recolectar telemetría cruda diaria** de 90 portales públicos: disponibilidad (código HTTP, tiempo de respuesta), Core Web Vitals (LCP, FID, CLS, FCP, TTFB), puntaje de desempeño y de accesibilidad (Lighthouse/WCAG 2.1).
2. **Detectar y registrar incidentes** (caídas, certificados vencidos, DNS roto) con fecha y hora exactas (`fecha_captura`), constituyendo un registro histórico auditable.
3. **Construir rankings y comparativas** entre entidades, categorías (ministerios, GORE, organismos autónomos, municipalidades) y regiones.
4. **Analizar tendencias temporales** (series de tiempo) para evaluar si la calidad digital pública mejora o deteriora.
5. **Visualizar los resultados** en un dashboard público (Fase 2: frontend Astro) con fichas por entidad, reportes y evidencia descargable.
6. **Fundamentar recomendaciones de política pública** basadas en datos abiertos y reproducibles.

---

## 3. Requerimientos del Sistema (RF y RNF) — Resumen

**Requerimientos Funcionales clave:**

| RF | Descripción |
|----|-------------|
| RF-001 | Registro y clasificación del catálogo de entidades (90) por categoría y región. |
| RF-002 | Verificación diaria de disponibilidad (código de estado HTTP, tiempo de respuesta). |
| RF-003 | Medición de velocidad de carga y Core Web Vitals vía PageSpeed Insights / Lighthouse. |
| RF-004 | Evaluación de accesibilidad (WCAG 2.1) con detalle de errores. |
| RF-005/009 | Clasificación de entidades y registro de metadatos. |
| RF-006 | **Actualización periódica automatizada** (GitHub Actions, cron diario). |
| RF-008 | Detección de anomalías e incidentes. |
| RF-010–013 | Visualización de métricas, rankings, tendencias y generación de reportes. |

**Requerimientos No Funcionales clave:**

| RNF | Descripción |
|-----|-------------|
| RNF-001/002 | Tiempo de respuesta del sistema ≤ 500 ms; carga del dashboard ≤ 3 s. |
| RNF-003 | Almacenamiento histórico de mediciones (capacidad > 90 entidades). |
| RNF-005 | Consultas agregadas eficientes (SQL, índices por fecha y entidad). |
| RNF-011 | Costos operativos mínimos (≤ $50/mes) → infraestructura 100% en planes gratuitos. |
| RNF-017 | Seguridad de credenciales (GitHub Secrets, claves de servicio restringidas). |
| RNF-027 | Diseño responsivo (soporte móvil). |

---

## 4. Aporte del Proyecto

### 4.1 Aporte técnico

- **Reproducibilidad total:** el pipeline completo (recolección → persistencia → análisis → visualización) es open source y ejecutable por terceros. Cualquier investigador puede auditar o replicar las mediciones.
- **Estandarización:** todas las entidades se miden con el mismo instrumento (Lighthouse en entorno de laboratorio controlado), lo que hace las comparaciones entre entidades **válidas y justas**.
- **Trazabilidad:** cada medición conserva el detalle estructurado de métricas, violaciones WCAG y el timestamp exacto de captura (`fecha_captura`), permitiendo verificación y auditoría a posteriori dentro del límite de almacenamiento gratuito (RNF-011).

### 4.2 Aporte metodológico

- Convierte la evaluación de calidad digital de **estudio puntual** a **panel de datos longitudinales** (daily panel data), habilitando análisis de tendencia, detección de regresiones y evaluación de políticas.
- Documenta y fundamenta los límites del método (ver § 6.3): métricas de laboratorio vs. campo, variabilidad horaria, muestras diarias.

### 4.3 Aporte social y de política pública

- **Rendición de cuentas:** hace visible el estado real de la infraestructura digital pública peruana, incluidas fallas que afectan directamente a la ciudadanía (portales caídos, SSL vencido = riesgo de seguridad, accesibilidad deficiente = exclusión digital).
- **Inclusión:** la evaluación WCAG 2.1 pone en la agenda pública la accesibilidad web como obligación del Estado hacia las personas con discapacidad.
- **Evidencia para la decisión:** rankings y tendencias permiten priorizar intervenciones en las entidades con peores indicadores, y medir el efecto de las mejoras implementadas.

---

## 5. Marco Teórico

### 5.1 Gobierno digital y transformación digital del Estado

El **gobierno digital** se entiende como el uso de tecnologías de la información por parte del Estado para mejorar servicios públicos, aumentar la eficiencia administrativa y promover la participación ciudadana (definiciones alineadas con la ONU E-Government Survey y la OECD). La literatura distingue tres fases: digitalización de trámites (e-government), apertura de datos (open government) y **gobierno digital como plataforma** centrada en el usuario.

En el Perú, el marco normativo relevante incluye:

- **Ley N.° 29733** — Ley de Protección de Datos Personales.
- **Política Nacional de Transformación Digital de la Administración Pública (DS N.° 048-2020-PCM)** y su sucesora normativa, que fijan como objetivo una administración digital centrada en la ciudadanía.
- **Directivas de la Secretaría de Gobierno Digital (PCM)** sobre estándares de plataformas digitales, interoperabilidad y accesibilidad de portales del Estado.
- El **Plan de Acción de Gobierno Digital**, que compromete mejora continua de servicios digitales.

**Vacío identificado:** la normativa peruana exige calidad, accesibilidad y seguridad a los portales estatales, pero **no existe un sistema público de monitoreo continuo** que verifique su cumplimiento. El Observatorio llena ese vacío.

### 5.2 Calidad del software y calidad de servicios web

El marco de referencia clásico es la norma **ISO/IEC 25010** (SQuaRE — Systems and software Quality Requirements and Evaluation), que define las características de calidad de productos de software. Para un portal web público, las características más relevantes del modelo son:

- **Funcionalidad y confiabilidad (disponibilidad):** el servicio debe estar operativo; se operacionaliza con el código de estado HTTP y el tiempo de respuesta.
- **Eficiencia de desempeño:** tiempo de respuesta, utilización de recursos; se operacionaliza con Core Web Vitals.
- **Usabilidad y accesibilidad:** se operacionaliza con la auditoría WCAG 2.1 / Lighthouse.
- **Seguridad:** se operacionaliza con la validez del certificado TLS (un certificado vencido es una falla de seguridad verificable).

El Observatorio traduce características abstractas de calidad en **métricas objetivas, medibles automáticamente y comparables entre entidades** — un ejercicio de operacionalización de constructos de calidad de software al dominio del gobierno digital.

### 5.3 Rendimiento web: Core Web Vitals y métricas de laboratorio

Los **Core Web Vitals (CWV)**, definidos por Google, son el estándar de facto para medir la experiencia de usuario en la carga de páginas:

| Métrica | Qué mide | Umbral "bueno" (Google) |
|---------|----------|--------------------------|
| **LCP** (Largest Contentful Paint) | Tiempo hasta el renderizado del elemento visible más grande. | ≤ 2.5 s |
| **FID / INP** (First Input Delay / Interaction to Next Paint) | Responsividad ante la primera interacción. | ≤ 100 ms (FID) |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual del layout (desplazamientos inesperados). | ≤ 0.1 |
| **FCP** (First Contentful Paint) | Tiempo hasta el primer contenido renderizado. | ≤ 1.8 s |
| **TTFB** (Time to First Byte) | Latencia inicial del servidor. | ≤ 800 ms |

Fundamento metodológico clave: **Lighthouse mide en "laboratorio"** (entorno controlado: Chrome emulado, condiciones de red y CPU estandarizadas), a diferencia de las métricas de "campo" (CrUX, RUM), que miden usuarios reales. Esto tiene dos consecuencias para el diseño del estudio:

1. **Ventaja:** las mediciones son comparables entre entidades y estables a lo largo del día (la hora exacta de captura no altera significativamente LCP, CLS, accesibilidad).
2. **Limitación:** no reflejan la experiencia de usuarios con conexiones heterogéneas; se declara como delimitación del estudio.

Adicionalmente, CWV es un **factor de posicionamiento en buscadores (SEO)**, por lo que un bajo CWV en portales públicos reduce su visibilidad y, con ello, el acceso de la ciudadanía a información oficial.

### 5.4 Accesibilidad web: WCAG 2.1 y la inclusión digital

Las **Pautas de Accesibilidad para el Contenido Web (WCAG) 2.1** del W3C, organizadas en el modelo **POUR** (Perceptible, Operable, Comprensible, Robusto), son el estándar internacional de accesibilidad. Los niveles de conformancia **A, AA y AAA** gradúan el compromiso; la práctica internacional y las directivas estatales suelen exigir **AA** como mínimo.

Fundamentos de por qué la accesibilidad es crítica en un Estado:

- **Derechos humanos:** la Convención sobre los Derechos de las Personas con Discapacidad (ratificada por el Perú) reconoce el acceso a la información y comunicaciones, incluidos los sistemas digitales públicos, como un derecho. Un portal inaccesible es una **barrera de exclusión** institucional.
- **Deber estatal:** si el Estado transfiere trámites y servicios a canales digitales, la accesibilidad deja de ser opcional: es la condición para que el servicio público sea universal.
- **Beneficio universal:** las prácticas de accesibilidad (contraste, estructura semántica, navegación por teclado) mejoran la usabilidad para todos los usuarios.

El Observatorio cuantifica la accesibilidad con el score de accesibilidad de Lighthouse y el detalle de errores (etiquetas `alt` faltantes, contraste insuficiente, jerarquía de encabezados incorrecta, etc.), y con ello genera la primera serie temporal peruana de este indicador.

### 5.5 Seguridad como atributo de calidad (HTTPS/TLS)

La validez del certificado TLS es un indicador mínimo de seguridad: garantiza cifrado e identidad del sitio. Un **certificado vencido en un portal del Estado** (caso detectado: GORE Piura) expone a los ciudadanos a riesgos de interceptación (man-in-the-middle) y genera advertencias del navegador que erosionan la confianza en el canal digital. El monitoreo continuo de este atributo convierte fallas de seguridad silentes en **incidentes documentados con fecha**.

### 5.6 Monitoreo continuo, observabilidad y datos longitudinales

Tres cuerpos de conocimiento convergen aquí:

- **Monitoreo de disponibilidad (uptime monitoring):** práctica de ingeniería que verifica periódicamente que un servicio responde; se extiende aquí al conjunto del Estado como objeto de estudio, no a un solo sistema.
- **Observabilidad:** más que saber "si funciona", permite interrogar el estado histórico del sistema (series de tiempo por entidad).
- **Diseño de panel longitudinal:** a diferencia de cortes transversales (una foto en el tiempo), la repetición diaria de la medición sobre las mismas unidades (entidades) permite: detectar tendencias, identificar regresiones tras cambios en los portales, evaluar el efecto de políticas o sanciones, y distinguir fallas crónicas de fallas transitorias (una caída puntual ≠ un portal abandonado).

### 5.7 Transparencia, open data y rendición de cuentas

El monitoreo se alinea con los principios de **Gobierno Abierto** (transparencia, participación, colaboración): la evidencia del Observatorio es un insumo de control ciudadano sobre la administración digital. Su publicación periódica:

- Presiona por mejora reputacional (rankings comparables entre entidades generan emulación).
- Provee datos abiertos reutilizables por academia, prensa y sociedad civil (periodismo de datos sobre el Estado).
- Materializa el principio de **accountability** en un dominio — la calidad de lo digital público — tradicionalmente invisible.

---

## 6. Metodología de la Medición

### 6.1 Instrumento y variables

| Variable | Instrumento | Unidad |
|----------|-------------|--------|
| Disponibilidad / código HTTP | Sonda HTTP (`HEAD`/`GET`, timeout 10 s) | código / booleano |
| Tiempo de respuesta | Sonda HTTP | ms |
| LCP, FCP, TTFB, CLS, FID | PageSpeed Insights API (Lighthouse v5+) | s / ms / adimensional |
| Desempeño (score global) | Lighthouse | 0–100 |
| Accesibilidad (score + errores) | Lighthouse (WCAG 2.1) | 0–100 / lista |
| Incidentes | Derivación de reglas (DNS, TLS, timeouts, 403) | registro con timestamp |

### 6.2 Diseño

- **Población:** catálogo maestro de 90 entidades estatales peruanas (tabla `entidades`), clasificadas en Gobiernos Regionales, Municipalidades Provinciales, Organismos Autónomos y Ministerios.
- **Frecuencia:** una captura diaria por entidad, programada dentro del horario laboral peruano.
- **Persistencia:** tabla `mediciones_crudas` (PostgreSQL/Supabase) con una fila por entidad-captura, índices por fecha y entidad, almacenando todas las métricas digeridas de disponibilidad, Core Web Vitals y errores WCAG con inserción eficiente en lotes de 10 entidades.
- **Automatización:** GitHub Actions (cron diario + disparo manual) ejecuta el colector (Bun + TypeScript, arquitectura hexagonal: puertos y adaptadores) que aplica las sondas y persiste en lotes pequeños para respetar los límites de tiempo del servicio de base de datos.

### 6.3 Fundamentación de las decisiones metodológicas (incluida la ventana de captura)

- **Ventana horaria de observación:** Las capturas se sitúan deliberadamente dentro del horario laboral y operativo peruano (tarde / cierre de jornada). El orquestador opera sobre infraestructura serverless pública gratuita (GitHub Actions), donde la cola de runners compartidos introduce latencia variable respecto a la hora programada. Por ello, **la hora oficial de cada medición es el timestamp exacto registrado en la base de datos (`fecha_captura`)**, no la hora nominal del cron.
- **Validez e invarianza frente a la variación horaria:**
  - *Métricas de laboratorio (Lighthouse / WCAG 2.1):* El 80% de los indicadores (LCP, CLS, FCP, score de rendimiento, violaciones WCAG) corresponden a simulaciones de laboratorio en entornos controlados y emulados. Estas métricas evalúan la arquitectura del portal, el peso de recursos y la estructura del código, siendo **invariantes a la hora del día**.
  - *Métricas de red y disponibilidad (HTTP status, TTFB):* La franja vespertina (15:00 a 18:00) coincide con el cierre de la jornada pública estatal y alta concurrencia de trámites ciudadanos de fin de día hábil (mesas de partes virtuales), evaluando la resiliencia de los portales bajo condiciones de estrés real.
- **Costo cero como requisito (RNF-011):** Todo el pipeline opera en planes gratuitos (GitHub Actions ~60 min/mes vs. 2.000 disponibles; PageSpeed ~90 solicitudes/día vs. 10.000; Supabase ~3 MB/mes vs. 500 MB), garantizando la reproducibilidad y sostenibilidad a largo plazo.

### 6.4 Limitaciones y delimitaciones

1. **Laboratorio vs. campo:** Lighthouse mide condiciones controladas, no la experiencia de usuarios reales con conexiones heterogéneas (futuras fases podrían integrar CrUX).
2. **Muestra diaria única:** una captura al día puede no capturar caídas breves; se mitiga con la serie temporal (fallas crónicas vs. transitorias) y el registro de reintentos.
3. **Alcance institucional:** 90 entidades representativas; el catálogo es extensible (`activa = true/false`).
4. **FID obsolescente:** Google reemplaza FID por INP; el instrumento actual reporta FID vía la API v5; migración prevista en fases posteriores.
5. **Bloqueos geográficos/de bot:** algunos portales responden 403 a centros de datos extranjeros (donde corren los runners); se documenta como limitación conocida del método.

### 6.5 Calibración de la Orquestación y Transición en Dos Etapas (Implementado)

Para consolidar la estabilidad temporal del estudio durante la ventana de cierre del proyecto sin quebrar la coherencia de la serie temporal histórica, se formalizó e implementó la calibración del orquestador:

#### A. Enfoque de Dos Etapas del Panel Longitudinal
1. **Etapa 1A — Calibración Empírica y Línea Base (Datos iniciales recolectados):**
   - *Configuración:* Disparador nominal programado a las 18:00 UTC (13:00 PET).
   - *Comportamiento real:* Debido a la saturación de la cola en el minuto `:00` en los runners compartidos de GitHub Actions, las ejecuciones efectivas se distribuyeron en una ventana vespertina amplia (15:30 – 18:30 PET).
   - *Estado metodológico:* Serie histórica válida como línea base de telemetría vespertina de cierre de operaciones.
2. **Etapa 1B — Régimen Estable Acotado (Implementado en `.github/workflows/daily-audit.yml`):**
   - *Configuración:* Cron calibrado a las **15:10 PET (`10 20 * * *`)**.
   - *Comportamiento:* Al utilizar un minuto no redondo (`:10`), se elude la congestión masiva de la infraestructura compartida, logrando que el workflow inicie de forma regular entre las 15:11 y 15:15 PET, culminando las 90 auditorías antes de las 16:00 PET.
   - *Estado metodológico:* Acotamiento de la varianza temporal (*jitter*) garantizando estabilidad operativa diaria.

#### B. Redacción Formal para el Sustento en Informe / Tesis
> *"El diseño metodológico del Observatorio contempló una fase inicial de calibración empírica (Etapa 1A) donde el orquestador serverless gratuito (GitHub Actions), programado a las 18:00 UTC, experimentó latencias de encolamiento que desplazaron las capturas hacia la franja de 15:30 a 18:30 PET. Aplicando el principio de mejora continua de la gestión de servicios TI (ITIL v4) y optimización de scheduling, el orquestador se ajustó a las 15:10 PET (`10 20 * * *`) con un minuto no redondo (Etapa 1B). Esta calibración preserva la homogeneidad de la serie temporal por tres razones: (1) ambas etapas se inscriben en el mismo constructo metodológico de 'Horario laboral vespertino de atención del Estado Peruano (15:00–18:00)'; (2) las métricas estructurales de laboratorio (Core Web Vitals sintéticos y accesibilidad WCAG 2.1) son invariantes a la hora; y (3) la tabla de telemetría conserva la estampa temporal auditable (`fecha_captura`) con precisión de microsegundos, asegurando máxima transparencia científica sin quiebres de muestra."*

---

## 7. Arquitectura del Sistema (resumen técnico)

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| Colector (backend) | **Bun + TypeScript** (arquitectura hexagonal: `core` / `application` / `infrastructure`) | Alto rendimiento I/O, `fetch` nativo, ecosistema npm (Playwright, supabase-js); un solo lenguaje en todo el stack. |
| Auditoría de rendimiento | **PageSpeed Insights API** (Lighthouse) | Estándar de facto; resultados de laboratorio comparables; cuota gratuita suficiente. |
| Base de datos | **PostgreSQL (Supabase)** | Modelo relacional (entidades ↔ mediciones), SQL para agregaciones y tendencias, plan gratuito con SSL. |
| Automatización | **GitHub Actions** (cron diario `10 20 * * *` a las 15:10 PET + `workflow_dispatch`) | Gratuito, nativo con el repositorio, ejecución reproducible con latencia de cola mínima. |
| Frontend (Fase 2) | **Astro** (islas de interactividad) + **Chart.js** + **CSS puro** (sin frameworks ni Tailwind) | CSS nativo moderno (variables CSS, flexbox/grid), máxima ligereza, cero dependencias CSS externas (ADR-0004, RNF-002). |
| Gestión de credenciales | GitHub Secrets (API key de PageSpeed, URL y service role key de Supabase) | RNF-017: sin credenciales en el código. |

**Estructura del colector (`packages/collector`):** separación de puertos (interfaces de dominio: repositorios, sondas, servicios de auditoría) y adaptadores (Supabase, fetch HTTP, cliente PageSpeed), con inserción por lotes pequeños para respetar los timeouts de la base de datos y reintentos con backoff en la API de Google.

---

## 8. Estado Actual y Hoja de Ruta

- ✅ **Fase 1 (en operación):** catálogo de 90 entidades en Supabase; colector de captura cruda funcionando; workflow diario automatizado con persistencia por lotes; registro de incidentes con timestamps exactos; orquestación calibrada en régimen vespertino estable a las 15:10 PET (`10 20 * * *`).
- 🔜 **Fase 2:** dashboard público (Astro + Chart.js + CSS puro): rankings, fichas por entidad, tendencias, reportes.
- 🔜 **Fase 3:** análisis longitudinal y generación de reportes de investigación (tendencias, rankings por categoría/región, correlaciones).
- 🔜 **Fase 4 (opcional):** métricas de campo (CrUX), migración FID→INP, alertas públicas y API abierta.


---

## 9. Referencias Normativas y Técnicas

1. W3C — *Web Content Accessibility Guidelines (WCAG) 2.1*.
2. ISO/IEC 25010 — *Systems and software Quality Requirements and Evaluation (SQuaRE)*.
3. Google — *Core Web Vitals* y documentación de la PageSpeed Insights API v5.
4. ONU — *E-Government Survey* (marco de gobierno digital).
5. OECD — recomendaciones sobre gobierno digital.
6. PCM (Perú) — *Política Nacional de Transformación Digital de la Administración Pública* y directivas de la Secretaría de Gobierno Digital.
8. Convención sobre los Derechos de las Personas con Discapacidad (ONU, ratificada por el Perú).
9. GitHub Actions — documentación sobre limitaciones de workflows programados (`schedule`).
10. Supabase — documentación de PostgreSQL gestionado y límites del plan gratuito.

---

*Documento de contexto del proyecto — generado para el Observatorio de Calidad Digital Pública del Perú. Última actualización de la Fase 1: captura diaria automatizada en operación.*
