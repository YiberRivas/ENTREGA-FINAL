from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.modelos.modelos import Factura, EstadoFactura
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

router = APIRouter(prefix="/facturas", tags=["Facturas"])

class FacturaCreate(BaseModel):
    persona_id: int
    total: Decimal
    forma_pago_id: int

class FacturaResponse(BaseModel):
    id_factura: int
    persona_id: int
    fecha: datetime
    total: Decimal
    forma_pago_id: int
    estado: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[FacturaResponse])
def listar_facturas(db: Session = Depends(get_db)):
    """Listar todas las facturas"""
    return db.query(Factura).all()

@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
def crear_factura(factura: FacturaCreate, db: Session = Depends(get_db)):
    """Crear una nueva factura"""
    nueva_factura = Factura(
        persona_id=factura.persona_id,
        total=factura.total,
        forma_pago_id=factura.forma_pago_id,
        fecha=datetime.now(),
        estado=EstadoFactura.emitida
    )
    db.add(nueva_factura)
    db.commit()
    db.refresh(nueva_factura)
    return nueva_factura

@router.get("/{id_factura}", response_model=FacturaResponse)
def obtener_factura(id_factura: int, db: Session = Depends(get_db)):
    """Obtener una factura por ID"""
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factura no encontrada"
        )
    return factura

@router.put("/{id_factura}/estado")
def actualizar_estado_factura(
    id_factura: int,
    nuevo_estado: EstadoFactura,
    db: Session = Depends(get_db)
):
    """Actualizar estado de una factura"""
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factura no encontrada"
        )
    
    factura.estado = nuevo_estado
    db.commit()
    return {"message": "Estado de factura actualizado correctamente"}

@router.get("/persona/{persona_id}", response_model=List[FacturaResponse])
def obtener_facturas_persona(persona_id: int, db: Session = Depends(get_db)):
    """Obtener todas las facturas de una persona"""
    facturas = db.query(Factura).filter(Factura.persona_id == persona_id).all()
    return facturas