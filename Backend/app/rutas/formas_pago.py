from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.modelos.modelos import FormaPago
from pydantic import BaseModel

# ❗ Sin prefijo — main.py ya lo añade: /formas_pago
router = APIRouter(tags=["Formas de Pago"])

class FormaPagoCreate(BaseModel):
    nombre_forma: str
    descripcion: str = None

class FormaPagoResponse(BaseModel):
    id_forma_pago: int
    nombre_forma: str
    descripcion: str = None

    class Config:
        from_attributes = True


@router.get("/", response_model=List[FormaPagoResponse])
def listar_formas_pago(db: Session = Depends(get_db)):
    """Listar todas las formas de pago"""
    return db.query(FormaPago).all()


@router.post("/", response_model=FormaPagoResponse, status_code=status.HTTP_201_CREATED)
def crear_forma_pago(forma: FormaPagoCreate, db: Session = Depends(get_db)):
    """Crear una nueva forma de pago"""
    nueva_forma = FormaPago(
        nombre_forma=forma.nombre_forma,
        descripcion=forma.descripcion
    )
    db.add(nueva_forma)
    db.commit()
    db.refresh(nueva_forma)
    return nueva_forma


@router.get("/{id_forma_pago}", response_model=FormaPagoResponse)
def obtener_forma_pago(id_forma_pago: int, db: Session = Depends(get_db)):
    """Obtener una forma de pago por ID"""
    forma = db.query(FormaPago).filter(FormaPago.id_forma_pago == id_forma_pago).first()
    if not forma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Forma de pago no encontrada"
        )
    return forma
