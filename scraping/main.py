import json
import time
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Configuración de cabeceras para simular una petición desde un navegador
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

BASE_URL = "https://www.gob.pe"
TARGET_URL = f"{BASE_URL}/estado"


def extraer_entidades():
    print(f"Obteniendo datos desde: {TARGET_URL}...")
    try:
        response = requests.get(TARGET_URL, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error al conectar con gob.pe: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    entidades = []

    # gob.pe organiza las entidades por secciones/categorías en su directorio HTML
    # Buscamos contenedores o enlaces de tipo entidad
    tarjetas = soup.select("a[href*='/'], div.card, li.entity-item")

    # Si la estructura principal varía, rastreamos todos los enlaces internos/externos relevantes
    if not tarjetas:
        tarjetas = soup.find_all("a", href=True)

    print(
        f"Se encontraron elementos potenciales. Procesando y filtrando..."
    )

    for item in tarjetas:
        # Extracción del nombre y la URL segun la etiqueta encontrada
        if item.name == "a":
            nombre = item.get_text(strip=True)
            url = item["href"]
        else:
            enlace = item.find("a", href=True)
            if not enlace:
                continue
            nombre = enlace.get_text(strip=True)
            url = enlace["href"]

        # Filtrar elementos vacíos o enlaces de navegación general
        if not nombre or len(nombre) < 3 or url.startswith("#"):
            continue

        # Normalizar la URL (si es relativa, agregar https://www.gob.pe)
        if url.startswith("/"):
            url_completa = f"{BASE_URL}{url}"
        elif url.startswith("http"):
            url_completa = url
        else:
            continue

        # Evitar duplicados inmediatos
        if not any(e["url"] == url_completa for e in entidades):
            entidades.append(
                {"nombre": nombre, "url": url_completa, "categoria": "Por clasificar"}
            )

    print(f"Total de entidades extraídas: {len(entidades)}")
    return entidades


def guardar_resultados(data):
    if not data:
        print("No hay datos para guardar.")
        return

    # 1. Guardar en JSON (útil para el backend de tu Observatorio)
    with open("entidades_gob_pe.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print("✓ Datos guardados en 'entidades_gob_pe.json'")

    # 2. Guardar en CSV/Excel (útil para seleccionar tus 80-100 URLs manualmente)
    df = pd.DataFrame(data)
    df.to_csv("entidades_gob_pe.csv", index=False, encoding="utf-8-sig")
    print("✓ Datos guardados en 'entidades_gob_pe.csv'")


if __name__ == "__main__":
    lista_entidades = extraer_entidades()
    guardar_resultados(lista_entidades)
