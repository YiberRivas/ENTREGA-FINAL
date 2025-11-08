from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.modelos.modelos import Pago, EstadoPago, Factura, EstadoFactura
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

router = APIRouter(prefix="/pagos", tags=["Pagos"])

class PagoCreate(BaseModel):
    id_factura: int
    id_forma_pago: int
    monto: Decimal

class PagoResponse(BaseModel):
    id_pago: int
    id_factura: int
    id_forma_pago: int
    monto: Decimal
    fecha_pago: datetime
    estado: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PagoResponse])
def listar_pagos(db: Session = Depends(get_db)):
    """Listar todos los pagos"""
    return db.query(Pago).all()

@router.post("/", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def crear_pago(pago: PagoCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo pago"""
    # Verificar que la factura existe
    factura = db.query(Factura).filter(Factura.id_factura == pago.id_factura).first()
    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Factura no encontrada"
        )
    
    nuevo_pago = Pago(
        id_factura=pago.id_factura,
        id_forma_pago=pago.id_forma_pago,
        monto=pago.monto,
        fecha_pago=datetime.now(),
        estado=EstadoPago.completado
    )
    
    # Actualizar estado de la factura a "pagada"
    factura.estado = EstadoFactura.pagada
    
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago

@router.get("/{id_pago}", response_model=PagoResponse)
def obtener_pago(id_pago: int, db: Session = Depends(get_db)):
    """Obtener un pago por ID"""
    pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
    if not pago:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    return pago

@router.get("/factura/{id_factura}", response_model=List[PagoResponse])
def obtener_pagos_factura(id_factura: int, db: Session = Depends(get_db)):
    """Obtener todos los pagos de una factura"""
    pagos = db.query(Pago).filter(Pago.id_factura == id_factura).all()
    return pagos