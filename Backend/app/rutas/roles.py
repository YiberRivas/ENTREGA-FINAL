# app/rutas/roles.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.modelos.modelos import Rol
from pydantic import BaseModel

router = APIRouter(prefix="/roles", tags=["Roles"])

class RolCreate(BaseModel):
    nombre_rol: str
    descripcion: str | None = None

class RolResponse(BaseModel):
    id_rol: int
    nombre_rol: str
    descripcion: str | None = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[RolResponse])
def listar_roles(db: Session = Depends(get_db)):
    """Listar todos los roles"""
    return db.query(Rol).all()

@router.post("/", response_model=RolResponse, status_code=status.HTTP_201_CREATED)
def crear_rol(rol: RolCreate, db: Session = Depends(get_db)):
    """Crear un nuevo rol"""
    nuevo_rol = Rol(nombre_rol=rol.nombre_rol, descripcion=rol.descripcion)
    db.add(nuevo_rol)
    db.commit()
    db.refresh(nuevo_rol)
    return nuevo_rol

@router.get("/{id_rol}", response_model=RolResponse)
def obtener_rol(id_rol: int, db: Session = Depends(get_db)):
    """Obtener un rol por ID"""
    rol = db.query(Rol).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return rol
