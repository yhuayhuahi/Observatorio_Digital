**Resumen del Proyecto de Investigación**

**Objetivo del Proyecto**

* **Artículo de Investigación:** Proponer un marco de gestión de calidad para servicios digitales públicos basado en ITIL v4 (Gestión de Eventos y SLAs), evaluando empíricamente la accesibilidad, disponibilidad y rendimiento de una muestra representativa del Estado peruano.

* **Producto (Observatorio Digital):** Desarrollar un software que capture, procese y visualice automáticamente métricas de desempeño tecnológico para categorizar la madurez digital pública.

**Alcance y Muestra del Estudio**
El estudio contempla una muestra equilibrada de **89 entidades clave** para garantizar representatividad y viabilidad técnica sin saturar cuotas de APIs gratuitas:

* **19** Ministerios (Poder Ejecutivo completo).
* **25** Gobiernos Regionales (webs principales).
* **30** Municipalidades provinciales estratégicas (mayor población e ingresos).
* **15** Organismos Autónomos y servicios de alto tráfico (SUNAT, RENIEC, EsSalud, etc.).

**Información Sustentatoria para el Marco Teórico**

* **Normativa Nacional:** Alineación con la Ley de Gobierno Digital (D.L. 1412) y directivas de la SGTD-PCM.

* **Estándares Internacionales:** Cumplimiento de pautas de accesibilidad web **WCAG 2.1** y buenas prácticas de **ITIL v4**.

* **Problemas Identificados:** Exclusión digital de personas con discapacidad o baja conectividad, ceguera operativa por falta de monitoreo continuo, fiscalización ineficiente y altos costos de auditorías manuales obsoletas.

**Métricas y Dimensiones a Evaluar**

* **Accesibilidad (WCAG 2.1):** Evaluación de contraste, uso de lectores de pantalla y navegación por teclado.

* **Rendimiento y Carga:** Tiempos de respuesta para conexiones lentas (3G/4G) y desempeño en móviles/escritorio mediante Google PageSpeed API.

* **Disponibilidad (*Uptime*):** Tasa de caídas del servidor y latencia histórica de respuesta.

* **Seguridad:** Estado y validez de certificados SSL/TLS.

**Stack Tecnológico Sugerido**

| Capa | Tecnología | Justificación / Uso |
| --- | --- | --- |
| **Backend & Scraping** | Python | Ejecución de scripts de extracción, integración con Google PageSpeed API y cálculo de métricas. |
| **Automatización** | GitHub Actions | Ejecución programada (*Cron Jobs*) para monitoreo periódico continuo y gratuito. |
| **Base de Datos** | PostgreSQL (Supabase / Neon) | Almacenamiento relacional de entidades, logs de disponibilidad e historial de análisis. |
| **Frontend** | Next.js o Astro | Desarrollo del Observatorio Web con alto rendimiento y optimización SEO. |
| **Visualización** | Recharts / Chart.js | Tableros interactivos con rankings de cumplimiento (0 a 100) y gráficos de *uptime*. |
| **Estilos** | Tailwind CSS | Maquetación limpia, responsiva y de corte institucional. |
| **Hosting** | Vercel / Netlify | Despliegue en la nube con integración continua a repositorio. |
