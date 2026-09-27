import os
import pandas as pd

# Crear carpeta 'filtered' si no existe
os.makedirs("filtered", exist_ok=True)

# Cargar el archivo de GOREs
df_gores = pd.read_csv("gobiernos_regionales.csv")

# Palabras clave para identificar GOREs puros
palabras_clave = ["Gobierno Regional", "Web de Gobierno Regional"]

# Filtrar registros que contengan alguna de las palabras clave en el nombre
gores_filtrados = df_gores[
    df_gores["nombre"].str.contains("|".join(palabras_clave), case=False, na=False)
]

# Excluir registros que contengan términos no deseados (incluyendo "Gerencia Regional")
terminos_excluir = [
    "Dirección Regional", "Unidad de Gestión", "Gerencia Regional", "Gerencia Sub Regional",
    "Hospital", "Sub Región", "Programas Regionales", "Actividad", "UE", "Oficina"
]

for termino in terminos_excluir:
    gores_filtrados = gores_filtrados[
        ~gores_filtrados["nombre"].str.contains(termino, case=False, na=False)
    ]

# Lista oficial de los 25 GOREs del Perú
lista_oficial_gores = [
    "Amazonas", "Ancash", "Apurímac", "Arequipa", "Ayacucho",
    "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco",
    "Ica", "Junín", "La Libertad", "Lambayeque", "Lima",
    "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
    "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
]

# Verificar cuáles GOREs de la lista oficial ya están en el DataFrame
gores_presentes = []
for gore in lista_oficial_gores:
    if any(gore in nombre for nombre in gores_filtrados["nombre"]):
        gores_presentes.append(gore)

# GOREs faltantes
faltantes = [gore for gore in lista_oficial_gores if gore not in gores_presentes]

# Datos para los GOREs faltantes (con sus dos URLs)
gores_faltantes = []
for gore in faltantes:
    nombre_formateado = gore.replace(" ", "").lower()
    gores_faltantes.extend([
        {
            "nombre": f"Gobierno Regional {gore} (Gore {gore})",
            "url": f"https://www.gob.pe/region{nombre_formateado}",
            "categoria": "GORE"
        },
        {
            "nombre": f"Web de Gobierno Regional {gore}",
            "url": f"http://www.region{nombre_formateado}.gob.pe",
            "categoria": "GORE"
        }
    ])

# Agregar los GOREs faltantes al DataFrame
if gores_faltantes:
    gores_filtrados = pd.concat([gores_filtrados, pd.DataFrame(gores_faltantes)], ignore_index=True)

# Guardar el archivo filtrado en la carpeta 'filtered'
gores_filtrados.to_csv("filtered/gobiernos_regionales.csv", index=False, encoding="utf-8-sig")
gores_filtrados.to_json("filtered/gobiernos_regionales.json", orient="records", indent=4, force_ascii=False)

print("--- GOREs filtrados y completados ---")
print(f"Total de registros: {len(gores_filtrados)}")
print(f"GOREs únicos esperados: {len(lista_oficial_gores)}")
print(f"GOREs faltantes añadidos: {faltantes}")

# Mostrar los GOREs únicos en el archivo final
gores_unicos = gores_filtrados["nombre"].str.extract(r'Gobierno Regional (\w+ \w*)')[0].dropna().unique()
print("\nGOREs únicos en el archivo final:")
print(gores_unicos)

# Mostrar los primeros 10 registros
print("\nPrimeros 10 registros:")
print(gores_filtrados.head(10))
