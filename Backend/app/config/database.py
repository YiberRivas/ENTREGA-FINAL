import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Cargar variables de entorno (si es necesario aquí, aunque generalmente va en main.py)
load_dotenv()

# Construir la URL de forma limpia
USER = os.getenv("DB_USER")
PASS = os.getenv("DB_PASS")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
NAME = os.getenv("DB_NAME")

# Usar f-string para construir la URL, evitando errores de caracteres ocultos
DATABASE_URL = f"mysql+pymysql://{USER}:{PASS}@{HOST}:{PORT}/{NAME}"

engine = create_engine(DATABASE_URL, echo=True)
# ... el resto de tu código)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para obtener la sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
