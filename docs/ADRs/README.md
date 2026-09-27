# Architectural Decision Records (ADRs) - Observatorio de Calidad Digital Pública

Este directorio contiene el registro formal de las decisiones arquitectónicas y tecnológicas adoptadas para el desarrollo del **Observatorio de Calidad Digital Pública**, alineadas con los [Requerimientos Funcionales](../requerimientos_funcionales.md), los [Requerimientos No Funcionales](../requerimientos_no_funcionales.md) y el [Contexto Técnico](../contexto.md).

## Índice de Decisiones Arquitectónicas

| ADR | Título | Estatus | Fecha | Alcance Principal |
| :---: | :--- | :---: | :---: | :--- |
| [ADR-0001](./ADR-0001-uso-de-bun.md) | **Uso de Bun como Runtime y Gestor de Paquetes** | Aceptado | 2026-09-27 | Runtime backend/frontend, gestor de paquetes unificado, alta velocidad. |
| [ADR-0002](./ADR-0002-uso-de-astro.md) | **Uso de Astro como Framework Frontend para el Dashboard** | Aceptado | 2026-09-27 | Frontend, Islands Architecture, Zero-JS por defecto, Core Web Vitals. |
| [ADR-0003](./ADR-0003-uso-de-postgresql.md) | **Uso de PostgreSQL para Persistencia y Métricas Históricas** | Aceptado | 2026-09-27 | Base de datos relacional, integridad ACID, historial anual de 90 entidades. |
| [ADR-0004](./ADR-0004-uso-de-css-puro.md) | **Uso de CSS Puro para los Estilos del Dashboard** | Aceptado | 2026-09-27 | Estilos nativos modernos, variables CSS, WCAG 2.1 AA, cero dependencias. |
| [ADR-0005](./ADR-0005-uso-de-github-actions.md) | **Uso de GitHub Actions para CI/CD y Recolección Automatizada** | Aceptado | 2026-09-27 | Automatización CI/CD, tareas programadas (cron), costo cero. |
| [ADR-0006](./ADR-0006-uso-de-apis-de-google.md) | **Uso de APIs de Google (PageSpeed y Lighthouse)** | Aceptado | 2026-09-27 | Auditorías estandarizadas, Core Web Vitals, evaluación WCAG 2.1 AA. |
| [ADR-0007](./ADR-0007-uso-de-docker.md) | **Uso de Docker para Homogeneidad y Fijación de Versiones** | Aceptado | 2026-09-27 | Contenedorización, paridad dev/prod, reproducibilidad del stack. |
