# **Requerimientos Funcionales (Simplificados) - Observatorio de Calidad Digital Pública**

## **1. Introducción**

Este documento define los **Requerimientos Funcionales (RF)** del **Observatorio de Calidad Digital Pública**, un sistema diseñado para **capturar, procesar y visualizar métricas de desempeño tecnológico** de los portales gubernamentales del Perú, alineado con la **Ley de Gobierno Digital (D.L. 1412)** y su reglamento (D.S. N.º 029-2021-PCM).


## **2. Categorías de Requerimientos Funcionales**

Los RF se organizan en las siguientes categorías, cada una con un enfoque claro y alcanzable:


| **Categoría**                    | **Descripción**                                                     |
| -------------------------------- | ------------------------------------------------------------------- |
| **Recolección de Datos**         | Extracción y verificación de datos de los portales gubernamentales. |
| **Procesamiento de Datos**       | Transformación y análisis de los datos recolectados.                |
| **Visualización y Dashboard**    | Presentación de datos en un panel interactivo.                      |
| **Gestión de Calidad (ITIL v4)** | Integración de marcos de gestión de servicios TI.                   |
| **Reportes**                     | Generación de reportes con métricas de desempeño.                   |

## **3. Requerimientos Funcionales Detallados**

### 3.1. Recolección de Datos

| **ID** | **Requerimiento**                                 | **Descripción**                                                                                                                                                                                                  | **Prioridad** |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| RF-001 | Extraer URLs de entidades públicas desde `gob.pe` | Implementar un sistema de **web scraping** para extraer las URLs oficiales de las **90 entidades** (25 GOREs, 20 entidades del Poder Ejecutivo —Presidencia y Ministerios—, 15 Organismos Autónomos, 30 Municipalidades) desde las páginas de `gob.pe/estado`. | Alta          |
| RF-002 | Verificar disponibilidad (uptime) de cada URL     | Monitorear el **estado HTTP** (200, 404, 500, etc.) de cada URL para determinar su disponibilidad.                                                                                                               | Alta          |
| RF-003 | Medir velocidad de carga de los portales          | Usar herramientas como **Google PageSpeed Insights API** o **Lighthouse** para medir métricas de desempeño (ej: LCP, TTI, velocidad de carga).                                                                   | Alta          |
| RF-004 | Evaluar accesibilidad según WCAG 2.1              | Auditar cada portal usando herramientas como **Lighthouse** o **WAVE** para verificar el cumplimiento del estándar **WCAG 2.1 (nivel AA)**.                                                                      | Alta          |
| RF-005 | Identificar y clasificar entidades por categoría  | Asignar a cada URL una **categoría** (Ministerio, GORE, Organismo Autónomo, Municipalidad) y **región** (si aplica).                                                                                             | Alta          |


---

### 3.2. Procesamiento de Datos


| **ID** | **Requerimiento**                                    | **Descripción**                                                                                        | **Prioridad** |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------- |
| RF-006 | Calcular puntaje de cumplimiento (0-100) por entidad | Asignar un **score** a cada entidad basado en métricas de disponibilidad, velocidad y accesibilidad.   | Alta          |
| RF-007 | Normalizar métricas para comparabilidad              | Convertir las métricas crudas (ej: tiempo de carga en segundos) a una **escala normalizada (0-100)**.  | Alta          |
| RF-008 | Detectar anomalías en las métricas                   | Identificar **valores atípicos** (ej: caídas de servicio, degradación de velocidad) y generar alertas. | Alta          |
| RF-009 | Agregar metadatos a cada entidad                     | Incluir campos como **fecha de última verificación**, **región**, **categoría** y **notas**.           | Media         |

---

### 3.3. Visualización y Dashboard

| **ID** | **Requerimiento**                                    | **Descripción**                                                                                                                                                    | **Prioridad** |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| RF-010 | Visualizar métricas en el dashboard                  | Mostrar un **ranking de entidades por puntaje**, gráficos de **uptime**, **velocidad de carga**, **accesibilidad** y **filtros dinámicos** por categoría o región. | Alta          |
| RF-011 | Mostrar detalles y historial de métricas por entidad | Incluir una **ficha técnica** con métricas, URLs, historial y tendencias para cada entidad.                                                                        | Media         |

---

### 3.4. Gestión de Calidad (ITIL v4)

| **ID** | **Requerimiento**                         | **Descripción**                                                                                                                           | **Prioridad** |
| ------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| RF-012 | Gestionar incidentes y SLAs según ITIL v4 | Registrar **incidentes de disponibilidad**, gestionar eventos, definir **SLAs** (ej: uptime mínimo) y generar **reportes de incidentes**. | Alta          |

---

### 3.5. Reportes


| **ID** | **Requerimiento**                                     | **Descripción**                                                                                                                                         | **Prioridad** |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| RF-013 | Generar reportes periódicos con métricas de desempeño | Crear **reportes automáticos** (diarios, semanales, mensuales) en **CSV/JSON** con todas las métricas clave (disponibilidad, velocidad, accesibilidad). | Alta          |

## **4. Resumen de Requerimientos Funcionales**


| **Prioridad** | **Cantidad** | **Requerimientos**                      |
| ------------- | ------------ | --------------------------------------- |
| **Alta**      | 10           | RF-001 a RF-008, RF-010, RF-012, RF-013 |
| **Media**     | 2            | RF-009, RF-011                          |

## **7. Anexos**

- **Requerimientos No Funcionales**: [requerimientos\_no\_funcionales.md](https://github.com/yhuayhuahi/Observatorio_Digital/blob/main/docs/requerimientos_no_funcionales.md).
- **Estado del Arte**
- **Proceso de Obtención de URLs**: [proceso\_obtencion\_urls.md](https://github.com/yhuayhuahi/Observatorio_Digital/blob/main/docs/proceso_obtencion_urls.md).
