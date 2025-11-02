from passlib.context import CryptContext

# Crear el contexto de encriptación con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Función para generar hash de una contraseña
def generar_hash(contrasena: str) -> str:
    return pwd_context.hash(contrasena)

# Función para verificar contraseña
def verificar_hash(contrasena_plana: str, contrasena_hash: str) -> bool:
    return pwd_context.verify(contrasena_plana, contrasena_hash)
