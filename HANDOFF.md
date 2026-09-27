# 🚀 DOCUMENTO DE TRASPASO TÉCNICO (HANDOFF.md)

* **Proyecto:** Observatorio de Calidad Digital Pública del Perú
* **Fecha:** 2026-09-27
* **Estado del Proyecto:** Fase 1 — Base de Datos y Entorno Configurados / Listo para Implementar el Módulo de Captura Cruda
* **Autor / Rol saliente:** Antigravity AI Assistant

---

## 🎯 1. Resumen Ejecutivo de la Sesión

En esta sesión se completó la preparación técnica y de ingeniería previa al desarrollo del sistema:
1. **Depuración y Validación de Datos:** Se auditaron y limpiaron los datasets de [scraping/filtered/](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/scraping/filtered), fijando la muestra oficial en exactamente **90 entidades públicas**.
2. **Sincronización Documental:** Se eliminaron inconsistencias de conteo ("89" vs "90") en todos los archivos conceptuales y normativos.
3. **Decisiones de Arquitectura (ADRs):** Se redactaron los 7 registros formales de decisión tecnológica bajo el estándar ADR.
4. **Modelo de Datos Fase 1 (PostgreSQL / Supabase):** Se diseñó un esquema relacional mínimo y limpio, posponiendo deliberadamente los cálculos derivados de SLAs e incidentes (Fase 2) para no sesgar la recolección empírica.
5. **Arquitectura en 3 Niveles:** Se documentó la arquitectura en nivel Macro (Contexto), Contenedores/Módulos y Código detallado.
6. **Infraestructura y Base de Datos Desplegada:** Se ejecutó el DDL en Supabase PostgreSQL mediante el Connection Pooler IPv4 y se sembraron las **90 entidades oficiales**. La conexión a Supabase y la Google PageSpeed Insights API están **100% probadas y activas**.

---

## 🗺️ 2. Mapa de Documentación Técnica Esencial

Para el próximo desarrollador o agente de IA, estos son los documentos de ingeniería obligatorios:

```
GSTI_project/
├── HANDOFF.md                       <-- Este documento (Guía de continuidad)
├── docs/
│   ├── schemes/                     <-- MODELO DE BASE DE DATOS
│   │   ├── modelo_base_datos.md     <-- Justificación de 2 fases, diagrama Mermaid, diccionario de datos
│   │   └── schema_fase1.sql         <-- Script DDL ejecutado en Supabase (entidades e índices)
│   ├── architecture/                <-- ARQUITECTURA EN 3 NIVELES
│   │   ├── arquitectura_del_sistema.md <-- Diagramas Mermaid (Contexto, Módulos y Código)
│   │   └── README.md                <-- Índice de arquitectura
│   ├── ADRs/                        <-- REGISTROS DE DECISIONES ARQUITECTÓNICAS
│   │   ├── README.md                <-- Índice de decisiones tecnológicas
│   │   ├── ADR-0001-uso-de-bun.md
│   │   ├── ADR-0002-uso-de-astro.md
│   │   ├── ADR-0003-uso-de-postgresql.md
│   │   ├── ADR-0004-uso-de-css-puro.md
│   │   ├── ADR-0005-uso-de-github-actions.md
│   │   ├── ADR-0006-uso-de-apis-de-google.md
│   │   └── ADR-0007-uso-de-docker.md
│   └── (Otros docs de contexto/humanos) <-- contexto.md, requerimientos_funcionales.md, etc.
```

---

## 📊 3. Estado Actual de la Solución ("¿Cómo Vamos?")

### A. Muestra Oficial de 90 Entidades en Producción
Los 4 archivos CSV limpios en [`scraping/filtered/`](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/scraping/filtered) ya fueron sembrados en la base de datos:
* **20 Poder Ejecutivo:** Presidencia de la República, Presidencia del Consejo de Ministros (PCM) y los 18 Ministerios (incluyendo MIMP con URL corregida `https://`).
* **25 Gobiernos Regionales (GOREs):** Portales institucionales directos (`Web de Gobierno Regional ...`), con su región política inferida y asignada.
* **15 Organismos Autónomos:** SUNAT, RENIEC, EsSalud, INEI, BCRP, OSIPTEL, etc.
* **30 Municipalidades Provinciales:** Capitales y provincias estratégicas con población e impacto económico clave.

### B. Base de Datos en Supabase (En Producción)
* **Región:** AWS `ca-central-1` (Canadá Central).
* **Host del Pooler IPv4:** `aws-0-ca-central-1.pooler.supabase.com` (Puerto 5432 / 65432).
* **Tablas Creadas:**
  1. `public.entidades` (90 registros activos con constraint único por URL).
  2. `public.mediciones_crudas` (lista para recibir las auditorías diarias).
  3. Índices temporales y relacionales aplicados.

