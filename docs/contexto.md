## **1. ¿Qué Vamos a Capturar?**
Vamos a monitorear **métricas clave** de los **90 portales gubernamentales** (Poder Ejecutivo, GOREs, Organismos Autónomos, Municipalidades) para evaluar su **calidad digital**. Estas métricas se agrupan en **3 categorías principales**, alineadas con el **Estado del Arte** y los **marcos de referencia** (ITIL v4, WCAG 2.1, Core Web Vitals):

---

### 1.1. Métricas de Disponibilidad (Uptime)

| **Métrica**               | **Descripción**                                                                                     | **Herramienta**               | **Relación con el Estado del Arte**                                                                                     | **Relación con ITIL v4**                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| **Estado HTTP**           | Código de respuesta del servidor (200, 404, 500, etc.).                                            | `requests` (Python)           | Sección 4.2: Herramientas de monitoreo automatizado                                           | **Gestión de Eventos**: Detectar fallas en servicios críticos (ITIL v4).                                   |
| **Tiempo de respuesta**   | Tiempo que tarda el servidor en responder (en milisegundos).                                       | `requests` (Python)           | Sección 4.1: KPI de desempeño web                                                                               | **Gestión de Rendimiento**: Monitorear el tiempo de respuesta para cumplir SLAs.                            |
| **Disponibilidad (Uptime)** | Porcentaje de tiempo que el portal está operativo.                                              | Cálculo interno              | Sección 4.2: Herramientas de monitoreo automatizado                                           | **Gestión de Disponibilidad**: Asegurar que los servicios estén disponibles según los SLAs definidos.     |

**¿Por qué es importante?**
- **ITIL v4**: La disponibilidad es un **pilar de la gestión de servicios TI**. Monitorearla permite **identificar incidentes** y **cumplir con los SLAs** (Acuerdos de Nivel de Servicio).
- **Investigación**: El estudio de Adedoja (2026) encontró que el **90% de los portales gubernamentales de EE.UU. no cumplían con los Core Web Vitals**, y muchos tenían problemas de disponibilidad. Tu Observatorio **validará si esto también ocurre en Perú**.

### 1.2. Métricas de Desempeño (Core Web Vitals)
Los **Core Web Vitals** son métricas de Google que miden la **experiencia de usuario** en un sitio web. Son clave para evaluar la **calidad técnica** de los portales:

| **Métrica**               | **Descripción**                                                                                     | **Herramienta**               | **Valores ideales**               | **Relación con el Estado del Arte**                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------|--------------------------------|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Largest Contentful Paint (LCP)** | Tiempo que tarda en cargarse el **contenido principal** de la página.                             | PageSpeed Insights / Lighthouse | ≤ 2.5 segundos                   | Sección 4.1: KPI de desempeño web, [6].                                                             |
| **First Input Delay (FID)** | Tiempo que tarda el sitio en **responder a la primera interacción del usuario**.                   | Lighthouse                     | ≤ 100 milisegundos               | Sección 4.1: KPI de desempeño web, [6].                                                             |
| **Cumulative Layout Shift (CLS)** | Cuántos **cambios de diseño no esperados** ocurren mientras se carga la página.                     | Lighthouse                     | ≤ 0.1                             | Sección 4.1: KPI de desempeño web, [6].                                                             |
| **Velocidad de carga**    | Puntaje general de velocidad (0-100).                                                            | PageSpeed Insights             | ≥ 90                             | Sección 4.2: Herramientas de monitoreo automatizado.                                              |

**¿Por qué es importante?**
- **Core Web Vitals**: Son **métricas validadas por Google** y ampliamente usadas en el **monitoreo de calidad web** (Ghattas et al., 2025).
- **Investigación**: El estudio de Ghattas et al. (2025) identificó que estas métricas son **las más citadas** en estudios de desempeño web (70% de los casos). Tu Observatorio las implementará para evaluar los portales peruanos.

---

### 1.3. Métricas de Accesibilidad (WCAG 2.1)

El **WCAG 2.1** (Web Content Accessibility Guidelines) es el estándar internacional para evaluar la accesibilidad de los sitios web. Se enfoca en hacer que el contenido sea accesible para **personas con discapacidad** (ej: ciegas, con discapacidad motriz, etc.):

