# Observatorio de Calidad Digital Pública del Estado Peruano

[![CI/CD Tests](https://img.shields.io/badge/Bun_Tests-Passing_100%25-success)](./apps/api/tests/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accesibilidad-WCAG_2.1_AA-blue)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Stack](https://img.shields.io/badge/Stack-Bun_|_Astro_|_Supabase_|_Gemini-purple)](./docs/ADRs/)

Plataforma de observabilidad continua, telemetría y auditoría prescriptiva asistida por IA para evaluar la disponibilidad, el rendimiento técnico y la accesibilidad universal de los portales web del Estado peruano, conforme a la **Ley de Gobierno Digital (D.L. N.° 1412)**, su reglamento (**D.S. N.° 029-2021-PCM**) y las mejores prácticas de **ITIL v4** e **ISO/IEC 25010**.

---

## 🎯 Visión General y Objetivos

* **Panel Longitudinal Continuo:** Monitoreo diario desatendido sobre una muestra representativa de **90 entidades públicas** (Poder Ejecutivo, Gobiernos Regionales, Municipalidades Provinciales y Organismos Autónomos).
* **Modelo Ponderado 40 / 30 / 30:**
  * **40% Disponibilidad (Uptime):** Sondas HTTP, latencia TTFB, resolución DNS, certificados SSL/TLS y evaluación de SLAs (meta: 99.5%).
  * **30% Rendimiento (Core Web Vitals):** LCP ($\le 2.5\text{s}$), CLS ($\le 0.1$), FCP y TTFB medidos mediante Google PageSpeed Insights API.
  * **30% Accesibilidad (WCAG 2.1 Nivel AA):** Detección automatizada de barreras de acceso digital (Lighthouse / Axe-core).
* **Auditoría Prescriptiva Asistida por IA (RAG Híbrido):** Asistente inteligente capaz de ejecutar consultas estructuradas (*Text-to-SQL*) sobre la telemetría histórica y recuperación semántica (*pgvector*) sobre el marco normativo peruano para generar diagnósticos y propuestas de remediación en código.

---

## 🏗️ Arquitectura del Repositorio (Monorepo)

```text
GSTI_project/
├── .github/
│   └── workflows/
│       └── daily-audit.yml              # Orquestador cron diario (15:10 PET / 20:10 UTC)
├── packages/
│   └── collector/                       # MÓDULO DE INGESTA Y RECOLECCIÓN
│       └── src/                         # Sondas HTTP, PageSpeed Client y persistencia
├── apps/
│   ├── api/                             # BACKEND CORE REST API & SUBSISTEMA RAG
│   │   ├── src/
│   │   │   ├── core/                    # Normalizadores, motor de SLAs e incidentes
│   │   │   ├── modules/                 # Entidades, rankings, reportes y RAG (Gemini)
│   │   │   └── server.ts                # Servidor HTTP nativo en Bun
│   │   └── tests/                       # Pruebas automatizadas de contratos y RAG
│   └── dashboard/                       # FRONTEND DASHBOARD & CHATBOT
│       ├── src/
│       │   ├── layouts/                 # Plantillas base accesibles (CSS Puro)
│       │   ├── pages/                   # /, /ranking, /entidad/[id], /incidentes, /reportes, /auditor-ia
│       │   ├── islands/                 # Tablas dinámicas, gráficos SVG y AuditChatWidget
│       │   └── styles/                  # Design tokens en CSS Puro WCAG 2.1 AA
│       └── tests/                       # Pruebas de integración del frontend
├── docs/
│   ├── ADRs/                            # Registro formal de 9 decisiones arquitectónicas
│   ├── architecture/                    # Especificaciones en 3 niveles (Contexto, Módulos, Código)
│   ├── SDD/                             # Especificaciones técnicas detalladas (MOD-001 a MOD-006)
│   ├── schemes/                         # Modelos relacionales, DDL y esquemas vectoriales
│   ├── knowledge_base/                  # Corpus normativo peruano indexado en pgvector
│   └── sustentacion/                    # RTM GSTI y Guía de Diapositivas para exposición
├── SLAs.md                              # Especificación formal de SLAs y criterios RAG
├── resumen.md                           # Resumen ejecutivo del proyecto
└── package.json                         # Configuración y scripts raíz del monorepo
```

---

## 🚀 Inicio Rápido en Desarrollo Local

### Prerrequisitos
* [Bun](https://bun.sh) v1.1+ instalado en el sistema.
* Cuenta en Supabase con PostgreSQL y extensión `pgvector` habilitada.
* Clave API de Google AI Studio (Gemini) y Google PageSpeed Insights.

### 1. Instalación de Dependencias
```bash
bun install
```

### 2. Configurar Variables de Entorno
Copia y configura los archivos de entorno en cada módulo:
```bash
cp apps/api/.env.example apps/api/.env
```
Asegúrate de configurar:
* `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
* `GEMINI_API_KEY`
* `GOOGLE_PAGESPEED_API_KEY`

### 3. Ejecución en Modo Desarrollo

#### Levantar el Backend API (Puerto 3000):
```bash
bun run dev:api
```

#### Levantar el Dashboard Web (Puerto 4321):
```bash
bun run dev:dashboard
```

El panel estará disponible en `http://localhost:4321` y la API en `http://localhost:3000`.

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con suites de pruebas unitarias y de integración end-to-end:

```bash
# Ejecutar todas las pruebas del monorepo
bun test

# Ejecutar pruebas exclusivas del backend y RAG
bun test --cwd apps/api

# Ejecutar pruebas del frontend dashboard
bun test --cwd apps/dashboard
```

---

## 📜 Licencia y Propósito Académico

Proyecto desarrollado con fines estrictamente académicos y de investigación en Ingeniería de Sistemas y Gestión de TI en la **Universidad Nacional de San Agustín de Arequipa (UNSA)**. Los datos se distribuyen bajo términos de acceso abierto con fines de investigación científica y transparencia cívica.
