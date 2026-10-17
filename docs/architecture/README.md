# Documentación de Arquitectura - Observatorio de Calidad Digital Pública

Este directorio contiene las especificaciones formales de arquitectura de software para el **Observatorio de Calidad Digital Pública**, estructuradas bajo un enfoque progresivo en 3 niveles de abstracción.

## Contenido

* [**Especificación Arquitectónica en 3 Niveles (Documento Principal)**](./arquitectura_del_sistema.md)
  * **Nivel 1 — Contexto e Interacción Global:** Diagrama macro de interacción entre la ciudadanía, los 90 portales del Estado, Google PageSpeed API, Google AI Studio (Gemini), Supabase y GitHub Actions.
  * **Nivel 2 — Contenedores y Módulos:** Desacoplamiento entre el Módulo de Captura Cruda autónomo, Supabase PostgreSQL (`pgvector`), el Backend Core en Bun, el Subsistema RAG y el Frontend en Astro.
  * **Nivel 3 — Código y Componentes:** Estructura modular de carpetas, interfaces y contratos de código para:
    1. **Módulo de Captura Cruda (`packages/collector`)** *(Ejecución programada con GitHub Actions y Supabase en producción)*.
    2. **Backend API y Subsistema RAG (`apps/api`)** *(Cálculo de SLAs ITIL v4, endpoints REST y Orquestador Gemini con Tool Calling)*.
    3. **Frontend Dashboard y Asistente (`apps/dashboard`)** *(Astro, componentes accesibles con CSS puro, islas de gráficos e isla del Chatbot RAG)*.
  * **Matriz de Trazabilidad:** Mapeo de cada capa y componente frente a los Requerimientos Funcionales (incluyendo RF-014 RAG) y No Funcionales (RNF-011 costo cero).