| **Métrica**               | **Descripción**                                                                                     | **Herramienta**               | **Nivel de cumplimiento** | **Relación con el Estado del Arte**                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------|--------------------------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Cumplimiento WCAG 2.1** | Nivel de cumplimiento del estándar (A, AA, AAA).                                                  | Lighthouse / WAVE            | AA (mínimo)                 | Sección 4.1: WCAG 2.1, [8], [9], [10].                                                             |
| **Errores de accesibilidad** | Lista de problemas específicos (ej: falta de texto alternativo, bajo contraste).                 | Lighthouse / WAVE            | 0 errores (ideal)          | Sección 4.2: Herramientas de monitoreo automatizado.                                              |
| **Contraste de colores**  | Verificar que el contraste entre texto y fondo cumpla con los estándares.                          | Lighthouse                   | ≥ 4.5:1 (texto normal)     | Sección 4.1: WCAG 2.1.                                                                               |

**¿Por qué es importante?**
- **WCAG 2.1**: Es el **estándar internacional** para accesibilidad web, adoptado por muchos gobiernos (incluyendo el Perú en su normativa de gobierno digital).
- **Investigación**:
  - Adedoja (2026) encontró que el **90% de los portales gubernamentales de EE.UU. no cumplían con WCAG 2.1**.
  - Uwase y Luhanga (2026) demostraron que las herramientas automáticas (como Lighthouse) **solo detectan entre el 13% y 30% de los problemas de WCAG 2.1**, por lo que es clave complementar con evaluaciones manuales.
  - Sam-Anlas y Stable-Rodríguez (2016) **ya identificaron barreras de accesibilidad** en portales peruanos. Tu Observatorio **actualizará estos hallazgos**.

---

## **2. ¿Cómo se Relaciona con la Investigación?**
El Observatorio **no solo monitorea**, sino que **valida y extiende** el **Estado del Arte** en varias dimensiones:

---

### 2.1. Relación con ITIL v4

**ITIL v4** es un marco de **gestión de servicios TI** que se enfoca en:
- **Gestión de Eventos**: Detectar y responder a incidentes (ej: caídas de servicio).
- **Gestión de Disponibilidad**: Asegurar que los servicios estén disponibles según los SLAs.
- **Gestión de Rendimiento**: Monitorear métricas de desempeño (ej: tiempo de respuesta).
- **Gestión de Nivel de Servicio (SLAs)**: Definir y monitorear acuerdos de calidad.

**Cómo se aplica en el Observatorio:**
| **Componente de ITIL v4**       | **Aplicación en el Observatorio**                                                                                     | **Requerimientos Relacionados**                                                                                     |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Gestión de Eventos**           | Registrar **incidentes** (ej: caídas de servicio, degradación de velocidad).                                      | RF-012 (Gestionar incidentes y SLAs según ITIL v4), RNF-004 (Autenticación y autorización).                     |
| **Gestión de Disponibilidad**   | Monitorear el **uptime** de los portales y calcular métricas de disponibilidad.                                    | RF-002 (Verificar disponibilidad), RF-012 (Gestionar SLAs).                                                       |
| **Gestión de Rendimiento**       | Medir **Core Web Vitals** y tiempo de respuesta.                                                                    | RF-003 (Medir velocidad de carga), RF-006 (Calcular puntaje de cumplimiento).                                      |
| **Gestión de Nivel de Servicio** | Definir **SLAs** (ej: uptime mínimo del 99.5%) y monitorear su cumplimiento.                                         | RF-012 (Gestionar SLAs).                                                                                          |
| **Gestión de Problemas**         | Analizar **tendencias de incidentes** para identificar problemas subyacentes.                                    | RF-012 (Gestionar incidentes), RF-008 (Detectar anomalías).                                                        |

**Brecha que resuelve el Observatorio:**
- El Estado del Arte (Sección 4.3) identificó que **no hay evidencia académica** sobre la aplicación de ITIL v4 al monitoreo de portales gubernamentales. Tu proyecto **implementará este marco** en la práctica, llenando esta brecha.

---

### 2.2. Relación con WCAG 2.1 y Core Web Vitals

