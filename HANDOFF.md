# 🚀 DOCUMENTO DE TRASPASO TÉCNICO (HANDOFF.md)

* **Proyecto:** Observatorio de Calidad Digital Pública del Perú
* **Fecha:** 2026-09-27
* **Estado del Proyecto:** Fase 1 — ✅ COMPLETADA / Listo para implementar Fase 2 (Backend + Dashboard)
* **Autor / Rol saliente:** Antigravity AI Assistant

---

## 🎯 1. Resumen Ejecutivo de la Sesión

En esta sesión se implementó, probó y desplegó el **Módulo de Captura Cruda (`packages/collector/`)**, completando la Fase 1 del proyecto:

1. **Módulo `packages/collector/` implementado** en Bun + TypeScript con Arquitectura Hexagonal (Puertos y Adaptadores), listo para ser reutilizado sin modificaciones en el Backend de Fase 2.
2. **GitHub Actions configurado** con workflow `daily-audit.yml`: cron diario a la **1:00 PM hora Perú (18:00 UTC)** y trigger manual (`workflow_dispatch`) con parámetros configurables.
3. **GitHub Secrets configurados** vía `gh secret set`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_PAGESPEED_API_KEY`.
4. **Primera ejecución real validada** en GitHub Actions (1m23s, exit code 0) y localmente. La tabla `mediciones_crudas` tiene **180 registros reales** con telemetría de los 90 portales (2 pasadas de prueba).
5. **Hallazgos iniciales de disponibilidad:** ~14% de portales con incidentes activos (DNS caído, timeouts, SSL expirado, HTTP 403).
6. **Commit y push** a `main` en `https://github.com/yhuayhuahi/Observatorio_Digital`.

---

## 🗺️ 2. Mapa de Documentación Técnica Esencial

> **Para el próximo desarrollador o agente de IA** — leer en este orden de prioridad:

```
GSTI_project/
├── HANDOFF.md                            ← Este documento (leer primero)
├── docs/
│   ├── schemes/
│   │   ├── modelo_base_datos.md          ← Modelo relacional, justificación de 2 fases, DDL
│   │   └── schema_fase1.sql              ← DDL ejecutado en Supabase (referencia)
│   ├── architecture/
│   │   ├── arquitectura_del_sistema.md   ← Diagramas Mermaid en 3 niveles (Contexto → Código)
│   │   └── README.md                     ← Índice de arquitectura
│   ├── ADRs/                             ← 7 decisiones tecnológicas formales
│   │   ├── README.md                     ← Índice de ADRs
│   │   ├── ADR-0001-uso-de-bun.md
│   │   ├── ADR-0002-uso-de-astro.md
│   │   ├── ADR-0003-uso-de-postgresql.md
│   │   ├── ADR-0004-uso-de-css-puro.md
│   │   ├── ADR-0005-uso-de-github-actions.md
│   │   ├── ADR-0006-uso-de-apis-de-google.md
│   │   └── ADR-0007-uso-de-docker.md
│   ├── contexto.md                       ← Qué se captura, por qué, relación con ITIL v4 / WCAG 2.1
│   ├── requerimientos_funcionales.md     ← RF-001 a RF-013
│   └── requerimientos_no_funcionales.md  ← RNF-001 a RNF-011
├── packages/
│   ├── collector/                        ← ✅ FASE 1 COMPLETA — Módulo de Captura Cruda
│   └── second_test/                      ← Scripts de prueba y validación de conexión (referencia)
├── apps/                                 ← ❌ NO EXISTE AÚN — Fase 2
│   ├── api/                              ← Backend Core REST (Bun)
│   └── dashboard/                        ← Frontend (Astro)
└── .github/
    └── workflows/
        └── daily-audit.yml               ← ✅ ACTIVO — Cron 18:00 UTC / 1:00 PM Perú
```

---

## 📊 3. Estado Actual de la Solución ("¿Cómo Vamos?")

### A. Base de Datos en Supabase (Producción)

* **Región:** AWS `ca-central-1` (Canadá Central)
* **Host del Pooler IPv4:** `aws-0-ca-central-1.pooler.supabase.com` (Puerto 5432 / 65432)
* **Tablas:**
  1. `public.entidades` — **90 registros activos** (catálogo maestro oficial y limpio)
  2. `public.mediciones_crudas` — **creciendo diariamente** desde el 2026-09-27
