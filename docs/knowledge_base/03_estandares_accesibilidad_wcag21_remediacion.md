# Pautas de Accesibilidad Web (W3C WCAG 2.1 Nivel AA) y Remediación Técnica

> **Fuente:** World Wide Web Consortium (W3C) - Web Content Accessibility Guidelines (WCAG) 2.1  
> **Categoría:** `ACCESIBILIDAD_WCAG`  
> **Uso:** Base de conocimiento para el motor RAG del Observatorio Digital

---

### WCAG 2.1: Criterio 1.1.1 - Contenido no Textual (Nivel A)
* **Principio:** Perceptible.
* **Norma:** Todo el contenido no textual que se presenta al usuario tiene una alternativa textual que cumple un propósito equivalente.
* **Falla habitual en portales estatales:** Imágenes informativas, logotipos institucionales o botones con íconos que carecen del atributo `alt`, o poseen un `alt=""` vacío cuando transmiten información esencial.
* **Impacto en el ciudadano:** Una persona ciega que utiliza lectores de pantalla (como NVDA o JAWS) escucha "gráfico sin etiquetar" o la URL del archivo, impidiendo saber qué trámite o comunicado oficial representa.
* **Remediación Técnica:**
  * En imágenes informativas: Agregar `alt="Descripción precisa del contenido o trámite"`.
  * En imágenes puramente decorativas (separadores, fondos): Utilizar `alt=""` explícito o `aria-hidden="true"`.
  * En imágenes dentro de enlaces o botones: El `alt` debe describir la acción (`alt="Descargar formulario de mesa de partes"`).

---

### WCAG 2.1: Criterio 1.4.3 - Contraste Mínimo de Color (Nivel AA)
* **Principio:** Perceptible.
* **Norma:** La presentación visual de texto e imágenes de texto tiene una relación de contraste de al menos **4.5:1**, excepto en textos grandes (al menos 18pt o 14pt en negrita) donde la relación mínima debe ser de **3:1**.
* **Falla habitual en portales estatales:** Textos en color gris claro (`#999999`) sobre fondo blanco, o botones institucionales con texto blanco sobre fondos celestes, amarillos o verdes claros.
* **Impacto en el ciudadano:** Personas con baja visión, adultos mayores o usuarios navegando en teléfonos móviles bajo la luz solar directa no pueden leer los requisitos o avisos de trámites.
* **Remediación Técnica:**
  * Incrementar la oscuridad del texto o aclarar el fondo hasta que la herramienta de contraste verifique un ratio $\ge 4.5:1$.
  * Ejemplo en CSS: Sustituir `color: #767676;` por `color: #595959;` sobre fondo `#FFFFFF` para alcanzar un ratio de 7:1.

---

### WCAG 2.1: Criterio 1.4.11 - Contraste de Elementos no Textuales (Nivel AA)
* **Principio:** Perceptible.
* **Norma:** Los componentes de la interfaz de usuario (bordes de campos de entrada, botones, íconos de estado) tienen una relación de contraste de al menos **3:1** contra los colores adyacentes.
* **Falla habitual en portales estatales:** Campos de texto en formularios de mesas de partes con bordes grises tenues que se confunden con el fondo de la página.
* **Remediación Técnica:**
  * En CSS: Definir bordes de campos con `border: 1px solid #707070;` o superior para garantizar el límite visible del control.

---

### WCAG 2.1: Criterio 2.1.1 - Teclado (Nivel A)
* **Principio:** Operable.
* **Norma:** Toda la funcionalidad del contenido es operable a través de una interfaz de teclado sin requerir tiempos específicos para pulsaciones individuales.
* **Falla habitual en portales estatales:** Menús desplegables de trámites, modales emergentes y carruseles de noticias que solo reaccionan al puntero del ratón (`onclick` en etiquetas `<div>` sin soporte de tecla `Enter` o `Espacio`).
* **Impacto en el ciudadano:** Personas con discapacidades motrices que navegan mediante pulsadores o teclado quedan bloqueadas sin poder abrir los menús institucionales.
* **Remediación Técnica:**
  * Emplear elementos semánticos nativos (`<button>`, `<a>`) en lugar de `<div onclick="...">`.
  * Si se usan componentes personalizados, implementar escuchadores de eventos para `keydown` (`Enter`, `Escape`, `Tab`) y asignar `tabindex="0"`.

---

### WCAG 2.1: Criterio 2.4.1 - Evitar Bloques Repetitivos / Skip Links (Nivel A)
* **Principio:** Operable.
* **Norma:** Se proporciona un mecanismo para omitir bloques de contenido que se repiten en múltiples páginas web.
* **Falla habitual en portales estatales:** Ausencia de un enlace de "Salto al contenido principal" (*Skip link*). El usuario de teclado debe pulsar la tecla Tab 40 o 50 veces por toda la cabecera gubernamental antes de llegar al trámite.
* **Remediación Técnica:**
  * Colocar como primer elemento del `<body>` un enlace visible al enfocar:
    ```html
    <a href="#contenido-principal" class="skip-link">Saltar al contenido principal</a>
    ```
  * En CSS:
    ```css
    .skip-link { position: absolute; top: -100px; left: 0; }
    .skip-link:focus { top: 0; background: #000; color: #fff; padding: 10px; z-index: 1000; }
    ```

---

### WCAG 2.1: Criterio 2.4.4 - Propósito de los Enlaces en Contexto (Nivel A)
* **Principio:** Operable.
* **Norma:** El propósito de cada enlace se puede determinar a partir del texto del enlace por sí solo o del contexto del enlace.
* **Falla habitual en portales estatales:** Páginas con decenas de enlaces que solo dicen "Clic aquí", "Ver más", "Descargar" o "Más información".
* **Remediación Técnica:**
  * Escribir enlaces descriptivos: `<a href="tupa.pdf">Descargar TUPA 2026 en PDF</a>`.
  * Si el diseño exige un texto corto visualmente, complementar con `aria-label`: `<a href="tupa.pdf" aria-label="Descargar Texto Único de Procedimientos Administrativos TUPA 2026">Ver más</a>`.

---

### WCAG 2.1: Criterio 3.1.1 - Idioma de la Página (Nivel A)
* **Principio:** Comprensible.
* **Norma:** El idioma predeterminado de cada página web se puede determinar mediante programación.
* **Falla habitual en portales estatales:** Falta del atributo `lang` en la etiqueta raíz `<html>` o uso erróneo de `lang="en"` por plantillas no traducidas.
* **Impacto en el ciudadano:** El software lector de pantalla asume pronunciación en inglés e intenta leer el español con fonética inglesa incomprensible.
* **Remediación Técnica:**
  * Declarar explícitamente en el HTML: `<html lang="es">`.

---

### WCAG 2.1: Criterio 4.1.2 - Nombre, Función, Valor (Nivel A)
* **Principio:** Robusto.
* **Norma:** Para todos los componentes de la interfaz de usuario, el nombre y la función pueden determinarse mediante programación; los estados, propiedades y valores pueden ser configurados por el usuario.
* **Falla habitual en portales estatales:** Botones con íconos de búsqueda o cierre de ventanas sin texto accesible ni atributo `aria-label`.
* **Remediación Técnica:**
  * `<button aria-label="Buscar en el portal institucional"><i class="fa fa-search"></i></button>`.
