import os
import pandas as pd

# Crear carpeta 'filtered' si no existe
os.makedirs("filtered", exist_ok=True)

# Cargar el archivo
df = pd.read_csv("poder_ejecutivo.csv")

# Lista de los 19 Ministerios oficiales (nombre + URL oficial)
ministerios_oficiales = [
    {"nombre": "Presidencia de la República del Perú (Presidencia)", "url": "https://www.gob.pe/presidencia", "categoria": "Ministerio"},
    {"nombre": "Presidencia del Consejo de Ministros (PCM)", "url": "https://www.gob.pe/pcm", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Relaciones Exteriores (RREE)", "url": "https://www.gob.pe/rree", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Defensa (MINDEF)", "url": "https://www.gob.pe/mindef", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Economía y Finanzas (MEF)", "url": "https://www.gob.pe/mef", "categoria": "Ministerio"},
    {"nombre": "Ministerio del Interior (MININTER)", "url": "https://www.gob.pe/mininter", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Justicia y Derechos Humanos (MINJUSDH)", "url": "https://www.gob.pe/minjus", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Educación (MINEDU)", "url": "https://www.gob.pe/minedu", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Salud (MINSA)", "url": "https://www.gob.pe/minsa", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Desarrollo Agrario y Riego (MIDAGRI)", "url": "https://www.gob.pe/midagri", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Trabajo y Promoción del Empleo (MTPE)", "url": "https://www.gob.pe/mtpe", "categoria": "Ministerio"},
    {"nombre": "Ministerio de la Producción (PRODUCE)", "url": "https://www.gob.pe/produce", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Comercio Exterior y Turismo (MINCETUR)", "url": "https://www.gob.pe/mincetur", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Vivienda, Construcción y Saneamiento (VIVIENDA)", "url": "https://www.gob.pe/vivienda", "categoria": "Ministerio"},
    {"nombre": "Ministerio del Ambiente (MINAM)", "url": "https://www.gob.pe/minam", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Desarrollo e Inclusión Social (MIDIS)", "url": "https://www.gob.pe/midis", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Cultura (Cultura)", "url": "https://www.gob.pe/cultura", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Transportes y Comunicaciones (MTC)", "url": "https://www.gob.pe/mtc", "categoria": "Ministerio"},
    {"nombre": "Ministerio de Energía y Minas (MINEM)", "url": "https://www.gob.pe/minem", "categoria": "Ministerio"}
]

# Filtrar el DataFrame para quedarnos solo con los ministerios oficiales
ministerios_seleccionados = []
for minis in ministerios_oficiales:
    # Buscar el ministerio en el DataFrame (por nombre o parte del nombre)
    nombre_buscar = minis["nombre"].split("(")[0].strip()
    filas_coincidentes = df[df["nombre"].str.contains(nombre_buscar, case=False, na=False)]
    if not filas_coincidentes.empty:
        # Si existe, usar el primer registro encontrado
        ministerios_seleccionados.append(filas_coincidentes.iloc[0].to_dict())
    else:
        # Si no existe, añadir el ministerio manualmente
        ministerios_seleccionados.append(minis)

# Convertir a DataFrame
df_seleccionados = pd.DataFrame(ministerios_seleccionados)

# Guardar en la carpeta 'filtered'
df_seleccionados.to_csv("filtered/poder_ejecutivo.csv", index=False, encoding="utf-8-sig")
df_seleccionados.to_json("filtered/poder_ejecutivo.json", orient="records", indent=4, force_ascii=False)

print("--- Ministerios seleccionados ---")
print(f"Total de registros: {len(df_seleccionados)}")
print("\nLista de Ministerios seleccionados:")
print(df_seleccionados[["nombre", "url"]].to_string(index=False))