* **Registros actuales:** ~180 (2 pasadas de validación el día de implementación)
* **Crecimiento esperado:** +90 registros/día = ~32.850 registros/año

### B. Módulo `packages/collector/` (Fase 1 — ✅ Completo)

Arquitectura Hexagonal implementada al 100%:

```
packages/collector/
├── package.json                      Bun + @supabase/supabase-js ^2.49.1
├── tsconfig.json
├── .gitignore                        Protege .env y node_modules
└── src/
    ├── index.ts                      Exportación pública para Backend Fase 2
    ├── cli.ts                        Entrypoint: bun run start
    ├── core/
    │   ├── models/
    │   │   ├── entity.model.ts       Interface Entity
    │   │   ├── probe-result.model.ts HttpProbeResult (disponibilidad HTTP)
    │   │   ├── audit-result.model.ts PageSpeedAuditResult (CWV + WCAG 2.1)
    │   │   └── measurement.model.ts  RawMeasurement (unidad de persistencia)
    │   └── ports/
    │       ├── entity-repository.port.ts    IEntityRepository
    │       ├── measurement-repository.port.ts IMeasurementRepository
    │       ├── http-probe.port.ts           IHttpProbe
    │       └── audit-service.port.ts        IAuditService
    ├── infrastructure/
    │   ├── config/env.config.ts      Validación fail-fast de variables de entorno
    │   ├── http/fetch-http-probe.ts  Sonda HTTP nativa (HEAD→GET, timeout 10s)
    │   ├── google/pagespeed-client.ts Cliente PageSpeed API v5 (CWV + WCAG, reintentos exponenciales)
    │   └── persistence/supabase-measurement-repo.ts Adaptador Supabase (lee entidades + persiste batch)
    └── application/
        ├── run-full-audit.usecase.ts Orquestador de las 90 entidades
        └── rate-limiter.ts           Lotes configurables con pausa anti-cuota
```

**Flags de ejecución** (variables de entorno opcionales):

| Variable | Default | Descripción |
|---|---|---|
| `AUDIT_BATCH_SIZE` | `3` | Entidades en paralelo por lote |
| `AUDIT_DELAY_MS` | `1500` | Pausa entre lotes (ms) para respetar cuota Google |
| `AUDIT_SOLO_HTTP` | `false` | Si `true`, omite PageSpeed (solo sonda HTTP) |

### C. GitHub Actions (Producción)

* **Workflow:** `.github/workflows/daily-audit.yml`
* **Cron:** `0 18 * * *` → **1:00 PM hora Perú (18:00 UTC)** — horario pico de tráfico gubernamental
* **Secrets configurados** en el repositorio:
  * `SUPABASE_URL` ✅
  * `SUPABASE_SERVICE_ROLE_KEY` ✅
  * `GOOGLE_PAGESPEED_API_KEY` ✅
* **Primera ejecución real:** 2026-09-27, exitosa en 1m23s, exit code 0
* **URL del workflow:** https://github.com/yhuayhuahi/Observatorio_Digital/actions/workflows/daily-audit.yml

### D. Hallazgos de Disponibilidad Iniciales (evidencia empírica)

Detectados en la primera ejecución real — datos ya persistidos en `mediciones_crudas`:

| Tipo de incidente | Entidades afectadas (muestra) |
|---|---|
| DNS no resuelve (`ENOTFOUND`) | GR Tacna, GR Ayacucho, GR Arequipa, GR Amazonas |
| Timeout > 10s | GR Loreto, GR Ucayali, GR Cajamarca, GR Lambayeque |
| Certificado SSL expirado | GR Piura |
| HTTP 403 (bloquea crawlers) | GR Callao |

---

## 🔒 4. Reglas Críticas de Seguridad

* **Bajo ninguna circunstancia leer, imprimir o volcar el archivo `.env`** en terminales, respuestas de chat o logs de commits.
* Los archivos `.env` están en `.gitignore` tanto en `packages/collector/` como en `packages/second_test/`.
* Las credenciales reales viven en:
  * **Localmente:** `packages/collector/.env` (copiado de `packages/second_test/.env`)
  * **En CI/CD:** GitHub Actions Secrets del repositorio

---

## ⚡ 5. Comandos de Verificación Rápida para Reanudar