| **Marco**               | **Aplicación en el Observatorio**                                                                                     | **Requerimientos Relacionados**                                                                                     |
|-------------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **WCAG 2.1**            | Evaluar la **accesibilidad** de los portales para personas con discapacidad.                                      | RF-004 (Evaluar accesibilidad según WCAG 2.1), RNF-006 (Usabilidad y accesibilidad).                          |
| **Core Web Vitals**     | Medir la **experiencia de usuario** en términos de velocidad y estabilidad visual.                                | RF-003 (Medir velocidad de carga), RF-006 (Calcular puntaje de cumplimiento).                                      |
| **e-GovQual**           | Evaluar la **calidad percibida** del servicio digital (usabilidad, confiabilidad, soporte).                      | RF-006 (Calcular puntaje de cumplimiento), RF-007 (Normalizar métricas).                                          |

**Brecha que resuelve el Observatorio:**
- El Estado del Arte (Sección 4.2) muestra que **no hay monitoreo continuo** de estas métricas en portales gubernamentales peruanos. Tu proyecto **implementará este monitoreo**, proporcionando datos empíricos para validar los hallazgos de estudios como los de Adedoja (2026) y Sam-Anlas (2016).

---

### 2.3. Relación con el Marco Normativo Peruano (D.L. 1412)

El **Decreto Legislativo N.º 1412 (Ley de Gobierno Digital)** establece que el Estado peruano debe:
- **Garantizar la calidad de los servicios digitales**.
- **Promover la accesibilidad e inclusión digital**.
- **Fomentar la interoperabilidad y el uso de estándares abiertos**.

**Cómo se aplica en el Observatorio:**
| **Objetivo de la Ley**          | **Aplicación en el Observatorio**                                                                                     | **Requerimientos Relacionados**                                                                                     |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Calidad de servicios digitales** | Monitorear **disponibilidad, velocidad y accesibilidad** de los portales.                                          | RF-002 a RF-004, RF-006 a RF-008.                                                                                 |
| **Accesibilidad e inclusión**  | Evaluar el cumplimiento de **WCAG 2.1** en los portales.                                                           | RF-004 (Evaluar accesibilidad según WCAG 2.1).                                                                     |
| **Interoperabilidad**           | Usar **formatos estándar** (CSV/JSON) para exportar datos.                                                         | RF-013 (Generar reportes en CSV/JSON), RNF-009 (Integración con APIs y exportación).                                |

**Brecha que resuelve el Observatorio:**
- La Ley de Gobierno Digital **exige** monitorear la calidad de los servicios digitales, pero **no especifica cómo hacerlo**. Tu proyecto **proporciona una metodología concreta** para cumplir con este mandato.

---

## 3. ¿Cómo Mostraremos los Datos en el Frontend?

El **frontend** (dashboard) será el **corazón del Observatorio**, donde los usuarios podrán **visualizar, analizar y exportar** los datos recolectados. Aquí te detallo cómo se organizará:

---

### 3.1. Estructura General del Dashboard

El dashboard tendrá **5 secciones principales**, cada una diseñada para responder preguntas clave sobre la calidad de los portales:

| **Sección**               | **Propósito**                                                                                     | **Datos que Muestra**                                                                                     | **Relación con ITIL v4 / Investigación**                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| **Resumen Ejecutivo**  | Mostrar un **panorama general** de la calidad de los portales.                                     | Puntaje promedio de cumplimiento, disponibilidad global, número de incidentes.                     | **Gestión de Rendimiento**: Métricas agregadas para evaluar el desempeño global.                                   |
| **Ranking de Entidades** | Comparar el **desempeño de las 90 entidades**.                                                   | Ranking por puntaje de cumplimiento, filtros por categoría (Poder Ejecutivo, GOREs, etc.).             | **Gestión de Nivel de Servicio**: Identificar entidades con bajo cumplimiento de SLAs.                           |
| **Métricas por Entidad** | Mostrar el **detalle de cada entidad**.                                                           | Disponibilidad, velocidad de carga, accesibilidad, historial de métricas.                           | **Gestión de Eventos**: Analizar incidentes específicos por entidad.                                               |
| **Alertas y Incidentes** | Notificar **problemas críticos** en tiempo real.                                                   | Lista de incidentes recientes, tiempo de resolución, entidades afectadas.                          | **Gestión de Incidentes**: Registrar y priorizar incidentes según ITIL v4.                                         |
| **Reportes**           | Exportar datos para **análisis externo**.                                                        | Reportes en CSV/JSON con métricas detalladas, tendencias históricas.                               | **Gestión de Conocimiento**: Proporcionar datos para informes y análisis.                                           |

