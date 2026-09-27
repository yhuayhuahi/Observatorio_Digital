import os
import pandas as pd

# Crear carpeta 'filtered' si no existe
os.makedirs("filtered", exist_ok=True)

# Cargar el archivo
df = pd.read_csv("organismos_autonomos.csv")

# Lista de los 15 Organismos Autónomos prioritarios (nombre + URL oficial)
organismos_prioritarios = [
    {"nombre": "Superintendencia Nacional de Aduanas y de Administración Tributaria (SUNAT)", "url": "https://www.sunat.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Registro Nacional de Identificación y Estado Civil (RENIEC)", "url": "https://www.reniec.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Seguro Social de Salud (EsSalud)", "url": "https://www.essalud.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Superintendencia Nacional de los Registros Públicos (SUNARP)", "url": "https://www.sunarp.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Instituto Nacional de Estadística e Informática (INEI)", "url": "https://www.inei.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Organismo Supervisor de la Inversión en Energía y Minería (OSINERGMIN)", "url": "https://www.osinergmin.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Organismo Supervisor de la Inversión en Telecomunicaciones (OSIPTEL)", "url": "https://www.osiptel.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Superintendencia Nacional de Educación Superior Universitaria (SUNEDU)", "url": "https://www.sunedu.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)", "url": "https://www.sunafil.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Organismo de Evaluación y Fiscalización Ambiental (OEFA)", "url": "https://www.oefa.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Superintendencia Nacional de Servicios de Saneamiento (SUNASS)", "url": "https://www.sunass.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Superintendencia de Transporte Terrestre de Personas, Carga y Mercancías (SUTRAN)", "url": "https://www.sutran.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)", "url": "https://www.indecopi.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Instituto Nacional de Calidad (INACAL)", "url": "https://www.inacal.gob.pe", "categoria": "Organismo Autónomo"},
    {"nombre": "Banco Central de Reserva del Perú (BCRP)", "url": "https://www.bcrp.gob.pe", "categoria": "Organismo Autónomo"}
]

# Filtrar el DataFrame para quedarnos solo con los organismos prioritarios
organismos_seleccionados = []
for org in organismos_prioritarios:
    # Buscar el organismo en el DataFrame (por nombre)
    filas_coincidentes = df[df["nombre"].str.contains(org["nombre"].split("(")[0], case=False, na=False)]
    if not filas_coincidentes.empty:
        # Si existe, usar el primer registro encontrado
        organismos_seleccionados.append(filas_coincidentes.iloc[0].to_dict())
    else:
        # Si no existe, añadir el organismo manualmente
        organismos_seleccionados.append(org)

# Convertir a DataFrame
df_seleccionados = pd.DataFrame(organismos_seleccionados)

# Guardar en la carpeta 'filtered'
df_seleccionados.to_csv("filtered/organismos_autonomos.csv", index=False, encoding="utf-8-sig")
df_seleccionados.to_json("filtered/organismos_autonomos.json", orient="records", indent=4, force_ascii=False)

print("--- Organismos Autónomos seleccionados ---")
print(f"Total de registros: {len(df_seleccionados)}")
print("\nLista de Organismos Autónomos seleccionados:")
print(df_seleccionados[["nombre", "url"]].to_string(index=False))
