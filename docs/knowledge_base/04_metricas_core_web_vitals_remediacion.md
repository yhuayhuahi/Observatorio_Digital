# Métricas Core Web Vitals y Guías de Remediación de Rendimiento Web

> **Fuente Oficial:** Google Developers / web.dev / W3C Web Performance Working Group  
> **Cita Formal:** Google Chrome Team (2024). *Core Web Vitals Metric Specifications*. [web.dev/articles/vitals](https://web.dev/articles/vitals)  
> **Categoría RAG:** `RENDIMIENTO_CWV`  
> **Alineación con la Base de Datos:** Tabla `mediciones_crudas` (PostgreSQL / Supabase)

---

### Mapeo de Columnas en Base de Datos vs. Métricas Evaluadas

| Columna en BD (`mediciones_crudas`) | Métrica Oficial | Unidad en BD | Umbral Bueno | Umbral Crítico |
| :--- | :--- | :--- | :--- | :--- |
| `lcp_segundos` | **Largest Contentful Paint** | Segundos (Float) | $\le 2.5\text{ s}$ | $> 4.0\text{ s}$ |
| `cls_score` | **Cumulative Layout Shift** | Adimensional (Float) | $\le 0.10$ | $> 0.25$ |
| `ttfb_ms` | **Time to First Byte** | Milisegundos (Float) | $\le 800\text{ ms}$ | $> 1800\text{ ms}$ |
| `fcp_segundos` | **First Contentful Paint** | Segundos (Float) | $\le 1.8\text{ s}$ | $> 3.0\text{ s}$ |
| `fid_ms` | **First Input Delay / INP** | Milisegundos (Float) | $\le 100\text{ ms}$ | $> 300\text{ ms}$ |
| `score_desempeno` | **Puntaje Global Lighthouse** | Entero (0–100) | $\ge 90$ | $< 50$ |

---

### 1. Columna BD: `lcp_segundos` — Largest Contentful Paint (LCP)
* **Qué representa en la BD:** El tiempo en segundos hasta que el elemento de contenido visible más grande de la página se ha renderizado completamente en pantalla.
* **Diagnóstico de Rangos:**
  * **Bueno (Verde):** `lcp_segundos <= 2.5`.
  * **Requiere Mejora (Amarillo):** `2.5 < lcp_segundos <= 4.0`.
  * **Pobre / Crítico (Rojo):** `lcp_segundos > 4.0` (en los portales estatales analizados, se observan valores críticos superiores a 13.0 segundos).
* **Causas Principales de Degradación:**
  1. *Latencia del servidor lenta (`ttfb_ms` elevado).*
  2. *Recursos bloqueantes:* Hojas de estilo CSS y scripts JS cargados en el `<head>` sin los atributos `defer` o `async`.
  3. *Imágenes pesadas:* Banners institucionales o infografías en formatos JPEG o PNG de más de 2 MB sin compresión.
* **Prescripción Técnica de Remediación:**
  * Convertir las imágenes a formatos de última generación: **WebP** o **AVIF** (reduce el peso entre 50% y 80%).
  * Otorgar prioridad de carga al elemento LCP: `<img src="banner.webp" fetchpriority="high" alt="...">`.
  * Nunca aplicar `loading="lazy"` a la imagen principal visible (la carga perezosa retrasa el LCP deliberadamente).
  * Habilitar compresión HTTP (Brotli o Gzip) en el servidor web.

---

### 2. Columna BD: `cls_score` — Cumulative Layout Shift (CLS)
* **Qué representa en la BD:** Puntuación de estabilidad visual que mide los desplazamientos inesperados de elementos en la pantalla durante la carga.
* **Diagnóstico de Rangos:**
  * **Bueno (Verde):** `cls_score <= 0.10`.
  * **Requiere Mejora (Amarillo):** `0.10 < cls_score <= 0.25`.
  * **Pobre / Crítico (Rojo):** `cls_score > 0.25`.
* **Causas Principales de Degradación:**
  1. *Imágenes o banners sin dimensiones:* El navegador desconoce el alto y ancho antes de descargar el archivo, empujando el texto hacia abajo cuando aparece.
  2. *Fuentes web sin propiedad de intercambio (FOUT/FOIT):* El texto parpadea y cambia de tamaño cuando se descarga la fuente personalizada.
* **Prescripción Técnica de Remediación:**
  * Declarar siempre atributos de tamaño en las etiquetas HTML: `<img src="..." width="800" height="400" alt="...">` o en CSS: `aspect-ratio: 16 / 9;`.
  * En la carga de fuentes web en `@font-face`, agregar la directiva: `font-display: swap;`.
  * Reservar espacio en el diseño con contenedores `min-height` para elementos dinámicos o carruseles de noticias.

---

### 3. Columna BD: `ttfb_ms` — Time to First Byte (TTFB)
* **Qué representa en la BD:** La latencia inicial de respuesta del servidor en milisegundos desde que el cliente solicita la página hasta que llega el primer byte de respuesta.
* **Diagnóstico de Rangos:**
  * **Bueno (Verde):** `ttfb_ms <= 800.0`.
  * **Pobre / Crítico (Rojo):** `ttfb_ms > 1800.0` (los timeouts de sonda ocurren a los 10,000 ms).
* **Causas Principales de Degradación:**
  1. *Falta de almacenamiento en caché de página completa (Full Page Cache).*
  2. *Servidores web sobrecargados o bases de datos con consultas lentas sin indexar.*
  3. *Cadena de redirecciones múltiples (de HTTP a HTTPS, de dominio raíz a www).*
* **Prescripción Técnica de Remediación:**
  * Implementar capas de almacenamiento en caché en el servidor web (Nginx / Varnish / Cloudflare).
  * Optimizar la resolución de nombres DNS migrando a proveedores con Anycast.
  * Habilitar el protocolo HTTP/2 o HTTP/3 en el servidor web de la entidad.

---

### 4. Columna BD: `fcp_segundos` — First Contentful Paint (FCP)
* **Qué representa en la BD:** El tiempo en segundos hasta que el navegador renderiza el primer fragmento de texto, imagen o elemento visual para el usuario.
* **Diagnóstico de Rangos:**
  * **Bueno (Verde):** `fcp_segundos <= 1.8`.
  * **Pobre (Rojo):** `fcp_segundos > 3.0`.
* **Prescripción Técnica de Remediación:**
  * Eliminar recursos CSS y JS que bloquean el renderizado inicial en la cabecera del documento.
  * Minificar los archivos CSS y HTML antes de enviarlos al cliente.

---

### 5. Columna BD: `fid_ms` — First Input Delay / Responsividad
* **Qué representa en la BD:** Mide el retraso en milisegundos desde que el usuario interactúa por primera vez con el portal (clic en un enlace, pulsación de un botón) hasta que el navegador puede comenzar a procesar el evento.
* **Diagnóstico de Rangos:**
  * **Bueno (Verde):** `fid_ms <= 100.0`.
  * **Pobre (Rojo):** `fid_ms > 300.0`.
* **Prescripción Técnica de Remediación:**
  * Reducir el tiempo de ejecución de JavaScript en el hilo principal (*Main Thread*).
  * Dividir tareas largas de JavaScript en bloques pequeños usando `requestIdleCallback()` o `setTimeout()`.

---

### 6. Columna BD: `score_desempeno` — Puntaje Global Lighthouse (0 a 100)
* **Qué representa en la BD:** Puntaje sintético ponderado por Google Lighthouse sobre la eficiencia global del portal.
* **Ponderación interna oficial de Lighthouse:**
  * LCP: 25% del puntaje.
  * Total Blocking Time (TBT): 30% del puntaje.
  * CLS: 25% del puntaje.
  * FCP: 10% del puntaje.
  * Speed Index: 10% del puntaje.
* **Interpretación:**
  * **90 a 100:** Rendimiento óptimo.
  * **50 a 89:** Rendimiento medio con oportunidades de mejora.
  * **0 a 49:** Rendimiento crítico (la mayoría de Gobiernos Regionales evaluados en el Estado Peruano caen en este rango, con promedios entre 12 y 25 puntos).
