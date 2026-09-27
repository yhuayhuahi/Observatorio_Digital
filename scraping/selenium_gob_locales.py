import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options
import pandas as pd
import time

# Configuración
BASE_URL = "https://www.gob.pe/estado/gobiernos-locales"
OUTPUT_FILE = "filtered/municipalidades_provinciales"

# Crear carpeta 'filtered' si no existe
os.makedirs("filtered", exist_ok=True)

# Lista de regiones (para validar)
regiones = [
    "Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho",
    "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco",
    "Ica", "Junín", "La Libertad", "Lambayeque", "Lima",
    "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
    "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
]

# Configurar el WebDriver para Firefox
options = Options()
options.add_argument("--headless")  # Ejecutar en modo sin cabeza
driver = webdriver.Firefox(options=options)

try:
    # Abrir la página
    driver.get(BASE_URL)
    print("Página cargada: gob.pe/estado/gobiernos-locales")

    # Esperar a que el <select> esté disponible
    select_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "select"))
    )

    # Inicializar el Select
    select = Select(select_element)

    # Lista para almacenar las municipalidades
    todas_municipalidades = []

    # Iterar sobre cada opción del <select> (excluyendo la primera opción "Seleccionar")
    for opcion in select.options[1:]:
        region = opcion.text
        print(f"\nProcesando región: {region}...")

        # Seleccionar la región
        select.select_by_visible_text(region)

        # Esperar a que se carguen las municipalidades
        time.sleep(3)  # Ajusta este tiempo si es necesario

        # Extraer las Municipalidades Provinciales
        municipalidades = driver.find_elements(By.XPATH, "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'municipalidad') or contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'gobierno local')]")

        for muni in municipalidades:
            nombre = muni.text.strip()
            url = muni.get_attribute("href")
            if nombre and url:
                todas_municipalidades.append({
                    "nombre": nombre,
                    "url": url,
                    "region": region,
                    "categoria": "Municipalidad Provincial"
                })

        print(f"  -> Encontradas: {len([m for m in municipalidades if m.text.strip()])} municipalidades.")

    # Guardar el resultado
    df = pd.DataFrame(todas_municipalidades)
    df.to_csv(f"{OUTPUT_FILE}.csv", index=False, encoding="utf-8-sig")
    df.to_json(f"{OUTPUT_FILE}.json", orient="records", indent=4, force_ascii=False)
    print(f"\nTotal de Municipalidades Provinciales extraídas: {len(df)}")
    print(f"Guardado en '{OUTPUT_FILE}.csv'")

finally:
    # Cerrar el navegador
    driver.quit()
