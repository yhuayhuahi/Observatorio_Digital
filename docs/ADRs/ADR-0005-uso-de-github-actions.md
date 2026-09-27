# ADR 0005: Uso de GitHub Actions para CI/CD y Recolección Automatizada de Métricas

* **Estatus:** Aceptado
* **Fecha:** 2026-09-27
* **Decisor(es):** Equipo de Arquitectura y Desarrollo del Observatorio Digital

## Contexto
El Observatorio de Calidad Digital Pública exige dos procesos clave de automatización:
1. **Recolección y auditoría periódica de métricas:** Ejecución programada diaria de scripts para auditar las 90 entidades públicas (disponibilidad HTTP, tiempos de respuesta, llamadas a APIs de Google y registro en PostgreSQL) según lo estipulado en RF-001 a RF-005, RF-012 y en el flujo del backend documentado en `contexto.md`.
2. **Integración y Despliegue Continuo (CI/CD):** Pruebas automatizadas de código, validación de esquemas y despliegue del frontend/backend en tiempos ≤ 10 minutos (RNF-008).

Adicionalmente, el proyecto debe operar bajo una estricta restricción de sostenibilidad económica (RNF-011: costo operativo mensual ≤ $50 USD), lo cual desaconseja el alquiler de servidores dedicados (VPS) exclusivamente para tareas programadas de cron jobs.

## Decisión
Adoptar **GitHub Actions** como la plataforma unificada para:
1. **Orquestación de tareas programadas (Scheduled Cron Workflows):** Configurar workflows basados en eventos `schedule: - cron: '...'` que ejecuten diariamente los scripts de auditoría y persistan los resultados en la base de datos PostgreSQL.
2. **Flujos de CI/CD:** Automatizar la verificación de código (linting, tipado estático con TypeScript) y el despliegue automático del dashboard en cada merge a la rama principal (`main`).

## Alternativas Consideradas
* **Servidor VPS dedicado permanente (DigitalOcean Droplet / AWS EC2):** Rechazado por implicar costos fijos recurrentes innecesarios, además de requerir mantenimiento manual de parches de seguridad, reinicios y configuración de demonios de cron en Linux.
* **Funciones Serverless con Cloud Scheduler (AWS Lambda + EventBridge o GCP Cloud Functions):** Rechazado por suponer mayor fragmentación de servicios en la nube, configuración de permisos IAM compleja y límites estrictos de tiempo de ejecución (timeout de 15 minutos en Lambda), lo cual resulta riesgoso para auditar en lote 90 URLs con análisis profundos de PageSpeed.
* **GitLab CI / Jenkins:** Rechazado debido a que el repositorio del proyecto se aloja en GitHub, por lo que introducir un orquestador externo aumentaría la complejidad operativa y los tiempos de configuración sin beneficios adicionales.

## Consecuencias

### Positivas
* Costo operativo nulo en infraestructura de cómputo para tareas periódicas, utilizando los minutos gratuitos mensuales provistos por GitHub para repositorios.
* Infraestructura como código: todos los flujos de auditoría y despliegue quedan versionados en `.github/workflows/` dentro del propio repositorio del proyecto.
* Gestión segura de variables de entorno y credenciales (claves de acceso a PostgreSQL, Google API Keys) mediante GitHub Secrets y Environments (RNF-005).
* Posibilidad de disparar auditorías manuales bajo demanda mediante `workflow_dispatch` cuando sea necesario reevaluar entidades específicas.

### Negativas / Riesgos
* Los jobs programados mediante `cron` en GitHub Actions no tienen precisión de reloj atómico al segundo exacto; en horas pico de GitHub pueden experimentar retrasos de 10 a 25 minutos respecto a la hora programada (lo cual es plenamente tolerable para una auditoría diaria).
* El tiempo máximo continuo de un job individual en GitHub Actions es de 6 horas, lo cual exige que los scripts de auditoría procesen las 90 entidades de forma eficiente o por lotes.
