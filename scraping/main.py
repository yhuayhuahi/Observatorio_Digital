import json
import pandas as pd
import requests
from bs4 import BeautifulSoup

# Configuración de cabeceras
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

BASE_URL = "https://www.gob.pe"
CATEGORIAS = {
    "poder_ejecutivo": {
        "url": f"{BASE_URL}/estado/poder-ejecutivo",
        "archivo": "poder_ejecutivo",
        "categoria": "Ministerio"
    },
    "poder_legislativo": {
        "url": f"{BASE_URL}/estado/poder-legislativo",
        "archivo": "poder_legislativo",
        "categoria": "Poder Legislativo"
    },
    "poder_judicial": {
        "url": f"{BASE_URL}/estado/poder-judicial",
        "archivo": "poder_judicial",
        "categoria": "Poder Judicial"
    },
    "organismos_autonomos": {
        "url": f"{BASE_URL}/estado/organismos-autonomos",
        "archivo": "organismos_autonomos",
        "categoria": "Organismo Autónomo"
    },
    "gobiernos_regionales": {
        "url": f"{BASE_URL}/estado/gobiernos-regionales",
        "archivo": "gobiernos_regionales",
        "categoria": "GORE"
    },
    "gobiernos_locales": {
        "url": f"{BASE_URL}/estado/gobiernos-locales",
        "archivo": "municipalidades_provinciales",
        "categoria": "Municipalidad Provincial"
    }
}

def extraer_entidades(url, categoria):
    print(f"Extrayendo entidades desde: {url}...")
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error al conectar con {url}: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    entidades = []

    # Buscar todos los enlaces en la página
    for enlace in soup.find_all("a", href=True):
        nombre = enlace.get_text(strip=True)
        url_enlace = enlace["href"]

        # Filtrar enlaces vacíos o de navegación
        if not nombre or len(nombre) < 3 or url_enlace.startswith("#"):
            continue

        # Normalizar la URL
        if url_enlace.startswith("/"):
            url_completa = f"{BASE_URL}{url_enlace}"
        elif url_enlace.startswith("http"):
            url_completa = url_enlace
        else:
            continue

        # Asignar categoría
        entidades.append({
            "nombre": nombre,
            "url": url_completa,
            "categoria": categoria
        })

    print(f"  -> Encontrados: {len(entidades)} registros.")
    return entidades

def guardar_entidades(entidades, nombre_archivo):
    if not entidades:
        print(f"No hay datos para guardar en {nombre_archivo}.")
        return

    # Guardar en CSV
    df = pd.DataFrame(entidades)
    df.to_csv(f"{nombre_archivo}.csv", index=False, encoding="utf-8-sig")
    print(f"  ✓ Guardado en {nombre_archivo}.csv")

    # Guardar en JSON
    with open(f"{nombre_archivo}.json", "w", encoding="utf-8") as f:
        json.dump(entidades, f, ensure_ascii=False, indent=4)
    print(f"  ✓ Guardado en {nombre_archivo}.json")

if __name__ == "__main__":
    for clave, config in CATEGORIAS.items():
        print(f"\n--- Procesando: {clave} ---")
        entidades = extraer_entidades(config["url"], config["categoria"])
        guardar_entidades(entidades, config["archivo"])
