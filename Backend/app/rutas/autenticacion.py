from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.esquemas.esquemas import LoginRequest
from app.modelos.modelos import Usuario, Rol, Persona
from app.seguridad.hash import verificar_hash as verify_password
from app.seguridad.auth import crear_token as create_access_token

# ⚠️ El prefijo /autenticacion lo agrega automáticamente main.py
router = APIRouter(tags=["Autenticación"])

# Debe coincidir con la ruta final en main.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/autenticacion/login")


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login de usuario, verifica credenciales y devuelve token JWT."""

    # 1️⃣ Buscar usuario por nombre
    usuario = db.query(Usuario).filter(Usuario.usuario == request.usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    # 2️⃣ Verificar contraseña
    if not verify_password(request.contrasena, usuario.contrasena_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    # 3️⃣ Verificar si está activo
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacte al administrador."
        )

    # 4️⃣ Obtener información relacionada
    rol = db.query(Rol).filter(Rol.id_rol == usuario.rol_id).first()
    persona = db.query(Persona).filter(Persona.id_persona == usuario.persona_id).first()

    # Normalizar datos
    nombre_rol = (rol.nombre_rol or "cliente").strip().lower() if rol else "cliente"
    nombre_completo = (
        f"{persona.nombres} {persona.apellidos}".strip()
        if persona and persona.nombres
        else usuario.usuario
    )
    correo_usuario = persona.correo if persona else None

    # 6️⃣ Crear token JWT
    access_token = create_access_token(
        data={
            "sub": usuario.usuario,
            "user_id": usuario.id_usuario,
            "rol": nombre_rol
        }
    )

    # 7️⃣ Respuesta
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id_usuario,
            "usuario": usuario.usuario,
            "nombre": nombre_completo,
            "correo": correo_usuario,
            "rol": nombre_rol,
            "activo": usuario.activo
        }
    }
