# **Requerimientos No Funcionales (RNF) - Observatorio de Calidad Digital Pública**

## **1. Introducción**

Este documento define los **Requerimientos No Funcionales (RNF)** del **Observatorio de Calidad Digital Pública**, complementando los [Requerimientos Funcionales](https://github.com/yhuayhuahi/Observatorio_Digital/blob/main/docs/requerimientos_funcionales.md). 

Los RNF aquí descritos **no cambiarán** durante el desarrollo del proyecto y están alineados con:

- El **Estado del Arte** .
- El **marco normativo peruano** (D.L. 1412, D.S. N.º 029-2021-PCM).
- Las **limitaciones del proyecto** (enfoque en la muestra de 90 entidades).

## **2. Requerimientos No Funcionales**

### 2.1. Rendimiento y Escalabilidad


| **ID**  | **Requerimiento**                                             | **Descripción**                                                                                                                                                    | **Métrica**                            | **Criterio de Aceptación**                                                | **Prioridad** |
| ------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------- | ------------- |
| RNF-001 | Tiempo de respuesta del backend                               | El backend debe responder a las solicitudes en un tiempo **mínimo** para garantizar una experiencia ágil.                                                          | Tiempo de respuesta (ms)               | ≤ 500 ms para el 95% de las solicitudes.                                  | Alta          |
| RNF-002 | Tiempo de carga del frontend (dashboard)                      | El dashboard debe cargarse rápidamente para una **buena experiencia de usuario**.                                                                                  | Tiempo de carga (segundos)             | ≤ 3 segundos para el 95% de las cargas (medido con Lighthouse).           | Alta          |
| RNF-003 | Capacidad de procesamiento y almacenamiento para 90 entidades | El sistema debe manejar el monitoreo de **90 entidades** (25 GOREs, 20 entidades del Poder Ejecutivo —Presidencia y Ministerios—, 15 Organismos Autónomos, 30 Municipalidades) y almacenar sus datos históricos. | Número de entidades / Volumen de datos | Soporte para 90 entidades con almacenamiento de datos históricos (1 año). | Alta          |


### 2.2. Seguridad


| **ID**  | **Requerimiento**                        | **Descripción**                                                                                | **Métrica**                                     | **Criterio de Aceptación**                                                             | **Prioridad** |
| ------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- |
| RNF-004 | Autenticación y autorización de usuarios | El sistema debe verificar la **identidad de los usuarios** y asignar **permisos según roles**. | Método de autenticación y granularidad de roles | Autenticación con **OAuth 2.0 o JWT** y roles definidos (Administrador, Visualizador). | Alta          |
| RNF-005 | Cifrado de datos en reposo               | Los datos almacenados deben estar **cifrados** si contienen información sensible.              | Algoritmo de cifrado                            | Uso de **AES-256** para datos sensibles (ej: credenciales de API).                     | Alta          |


### 2.3. Usabilidad y Accesibilidad


| **ID**  | **Requerimiento**                        | **Descripción**                                                                                       | **Métrica**                                        | **Criterio de Aceptación**                                                   | **Prioridad** |
| ------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| RNF-006 | Usabilidad y accesibilidad del dashboard | El dashboard debe ser **intuitivo, accesible y compatible** con múltiples dispositivos y navegadores. | Puntaje de usabilidad / Nivel de cumplimiento WCAG | ≥ 80/100 en pruebas de usabilidad y **cumplimiento de WCAG 2.1 (nivel AA)**. | Alta          |

### 2.4. Mantenibilidad


| **ID**  | **Requerimiento**                                 | **Descripción**                                                                                        | **Métrica**                                                   | **Criterio de Aceptación**                                                                 | **Prioridad** |
| ------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------- |
| RNF-007 | Código bien documentado y fácil de mantener       | El código debe estar **documentado y estructurado** para facilitar su mantenimiento y actualizaciones. | Cobertura de documentación / Estructura modular               | ≥ 80% de funciones/clases documentadas y arquitectura modular.                             | Alta          |
| RNF-008 | Versión de dependencias y facilidad de despliegue | Las dependencias deben estar **versionadas** y el sistema debe ser fácil de desplegar.                 | Herramienta de gestión de dependencias / Tiempo de despliegue | Uso de `pyproject.toml` o `package.json` con versiones fijas y despliegue en ≤ 10 minutos. | Media         |


### 2.5. Interoperabilidad


| **ID**  | **Requerimiento**                                    | **Descripción**                                                                                                                                    | **Métrica**                                         | **Criterio de Aceptación**                                            | **Prioridad** |
| ------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- | ------------- |
| RNF-009 | Integración con APIs externas y exportación de datos | El sistema debe poder **integrarse con APIs de monitoreo** (PageSpeed Insights, Lighthouse) y **exportar datos en formatos estándar** (CSV, JSON). | Número de APIs integradas / Formatos de exportación | Integración con al menos **2 APIs externas** y soporte para CSV/JSON. | Alta          |


### 2.6. Cumplimiento Normativo


| **ID**  | **Requerimiento**                                  | **Descripción**                                                                                                                                                                                        | **Métrica**               | **Criterio de Aceptación**                                      | **Prioridad** |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | --------------------------------------------------------------- | ------------- |
| RNF-010 | Cumplimiento de normativas y estándares aplicables | El sistema debe alinearse con la **Ley de Gobierno Digital (D.L. 1412)**, la **normativa de accesibilidad (WCAG 2.1)**, la **Ley de Protección de Datos (Ley N° 29733)**, y el **estándar ISO 25010**. | Nivel de cumplimiento (%) | 100% de alineación con las normativas y estándares mencionados. | Alta          |

### 2.7. Sostenibilidad


| **ID**  | **Requerimiento**         | **Descripción**                                    | **Métrica**         | **Criterio de Aceptación**                                                                           | **Prioridad** |
| ------- | ------------------------- | -------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| RNF-011 | Costos operativos mínimos | El sistema debe tener **costos operativos bajos**. | Costo mensual (USD) | ≤ $50 USD/mes para el primer año (usando servicios gratuitos como Supabase, Vercel, GitHub Actions). | Alta          |


## **3. Resumen de Requerimientos No Funcionales**


| **Prioridad** | **Cantidad** | **Requerimientos**                  |
| ------------- | ------------ | ----------------------------------- |
| **Alta**      | 8            | RNF-001 a RNF-006, RNF-009, RNF-010 |
| **Media**     | 2            | RNF-007, RNF-008                    |


## **6. Anexos**

- **Requerimientos Funcionales**: [requerimientos\_funcionales.md](https://github.com/yhuayhuahi/Observatorio_Digital/blob/main/docs/requerimientos_funcionales.md).
- **Proceso de Obtención de URLs**: [proceso\_obtencion\_urls.md](https://github.com/yhuayhuahi/Observatorio_Digital/blob/main/docs/proceso_obtencion_urls.md).
