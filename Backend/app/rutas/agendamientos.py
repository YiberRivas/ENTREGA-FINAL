from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time, datetime
from app.config.database import get_db
from app.modelos.modelos import (
    Agendamiento, EstadoAgendamiento,
    FinalizacionServicio, Servicio, Persona, Factura, EstadoFactura
)
from pydantic import BaseModel
from decimal import Decimal

# ⚠️ El prefijo /agendamientos lo añade main.py
router = APIRouter(tags=["Agendamientos"])

# ==================== ESQUEMAS ====================

class AgendamientoCreate(BaseModel):
    persona_id: int
    servicio_id: int
    fecha: date
    hora: time
    observaciones: Optional[str] = None


class AgendamientoResponse(BaseModel):
    id_agendamiento: int
    persona_id: int
    servicio_id: int
    fecha: date
    hora: time
    estado: str
    observaciones: Optional[str] = None
    persona: Optional[dict] = None
    servicio: Optional[dict] = None

    class Config:
        from_attributes = True


class FinalizacionCreate(BaseModel):
    agendamiento_id: int
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None


class FinalizacionResponse(BaseModel):
    id_finalizacion: int
    agendamiento_id: int
    fecha_finalizacion: datetime
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None

    class Config:
        from_attributes = True


class FinalizarRequest(BaseModel):
    agendamiento_id: int
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None


# ==================== ENDPOINTS AGENDAMIENTOS ====================

@router.get("/", response_model=List[AgendamientoResponse])
def listar_agendamientos(
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Listar agendamientos con datos completos."""
    query = db.query(Agendamiento)
    if estado:
        query = query.filter(Agendamiento.estado == estado)

    agendamientos = query.all()
    resultado = []

    for ag in agendamientos:
        resultado.append({
            "id_agendamiento": ag.id_agendamiento,
            "persona_id": ag.persona_id,
            "servicio_id": ag.servicio_id,
            "fecha": ag.fecha,
            "hora": ag.hora,
            "estado": ag.estado.value,
            "observaciones": ag.observaciones,
            "persona": {
                "nombres": ag.persona.nombres,
                "apellidos": ag.persona.apellidos,
                "correo": ag.persona.correo,
                "telefono": ag.persona.telefono
            } if ag.persona else None,
            "servicio": {
                "nombre_servicio": ag.servicio.nombre_servicio,
                "precio_base": float(ag.servicio.precio_base),
                "duracion_minutos": ag.servicio.duracion_minutos
            } if ag.servicio else None
        })

    return resultado


@router.post("/", response_model=AgendamientoResponse, status_code=status.HTTP_201_CREATED)
def crear_agendamiento(ag: AgendamientoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo agendamiento."""
    persona = db.query(Persona).filter(Persona.id_persona == ag.persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")

    servicio = db.query(Servicio).filter(Servicio.id_servicio == ag.servicio_id).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    nuevo = Agendamiento(
        persona_id=ag.persona_id,
        servicio_id=ag.servicio_id,
        fecha=ag.fecha,
        hora=ag.hora,
        observaciones=ag.observaciones,
        estado=EstadoAgendamiento.pendiente,
        creado_en=datetime.now()
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {
        "id_agendamiento": nuevo.id_agendamiento,
        "persona_id": nuevo.persona_id,
        "servicio_id": nuevo.servicio_id,
        "fecha": nuevo.fecha,
        "hora": nuevo.hora,
        "estado": nuevo.estado.value,
        "observaciones": nuevo.observaciones,
        "persona": {
            "nombres": nuevo.persona.nombres,
            "apellidos": nuevo.persona.apellidos,
            "correo": nuevo.persona.correo,
            "telefono": nuevo.persona.telefono
        },
        "servicio": {
            "nombre_servicio": nuevo.servicio.nombre_servicio,
            "precio_base": float(nuevo.servicio.precio_base),
            "duracion_minutos": nuevo.servicio.duracion_minutos
        }
    }


@router.put("/{id_agendamiento}/estado")
def actualizar_estado(id_agendamiento: int, nuevo_estado: EstadoAgendamiento, db: Session = Depends(get_db)):
    """Actualizar el estado de un agendamiento."""
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id_agendamiento).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    ag.estado = nuevo_estado
    db.commit()

    return {"message": f"Estado actualizado a {nuevo_estado.value}"}


@router.delete("/{id_agendamiento}")
def eliminar_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    """Eliminar un agendamiento."""
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id_agendamiento).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    db.delete(ag)
    db.commit()

    return {"message": "Agendamiento eliminado correctamente"}


# ==================== FINALIZAR SERVICIO ====================

@router.post("/finalizar")
def finalizar_servicio(data: FinalizarRequest, db: Session = Depends(get_db)):
    """Finalizar servicio y generar factura automáticamente."""
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == data.agendamiento_id).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    ag.estado = EstadoAgendamiento.finalizado

    finalizacion = FinalizacionServicio(
        agendamiento_id=ag.id_agendamiento,
        observaciones=data.observaciones,
        calificacion=data.calificacion
    )
    db.add(finalizacion)

    monto = ag.servicio.precio_base if ag.servicio else Decimal("0.00")

    factura = Factura(
        persona_id=ag.persona_id,
        agendamiento_id=ag.id_agendamiento,
        total=monto,
        forma_pago_id=1,
        fecha=datetime.now(),
        estado=EstadoFactura.emitida
    )

    db.add(factura)
    db.commit()
    db.refresh(factura)

    return {
        "message": "Servicio finalizado y factura generada correctamente",
        "factura": {
            "id_factura": factura.id_factura,
            "fecha": factura.fecha,
            "total": float(factura.total),
            "estado": factura.estado.value,
            "forma_pago_id": factura.forma_pago_id,
        }
    }


# ==================== HISTORIAL ====================

@router.get("/persona/{persona_id}/historial")
def obtener_historial_persona(persona_id: int, db: Session = Depends(get_db)):
    """Historial de servicios finalizados por persona."""
    ags = db.query(Agendamiento).filter(
        Agendamiento.persona_id == persona_id,
        Agendamiento.estado == EstadoAgendamiento.finalizado
    ).all()

    historial = []
    for ag in ags:
        fin = db.query(FinalizacionServicio).filter(
            FinalizacionServicio.agendamiento_id == ag.id_agendamiento
        ).first()

        historial.append({
            "id_agendamiento": ag.id_agendamiento,
            "fecha": ag.fecha,
            "hora": ag.hora,
            "servicio": {
                "nombre": ag.servicio.nombre_servicio,
                "precio": float(ag.servicio.precio_base)
            },
            "finalizacion": {
                "fecha_finalizacion": fin.fecha_finalizacion,
                "observaciones": fin.observaciones,
                "calificacion": fin.calificacion
            } if fin else None
        })

    return {
        "persona_id": persona_id,
        "total_servicios": len(historial),
        "historial": historial
    }