---

### 3.2. Detalle de Cada Sección**

---

#### 3.2.1. Resumen Ejecutivo

**Objetivo:** Dar una **visión general** del estado de los portales gubernamentales.

**Componentes:**
- **Puntaje promedio de cumplimiento**: Promedio del score (0-100) de las 90 entidades.
  - *Ejemplo*: "El puntaje promedio de los Ministerios es **85/100**, mientras que el de los GOREs es **72/100**".
- **Disponibilidad global**: Porcentaje de portales disponibles (status_code = 200) en el último mes.
  - *Ejemplo*: "El 92% de los portales están disponibles".
- **Número de incidentes**: Total de caídas o degradaciones de servicio en el último mes.
  - *Ejemplo*: "Se registraron **15 incidentes** en los últimos 30 días".
- **Gráfico de tendencias**: Evolución del puntaje promedio en el tiempo.
  - *Herramienta*: Gráfico de líneas con **Recharts** o **Chart.js**.

**Relación con ITIL v4:**
- **Gestión de Rendimiento**: El puntaje promedio y la disponibilidad global son **métricas clave** para evaluar el desempeño del servicio.

---

#### 3.2.2. Ranking de Entidades

**Objetivo:** Permitir **comparar el desempeño** de las entidades y identificar las que necesitan mejoras.

**Componentes:**
- **Tabla de ranking**: Lista de las 90 entidades ordenadas por **puntaje de cumplimiento** (0-100).
  - *Columnas*: Posición, Nombre, Puntaje, Disponibilidad, Velocidad, Accesibilidad, Categoría, Región.
  - *Ejemplo*:
    | Posición | Entidad | Puntaje | Disponibilidad | Velocidad | Accesibilidad | Categoría |
    |----------|---------|---------|----------------|-----------|---------------|------------|
    | 1        | MINSA   | 95      | 99.9%          | 92        | AA            | Ministerio |
    | 2        | GORE Lima | 90    | 99.5%          | 88        | AA            | GORE       |
- **Filtros dinámicos**: Permitir filtrar por **categoría** (Ministerios, GOREs, etc.) o **región**.
  - *Ejemplo*: "Mostrar solo los Ministerios de la región Lima".
- **Gráfico de barras**: Comparación visual del puntaje de las **top 10 entidades**.

**Relación con ITIL v4:**
- **Gestión de Nivel de Servicio**: El ranking permite **identificar entidades que no cumplen con los SLAs** y priorizar acciones de mejora.

---

#### 3.2.3. Métricas por Entidad

**Objetivo:** Mostrar el **detalle técnico** de cada entidad para análisis profundo.

**Componentes:**
- **Ficha técnica por entidad**:
  - *Datos básicos*: Nombre, URL, categoría, región.
  - *Métricas de disponibilidad*: Uptime (%), status_code, tiempo de respuesta.
  - *Métricas de desempeño*: LCP, FID, CLS, velocidad de carga (score 0-100).
  - *Métricas de accesibilidad*: Nivel WCAG (A/AA/AAA), errores detectados.
  - *Puntaje de cumplimiento*: Score global (0-100).
  - *Historial*: Gráfico de evolución del puntaje en el tiempo (últimos 30 días).
- **Gráficos detallados**:
  - Gráfico de **uptime** (disponibilidad en el tiempo).
  - Gráfico de **velocidad de carga** (LCP, FID, CLS).
  - Gráfico de **accesibilidad** (errores de WCAG 2.1).

**Relación con ITIL v4:**
- **Gestión de Eventos**: El historial de métricas permite **identificar patrones de incidentes** (ej: caídas recurrentes en una entidad).

---

#### 3.2.4. Alertas y Incidentes

**Objetivo:** Notificar **problemas críticos** para acción inmediata.

**Componentes:**
- **Lista de incidentes recientes**:
  - *Campos*: Entidad, Tipo de incidente (ej: caída de servicio, degradación de velocidad), Fecha, Duración, Estado (resuelto/no resuelto).
  - *Ejemplo*:
    | Entidad       | Tipo de Incidente       | Fecha       | Duración | Estado      |
    |---------------|-------------------------|-------------|----------|-------------|
    | MINEDU        | Caída de servicio (500) | 2026-09-25  | 2 horas  | Resuelto    |
    | GORE Cusco    | Degradación de velocidad | 2026-09-24 | 1 hora   | No resuelto |
