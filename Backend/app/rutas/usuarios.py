from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modelos.usuario import Usuario
from app.modelos.persona import Persona
from app.seguridad.hash import generar_hash

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.post("/registro")
def registrar_usuario(datos: dict, db: Session = Depends(get_db)):
    # Separar datos
    usuario_nombre = datos.get("usuario")
    contrasena = datos.get("contrasena")
    persona_datos = datos.get("persona")

    # Verificar si el usuario ya existe
    if db.query(Usuario).filter(Usuario.usuario == usuario_nombre).first():
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    # Crear la persona primero
    nueva_persona = Persona(
        nombres=persona_datos.get("nombres"),
        apellidos=persona_datos.get("apellidos"),
        tipo_identificacion_id=persona_datos.get("tipo_identificacion_id"),
        identificacion=persona_datos.get("identificacion"),
        direccion_id=persona_datos.get("direccion_id"),
        telefono=persona_datos.get("telefono"),
        correo=persona_datos.get("correo"),
        rol_id=persona_datos.get("rol_id"),
        fecha_registro=persona_datos.get("fecha_registro")
    )

    db.add(nueva_persona)
    db.commit()
    db.refresh(nueva_persona)

    # Crear el usuario con referencia a la persona
    nuevo_usuario = Usuario(
        usuario=usuario_nombre,
        contrasena_hash=generar_hash(contrasena),
        persona_id=nueva_persona.id_persona
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "mensaje": "Usuario y persona registrados correctamente",
        "usuario": nuevo_usuario.usuario,
        "persona_id": nueva_persona.id_persona
    }
