# ADR 0004: Uso de CSS Puro para los Estilos del Dashboard

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El dashboard del Observatorio de Calidad Digital Pública debe cumplir con requisitos rigurosos de rendimiento y accesibilidad: tiempo de carga ≤ 3 segundos medido con Google Lighthouse (RNF-002), accesibilidad web que satisfaga las pautas WCAG 2.1 nivel AA (RNF-006: contraste mínimo de texto 4.5:1, compatibilidad con lectores de pantalla), y facilidad de mantenimiento con mínimo acoplamiento a herramientas externas (RNF-007 y RNF-008).

El uso de frameworks de utilidades o librerías de componentes complejas suele introducir capas de abstracción adicionales, dependencias de compiladores pesados (PostCSS, plugins complejos) y hojas de estilo sobredimensionadas que pueden afectar el tiempo de renderizado inicial (Render-Blocking Resources).

## Decisión
Implementar los estilos de la interfaz utilizando **CSS puro** (CSS moderno nativo), aprovechando:
1. **Variables de CSS (Custom Properties)** para definir un sistema de diseño consistente (paleta de colores accesibles según WCAG 2.1 AA, espaciados, escalas tipográficas y soporte de modo claro/oscuro).
2. **CSS Grid y Flexbox** para maquetar el Resumen Ejecutivo, Tablas de Ranking y Fichas de Entidades con responsividad completa (móvil, tablet, escritorio).
3. **Estilos encapsulados de Astro (`<style>` scoped)** para modularizar las reglas por componente y evitar colisiones globales sin sobrecarga de dependencias.

## Alternativas Consideradas
* **Tailwind CSS:** Rechazado para evitar dependencias adicionales en la cadena de compilación de frontend, dependencias de PostCSS y potenciales cambios de sintaxis o configuración entre versiones mayores, priorizando la estabilidad y mantenibilidad a largo plazo (RNF-007).
* **Bootstrap / Bulma:** Rechazado debido a que incluyen decenas de kilobytes de estilos no utilizados que impactan negativamente la métrica de peso de página y el First Contentful Paint (FCP), además de requerir adaptaciones complejas para cumplir estrictamente con los contrastes de WCAG 2.1 nivel AA.
* **Librerías UI basadas en CSS-in-JS (Styled Components, Emotion):** Rechazado por su alto costo de ejecución en tiempo de cliente (runtime overhead), lo que contradice el principio de "Zero JavaScript por defecto" adoptado con Astro.

## Consecuencias

### Positivas
* Cero dependencias adicionales de compilación CSS y cero KBs de código no utilizado en el bundle final, maximizando las métricas de rendimiento Lighthouse (RNF-002).
* Control total y transparente sobre los ratios de contraste de color y el dimensionamiento tipográfico para cumplir el 100% de la normativa de accesibilidad WCAG 2.1 AA (RNF-006 y RNF-010).
* Código predecible, estándar y libre de obsolescencia tecnológica por actualización de dependencias de terceros (RNF-007 y RNF-008).
* Perfecta sinergia con el modelo de estilos scoped por componente que Astro incluye de manera nativa sin configuración extra.

### Negativas / Riesgos
* Requiere construir y mantener un sistema de diseño inicial propio (hoja base de tokens y variables para colores, tipografías y espaciados).
* Mayor disciplina por parte del equipo para respetar las convenciones de nombrado y evitar la duplicación de reglas en componentes globales.
