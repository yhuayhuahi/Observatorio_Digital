import pandas as pd

# Cargar el archivo con todas las municipalidades
df = pd.read_csv("filtered/municipalidades_provinciales.csv")

# Lista de municipalidades prioritarias (nombre o parte del nombre)
municipalidades_prioritarias = [
    "Lima", "Barranca", "Huaura", "Arequipa", "Camana", "Trujillo", "Ascope",
    "Chiclayo", "Ferreñafe", "Piura", "Sullana", "Cusco", "La Convención",
    "Huancayo", "Concepción", "Puno", "Azángaro", "Moyobamba", "Tarapoto",
    "Tacna", "Jorge Basadre", "Ica", "Chincha", "Huaraz", "Casma",
    "Cajamarca", "Jaén", "Coronel Portillo", "Moquegua", "Huánuco", "Pasco"
]

# Filtrar el DataFrame para quedarnos solo con las municipalidades prioritarias
df_filtrado = df[df["nombre"].str.contains("|".join(municipalidades_prioritarias), case=False, na=False)]

# Guardar el resultado
df_filtrado.to_csv("filtered/municipalidades_provinciales_top30.csv", index=False, encoding="utf-8-sig")
df_filtrado.to_json("filtered/municipalidades_provinciales_top30.json", orient="records", indent=4, force_ascii=False)

print(f"Total de Municipalidades Provinciales seleccionadas: {len(df_filtrado)}")
print(df_filtrado[["nombre", "region", "url"]])
