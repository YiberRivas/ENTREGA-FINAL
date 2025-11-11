from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.config.database import get_db
from app.esquemas.esquemas import UsuarioCreate, UsuarioResponse
from app.modelos.modelos import Usuario, Persona
from app.seguridad import hash_password

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# =======================
#   LISTAR USUARIOS
# =======================
@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    """Listar todos los usuarios"""
    return db.query(Usuario).all()


# =======================
#   OBTENER POR ID
# =======================
@router.get("/{id_usuario}", response_model=UsuarioResponse)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    """Obtener un usuario por ID"""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario


# =======================
#   REGISTRAR NUEVO USUARIO
# =======================
@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo usuario con su persona asociada.
    Crea ambos registros en la base de datos.
    """

    # Verificar si el usuario ya existe
    usuario_existe = db.query(Usuario).filter(Usuario.usuario == usuario_data.usuario).first()
    if usuario_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )

    # Verificar si el correo ya está en uso
    correo_existe = db.query(Persona).filter(Persona.correo == usuario_data.persona.correo).first()
    if correo_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )

    try:
        # Crear registro en la tabla Persona
        nueva_persona = Persona(
            nombres=usuario_data.persona.nombres,
            apellidos=usuario_data.persona.apellidos,
            fecha_nacimiento=usuario_data.persona.fecha_nacimiento,
            tipo_identificacion_id=usuario_data.persona.tipo_identificacion_id,
            identificacion=usuario_data.persona.identificacion,
            telefono=usuario_data.persona.telefono,
            correo=usuario_data.persona.correo,
            direccion_id=usuario_data.persona.direccion_id,
            rol_id=usuario_data.persona.rol_id,
            fecha_registro=datetime.now()
        )
        db.add(nueva_persona)
        db.flush()  # Obtener ID sin confirmar transacción

        # Crear usuario vinculado a la persona
        nuevo_usuario = Usuario(
            usuario=usuario_data.usuario,
            contrasena_hash=hash_password(usuario_data.contrasena),
            persona_id=nueva_persona.id_persona,
            activo=True,
            fecha_creacion=datetime.now()
        )
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)

        return nuevo_usuario

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"
        )


# =======================
#   ACTIVAR / DESACTIVAR USUARIO
# =======================
@router.put("/{id_usuario}/activar")
def activar_usuario(id_usuario: int, activo: bool, db: Session = Depends(get_db)):
    """Activar o desactivar un usuario"""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    usuario.activo = activo
    db.commit()
    return {"message": f"Usuario {'activado' if activo else 'desactivado'} correctamente"}
