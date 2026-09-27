# ADR 0002: Uso de Astro como Framework Frontend para el Dashboard

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública tiene como objetivo principal presentar métricas técnicas, clasificaciones (rankings) y fichas de cumplimiento de 90 portales del Estado (RF-010 y RF-011). La plataforma es predominantemente un sitio de consulta intensivo en lectura con necesidades puntuales de interactividad (filtros dinámicos por región/categoría y visualización de gráficos históricos con Recharts/Chart.js).

Los requerimientos no funcionales exigen un tiempo de carga del dashboard ≤ 3 segundos medido con Google Lighthouse (RNF-002), un puntaje de usabilidad y accesibilidad ≥ 80/100 alineado con WCAG 2.1 AA (RNF-006), y costos de hosting tendientes a cero (RNF-011) en plataformas como Vercel o Cloudflare Pages. Los frameworks SPA convencionales envían paquetes de JavaScript sobredimensionados que degradan el First Contentful Paint (FCP) y el Largest Contentful Paint (LCP).

## Decisión
Adoptar **Astro** como framework frontend para la construcción del dashboard del Observatorio. Se utilizará su arquitectura basada en islas (Islands Architecture), generando páginas predominantemente estáticas o renderizadas en servidor (SSR/SSG híbrido) con cero JavaScript por defecto en el cliente, hidratando únicamente los componentes interactivos aislados (como tablas de ranking interactivas y gráficos de métricas).

## Alternativas Consideradas
* **Next.js (React App Router):** Rechazado debido a que introduce por defecto un runtime de cliente sustancial y mayor complejidad en la hidratación de páginas, lo que incrementa el bundle de JavaScript y compromete el cumplimiento estricto del tiempo de carga ≤ 3s (RNF-002) en dispositivos con conectividad limitada.
* **Single Page Application pura (Vite + React / Vue):** Rechazado por carecer de renderizado en servidor predeterminado, dificultando la indexabilidad de los datos públicos y obligando al cliente a descargar y parsear todo el bundle antes de mostrar el contenido inicial.
* **HTML estático tradicional con plantillas (Junjia / Handlebars):** Rechazado por la dificultad de componer interfaces reactivas complejas para los filtros dinámicos y la integración modular de librerías de gráficos interactivos requeridas por RF-010.

## Consecuencias

### Positivas
* Rendimiento óptimo en Core Web Vitals (LCP < 1.5s inmediato), garantizando el cumplimiento holgado del RNF-002.
* "Zero JS por defecto": Solo se envían scripts al cliente para componentes que requieren interactividad activa (usando directivas como `client:visible` o `client:idle`).
* Flexibilidad para integrar componentes de interfaz en React, Preact o Vanilla JS dentro de las islas interactivas.
* Despliegue sencillo y gratuito en plataformas como Vercel, Netlify o Cloudflare Pages, satisfaciendo el límite de presupuesto de RNF-011.

### Negativas / Riesgos
* Curva de adaptación para desarrolladores acostumbrados a aplicaciones puramente reactivas de cliente donde el estado global se propaga en toda la aplicación.
* La comunicación de estado entre islas independientes en la misma página requiere el uso de primitivas livianas (como `nanostores` o eventos nativos del navegador).
