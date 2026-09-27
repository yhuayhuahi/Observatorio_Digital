# Documentación de Arquitectura - Observatorio de Calidad Digital Pública

Este directorio contiene las especificaciones formales de arquitectura de software para el **Observatorio de Calidad Digital Pública**, estructuradas bajo un enfoque progresivo en 3 niveles de abstracción.

## Contenido

* [**Especificación Arquitectónica en 3 Niveles (Documento Principal)**](./arquitectura_del_sistema.md)
  * **Nivel 1 — Contexto e Interacción Global:** Diagrama macro de interacción entre la ciudadanía, los 90 portales del Estado, Google PageSpeed API, Supabase y GitHub Actions.
  * **Nivel 2 — Contenedores y Módulos:** Desacoplamiento entre el Módulo de Captura Cruda autónomo, Supabase PostgreSQL, el Backend Core en Bun y el Frontend en Astro.
  * **Nivel 3 — Código y Componentes:** Estructura modular de carpetas, interfaces y contratos de código para:
    1. **Módulo de Captura Cruda (`packages/collector`)** *(Prioridad inmediata para ejecución programada con GitHub Actions y Supabase)*.
    2. **Backend API (`apps/api`)** *(Cálculo de SLAs ITIL v4, incidentes y endpoints REST)*.
    3. **Frontend Dashboard (`apps/dashboard`)** *(Astro, componentes accesibles con CSS puro e islas interactivas)*.
  * **Matriz de Trazabilidad:** Mapeo de cada capa y componente frente a los Requerimientos Funcionales (RF) y No Funcionales (RNF).
