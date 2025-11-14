# app/rutas/servicios.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.config.database import get_db
from app.modelos.modelos import Servicio

# ❗ SIN prefix → main.py agrega /servicios automáticamente
router = APIRouter(tags=["Servicios"])

# ============================
# 📌 Esquemas Pydantic
# ============================
class ServicioBase(BaseModel):
    nombre_servicio: str
    descripcion: str | None = None
    precio_base: float
    duracion_minutos: int

class ServicioResponse(ServicioBase):
    id_servicio: int
    activo: bool

    class Config:
        from_attributes = True


# ============================
# 📌 Listar servicios
# ============================
@router.get("/", response_model=List[ServicioResponse])
def listar_servicios(db: Session = Depends(get_db)):
    servicios = db.query(Servicio).all()
    return servicios


# ============================
# 📌 Crear servicio
# ============================
@router.post("/", response_model=ServicioResponse, status_code=status.HTTP_201_CREATED)
def crear_servicio(servicio: ServicioBase, db: Session = Depends(get_db)):

    # Validación: nombre duplicado
    existe = db.query(Servicio).filter(
        Servicio.nombre_servicio == servicio.nombre_servicio
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"El servicio '{servicio.nombre_servicio}' ya existe."
        )
    
    nuevo = Servicio(
        nombre_servicio=servicio.nombre_servicio,
        descripcion=servicio.descripcion,
        precio_base=servicio.precio_base,
        duracion_minutos=servicio.duracion_minutos,
        activo=True
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


# ============================
# 📌 Obtener servicio por ID
# ============================
@router.get("/{id_servicio}", response_model=ServicioResponse)
def obtener_servicio(id_servicio: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()

    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    return servicio


# ============================
# 📌 Actualizar servicio
# ============================
@router.put("/{id_servicio}", response_model=ServicioResponse)
def actualizar_servicio(
    id_servicio: int,
    datos: ServicioBase,
    db: Session = Depends(get_db)
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()

    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    servicio.nombre_servicio = datos.nombre_servicio
    servicio.descripcion = datos.descripcion
    servicio.precio_base = datos.precio_base
    servicio.duracion_minutos = datos.duracion_minutos

    db.commit()
    db.refresh(servicio)
    return servicio


# ============================
# 📌 Activar / Desactivar servicio
# ============================
@router.put("/{id_servicio}/activar")
def activar_servicio(id_servicio: int, db: Session = Depends(get_db)):

    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    servicio.activo = True
    db.commit()
    return {"mensaje": "Servicio activado correctamente"}


@router.put("/{id_servicio}/desactivar")
def desactivar_servicio(id_servicio: int, db: Session = Depends(get_db)):

    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    servicio.activo = False
    db.commit()
    return {"mensaje": "Servicio desactivado correctamente"}
