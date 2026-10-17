# Base de Conocimiento Normativa y Técnica del Sistema RAG

> **Proyecto:** Observatorio de Calidad Digital Pública del Perú  
> **Componente:** Base de Conocimiento Vectorial para el Agente RAG de Auditoría ([ADR-0008](../ADRs/ADR-0008-uso-de-pgvector-en-supabase.md), [ADR-0009](../ADRs/ADR-0009-seleccion-modelo-gemini-rag.md))  
> **Objetivo:** Proveer un corpus de fuentes primarias oficiales para sustentar las respuestas prescriptivas del LLM sin incurrir en alucinaciones legales o técnicas (RNF-012).

---

## 1. Índice Maestro de Documentos y Fuentes Oficiales

La siguiente tabla consolida los 5 documentos de la base de conocimiento, enlazando cada archivo local con su fuente oficial externa y su cita formal:

| Archivo en la Base de Conocimiento                                                                           | Categoría RAG        | Norma / Estándar Oficial                                                                | Cita Formal y Enlace Oficial Verificable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :----------------------------------------------------------------------------------------------------------- | :------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[01_ley_gobierno_digital_dl1412.md](./01_ley_gobierno_digital_dl1412.md)**                                 | `LEGISLACION_PERU`   | **Decreto Legislativo N.º 1412**<br>(Ley de Gobierno Digital)                           | Presidencia de la República (2018). *Decreto Legislativo N.º 1412*. Diario Oficial El Peruano.<br>🔗 [Diario Oficial El Peruano - D.L. 1412](https://busquedas.elperuano.pe/normaslegales/decreto-legislativo-que-aprueba-la-ley-de-gobierno-digital-decreto-legislativo-n-1412-1691026-1/) \| [gob.pe](https://www.gob.pe/institucion/pcm/normas-legales/287313-1412)                                                                                                                                                       |
| **[02_reglamento_gobierno_digital_ds029_2021_pcm.md](./02_reglamento_gobierno_digital_ds029_2021_pcm.md)**   | `LEGISLACION_PERU`   | **D.S. N.º 029-2021-PCM**, **D.S. N.º 085-2023-PCM** y **R.SGTD N.º 001-2025-PCM/SGTD** | Presidencia del Consejo de Ministros (2021, 2025). *Reglamento del D.L. 1412 y Lineamiento de Accesibilidad Digital Obligatoria*.<br>🔗 [Compendio Normas de Gobierno Digital (gob.pe)](https://www.gob.pe/institucion/pcm/colecciones/771-normas-de-gobierno-digital) \| [SPIJ - Ministerio de Justicia](http://spij.minjus.gob.pe/) \| [El Peruano - R.SGTD 001-2025](https://busquedas.elperuano.pe/normaslegales/aprueban-el-lineamiento-para-el-diseno-y-desarrollo-de-servic-resolucion-n-001-2025-pcmsgtd-2412891-1/) |
| **[03_estandares_accesibilidad_wcag21_remediacion.md](./03_estandares_accesibilidad_wcag21_remediacion.md)** | `ACCESIBILIDAD_WCAG` | **W3C WCAG 2.1 (Nivel AA)**<br>(Web Content Accessibility Guidelines)                   | World Wide Web Consortium (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation.<br>🔗 [W3C WCAG 2.1 Recommendation](https://www.w3.org/TR/WCAG21/) \| [Traducción Autorizada al Español](https://www.w3.org/Translations/WCAG21-es/)                                                                                                                                                                                                                                                                |
| **[04_metricas_core_web_vitals_remediacion.md](./04_metricas_core_web_vitals_remediacion.md)**               | `RENDIMIENTO_CWV`    | **Google Core Web Vitals** & **W3C Web Performance**                                    | Google Chrome Team & W3C Web Performance WG (2024). *Core Web Vitals Metric Definitions (LCP, CLS, TTFB, FCP)*.<br>🔗 [web.dev - Core Web Vitals](https://web.dev/articles/vitals) \| [Lighthouse Performance Documentation](https://developer.chrome.com/docs/lighthouse/performance)                                                                                                                                                                                                                                       |
| **[05_gestion_servicios_itil_slas.md](./05_gestion_servicios_itil_slas.md)**                                 | `GESTION_ITIL`       | **ITIL v4 Foundation** & **ISO/IEC 25010**                                              | AXELOS (2019). *ITIL Foundation: ITIL 4 Edition*. TSO (The Stationery Office), London. ISBN: 9780113316076.<br>ISO/IEC (2011). *ISO/IEC 25010: Systems and software engineering — SQuaRE*.<br>🔗 [ISO/IEC 25010 Standard](https://www.iso.org/standard/35733.html) \| [AXELOS ITIL 4 Overview](https://www.axelos.com/certifications/itil-service-management)                                                                                                                                                                |

---

## 2. Detalle y Trazabilidad de los Documentos

### 2.1. Marco Jurídico Peruano (`LEGISLACION_PERU`)
1. **[01_ley_gobierno_digital_dl1412.md](./01_ley_gobierno_digital_dl1412.md):**
   * Contiene los mandatos del **Decreto Legislativo N.º 1412**, en particular:
     * *Artículo 4.1:* Obligación estatal de proveer servicios digitales disponibles, accesibles y seguros.
     * *Artículo 5 (5.5, 5.6, 5.9, 5.10):* Principios de neutralidad tecnológica, interoperabilidad, datos abiertos y orientación ciudadana inclusiva.
     * *Artículo 8:* Rol regulador y supervisor de la SGTD-PCM.
     * *Artículo 18:* Garantías legales de disponibilidad de información y accesibilidad web.
2. **[02_reglamento_gobierno_digital_ds029_2021_pcm.md](./02_reglamento_gobierno_digital_ds029_2021_pcm.md):**
   * Contiene el **D.S. N.º 029-2021-PCM**, el **D.S. N.º 085-2023-PCM** (Sello de Accesibilidad Digital) y la **Resolución SGTD N.º 001-2025-PCM/SGTD**:
     * Formaliza el plazo perentorio de **12 meses** para que Ministerios y Gobiernos Regionales apliquen obligatoriamente las pautas WCAG.
     * Dispone la obligatoriedad de certificados TLS/HTTPS y disponibilidad ininterrumpida de mesas de partes virtuales.

### 2.2. Estándares Técnicos Internacionales
3. **[03_estandares_accesibilidad_wcag21_remediacion.md](./03_estandares_accesibilidad_wcag21_remediacion.md):**
   * Define los criterios W3C WCAG 2.1 nivel AA que audita Lighthouse (1.1.1 Contenido no textual, 1.4.3 Contraste de color, 2.1.1 Navegación por teclado, 2.4.1 Skip links, 3.1.1 Idioma HTML y 4.1.2 Roles ARIA), acompañados de prescripciones técnicas en código HTML/CSS.
4. **[04_metricas_core_web_vitals_remediacion.md](./04_metricas_core_web_vitals_remediacion.md):**
   * Especifica los umbrales cuantitativos de Google (LCP $\le 2.5\text{s}$, CLS $\le 0.1$, TTFB $\le 800\text{ms}$), detallando las causas de degradación y las técnicas de remediación (imágenes WebP, prioridad de carga `fetchpriority`, compresión Brotli y almacenamiento en caché).
5. **[05_gestion_servicios_itil_slas.md](./05_gestion_servicios_itil_slas.md):**
   * Formaliza la taxonomía de eventos de monitoreo (Informativo, Advertencia, Excepción), el ciclo de vida de incidentes (transitorio vs. crónico), la fórmula de SLA mensual ($\ge 99.5\%$ Cumple, $98.0\%-99.49\%$ En Riesgo, $< 98.0\%$ Incumple) y la ponderación ISO/IEC 25010 ($40\%$ disponibilidad, $30\%$ rendimiento, $30\%$ accesibilidad).

---

## 3. Flujo de Indexación Vectorial en Supabase (`pgvector`)

El proceso de carga y vectorización hacia la base de datos se ejecuta mediante un script de ingestión que opera de la siguiente manera:

```
[Archivos Markdown en docs/knowledge_base/]
                  │
                  ▼
         [Script chunker.ts]
   Divide cada archivo por encabezados (###)
   en fragmentos semánticos de 300 a 600 tokens
                  │
                  ▼
     [Google Gemini Embeddings API]
   Genera vector denso de 768 dimensiones
   utilizando el modelo gemini-embedding-001
                  │
                  ▼
      [Supabase PostgreSQL DB]
   Inserta en la tabla documentos_normativos:
   (fuente, categoria, titulo, contenido, embedding)
                  │
                  ▼
      [Búsqueda RAG en Tiempo Real]
   Función match_documentos_normativos()
   calcula distancia coseno (1 - embedding <=> query)
```

---

*Base de Conocimiento oficial y verificada — Observatorio de Calidad Digital Pública del Perú.*