### C. Entorno de Pruebas Previo (`packages/second_test/`)
Se construyó un banco de pruebas funcional con Bun:
* [`packages/second_test/.env`](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/packages/second_test/.env): Contiene las credenciales reales provistas por el usuario (**¡NUNCA LEER NI IMPRIMIR ESTE ARCHIVO!** Está protegido en `.gitignore`).
* [`test-connection.ts`](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/packages/second_test/test-connection.ts): Valida conectividad Supabase (696 ms) y Google PageSpeed API en vivo.
* [`seed-entities.ts`](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/packages/second_test/seed-entities.ts): Script de sembrado masivo vía HTTPS.
* [`setup-database.ts`](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/packages/second_test/setup-database.ts): Script de migración DDL vía Connection Pooler.

---

## 🛠️ 4. Lo que Sigue: Implementación del Módulo de Captura Cruda

El siguiente paso obligatorio es **implementar el Módulo de Captura Cruda (`packages/collector/`)**.

### Objetivo del Módulo:
Construir un worker / CLI en **Bun + TypeScript** que pueda ser ejecutado diariamente por **GitHub Actions** (y manualmente vía CLI), y que en la Fase 2 se integre sin modificaciones dentro del Backend.

### Especificaciones de Diseño (según [arquitectura_del_sistema.md](file:///home/tooboe/Documentos/AcademicProjects/GSTI_project/docs/architecture/arquitectura_del_sistema.md#L41)):
1. **Patrón Arquitectónico:** Arquitectura Hexagonal (Puertos y Adaptadores).
   * `core/models/`: Modelos de dominio (`Entity`, `RawMeasurement`, `HttpProbeResult`, `PageSpeedAuditResult`).
   * `core/ports/`: Interfaces (`IEntityRepository`, `IMeasurementRepository`, `IHttpProbeService`, `IAuditService`).
   * `infrastructure/`:
     * `http/fetch-http-probe.ts`: Sonda nativa con `fetch` de Bun (mide `status_code`, `tiempo_respuesta_ms`, `disponible = true/false` con timeout de 10s y captura de excepciones de red).
     * `google/pagespeed-client.ts`: Cliente de Google PageSpeed Insights API v5 con extracción de métricas CWV (LCP, FID/INP, CLS, FCP, TTFB, score_desempeno) y Accesibilidad (score_accesibilidad, errores_accesibilidad JSONB, y raw_auditoria).
     * `persistence/supabase-measurement-repo.ts`: Inserción en `mediciones_crudas` mediante `@supabase/supabase-js`.
   * `application/`:
     * `run-full-audit.usecase.ts`: Orquestador que consulta entidades activas, ejecuta sonda HTTP y auditoría Google.
     * `rate-limiter.ts`: **Crítico:** Las 90 entidades deben procesarse en lotes pequeños (ej. 2-3 en paralelo con pausas de 1-2s) para no saturar la cuota por minuto de Google PageSpeed API.
   * `src/cli.ts`: Entrypoint ejecutable (`bun run start`).
   * `src/index.ts`: Exportación de interfaces y del caso de uso para el backend futuro.

2. **Workflow de GitHub Actions (`.github/workflows/daily-audit.yml`):**
   * Trigger programado por cron (ej. `schedule: - cron: '0 5 * * *'` a las 00:00 hora Perú / 05:00 UTC).
   * Trigger manual: `workflow_dispatch`.
   * Variables secretas de GitHub:
     * `SUPABASE_URL`
     * `SUPABASE_SERVICE_ROLE_KEY`
     * `GOOGLE_PAGESPEED_API_KEY`
   * Pasos del job: Checkout repo -> Setup Bun -> `bun install` -> `bun run collector`.

---

## ⚡ 5. Comandos de Verificación Rápida para Reanudar

Para verificar que el entorno sigue operativo al retomar el trabajo:

```bash
# 1. Cargar el entorno de Bun
source ~/.bashrc
export PATH="$HOME/.bun/bin:$PATH"

# 2. Verificar versiones
bun --version       # Debe responder 1.4.2+
supabase --version  # Debe responder 2.118.0+

# 3. Correr la prueba de verificación de conexión actual
cd packages/second_test
bun run test:connection
```

---

## 🔒 6. Reglas Críticas de Seguridad
* **Bajo ninguna circunstancia leer, imprimir o volcar el archivo `.env`** en terminales, respuestas de chat o logs de commits.
* Las variables requeridas para el módulo final se deben copiar desde `packages/second_test/.env` a `packages/collector/.env` 
