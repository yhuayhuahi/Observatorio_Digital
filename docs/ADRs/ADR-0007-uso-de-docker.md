# ADR 0007: Uso de Docker para Homogeneidad de Entornos y Fijación de Versiones

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El desarrollo y mantenimiento del Observatorio involucra múltiples capas tecnológicas: runtime Bun, base de datos relacional PostgreSQL con extensiones, scripts de auditoría y la aplicación web en Astro. Para cumplir con el requerimiento RNF-007 (código documentado y fácil de mantener) y RNF-008 (versión fija de dependencias y despliegue rápido ≤ 10 minutos), es imprescindible asegurar que cualquier desarrollador o servidor de integración ejecute las mismas versiones exactas de herramientas y motores de base de datos.

En entornos de desarrollo sin aislamiento existen frecuentes divergencias entre sistemas operativos (Linux, macOS, Windows/WSL), versiones de clientes de bases de datos o configuraciones de red, lo que genera retrasos y el clásico problema de "en mi máquina sí funciona".

## Decisión
Adoptar **Docker** y **Docker Compose** como la herramienta de contenedorización estándar para:
1. **Fijar versiones precisas** de las herramientas base (imagen de Bun con versión específica, imagen oficial de PostgreSQL 16+ con configuración estandarizada de extensiones y codificación UTF-8).
2. **Entorno de desarrollo local unificado:** Proveer un archivo `docker-compose.yml` que levante con un solo comando la base de datos PostgreSQL local para pruebas, el backend y los servicios auxiliares sin requerir instalaciones nativas en la máquina del desarrollador.
3. **Reproducibilidad en CI/CD y despliegue:** Facilitar que las imágenes resultantes puedan ejecutarse de forma predecible en cualquier proveedor de contenedores.

## Alternativas Consideradas
* **Instalación nativa manual en el sistema anfitrión (Bare-metal):** Rechazado por generar fricción en el onboarding de colaboradores, riesgo de incompatibilidad de versiones locales de PostgreSQL o Bun instaladas globalmente, y mayor dificultad para limpiar el estado de pruebas.
* **Máquinas Virtuales completas (Vagrant / VirtualBox):** Rechazado por su elevado consumo de recursos de CPU y disco (imágenes de varios gigabytes), tiempos de inicio lentos (minutos en lugar de segundos) y poca agilidad para entornos de desarrollo continuo.
* **Nix / Devcontainers sin Docker:** Rechazado por requerir conocimientos avanzados de sintaxis específica y tener menor adopción en equipos multidisciplinarios en comparación con el estándar universal de la industria que representa Docker.

## Consecuencias

### Positivas
* Paridad absoluta entre entornos de desarrollo local, pruebas de CI y producción; eliminar discrepancias en versiones de dependencias (RNF-008).
* Rápido arranque del entorno completo para nuevos desarrolladores mediante un simple `docker compose up -d`.
* Facilidad para inicializar esquemas de base de datos limpios y fixtures de prueba para las 90 entidades sin alterar la base de datos de producción.
* Aislamiento de puertos, credenciales y volúmenes persistentes gestionados de forma segura.

### Negativas / Riesgos
* Consumo moderado de almacenamiento en disco para almacenar imágenes y capas de Docker en los equipos de desarrollo.
* Requiere que los integrantes del equipo cuenten con el servicio de Docker instalado y en funcionamiento en sus estaciones de trabajo.
