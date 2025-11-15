# app/seguridad/auth.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Importaciones de tu aplicación
from app.config.database import get_db 
from app.modelos.modelos import Usuario 

# Cargar variables de entorno
load_dotenv()

# Configuración JWT
SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_super_segura_cambiala_en_produccion12345")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ✅ DEBUG: Verificar que se cargaron las variables
print("=" * 60)
print("🔐 CONFIGURACIÓN DE AUTENTICACIÓN")
print("=" * 60)
print(f"✅ SECRET_KEY cargada: {SECRET_KEY[:30]}... (longitud: {len(SECRET_KEY)})")
print(f"✅ ALGORITHM: {ALGORITHM}")
print(f"✅ TOKEN_EXPIRE: {ACCESS_TOKEN_EXPIRE_MINUTES} minutos ({ACCESS_TOKEN_EXPIRE_MINUTES/60} horas)")
print("=" * 60)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/autenticacion/login")

# Contexto de encriptación de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==================== FUNCIONES DE PASSWORD ====================

def verificar_password(password_plano: str, password_hash: str) -> bool:
    """Verifica si el password coincide con el hash"""
    return pwd_context.verify(password_plano, password_hash)


def obtener_password_hash(password: str) -> str:
    """Genera el hash del password"""
    return pwd_context.hash(password)


# ==================== FUNCIONES DE TOKEN ====================

def crear_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Crea un token JWT con los datos proporcionados.
    
    Args:
        data: Diccionario con los datos a codificar (debe incluir 'sub' con el user_id)
        expires_delta: Tiempo de expiración opcional
    
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    try:
        token_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        expire_time = expire.strftime("%Y-%m-%d %H:%M:%S")
        print(f"✅ Token creado exitosamente")
        print(f"   - Expira: {expire_time} ({ACCESS_TOKEN_EXPIRE_MINUTES} min)")
        print(f"   - Datos: {list(data.keys())}")
        return token_jwt
    except Exception as e:
        print(f"❌ Error al crear token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar token de autenticación"
        )


def decode_token(token: str):
    """
    Decodifica un token JWT.
    
    Args:
        token: Token JWT a decodificar
    
    Returns:
        Payload del token si es válido, None si hay error
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp:
            exp_time = datetime.utcfromtimestamp(exp).strftime("%Y-%m-%d %H:%M:%S")
            now_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            print(f"✅ Token decodificado correctamente")
            print(f"   - Expira: {exp_time}")
            print(f"   - Ahora:  {now_time}")
        return payload
    except jwt.ExpiredSignatureError:
        print("❌ Token expirado")
        exp = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False}).get("exp")
        if exp:
            exp_time = datetime.utcfromtimestamp(exp).strftime("%Y-%m-%d %H:%M:%S")
            now_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            print(f"   - Expiró: {exp_time}")
            print(f"   - Ahora:  {now_time}")
        return None
    except JWTError as e:
        print(f"❌ Error al decodificar token: {e}")
        return None
    except Exception as e:
        print(f"❌ Error inesperado al decodificar token: {e}")
        return None


# ==================== DEPENDENCIAS DE AUTENTICACIÓN ====================

def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependencia para obtener el usuario actual desde el token JWT.
    
    Args:
        token: Token JWT del header Authorization
        db: Sesión de base de datos
    
    Returns:
        Usuario autenticado
    
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales. Token inválido o expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar el token
        payload = decode_token(token)
        
        # ✅ Verificar que el payload no sea None
        if payload is None:
            print("❌ Payload es None - Token inválido o expirado")
            raise credenciales_invalidas
        
        # Extraer el ID del usuario del campo 'sub'
        usuario_id_str: str = payload.get("sub")
        
        if usuario_id_str is None:
            print("❌ No se encontró 'sub' en el payload del token")
            print(f"   - Payload recibido: {payload}")
            raise credenciales_invalidas
        
        # Convertir a entero
        try:
            usuario_id = int(usuario_id_str)
        except (ValueError, TypeError):
            print(f"❌ ID de usuario inválido en token: {usuario_id_str}")
            raise credenciales_invalidas
        
        print(f"✅ Token válido. Buscando usuario ID: {usuario_id}")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado al procesar token: {e}")
        raise credenciales_invalidas
    
    # Buscar el usuario en la base de datos
    try:
        usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
        
        if usuario is None:
            print(f"❌ Usuario con ID {usuario_id} no encontrado en la base de datos")
            raise credenciales_invalidas
        
        # Verificar que el usuario esté activo
        if not usuario.activo:
            print(f"⚠️ Usuario {usuario.usuario} está inactivo")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo. Contacta al administrador."
            )
        
        print(f"✅ Usuario autenticado: {usuario.usuario} (ID: {usuario.id_usuario})")
        return usuario
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error al buscar usuario en la base de datos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al verificar usuario"
        )


def obtener_usuario_admin(
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
) -> Usuario:
    """
    Dependencia para verificar que el usuario actual sea administrador.
    
    Args:
        usuario_actual: Usuario autenticado
    
    Returns:
        Usuario si es administrador
    
    Raises:
        HTTPException: Si el usuario no tiene permisos de administrador
    """
    if not usuario_actual.rol or usuario_actual.rol.nombre_rol.lower() != "administrador":
        print(f"⚠️ Usuario {usuario_actual.usuario} intentó acceder a recurso de admin sin permisos")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador para realizar esta acción"
        )
    
    print(f"✅ Acceso de administrador verificado: {usuario_actual.usuario}")
    return usuario_actual


def obtener_usuario_cliente(
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
) -> Usuario:
    """
    Dependencia para verificar que el usuario actual sea cliente.
    
    Args:
        usuario_actual: Usuario autenticado
    
    Returns:
        Usuario si es cliente
    
    Raises:
        HTTPException: Si el usuario no es cliente
    """
    if not usuario_actual.rol or usuario_actual.rol.nombre_rol.lower() != "cliente":
        print(f"⚠️ Usuario {usuario_actual.usuario} intentó acceder a recurso de cliente sin permisos")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de cliente para realizar esta acción"
        )
    
    print(f"✅ Acceso de cliente verificado: {usuario_actual.usuario}")
    return usuario_actual


# ==================== FUNCIÓN AUXILIAR ====================

def crear_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Alias de crear_token para compatibilidad.
    Crea un token de acceso JWT.
    """
    return crear_token(data, expires_delta)