- **Filtros**: Por entidad, tipo de incidente, fecha.
- **Notificaciones**: Alertas visuales en el dashboard para incidentes **no resueltos**.

**Relación con ITIL v4:**
- **Gestión de Incidentes**: Esta sección implementa directamente el **proceso de gestión de incidentes** de ITIL v4, permitiendo:
  - **Registrar** incidentes.
  - **Clasificar** por gravedad.
  - **Priorizar** acciones de resolución.

---

#### 3.2.5. Reportes

**Objetivo:** Permitir la **exportación de datos** para análisis externo o informes.

**Componentes:**
- **Generación de reportes automáticos**:
  - *Frecuencia*: Diarios, semanales, mensuales.
  - *Formato*: CSV o JSON.
  - *Contenido*: Métricas detalladas de todas las entidades (disponibilidad, velocidad, accesibilidad).
- **Reportes personalizados**:
  - Permitir seleccionar **entidades específicas** o **períodos de tiempo** para el reporte.
- **Exportación**:
  - Botón para descargar el reporte en el formato seleccionado.

**Relación con ITIL v4:**
- **Gestión de Conocimiento**: Los reportes proporcionan **datos históricos** para análisis de tendencias y mejora continua.

---

## **4. Proceso Completo: Desde la Captura hasta la Visualización**
Aquí te muestro el **flujo completo** del Observatorio, desde la recolección de datos hasta su visualización:

---

### Paso 1: Recolección de Datos (Backend)

1. **Script de Python** (usando `requests`, `BeautifulSoup`, APIs de PageSpeed y Lighthouse):
   - Recorre la lista de **90 URLs** (Poder Ejecutivo, GOREs, Organismos Autónomos, Municipalidades).
   - Para cada URL:
     - Verifica **disponibilidad** (status_code).
     - Mide **velocidad de carga** (LCP, FID, CLS).
     - Evalúa **accesibilidad** (WCAG 2.1).
2. **Almacenamiento**:
   - Guarda los datos en **PostgreSQL** (Supabase/Neon) con la siguiente estructura:
     ```sql
     CREATE TABLE metricas_entidades (
         id SERIAL PRIMARY KEY,
         entidad VARCHAR(255) NOT NULL,
         url VARCHAR(255) NOT NULL,
         categoria VARCHAR(50) NOT NULL,  -- Ministerio, GORE, etc.
         region VARCHAR(50),             -- Para GOREs y Municipalidades
         fecha TIMESTAMP NOT NULL,
         disponibilidad BOOLEAN NOT NULL, -- True si status_code = 200
         status_code INTEGER,
         tiempo_respuesta FLOAT,         -- en milisegundos
         lcp FLOAT,                      -- en segundos
         fid FLOAT,                      -- en milisegundos
         cls FLOAT,                      -- score (0-1)
         velocidad_carga INTEGER,        -- score (0-100)
         accesibilidad_wcag VARCHAR(10), -- "A", "AA", "AAA"
         errores_accesibilidad TEXT[],   -- Lista de errores
         puntaje INTEGER,                -- Score global (0-100)
         incidentes TEXT[]              -- Lista de incidentes detectados
     );
     ```
3. **Automatización**:
   - **GitHub Actions** ejecuta el script **diariamente** para actualizar los datos.

**Requerimientos cubiertos**: RF-001 a RF-005, RF-008, RF-009.

### Paso 2: Procesamiento de Datos (Backend)

1. **Cálculo de puntajes**:
   - **Disponibilidad**: 40 puntos si `status_code = 200`, 0 si falla.
   - **Velocidad**: 30 puntos si `velocidad_carga >= 90`, escala lineal hasta 0.
   - **Accesibilidad**: 30 puntos si `accesibilidad_wcag = "AA"`, 0 si es "A" o menor.
   - **Puntaje total**: Suma de los 3 componentes (0-100).
2. **Detección de anomalías**:
   - Si `status_code != 200` → **Incidente de disponibilidad**.
   - Si `velocidad_carga < 50` → **Incidente de rendimiento**.
   - Si `accesibilidad_wcag = "A"` → **Incidente de accesibilidad**.
