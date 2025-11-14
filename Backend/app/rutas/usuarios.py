# app/rutas/usuarios.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.config.database import get_db
from app.esquemas.esquemas import UsuarioCreate, UsuarioResponse
from app.modelos.modelos import Usuario, Persona, Rol
from app.seguridad import hash_password

# ❗ Sin prefix: se agrega desde main.py
router = APIRouter(tags=["Usuarios"])


# ============================
# 🔹 LISTAR USUARIOS
# ============================
@router.get("/", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    """Listar todos los usuarios registrados."""
    return db.query(Usuario).all()


# ============================
# 🔹 OBTENER USUARIO POR ID
# ============================
@router.get("/{id_usuario}", response_model=UsuarioResponse)
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    """Obtener un usuario específico por ID."""
    
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return usuario


# ============================
# 🔹 REGISTRO DE USUARIO
# ============================
@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registrar un nuevo usuario y crear la persona asociada.
    Si no se especifica otro rol, se asigna 'Cliente'.
    """

    # 1️⃣ Validar si existe el usuario
    if db.query(Usuario).filter(Usuario.usuario == usuario_data.usuario).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")

    # 2️⃣ Evitar correos duplicados
    if db.query(Persona).filter(Persona.correo == usuario_data.persona.correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    try:
        # 3️⃣ Buscar o crear rol "Cliente"
        rol_cliente = db.query(Rol).filter(Rol.nombre_rol.ilike("cliente")).first()

        if not rol_cliente:
            rol_cliente = Rol(nombre_rol="Cliente")
            db.add(rol_cliente)
            db.commit()
            db.refresh(rol_cliente)

        # 4️⃣ Crear Persona asociada
        nueva_persona = Persona(
            nombres=usuario_data.persona.nombres,
            apellidos=usuario_data.persona.apellidos,
            fecha_nacimiento=usuario_data.persona.fecha_nacimiento,
            tipo_identificacion_id=usuario_data.persona.tipo_identificacion_id,
            identificacion=usuario_data.persona.identificacion,
            telefono=usuario_data.persona.telefono,
            correo=usuario_data.persona.correo,
            direccion_id=usuario_data.persona.direccion_id,
            rol_id=rol_cliente.id_rol,
            fecha_registro=datetime.now()
        )

        db.add(nueva_persona)
        db.flush()  # Obtiene el ID sin hacer commit todavía

        # 5️⃣ Crear Usuario asociado a Persona
        nuevo_usuario = Usuario(
            usuario=usuario_data.usuario,
            contrasena_hash=hash_password(usuario_data.contrasena),
            persona_id=nueva_persona.id_persona,
            rol_id=rol_cliente.id_rol,
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
            status_code=500,
            detail=f"Error al registrar usuario: {str(e)}"
        )


# ============================
# 🔹 ACTIVAR / DESACTIVAR USUARIO
# ============================
@router.put("/{id_usuario}/activar")
def activar_usuario(id_usuario: int, activo: bool, db: Session = Depends(get_db)):
    """
    Activar o desactivar un usuario.
    activo=True → activa
    activo=False → desactiva
    """

    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = activo
    db.commit()

    return {
        "message": f"Usuario {'activado' if activo else 'desactivado'} correctamente"
    }
