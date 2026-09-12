# Observatorio de Calidad de Servicios Digitales Públicos (Gobierno Digital - Perú)

## Descripción del Proyecto

El **Observatorio de Calidad Digital Pública** es un software interactivo que captura, procesa y visualiza automáticamente métricas de desempeño tecnológico de los portales gubernamentales del Estado peruano[cite: 2]. 

El proyecto aborda la desconexión entre el marco normativo de transformación digital (Ley de Gobierno Digital - D.L. 1412) y la experiencia real del ciudadano al realizar trámites digitales[cite: 2].

### Objetivos
* **Objetivo del Producto:** Implementar un dashboard interactivo que monitoree continuamente la disponibilidad (*uptime*), velocidad de carga y nivel de accesibilidad (WCAG 2.1) de las plataformas estatales[cite: 2].
* **Objetivo de Investigación:** Proponer un marco de gestión de calidad basado en **ITIL v4** (Gestión de Eventos y SLAs)[cite: 2] para reducir la ceguera operativa y reemplazar auditorías manuales costosas[cite: 2].

---

## Estado Actual del Proyecto: Recolección y Procesamiento de Datos

Actualmente se completó con éxito la fase de **extracción de datos (*web scraping*)** desde el portal oficial `gob.pe/estado`[cite: 2]:

* **Directorio Base Extraído:** Se capturaron **575 entidades públicas** estructuradas en formatos JSON y CSV[cite: 2].
* **Selección de la Muestra:** A partir del universo extraído, se está depurando una muestra científicamente representativa de **89 entidades clave**[cite: 2]:
  * **19** Ministerios (Poder Ejecutivo)[cite: 2].
  * **25** Gobiernos Regionales (GOREs)[cite: 2].
  * **30** Municipalidades provinciales estratégicas[cite: 2].
  * **15** Organismos Autónomos (SUNAT, RENIEC, EsSalud, etc.)[cite: 2].

---

## Funcionalidades del Producto Final

1. **Panel de Control General (Dashboard):** Ranking institucional con puntajes de cumplimiento (score 0-100) comparando ministerios, regiones y municipalidades[cite: 2].
2. **Ficha Técnica por Entidad:** Medición del nivel de accesibilidad WCAG 2.1 (soporte para lectores de pantalla, contraste), rendimiento móvil/desktop y estado de certificados SSL[cite: 2].
3. **Rastreador de Disponibilidad (Uptime Tracker):** Gráficos de caídas de servicio e historial de latencia en tiempo real[cite: 2].

---

## Stack Tecnológico

* **Backend & Web Scraping:** Python (`requests`, `beautifulsoup4`, `pandas`)[cite: 2].
* **Automatización / Monitoreo:** GitHub Actions (ejecución programada de tareas periódicas via Cron Jobs).
* **Métricas de Performance:** Google PageSpeed Insights API & auditorías Lighthouse[cite: 2].
* **Base de Datos:** PostgreSQL (Supabase / Neon).
* **Frontend:** Next.js / Astro con Tailwind CSS.
* **Visualización de Datos:** Recharts / Chart.js.
* **Hosting:** Vercel.

---

## Estructura del Repositorio

~~~text
.
├── README.md
├── resumen.md
└── scraping
    ├── entidades_gob_pe.csv
    ├── entidades_gob_pe.json
    ├── main.py
    ├── pyproject.toml
    ├── README.md
    └── uv.lock

2 directories, 8 files
~~~