3. **Normalización**:
   - Convertir métricas crudas (ej: LCP en segundos) a una **escala 0-100** para comparabilidad.

**Requerimientos cubiertos**: RF-006 a RF-009.

### Paso 3: Visualización (Frontend)

1. **Dashboard con Next.js/Astro**:
   - **Librerías**: `Recharts` o `Chart.js` para gráficos, `Tailwind CSS` para estilos.
   - **Estructura**:
     - **Página principal**: Resumen ejecutivo + Ranking de entidades.
     - **Página de entidad**: Métricas detalladas + historial.
     - **Página de incidentes**: Lista de alertas.
     - **Página de reportes**: Exportación de datos.
2. **Conexión con el backend**:
   - El frontend consulta la **base de datos (PostgreSQL)** para obtener los datos.
   - Ejemplo de consulta para el ranking:
     ```sql
     SELECT entidad, categoria, region, puntaje, disponibilidad, velocidad_carga, accesibilidad_wcag
     FROM metricas_entidades
     WHERE fecha = (SELECT MAX(fecha) FROM metricas_entidades)
     ORDER BY puntaje DESC;
     ```
3. **Interactividad**:
   - Filtros por **categoría, región, fecha**.
   - Gráficos **dinámicos** (ej: seleccionar un rango de fechas para ver tendencias).

**Requerimientos cubiertos**: RF-010 a RF-013.

---

## **5. Campos Tentativos a Guardar (Estructura de Datos)**

Aquí tienes una **propuesta de campos** para almacenar en la base de datos (PostgreSQL). Estos campos cubren todas las métricas necesarias para el **monitoreo, análisis y visualización**:

| **Campo** | **Tipo** | **Descripción** | **Ejemplo** | **Relación con RF/RNF** |
|-----------|----------|----------------|-------------|-------------------------|
| `id` | SERIAL | Identificador único de la métrica. | 1 | - |
| `entidad` | VARCHAR(255) | Nombre de la entidad (ej: "Ministerio de Salud"). | "Ministerio de Salud" | RF-005 |
| `url` | VARCHAR(255) | URL del portal de la entidad. | "https://www.gob.pe/minsa" | RF-001 |
| `categoria` | VARCHAR(50) | Categoría de la entidad (Ministerio, GORE, Organismo Autónomo, Municipalidad). | "Ministerio" | RF-005 |
| `region` | VARCHAR(50) | Región de la entidad (solo para GOREs y Municipalidades). | "Lima" | RF-005 |
| `fecha` | TIMESTAMP | Fecha y hora de la verificación. | "2026-09-26 14:30:00" | RF-009 |
| `disponibilidad` | BOOLEAN | ¿El portal está disponible? (True si `status_code = 200`). | True | RF-002 |
| `status_code` | INTEGER | Código HTTP de respuesta. | 200 | RF-002 |
| `tiempo_respuesta` | FLOAT | Tiempo de respuesta del servidor (en milisegundos). | 250.5 | RF-002 |
| `lcp` | FLOAT | Largest Contentful Paint (en segundos). | 1.8 | RF-003 |
| `fid` | FLOAT | First Input Delay (en milisegundos). | 80.2 | RF-003 |
| `cls` | FLOAT | Cumulative Layout Shift (score 0-1). | 0.05 | RF-003 |
| `velocidad_carga` | INTEGER | Puntaje de velocidad de carga (0-100). | 92 | RF-003 |
| `accesibilidad_wcag` | VARCHAR(10) | Nivel de cumplimiento de WCAG 2.1 ("A", "AA", "AAA"). | "AA" | RF-004 |
| `errores_accesibilidad` | TEXT[] | Lista de errores de accesibilidad detectados. | ["Falta texto alternativo en imagen", "Bajo contraste"] | RF-004 |
| `puntaje` | INTEGER | Puntaje global de cumplimiento (0-100). | 85 | RF-006 |
| `incidentes` | TEXT[] | Lista de incidentes detectados (ej: "Caída de servicio", "Degradación de velocidad"). | ["Caída de servicio (500)"] | RF-012 |
| `sla_cumplido` | BOOLEAN | ¿Se cumple el SLA definido para esta entidad? | True | RF-012 |

