# **Proceso de Obtención de URLs para el Observatorio de Calidad Digital Pública**

---

## **1. Contexto y Objetivos**

El **Observatorio de Calidad Digital Pública** tiene como objetivo **monitorear la disponibilidad, velocidad de carga y accesibilidad (WCAG 2.1) de los portales gubernamentales del Perú**, en el marco de la **Ley de Gobierno Digital (D.L. 1412)**. Para lograrlo, se requirió una **muestra representativa de 90 entidades públicas**, distribuidas en:

- **20 entidades del Poder Ejecutivo** (Presidencia de la República, PCM y 18 Ministerios).
- **25 Gobiernos Regionales (GOREs)**.
- **15 Organismos Autónomos**.
- **30 Municipalidades Provinciales**.

Este documento detalla el **proceso de extracción y selección de las URLs** de estas entidades, utilizando técnicas de **web scraping** y criterios de filtrado basados en la estructura oficial del Estado peruano.

## **2. Metodología General**

### ** Enfoque**

Se utilizó **web scraping** para extraer los enlaces directamente desde el portal oficial [gob.pe](https://www.gob.pe/estado), garantizando que:

- Las URLs sean **oficiales y actualizadas**.
- La muestra sea **representativa** de las entidades más relevantes del Estado peruano.
- Los datos sean **trazables** y replicables.

### ** Herramientas y Tecnologías**


| **Herramienta**    | **Uso**                                                                                      | **Justificación**                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Python**         | Lenguaje principal para el scraping y procesamiento de datos.                                | Flexibilidad y librerías especializadas (ej: `requests`, `BeautifulSoup`, `pandas`). |
| **BeautifulSoup**  | Parseo de HTML para extraer enlaces y datos estructurados.                                   | Permite navegar y filtrar el DOM de las páginas de `gob.pe`.                         |
| **Selenium**       | Automatización de navegadores para contenido dinámico (ej: `<select>` en Gobiernos Locales). | Necesario para páginas que cargan datos mediante JavaScript.                         |
| **Pandas**         | Manejo y filtrado de datos en formato tabular (CSV/JSON).                                    | Facilita la limpieza y selección de entidades relevantes.                            |


## **3. Fuentes de Datos**

Las URLs se extrajeron de las siguientes páginas oficiales de `gob.pe`:


| **Categoría**            | **URL de Origen**                                                                    | **Número de Entidades Extraídas**      | **Número de Entidades Seleccionadas** |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------- |
| **Poder Ejecutivo**      | [gob.pe/estado/poder-ejecutivo](https://www.gob.pe/estado/poder-ejecutivo)           | 581 registros                          | 20 entidades (Presidencia, PCM y 18 Ministerios) |
| **Poder Legislativo**    | [gob.pe/estado/poder-legislativo](https://www.gob.pe/estado/poder-legislativo)       | 17 registros                           | 0 (no aplicable para la muestra)      |
| **Poder Judicial**       | [gob.pe/estado/poder-judicial](https://www.gob.pe/estado/poder-judicial)             | 58 registros                           | 0 (no aplicable para la muestra)      |
| **Organismos Autónomos** | [gob.pe/estado/organismos-autonomos](https://www.gob.pe/estado/organismos-autonomos) | 57 registros                           | 15 Organismos Autónomos               |
| **Gobiernos Regionales** | [gob.pe/estado/gobiernos-regionales](https://www.gob.pe/estado/gobiernos-regionales) | 702 registros                          | 25 GOREs                              |
| **Gobiernos Locales**    | [gob.pe/estado/gobiernos-locales](https://www.gob.pe/estado/gobiernos-locales)       | Contenido dinámico (requirió Selenium) | 30 Municipalidades Provinciales       |


---

---

## **4. Proceso de Extracción y Selección**

### **4.1. Poder Ejecutivo (Presidencia y Ministerios)**

#### **Proceso de Extracción**

1. **Scraping inicial**:
  - Se extrajeron **581 registros** de la página [gob.pe/estado/poder-ejecutivo](https://www.gob.pe/estado/poder-ejecutivo) usando `BeautifulSoup`.
  - Los datos incluían **ministerios, comisiones, direcciones y organismos públicos**.
2. **Filtrado de Entidades del Poder Ejecutivo**:
  - Se seleccionaron **20 entidades oficiales del Poder Ejecutivo del Perú**: la **Presidencia de la República**, la **Presidencia del Consejo de Ministros (PCM)** y los **18 Ministerios**.
  - Se incluyó la **Presidencia de la República (Presidencia)** y el **Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)**, completando la estructura central de gobierno.

#### **Criterios de Selección**

- **Representatividad**: Incluir todos los ministerios que conforman el **Poder Ejecutivo del Perú** según la normativa oficial.
- **Relevancia**: Priorizar ministerios con **alto impacto en la ciudadanía** (ej: MINSA, MINEDU, MEF).
- **Validación**: Verificar que las URLs sean **funcionales** y correspondan a portales oficiales.

#### **Lista Final del Poder Ejecutivo (20 Entidades)**


| **Nombre**                                                    | **URL**                                            | **Razón de Selección**                   |
| ------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| Presidencia de la República del Perú (Presidencia)            | [www.gob.pe/presidencia](https://www.gob.pe/presidencia) | Jefatura del Estado y Despacho Presidencial. |
| Presidencia del Consejo de Ministros (PCM)                    | [www.gob.pe/pcm](https://www.gob.pe/pcm)           | Coordinación del Poder Ejecutivo.        |
| Ministerio de Relaciones Exteriores (RREE)                    | [www.gob.pe/rree](https://www.gob.pe/rree)         | Relaciones internacionales.              |
| Ministerio de Defensa (MINDEF)                                | [www.gob.pe/mindef](https://www.gob.pe/mindef)     | Defensa nacional.                        |
| Ministerio de Economía y Finanzas (MEF)                       | [www.gob.pe/mef](https://www.gob.pe/mef)           | Economía y presupuesto.                  |
| Ministerio del Interior (MININTER)                            | [www.gob.pe/mininter](https://www.gob.pe/mininter) | Seguridad interna.                       |
| Ministerio de Justicia y Derechos Humanos (MINJUSDH)          | [www.gob.pe/minjus](https://www.gob.pe/minjus)     | Justicia y derechos humanos.             |
| Ministerio de Educación (MINEDU)                              | [www.gob.pe/minedu](https://www.gob.pe/minedu)     | Educación pública.                       |
| Ministerio de Salud (MINSA)                                   | [www.gob.pe/minsa](https://www.gob.pe/minsa)       | Salud pública.                           |
| Ministerio de Desarrollo Agrario y Riego (MIDAGRI)            | [www.gob.pe/midagri](https://www.gob.pe/midagri)   | Agricultura y desarrollo rural.          |
| Ministerio de Trabajo y Promoción del Empleo (MTPE)           | [www.gob.pe/mtpe](https://www.gob.pe/mtpe)         | Empleo y trabajo.                        |
| Ministerio de la Producción (PRODUCE)                         | [www.gob.pe/produce](https://www.gob.pe/produce)   | Producción y comercio.                   |
| Ministerio de Comercio Exterior y Turismo (MINCETUR)          | [www.gob.pe/mincetur](https://www.gob.pe/mincetur) | Comercio y turismo.                      |
| Ministerio de Vivienda, Construcción y Saneamiento (VIVIENDA) | [www.gob.pe/vivienda](https://www.gob.pe/vivienda) | Vivienda y saneamiento.                  |
| Ministerio del Ambiente (MINAM)                               | [www.gob.pe/minam](https://www.gob.pe/minam)       | Medio ambiente.                          |
| Ministerio de Desarrollo e Inclusión Social (MIDIS)           | [www.gob.pe/midis](https://www.gob.pe/midis)       | Inclusión social.                        |
| Ministerio de Cultura                                         | [www.gob.pe/cultura](https://www.gob.pe/cultura)   | Cultura y patrimonio.                    |
| Ministerio de Transportes y Comunicaciones (MTC)              | [www.gob.pe/mtc](https://www.gob.pe/mtc)           | Transporte y comunicaciones.             |
| Ministerio de Energía y Minas (MINEM)                         | [www.gob.pe/minem](https://www.gob.pe/minem)       | Energía y minería.                       |
| Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)       | [www.gob.pe/mimp](https://www.gob.pe/mimp)         | Igualdad de género y grupos vulnerables. |


---

### **4.2. Organismos Autónomos**

#### **Proceso de Extracción**

1. **Scraping inicial**:
  - Se extrajeron **57 registros** de [gob.pe/estado/organismos-autonomos](https://www.gob.pe/estado/organismos-autonomos).
  - Los datos incluían **organismos autónomos, superintendencias, institutos y universidades**.
2. **Filtrado de Organismos Autónomos**:
  - Se seleccionaron **15 Organismos Autónomos prioritarios** basados en su **impacto en la ciudadanía y relevancia en el Estado**.

#### **Criterios de Selección**

- **Autonomía funcional**: Entidades con **autonomía administrativa y económica** según la normativa peruana.
- **Impacto en servicios públicos**: Organismos que brindan **servicios críticos** (ej: SUNAT, RENIEC, EsSalud).
- **Representatividad**: Cubrir áreas clave como **tributación, identificación, salud y regulación**.

#### **Lista Final de Organismos Autónomos**


| **Nombre**                                                                                                | **URL**                                                | **Razón de Selección**               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)                               | [www.sunat.gob.pe](https://www.sunat.gob.pe)           | Recaudación tributaria.              |
| Registro Nacional de Identificación y Estado Civil (RENIEC)                                               | [www.reniec.gob.pe](https://www.reniec.gob.pe)         | Identificación ciudadana.            |
| Seguro Social de Salud (EsSalud)                                                                          | [www.essalud.gob.pe](https://www.essalud.gob.pe)       | Salud pública.                       |
| Superintendencia Nacional de los Registros Públicos (SUNARP)                                              | [www.sunarp.gob.pe](https://www.sunarp.gob.pe)         | Registros públicos.                  |
| Instituto Nacional de Estadística e Informática (INEI)                                                    | [www.inei.gob.pe](https://www.inei.gob.pe)             | Estadísticas oficiales.              |
| Organismo Supervisor de la Inversión en Energía y Minería (OSINERGMIN)                                    | [www.osinergmin.gob.pe](https://www.osinergmin.gob.pe) | Regulación en energía y minería.     |
| Organismo Supervisor de la Inversión en Telecomunicaciones (OSIPTEL)                                      | [www.osiptel.gob.pe](https://www.osiptel.gob.pe)       | Regulación en telecomunicaciones.    |
| Superintendencia Nacional de Educación Superior Universitaria (SUNEDU)                                    | [www.sunedu.gob.pe](https://www.sunedu.gob.pe)         | Calidad educativa superior.          |
| Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)                                              | [www.sunafil.gob.pe](https://www.sunafil.gob.pe)       | Fiscalización laboral.               |
| Organismo de Evaluación y Fiscalización Ambiental (OEFA)                                                  | [www.oefa.gob.pe](https://www.oefa.gob.pe)             | Fiscalización ambiental.             |
| Superintendencia Nacional de Servicios de Saneamiento (SUNASS)                                            | [www.sunass.gob.pe](https://www.sunass.gob.pe)         | Servicios de saneamiento.            |
| Superintendencia de Transporte Terrestre de Personas, Carga y Mercancías (SUTRAN)                         | [www.sutran.gob.pe](https://www.sutran.gob.pe)         | Transporte terrestre.                |
| Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI) | [www.indecopi.gob.pe](https://www.indecopi.gob.pe)     | Competencia y propiedad intelectual. |
| Instituto Nacional de Calidad (INACAL)                                                                    | [www.inacal.gob.pe](https://www.inacal.gob.pe)         | Normalización y calidad.             |
| Banco Central de Reserva del Perú (BCRP)                                                                  | [www.bcrp.gob.pe](https://www.bcrp.gob.pe)             | Política monetaria.                  |


---

### **4.3. Gobiernos Regionales (GOREs)**

#### **Proceso de Extracción**

1. **Scraping inicial**:
  - Se extrajeron **702 registros** de [gob.pe/estado/gobiernos-regionales](https://www.gob.pe/estado/gobiernos-regionales).
  - Los datos incluían **GOREs, direcciones regionales, hospitales y gerencias subregionales**.
2. **Filtrado de GOREs**:
  - Se aplicó un filtro para seleccionar solo registros con nombres que contuvieran **"Gobierno Regional"** o **"Web de Gobierno Regional"**.
  - Se excluyeron términos como **"Dirección Regional"**, **"Hospital"**, **"Gerencia Regional"**, etc.
  - Se verificó que los **25 GOREs oficiales del Perú** estuvieran presentes. **Callao** y **Madre de Dios** no aparecían en el scraping inicial, por lo que se añadieron manualmente.

#### **Criterios de Selección**

- **Representatividad geográfica**: Incluir **todos los Gobiernos Regionales del Perú** según la división política oficial.
- **Cobertura nacional**: Asegurar que cada región del Perú esté representada.
- **Validación de URLs**: Verificar que las URLs sean **funcionales** y correspondan a los portales oficiales de cada GORE.

#### **Lista Final de GOREs**

Los **25 Gobiernos Regionales oficiales del Perú** fueron seleccionados, incluyendo:

- Amazonas, Áncash, Apurímac, Arequipa, Ayacucho, Cajamarca, Callao, Cusco, Huancavelica, Huánuco, Ica, Junín, La Libertad, Lambayeque, Lima, Loreto, Madre de Dios, Moquegua, Pasco, Piura, Puno, San Martín, Tacna, Tumbes, Ucayali.

### **4.4. Municipalidades Provinciales**

#### **Proceso de Extracción**

1. **Desafío inicial**:
  - La página [gob.pe/estado/gobiernos-locales](https://www.gob.pe/estado/gobiernos-locales) carga el contenido de las municipalidades **dinámicamente** mediante un `<select>` que selecciona la región.
  - **BeautifulSoup** no pudo extraer el contenido dinámico, por lo que se usó **Selenium** para automatizar la selección de cada región y extraer las municipalidades.
2. **Scraping con Selenium**:
  - Se iteró sobre cada una de las **25 regiones** del `<select>`.
  - Para cada región, se seleccionó la opción correspondiente y se extrajeron las **Municipalidades Provinciales** asociadas.
  - Se filtraron los enlaces que contuvieran términos como **"Municipalidad Provincial"** o **"Gobierno Local"**.
3. **Selección de las 30 Municipalidades Provinciales más relevantes**:
  - Se priorizaron municipalidades de **regiones con mayor población y actividad económica** (ej: Lima, Arequipa, La Libertad, Piura).
  - Se aseguró incluir al menos **1-2 municipalidades por región** para garantizar representatividad geográfica.

#### **Criterios de Selección**

- **Población**: Municipalidades de las **regiones más pobladas** (ej: Lima Metropolitana, Arequipa, Trujillo).
- **Impacto económico**: Municipalidades con **alta actividad económica** (ej: Chiclayo, Piura, Ica).
- **Representatividad geográfica**: Cubrir **todas las macrorregiones del Perú** (costa, sierra, selva).
- **Disponibilidad de servicios digitales**: Municipalidades con **portales activos** y relevantes para el monitoreo.

#### **Lista Final de Municipalidades Provinciales**

Se seleccionaron **30 Municipalidades Provinciales**, incluyendo:

- **Lima**: Municipalidad Metropolitana de Lima, Barranca, Huaura.
- **Arequipa**: Arequipa, Camaná, Islay.
- **La Libertad**: Trujillo, Ascope, Chepén.
- **Lambayeque**: Chiclayo, Ferreñafe.
- **Piura**: Piura, Sullana, Paita.
- **Cusco**: Cusco, La Convención.
- **Junín**: Huancayo, Concepción.
- **Puno**: Puno, Azángaro.
- **San Martín**: Moyobamba, Tarapoto.
- **Tacna**: Tacna, Jorge Basadre.
- **Ica**: Ica, Chincha.
- **Ancash**: Huaraz, Casma.
- **Cajamarca**: Cajamarca, Jaén.
- **Loreto**: Maynas (Iquitos).
- **Ucayali**: Coronel Portillo.
- **Moquegua**: Moquegua.
- **Huánuco**: Huánuco.
- **Pasco**: Pasco.

## **5. Resultados Obtenidos**

### **Archivos Generados**

Los datos extraídos y filtrados se guardaron en la carpeta `filtered/` en los siguientes archivos:


| **Archivo**                              | **Entidades**                   | **Registros**        | **Descripción**                    |
| ---------------------------------------- | ------------------------------- | -------------------- | ---------------------------------- |
| `gobiernos_regionales.csv`               | 25 GOREs                        | 50 (2 URLs por GORE) | Gobiernos Regionales oficiales.    |
| `poder_ejecutivo.csv`                    | 20 entidades (Presidencia, PCM y 18 Ministerios) | 20                   | Entidades centrales del Poder Ejecutivo. |
| `organismos_autonomos.csv`               | 15 Organismos Autónomos         | 15                   | Organismos Autónomos prioritarios. |
| `municipalidades_provinciales_top30.csv` | 30 Municipalidades Provinciales | 30                   | Municipalidades más relevantes.    |


### ** Estadísticas de la Muestra Final**

- **Total de entidades**: **90** (25 GOREs + 20 entidades del Poder Ejecutivo + 15 Organismos Autónomos + 30 Municipalidades Provinciales).
- **Total de URLs**: **115** (algunas entidades tienen 2 URLs: una en `gob.pe` y otra oficial).
- **Cobertura geográfica**: **Todas las regiones del Perú** están representadas.

## **6. Detalles Técnicos Importantes**

### **Problemas Encontrados y Soluciones**


| **Problema**                                  | **Causa**                                                                          | **Solución**                                                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Contenido dinámico en Gobiernos Locales**   | La página usa JavaScript para cargar municipalidades según la región seleccionada. | Se usó **Selenium** para automatizar la selección de regiones y extraer el contenido.                                                            |
| **Faltaban 2 GOREs (Callao y Madre de Dios)** | No aparecían en el scraping inicial de `gob.pe/estado/gobiernos-regionales`.       | Se añadieron **manualmente** con sus URLs oficiales.                                                                                             |
| **Faltaba el Ministerio de la Mujer (MIMP)**  | No estaba en el filtrado inicial de ministerios.                                   | Se añadió **manualmente** con su URL oficial.                                                                                                    |
| **Enlaces no deseados en los datos**          | Algunos registros incluían direcciones regionales, hospitales o gerencias.         | Se filtraron usando **palabras clave** (ej: "Gobierno Regional", "Municipalidad Provincial") y se excluyeron términos como "Dirección Regional". |

### **Lecciones Aprendidas**

1. **El scraping de contenido dinámico requiere Selenium**:
  - Páginas como `gob.pe/estado/gobiernos-locales` cargan datos mediante JavaScript, por lo que **BeautifulSoup no es suficiente**. Selenium permite interactuar con el navegador y extraer el contenido dinámico.
2. **Validación manual de datos críticos**:
  - Aunque el scraping automatizado extrae muchos datos, **algunas entidades clave pueden faltar** (ej: Callao, Madre de Dios, MIMP). Es importante **validar manualmente** que la muestra esté completa.
3. **Filtrado por palabras clave**:
  - Usar **términos específicos** (ej: "Gobierno Regional", "Municipalidad Provincial") ayuda a filtrar registros relevantes y excluir datos no deseados.
4. **Estructura de URLs en `gob.pe`**:
  - Las URLs en `gob.pe` suelen seguir patrones como:
    - `gob.pe/region[nombre]` (para GOREs).
    - `gob.pe/muni[nombre]` (para municipalidades).
  - Esto facilitó la **normalización de enlaces** y la identificación de entidades.


### **Recomendaciones para Futuras Actualizaciones**

1. **Automatizar la verificación de URLs**:
  - Usar `curl` o `requests` para **verificar el estado HTTP** de cada enlace y detectar URLs rotas.
  - Ejemplo: Un script que recorra los CSV y registre el **código de estado** (200, 404, 500, etc.) de cada URL.
2. **Programar scraping periódico**:
  - Usar **GitHub Actions** para ejecutar el scraping cada **X tiempo** (ej: mensualmente) y mantener los datos actualizados.
3. **Incluir metadatos adicionales**:
  - Añadir campos como **fecha de última verificación**, **estado de disponibilidad** o **notas sobre la entidad** (ej: "Portal en mantenimiento").
4. **Documentar cambios en la estructura de `gob.pe`**:
  - Si `gob.pe` modifica su estructura HTML, los scripts de scraping deben actualizarse. **Monitorea cambios en el DOM** de las páginas clave.

## ** 7. Conclusiones**

El proceso de obtención de URLs para el **Observatorio de Calidad Digital Pública** se basó en:

1. **Web scraping** de las páginas oficiales de `gob.pe` para garantizar que los datos sean **oficiales y actualizados**.
2. **Filtrado por criterios de relevancia** (normativos, geográficos y de impacto) para seleccionar las **90 entidades más representativas** del Estado peruano.
3. **Uso de herramientas adecuadas** (BeautifulSoup para contenido estático, Selenium para contenido dinámico).
4. **Validación manual** de entidades críticas para asegurar la **completitud de la muestra**.

Este proceso asegura que el Observatorio cuente con una **base de datos sólida y representativa** para monitorear la calidad de los servicios digitales del Estado peruano, alineado con la **Ley de Gobierno Digital (D.L. 1412)** y las mejores prácticas identificadas en el estado del arte.


## **8. Anexos**

- **Script de scraping para GOREs y Ministerios**: [Ver código](#) (usando BeautifulSoup).
- **Script de scraping para Municipalidades Provinciales**: [Ver código](#) (usando Selenium).
- **Archivos generados**: Disponibles en la carpeta [`filtered/`](#).
