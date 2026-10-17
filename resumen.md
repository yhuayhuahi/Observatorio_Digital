# Resumen Ejecutivo del Proyecto de Investigación y Desarrollo

## Observatorio de Calidad Digital Pública del Estado Peruano

* **Institución:** Universidad Nacional de San Agustín de Arequipa (UNSA)
* **Facultad:** Facultad de Ingeniería de Producción y Servicios — Escuela Profesional de Ingeniería de Sistemas
* **Asignatura:** Gestión de Sistemas y Tecnologías de Información (GSTI)
* **Docente:** Ing. Ricardo Fabrizio Calienes Rodríguez
* **Año Académico:** 2026

---

### 1. Objetivos del Proyecto

1. **Objetivo de Investigación (Artículo Científico):**  
   Proponer un marco cuantitativo y sistemático de gobernanza de TI basado en **ITIL v4** (Gestión de Eventos, Gestión de Incidentes y Gestión de Niveles de Servicio - SLAs) y la norma **ISO/IEC 25010**, evaluando de forma empírica y longitudinal la disponibilidad (*uptime*), el rendimiento (*Core Web Vitals*) y la accesibilidad universal (*WCAG 2.1 AA*) de los portales del Estado peruano, contrastando los hallazgos contra la **Ley de Gobierno Digital (D.L. N.° 1412)** y su reglamento (**D.S. N.° 029-2021-PCM**).

2. **Objetivo de Ingeniería de Software (Observatorio Digital):**  
   Desarrollar una plataforma integral, desacoplada y de costo operativo cero ($0 USD/mes) compuesta por un módulo colector autónomo diario, una base de datos relacional y vectorial en PostgreSQL (`pgvector`), un backend analítico de alto desempeño en Bun y un panel web de alta accesibilidad en Astro con un **Agente Conversacional Inteligente con RAG Híbrido** para auditoría y remediación técnica asistida por IA.

---

### 2. Alcance y Muestra Representativa (90 Entidades Públicas)

La muestra contempla **90 entidades públicas estratégicas** del Estado peruano:

* **20 Entidades del Poder Ejecutivo:** Presidencia de la República, Presidencia del Consejo de Ministros (PCM) y los 18 Ministerios.
* **25 Gobiernos Regionales (GOREs):** Todas las sedes regionales del país.
* **30 Municipalidades Provinciales:** Gobiernos locales seleccionados por densidad poblacional e impacto socioeconómico.
* **15 Organismos Autónomos:** Instituciones de alto tráfico y servicios críticos a la ciudadanía (RENIEC, SUNAT, ONPE, JNE, Banco Central de Reserva, Contraloría, etc.).

---

### 3. Dimensiones de Evaluación y Modelo Ponderado (40 / 30 / 30)

El Índice de Calidad Digital consolida tres dimensiones técnicas normalizadas de 0 a 100 puntos:

$$\text{Score Global} = (0.40 \times \text{Disponibilidad}) + (0.30 \times \text{Rendimiento}) + (0.30 \times \text{Accesibilidad})$$

1. **Disponibilidad y Confiabilidad (40%):**  
   * Monitoreo continuo del estado HTTP (200, 403, 500, etc.), latencia de red (TTFB), resolución DNS y certificados de seguridad TLS/SSL.
   * Evaluación de Acuerdos de Nivel de Servicio (SLA): $\ge 99.50\%$ (*Cumple*), $98.00\% - 99.49\%$ (*En Riesgo*), $< 98.00\%$ (*Incumple*), según la R.SGTD N.° 001-2025-PCM/SGTD.
2. **Rendimiento y Experiencia de Usuario (30%):**  
   * Métricas oficiales *Google Core Web Vitals*: Largest Contentful Paint (LCP $\le 2.5\text{s}$), Cumulative Layout Shift (CLS $\le 0.1$), First Contentful Paint (FCP) e Interaction to Next Paint (INP).
3. **Accesibilidad Universal (30%):**  
   * Auditoría automatizada conforme a las pautas internacionales *W3C WCAG 2.1 Nivel AA* (Lighthouse / Axe-core) para garantizar el acceso a ciudadanos con discapacidad visual, auditiva o motriz.

---

### 4. Capa de Inteligencia: Auditor RAG Asistido por IA

Para cerrar la brecha entre la telemetría numérica y la toma de decisiones técnicas y legales:
* **Arquitectura RAG Híbrida:** Combina *Tool Calling* (*Text-to-SQL*) sobre la telemetría en PostgreSQL con búsqueda semántica vectorial sobre el corpus legal peruano y guías W3C en `pgvector`.
* **Modelos Fundacionales:** Google Gemini (Flash-Lite / Flash) con embeddings de 768 dimensiones (`gemini-embedding-001`).
* **Salida Prescriptiva:** Provee diagnósticos explicables en lenguaje natural, fundamentación jurídica y propuestas de remediación en código (HTML/CSS) para subsanar los hallazgos.

---

### 5. Stack Tecnológico Oficial

| Capa / Componente | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Runtime & Lenguaje** | **Bun + TypeScript** | Ejecución ultrarrápida, servidor HTTP nativo y tipado estricto. |
| **Colector Autónomo** | **packages/collector** | Arquitectura hexagonal con sondas HTTP y cliente Google PageSpeed Insights API v5. |
| **Orquestador Cron** | **GitHub Actions** | Automatización desatendida diaria a las 15:10 PET a costo $0 USD. |
| **Base de Datos** | **Supabase (PostgreSQL + pgvector)** | Persistencia ACID de telemetría y base de conocimiento vectorial indexada con HNSW. |
| **Backend REST API** | **apps/api (Bun.serve)** | Endpoints de catálogos, rankings, SLAs, reportes e interfaces de chat SSE. |
| **Frontend Web** | **apps/dashboard (Astro)** | Arquitectura de islas (*Islands Architecture*), contenido accesible Zero-JS por defecto. |
| **Sistema de Diseño** | **CSS Puro (Design Tokens)** | Cumplimiento estricto WCAG 2.1 AA (contrastes $\ge 4.5:1$, foco visible), sin librerías pesadas. |

---

### 6. Documentación Detallada de Referencia

* [**`SLAs.md`**](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/SLAs.md): Especificación formal de los Acuerdos de Nivel de Servicio (Uptime $\ge 99.50\%$, Core Web Vitals, MTTR $\le 60$ min, ponderación 40/30/30) y criterios de curaduría de la base de conocimiento vectorial RAG.
* [**`docs/sustentacion/matriz_trazabilidad_gsti.md`**](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/docs/sustentacion/matriz_trazabilidad_gsti.md): Matriz de Trazabilidad de Requisitos (RTM) vinculando RF, RNF, ITIL v4, COBIT 2019 e ISO 25010 con componentes de software y tests.
* [**`docs/sustentacion/guia_sustentacion_diapositivas.md`**](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/docs/sustentacion/guia_sustentacion_diapositivas.md): Guion de sustentación oral paso a paso y estructura de 12 diapositivas para la defensa de GSTI.
* [**`docs/requerimientos_funcionales.md`**](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/docs/requerimientos_funcionales.md): Especificación de RF-001 a RF-014.
* [**`docs/architecture/arquitectura_del_sistema.md`**](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/docs/architecture/arquitectura_del_sistema.md): Diagrama C4 y vista general de arquitectura.


