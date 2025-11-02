# check_db_connection.py

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# 1. Cargar variables de entorno desde el archivo .env
# Asegúrate de que tu archivo .env está en la misma carpeta.
load_dotenv()

# --- Configuración de la Base de Datos ---
# Asumiendo que tu DATABASE_URL está definida en .env
DATABASE_URL = os.getenv("DATABASE_URL")

# --- Función de Verificación ---

def check_connection():
    """
    Intenta crear un motor de SQLAlchemy y ejecutar una consulta simple 
    para verificar la conexión a la base de datos.
    """
    if not DATABASE_URL:
        print("❌ ERROR: La variable DATABASE_URL no está definida en el archivo .env.")
        return

    print(f"🔗 Intentando conectar a: {DATABASE_URL[:DATABASE_URL.find('@')] + '@...'}")
    
    try:
        # 1. Crear el motor de conexión
        engine = create_engine(DATABASE_URL)
        
        # 2. Intentar la conexión y ejecutar una consulta simple
        with engine.connect() as connection:
            # Una consulta simple que no modifica datos, solo prueba la conexión.
            result = connection.execute(text("SELECT 1"))
            # Consume el resultado para asegurar que la consulta se ejecutó
            result.fetchone() 
            
            print("\n✅ CONEXIÓN EXITOSA:")
            print("   La base de datos respondió correctamente.")
            
    except OperationalError as e:
        print("\n❌ ERROR DE CONEXIÓN (OperationalError):")
        print("   No se pudo establecer conexión con la base de datos.")
        print("   Causas comunes:")
        print("   - El servicio de MySQL/MariaDB no está iniciado.")
        print("   - Las credenciales (usuario/contraseña) o el puerto son incorrectos.")
        print(f"   Detalle del error: {e}")
        
    except Exception as e:
        print("\n❌ OTRO ERROR INESPERADO:")
        print(f"   Ocurrió un error al intentar conectar: {e}")

if __name__ == "__main__":
    check_connection()