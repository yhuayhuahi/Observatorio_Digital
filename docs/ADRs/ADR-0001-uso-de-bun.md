# ADR 0001: Uso de Bun como Runtime y Gestor de Paquetes para Backend y Frontend

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública requiere procesar periódicamente métricas de 90 portales institucionales peruanos, servir APIs ligeras de consulta y compilar la interfaz de usuario en tiempos mínimos para garantizar despliegues ágiles (RNF-008: tiempo de despliegue ≤ 10 minutos). Además, el sistema exige alta eficiencia en el backend con tiempos de respuesta reducidos (RNF-001: latencia ≤ 500 ms) y costos de infraestructura mínimos (RNF-011: presupuesto ≤ $50 USD/mes), lo cual favorece herramientas ligeras con bajo consumo de memoria y rápido arranque.

Se evaluó el uso de un runtime moderno unificado que optimice tanto la ejecución de scripts/servicios backend en TypeScript como la gestión de dependencias del frontend (Astro), reduciendo la fricción entre entornos y acelerando los pipelines de integración continua. Astro cuenta con soporte pleno para Bun como gestor de paquetes y compatibilidad de ejecución en servidor.

## Decisión
Adoptar **Bun** como:
1. **Gestor de paquetes unificado** para todo el proyecto (backend y frontend), reemplazando npm/pnpm.
2. **Runtime de ejecución para el Backend y scripts de procesamiento**, aprovechando su soporte nativo de TypeScript sin transpiladores adicionales y su motor HTTP de ultra alto rendimiento (`Bun.serve`).
3. **Entorno de ejecución para Astro**, tanto en desarrollo como en la compilación estática/SSR del frontend.

## Alternativas Consideradas
* **Node.js (LTS):** Rechazado por su mayor lentitud en la instalación de dependencias en pipelines de CI/CD, mayor huella de memoria RAM y la necesidad de configurar herramientas auxiliares (`ts-node`, `tsx` o `esbuild`) para ejecutar TypeScript en el backend.
* **Deno:** Rechazado debido a que, si bien ofrece ejecución nativa de TypeScript y seguridad granular, presenta menor ergonomía y compatibilidad con ciertas dependencias del ecosistema npm utilizadas habitualmente por Astro y librerías de visualización.
* **Python (como runtime exclusivo de Backend):** Si bien se utilizó Python en la fase inicial de scraping exploratorio, mantener dos ecosistemas aislados para desarrollo web (Python para backend y JavaScript/TypeScript para frontend) incrementa los tiempos de build, la complejidad de dependencias y el esfuerzo de mantenimiento del equipo (RNF-007).

## Consecuencias

### Positivas
* Velocidad de instalación de dependencias hasta 10 veces más rápida en entornos locales y runners de GitHub Actions, reduciendo drásticamente los tiempos de CI/CD (RNF-008).
* Soporte nativo para TypeScript y JSX/TSX sin configuración compleja de compiladores (`tsconfig` directo).
* Tiempos de respuesta de backend por debajo de 50 ms gracias a su motor basado en JavaScriptCore, cumpliendo con holgura el RNF-001.
* Reducción en consumo de memoria, facilitando su ejecución en tiers gratuitos o contenedores reducidos (RNF-011).

### Negativas / Riesgos
* Menor historial de madurez en producción en comparación con Node.js, existiendo el riesgo de inconsistencias puntuales con librerías nativas antiguas dependientes de Node-API o node-gyp.
* Requiere asegurar que el hosting o contenedor de despliegue tenga soporte para el binario de Bun o se use el adaptador Node/Bun compatible de Astro.
