from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.config.database import get_db
from app.modelos.modelos import Usuario, Rol, Persona
from app.seguridad.hash import verificar_hash
from app.seguridad.auth import (
    crear_token,           # ✅ Importar desde auth.py
    ACCESS_TOKEN_EXPIRE_MINUTES  # ✅ Importar la misma configuración
)

router = APIRouter(tags=["Autenticación"])

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login con OAuth2 estándar"""
    
    # 1️⃣ Buscar usuario
    usuario = db.query(Usuario).filter(Usuario.usuario == form_data.username).first()
    
    if not usuario:
        print(f"❌ Usuario no encontrado: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2️⃣ Verificar contraseña
    if not verificar_hash(form_data.password, usuario.contrasena_hash):
        print(f"❌ Contraseña incorrecta para: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3️⃣ Verificar activo
    if not usuario.activo:
        print(f"⚠️ Usuario inactivo: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacte al administrador."
        )

    # 4️⃣ Obtener información
    rol = db.query(Rol).filter(Rol.id_rol == usuario.rol_id).first()
    persona = db.query(Persona).filter(Persona.id_persona == usuario.persona_id).first()

    nombre_rol = (rol.nombre_rol or "cliente").strip().lower() if rol else "cliente"
    nombre_completo = (
        f"{persona.nombres} {persona.apellidos}".strip()
        if persona and persona.nombres
        else usuario.usuario
    )
    correo_usuario = persona.correo if persona else None

    # 5️⃣ Crear token con la MISMA SECRET_KEY
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crear_token(
        data={
            "sub": str(usuario.id_usuario),  # ✅ IMPORTANTE: id_usuario como string
            "username": usuario.usuario,
            "rol": nombre_rol
        },
        expires_delta=access_token_expires
    )

    print(f"✅ Login exitoso: {usuario.usuario} (ID: {usuario.id_usuario}, Rol: {nombre_rol})")

    # 6️⃣ Respuesta
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "usuario": {
            "id": usuario.id_usuario,
            "usuario": usuario.usuario,
            "nombre": nombre_completo,
            "correo": correo_usuario,
            "rol": nombre_rol,
            "activo": usuario.activo
        }
    }