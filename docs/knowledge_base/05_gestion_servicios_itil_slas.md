# Marco de Gestión de Servicios de TI: ITIL v4, SLAs e Incidentes de Servicio

> **Fuente:** ITIL 4 Foundation / ISO/IEC 25010 (SQuaRE)  
> **Categoría:** `GESTION_ITIL`  
> **Uso:** Base de conocimiento para el motor RAG del Observatorio Digital

---

### 1. Gestión de Eventos y Monitoreo (Monitoring and Event Management)
* **Definición ITIL v4:** Un evento es cualquier cambio de estado que tiene significado para la gestión de un servicio o elemento de configuración (CI).
* **Clasificación Operacional del Observatorio:**
  1. **Evento Informativo:** El portal web responde de acuerdo con los parámetros nominales de servicio (Código HTTP 200 OK, tiempo de respuesta TTFB $\le 2000\text{ ms}$). No requiere intervención.
  2. **Evento de Advertencia (Warning):** El portal responde, pero presenta degradación en su desempeño (Código HTTP 200 OK con latencia TTFB entre $2000\text{ ms}$ y $10000\text{ ms}$, o LCP $> 4.0\text{ s}$). Indica riesgo potencial de saturación de infraestructura.
  3. **Evento de Excepción (Falla):** El portal no entrega el servicio público al ciudadano. Incluye:
     * *Falla de DNS (`ENOTFOUND`):* El dominio institucional no resuelve a ninguna dirección IP pública.
     * *Falla de Seguridad TLS (`SSL_EXPIRED`):* El certificado digital ha expirado, bloqueando el acceso seguro HTTPS.
     * *Bloqueo de Acceso (`HTTP 403 Forbidden`):* El servidor rechaza la conexión.
     * *Agotamiento de Tiempo (`TIMEOUT_GT_10S`):* La conexión supera los 10 segundos sin respuesta.
     * *Fallo Interno (`HTTP 500 / 502 / 503`):* Error de servidor o caída del proceso web.

---

### 2. Gestión de Incidentes de Servicio (Incident Management)
* **Definición ITIL v4:** Un incidente es una interrupción no planificada de un servicio o una reducción en la calidad de un servicio TI.
* **Ciclo de Vida de un Incidente en el Observatorio:**
  * **Detección y Apertura:** Ocurre cuando la sonda de monitoreo registra un *Evento de Excepción*. Se registra con la fecha y hora exacta (`fecha_captura`) del primer fallo.
  * **Incidente Transitorio:** Falla que ocurre en una sola captura y se recupera en la siguiente verificación (duración $< 24\text{ horas}$). Suele corresponder a reinicios de servidores, despliegues o microcortes de red.
  * **Incidente Crónico / Persistente:** Falla que se repite durante múltiples días consecutivos. Refleja abandono institucional, falta de renovación de dominios/certificados o fallas estructurales de infraestructura.
  * **Cierre y Duración:** Se marca como resuelto en la primera captura posterior que devuelve `HTTP 200 OK`. La duración es el intervalo temporal entre la apertura y la resolución.

---

### 3. Gestión de Niveles de Servicio (Service Level Management - SLAs)
* **Definición ITIL v4:** Los Acuerdos de Nivel de Servicio (SLA) establecen los compromisos formales entre el proveedor del servicio (la entidad pública) y los consumidores (la ciudadanía y empresas).
* **Métrica de Disponibilidad Mensual (Uptime %):**
  $$\text{Disponibilidad \%} = \left( \frac{\text{Días operativos exitosos}}{\text{Total de días evaluados en el mes}} \right) \times 100$$
* **Estados de Cumplimiento de Nivel de Servicio:**
  * **CUMPLE (Verde):** Disponibilidad mensual $\ge 99.5\%$. Equivale a permitir como máximo 1 día con fallo en el mes. Indica madurez y confiabilidad operativa.
  * **EN RIESGO (Amarillo):** Disponibilidad mensual entre $98.0\%$ y $99.49\%$. Equivale a 1 o 2 días con caídas acumuladas. Requiere acciones correctivas y supervisión por el jefe de TI.
  * **INCUMPLE (Rojo):** Disponibilidad mensual $< 98.0\%$. Equivale a más de 2 días de inoperatividad en el mes. Constituye una vulneración directa del principio de continuidad del servicio digital exigido por el D.S. 029-2021-PCM.

---

### 4. Modelo de Calidad de Software ISO/IEC 25010 y Puntaje Ponderado
El sistema operacionaliza tres características de calidad del producto de software según ISO 25010 mediante una fórmula ponderada:
$$\text{Score Global (0-100)} = (0.40 \times \text{Disponibilidad}) + (0.30 \times \text{Rendimiento}) + (0.30 \times \text{Accesibilidad})$$

1. **Confiabilidad (40% de ponderación):** Es la dimensión primordial; si el portal está caído, no se puede acceder a ningún trámite ni información. Se calcula a partir de la tasa de disponibilidad y latencia TTFB.
2. **Eficiencia de Desempeño (30% de ponderación):** Determina si el servicio es rápido y usable bajo redes móviles y dispositivos modestos. Se calcula a partir del score compuesto de Core Web Vitals (LCP, CLS, FCP).
3. **Usabilidad y Accesibilidad (30% de ponderación):** Garantiza que el portal no excluya a personas con discapacidad. Se calcula a partir de la auditoría WCAG 2.1 nivel AA de Lighthouse.
