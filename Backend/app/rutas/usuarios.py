from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.esquemas.esquemas import UsuarioCreate, UsuarioResponse
from app.modelos.modelos import Usuario, Persona
from app.seguridad import hash_password
from datetime import datetime

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    """Listar todos los usuarios"""
    usuarios = db.query(Usuario).all()
    return usuarios

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

@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    """Registrar nuevo usuario"""
    
    # Verificar si el usuario ya existe
    usuario_existe = db.query(Usuario).filter(Usuario.usuario == usuario_data.usuario).first()
    if usuario_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe"
        )
    
    # Verificar si el correo ya existe
    correo_existe = db.query(Persona).filter(Persona.correo == usuario_data.persona.correo).first()
    if correo_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )
    
    try:
        # Crear persona
        nueva_persona = Persona(
            nombres=usuario_data.persona.nombres,
            apellidos=usuario_data.persona.apellidos,
            correo=usuario_data.persona.correo,
            telefono=usuario_data.persona.telefono,
            tipo_identificacion_id=usuario_data.persona.tipo_identificacion_id,
            direccion_id=usuario_data.persona.direccion_id,
            rol_id=usuario_data.persona.rol_id,
            fecha_registro=datetime.now()
        )
        db.add(nueva_persona)
        db.flush()
        
        # Crear usuario
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