# Observatorio de Calidad de Servicios Digitales Públicos (Gobierno Digital - Perú)

## Descripción del Proyecto

El **Observatorio de Calidad Digital Pública** es una solución para monitorear la calidad técnica de los portales gubernamentales del Estado peruano. Captura métricas de disponibilidad, rendimiento y accesibilidad para generar evidencia sobre la experiencia digital de la ciudadanía.

El proyecto relaciona la calidad de los servicios digitales con el marco de gestión **ITIL v4**, los **Core Web Vitals** y las pautas de accesibilidad **WCAG 2.1**.

### Objetivos

* **Objetivo del producto:** Construir un dashboard público que muestre la disponibilidad (*uptime*), el rendimiento y la accesibilidad de los portales estatales.
* **Objetivo de investigación:** Proponer un marco de gestión de calidad basado en ITIL v4 para identificar incidentes, evaluar niveles de servicio y reducir la dependencia de auditorías manuales.

## Estado Actual del Proyecto

La **Fase 1 — Captura Cruda de Telemetría** está completada y operativa:

* Se seleccionaron **90 entidades públicas**: 20 del Poder Ejecutivo, 25 Gobiernos Regionales, 30 municipalidades provinciales y 15 organismos autónomos.
* El módulo [`packages/collector`](./packages/collector/) está implementado en Bun + TypeScript con arquitectura hexagonal.
* La información se almacena en Supabase PostgreSQL: catálogo de entidades y mediciones crudas.
* La auditoría consulta disponibilidad HTTP, Core Web Vitals y métricas de accesibilidad mediante Google PageSpeed.
* GitHub Actions ejecuta una auditoría diaria a las **13:00 hora del Perú (18:00 UTC)**.

La primera ejecución real fue validada correctamente y registró telemetría de los 90 portales. La **Fase 2** implementará el backend analítico y el dashboard.

## Funcionalidades

1. **Captura de disponibilidad:** estado HTTP, tiempo de respuesta, errores de DNS, timeouts y problemas de SSL.
2. **Auditoría de rendimiento:** métricas Core Web Vitals y puntuación de PageSpeed.
3. **Evaluación de accesibilidad:** métricas automatizadas relacionadas con WCAG 2.1.
4. **Persistencia histórica:** almacenamiento de mediciones para analizar tendencias, SLAs e incidentes.
5. **Automatización:** ejecución programada o manual mediante GitHub Actions.

## Stack Tecnológico

* **Runtime y lenguaje:** Bun + TypeScript.
* **Captura:** módulo propio con sonda HTTP nativa.
* **Auditoría:** Google PageSpeed Insights API / Lighthouse.
* **Base de datos:** PostgreSQL en Supabase.
* **Automatización:** GitHub Actions.
* **Backend y dashboard:** Bun y Astro, previstos para la Fase 2.

## Estructura del Repositorio

~~~text
.
├── .github/
│   └── workflows/
│       └── daily-audit.yml
├── docs/
│   ├── ADRs/
│   ├── architecture/
│   ├── schemes/
│   ├── contexto.md
│   ├── requerimientos_funcionales.md
│   └── requerimientos_no_funcionales.md
├── packages/
│   ├── collector/                 # Captura cruda de telemetría (Fase 1)
│   └── second_test/               # Pruebas de conexión y validación
├── scraping/                      # Extracción y selección inicial de entidades
├── HANDOFF.md
└── README.md
~~~

## Uso Rápido

Para ejecutar el collector localmente:

~~~bash
cd packages/collector
bun install
bun run start
~~~

También se puede ejecutar una auditoría solo HTTP, sin consumir cuota de Google:

~~~bash
AUDIT_SOLO_HTTP=true bun run start
~~~

Las variables de entorno requeridas son `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `GOOGLE_PAGESPEED_API_KEY`. No deben incluirse en el repositorio.

## Documentación

* [Documento de traspaso técnico](./HANDOFF.md)
* [Contexto de la investigación](./docs/contexto.md)
* [Arquitectura del sistema](./docs/architecture/arquitectura_del_sistema.md)
* [Modelo de base de datos](./docs/schemes/modelo_base_datos.md)
* [Requerimientos funcionales](./docs/requerimientos_funcionales.md)
* [Requerimientos no funcionales](./docs/requerimientos_no_funcionales.md)
* [Decisiones arquitectónicas](./docs/ADRs/README.md)

## Próximos Pasos — Fase 2

* Implementar el backend REST en `apps/api/`.
* Calcular SLAs, incidentes y puntajes de calidad.
* Implementar el dashboard público en `apps/dashboard/`.
* Habilitar reportes exportables en CSV y JSON.