---

## **6. Resumen: ¿Cómo se Relaciona Todo?**
| **Componente** | **Métricas Capturadas** | **Relación con ITIL v4** | **Relación con el Estado del Arte** | **Relación con la Investigación** |
|---------------|-------------------------|--------------------------|-------------------------------------|------------------------------------|
| **Disponibilidad** | Estado HTTP, uptime, tiempo de respuesta | Gestión de Eventos, Disponibilidad | Sección 4.2: Herramientas de monitoreo automatizado | Validar hallazgos de Adedoja (2026) sobre caídas de servicio. |
| **Desempeño** | LCP, FID, CLS, velocidad de carga | Gestión de Rendimiento | Sección 4.1: KPI de desempeño web, [6] | Validar hallazgos de Ghattas et al. (2025) sobre Core Web Vitals. |
| **Accesibilidad** | WCAG 2.1, errores de accesibilidad | Gestión de Calidad | Sección 4.1: WCAG 2.1, [8], [9], [10] | Validar hallazgos de Sam-Anlas (2016) sobre barreras de accesibilidad en Perú. |
| **Gestión de Incidentes** | Registro de incidentes, SLAs | Gestión de Incidentes, Nivel de Servicio | Sección 4.3: Gestión de servicios TI | Llenar la brecha de aplicación de ITIL v4 en el sector público. |
| **Visualización** | Dashboard con ranking, gráficos, filtros | Gestión de Conocimiento | Brecha identificada: Monitoreo a nivel institucional. | Proporcionar datos para informes y análisis. |

---

## **7. Ejemplo Práctico: Flujo de Datos**
Imagina que hoy **26 de septiembre de 2026** se ejecuta el script de recolección para el **Ministerio de Salud (MINSA)**:

1. **Recolección**:
   - URL: `https://www.gob.pe/minsa`
   - **Disponibilidad**: `status_code = 200` → `disponibilidad = True`.
   - **Velocidad**: LCP = 1.5 s, FID = 70 ms, CLS = 0.03 → `velocidad_carga = 95`.
   - **Accesibilidad**: WCAG 2.1 = "AA", errores = ["Falta texto alternativo en 2 imágenes"] → `accesibilidad_wcag = "AA"`.

2. **Procesamiento**:
   - **Puntaje**:
     - Disponibilidad: 40 puntos.
     - Velocidad: 95 → 30 puntos (escala lineal: 95/100 * 30 = 28.5, redondeado a 30).
     - Accesibilidad: "AA" → 30 puntos.
     - **Total**: 40 + 30 + 30 = **100/100**.

3. **Almacenamiento**:
   - Se guarda en PostgreSQL un registro con todos los campos descritos en la tabla anterior.

4. **Visualización**:
   - En el dashboard:
     - **Ranking**: MINSA aparece en el **primer lugar** con 100 puntos.
     - **Ficha técnica**: Se muestra que MINSA tiene **100% de disponibilidad**, **velocidad de carga 95/100**, y **accesibilidad AA**.
     - **Alertas**: Se muestra una **advertencia** por los 2 errores de accesibilidad.

---

## **8. ¿Qué Falta Definir?**
Ahora que tienes claro **qué se captura** y **cómo se muestra**, los siguientes pasos son:

1. **Definir los SLAs**:
   - Ejemplo:
     - **Disponibilidad**: Uptime ≥ 99.5% mensual.
     - **Velocidad**: LCP ≤ 2.5 s, FID ≤ 100 ms, CLS ≤ 0.1.
     - **Accesibilidad**: WCAG 2.1 nivel **AA** como mínimo.

2. **Definir el cálculo exacto del puntaje**:
   - ¿Cómo se ponderan las métricas? (Ejemplo: 40% disponibilidad, 30% velocidad, 30% accesibilidad).
   - ¿Cómo se normalizan las métricas crudas a la escala 0-100?

3. **Diseñar el esquema final de la base de datos**:
   - ¿Se necesitan más campos?
   - ¿Cómo se relacionan las tablas? (Ejemplo: tabla de entidades + tabla de métricas).

4. **Definir el diseño del frontend**:
   - ¿Qué librerías usar? (Recharts, Chart.js, etc.).
   - ¿Cómo se organizarán las páginas?

