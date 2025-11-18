from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.modelos.modelos import Pago, EstadoPago, Factura, EstadoFactura
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

router = APIRouter(tags=["Pagos"])

class PagoCreate(BaseModel):
    id_factura: int
    id_forma_pago: int
    monto: float  # ✅ Frontend envía float

class PagoResponse(BaseModel):
    id_pago: int
    id_factura: int
    id_forma_pago: int
    monto: float  # ✅ Convertimos Decimal a float para respuesta
    fecha_pago: datetime
    estado: str

    class Config:
        from_attributes = True

# ============================================================================
# ENDPOINTS ACTUALIZADOS
# ============================================================================

@router.get("/", response_model=List[PagoResponse])
def listar_pagos(db: Session = Depends(get_db)):
    """Listar todos los pagos"""
    try:
        pagos = db.query(Pago).all()
        print(f"✅ Listando {len(pagos)} pagos")
        return pagos
    except Exception as e:
        print(f"❌ Error al listar pagos: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener pagos")

@router.post("/", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def crear_pago(pago: PagoCreate, db: Session = Depends(get_db)):
    """Registrar un nuevo pago"""
    
    print(f"🎯 Endpoint /pagos/ POST llamado con: {pago.dict()}")
    
    try:
        # 1️⃣ Verificar factura
        factura = db.query(Factura).filter(Factura.id_factura == pago.id_factura).first()
        if not factura:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Factura no encontrada"
            )

        # 2️⃣ Convertir float a Decimal para la base de datos
        monto_decimal = Decimal(str(pago.monto))
        
        # 3️⃣ Crear registro de pago
        nuevo_pago = Pago(
            id_factura=pago.id_factura,
            id_forma_pago=pago.id_forma_pago,
            monto=monto_decimal,  # ✅ Usamos Decimal para la DB
            fecha_pago=datetime.now(),
            estado=EstadoPago.completado
        )

        # 4️⃣ Actualizar factura como pagada
        factura.estado = EstadoFactura.pagada
        
        db.add(nuevo_pago)
        db.commit()
        db.refresh(nuevo_pago)
        
        print(f"✅ Pago creado exitosamente: ID {nuevo_pago.id_pago}")
        return nuevo_pago
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error al crear pago: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.get("/{id_pago}", response_model=PagoResponse)
def obtener_pago(id_pago: int, db: Session = Depends(get_db)):
    """Obtener un pago por ID"""
    try:
        pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
        
        if not pago:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pago no encontrado"
            )
        
        print(f"✅ Pago {id_pago} encontrado")
        return pago
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error al obtener pago {id_pago}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener pago")

@router.get("/factura/{id_factura}", response_model=List[PagoResponse])
def obtener_pagos_factura(id_factura: int, db: Session = Depends(get_db)):
    """Obtener todos los pagos de una factura"""
    try:
        pagos = db.query(Pago).filter(Pago.id_factura == id_factura).all()
        print(f"✅ Encontrados {len(pagos)} pagos para factura {id_factura}")
        return pagos
        
    except Exception as e:
        print(f"❌ Error al obtener pagos de factura {id_factura}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener pagos de factura")

# ============================================================================
# ENDPOINTS ADICIONALES (OPCIONALES)
# ============================================================================

@router.put("/{id_pago}/completar", response_model=PagoResponse)
def marcar_pago_completado(id_pago: int, db: Session = Depends(get_db)):
    """Marcar un pago como completado"""
    try:
        pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
        
        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
            
        pago.estado = EstadoPago.completado
        db.commit()
        db.refresh(pago)
        
        print(f"✅ Pago {id_pago} marcado como completado")
        return pago
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error al marcar pago como completado: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar pago")

@router.delete("/{id_pago}", status_code=status.HTTP_200_OK)
def eliminar_pago(id_pago: int, db: Session = Depends(get_db)):
    """Eliminar un pago"""
    try:
        pago = db.query(Pago).filter(Pago.id_pago == id_pago).first()
        
        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
            
        db.delete(pago)
        db.commit()
        
        print(f"✅ Pago {id_pago} eliminado")
        return {"message": "Pago eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error al eliminar pago: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar pago")