```bash
# 1. Cargar Bun
export PATH="$HOME/.bun/bin:$PATH"

# 2. Verificar versiones
bun --version       # Debe responder 1.4.2+
gh --version        # Debe responder 2.97.0+

# 3. Verificar conexión a Supabase y Google PageSpeed API
cd packages/second_test
bun run test:connection

# 4. Ejecutar auditoría manualmente (solo HTTP, rápido, sin consumir cuota Google)
cd packages/collector
AUDIT_SOLO_HTTP=true AUDIT_BATCH_SIZE=5 bun run start

# 5. Ejecutar auditoría completa (HTTP + PageSpeed) — consume cuota Google
cd packages/collector
bun run start

# 6. Disparar workflow manualmente desde CLI
gh workflow run daily-audit.yml \
  --repo yhuayhuahi/Observatorio_Digital \
  --field solo_http=false \
  --field batch_size=3 \
  --field delay_ms=1500
```

---

## 🛠️ 6. Lo que Sigue: Fase 2 — Backend Core + Dashboard

> **Contexto para el próximo agente:** La Fase 1 recolecta telemetría cruda sin interpretarla.
> La Fase 2 agrega la lógica analítica (SLAs, incidentes, scores) y la visualiza en un dashboard público.

### Principio de integración del Collector

El módulo `packages/collector/` fue diseñado para **importarse sin modificaciones** en el Backend:

```typescript
// En apps/api — una sola línea basta
import { RunFullAuditUseCase, SupabaseRepo, FetchHttpProbe, PageSpeedClient } from '@observatorio/collector';
```

### A. Backend Core (`apps/api/`) — *Próximo a implementar*

Runtime **Bun** con servidor HTTP nativo (`Bun.serve`). Estructura definida en [`arquitectura_del_sistema.md`](docs/architecture/arquitectura_del_sistema.md#L279):

* **`modules/slas/`** — Calcula uptime mensual real vs umbral (ej. 99.5%) sobre `mediciones_crudas`
* **`modules/incidents/`** — Detecta incidentes por continuidad de `disponible = false` (ITIL v4)
* **`modules/scoring/`** — Puntaje compuesto 0–100 (40% disponibilidad / 30% velocidad / 30% accesibilidad)
* **`modules/reports/`** — Exporta CSV/JSON para descarga pública

> **Nota crítica:** La fórmula de ponderación (40/30/30) aún debe **validarse empíricamente** contra la dispersión real de los datos acumulados. No fijarla en piedra hasta tener al menos 30 días de telemetría. Ver `modelo_base_datos.md` sección 5.

### B. Frontend Dashboard (`apps/dashboard/`) — *Fase 2 posterior al Backend*

Framework **Astro** con arquitectura de islas. Estructura en [`arquitectura_del_sistema.md`](docs/architecture/arquitectura_del_sistema.md#L319):

* **5 páginas:** Resumen Ejecutivo, Ranking de 90 Entidades, Ficha por Entidad, Alertas/Incidentes, Reportes
* **Islas interactivas** (React/Preact): tabla de ranking con filtros, gráficos históricos (CWV + uptime)
* **CSS Puro sin dependencias externas** — contraste WCAG 2.1 AA mínimo (ratio ≥ 4.5:1)
* **Despliegue:** Vercel o Cloudflare Pages (hosting estático/SSR)

### C. Matriz de Requerimientos Pendientes para Fase 2

Consultar [`requerimientos_funcionales.md`](docs/requerimientos_funcionales.md) y [`requerimientos_no_funcionales.md`](docs/requerimientos_no_funcionales.md) para el detalle completo. Los más críticos:

| ID | Requerimiento | Módulo Fase 2 |
|---|---|---|
| RF-006 | Calcular puntaje de cumplimiento (0–100) | `apps/api/modules/scoring/` |
| RF-008 | Detectar anomalías y tendencias | `apps/api/modules/incidents/` |
| RF-010 | Dashboard web público | `apps/dashboard/` |
| RF-012 | Gestión de SLAs e incidentes (ITIL v4) | `apps/api/modules/slas/` + `incidents/` |
| RF-013 | Reportes CSV/JSON exportables | `apps/api/modules/reports/` |
| RNF-002 | Carga del frontend ≤ 3s (LCP) | Astro Islands + CDN |
| RNF-006 | Accesibilidad WCAG 2.1 nivel AA | CSS tokens + estructura semántica |
