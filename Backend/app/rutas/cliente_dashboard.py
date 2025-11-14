from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from app.config.database import get_db
from app.modelos.modelos import (
    Persona,
    Usuario,
    Agendamiento,
    Servicio,
    Factura,
    EstadoFactura,
    EstadoAgendamiento
)

router = APIRouter(prefix="/cliente", tags=["Panel Cliente"])


# ==============================
# 🔐 Validación de rol cliente
# ==============================
def validar_cliente(db: Session, persona_id: int):
    usuario = db.query(Usuario).filter(Usuario.persona_id == persona_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # ⚠️ Ajusta si tus IDs de rol cambian
    if usuario.rol_id != 2:
        raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")

    return usuario


# ==============================
# 👤 PERFIL DEL CLIENTE
# ==============================
@router.get("/perfil/{persona_id}")
def obtener_perfil(persona_id: int, db: Session = Depends(get_db)):
    persona = db.query(Persona).filter(Persona.id_persona == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    return persona


@router.put("/perfil/{persona_id}")
def editar_perfil(persona_id: int, datos: dict, db: Session = Depends(get_db)):
    validar_cliente(db, persona_id)

    persona = db.query(Persona).filter(Persona.id_persona == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    campos_validos = ["nombres", "apellidos", "correo", "telefono", "direccion"]

    for campo, valor in datos.items():
        if campo in campos_validos and valor is not None:
            setattr(persona, campo, valor)

    db.commit()
    db.refresh(persona)

    return {
        "message": "Perfil actualizado correctamente",
        "persona": persona
    }


# ==============================
# 🧾 HISTORIAL DE SERVICIOS
# ==============================
@router.get("/historial/{persona_id}")
def historial_servicios(persona_id: int, db: Session = Depends(get_db)):
    validar_cliente(db, persona_id)

    ags = (
        db.query(Agendamiento)
        .filter(Agendamiento.persona_id == persona_id)
        .order_by(Agendamiento.fecha.desc())
        .all()
    )

    historial = []
    for ag in ags:
        factura = (
            db.query(Factura)
            .filter(Factura.agendamiento_id == ag.id_agendamiento)
            .first()
        )

        historial.append({
            "id_agendamiento": ag.id_agendamiento,
            "servicio": ag.servicio.nombre_servicio if ag.servicio else "N/A",
            "fecha": ag.fecha,
            "estado": ag.estado.value,
            "precio": float(ag.servicio.precio_base) if ag.servicio else 0,
            "factura": {
                "id_factura": factura.id_factura,
                "total": float(factura.total),
                "estado": factura.estado.value,
                "fecha": factura.fecha
            } if factura else None
        })

    return {
        "persona_id": persona_id,
        "historial": historial,
        "total_servicios": len(historial)
    }


# ==============================
# 🗓️ AGENDAR NUEVO SERVICIO
# ==============================
@router.post("/agendar")
def agendar_servicio(
    persona_id: int,
    servicio_id: int,
    fecha: date,
    hora: Optional[str] = None,
    observaciones: Optional[str] = None,
    db: Session = Depends(get_db)
):
    validar_cliente(db, persona_id)

    persona = db.query(Persona).filter(Persona.id_persona == persona_id).first()
    servicio = db.query(Servicio).filter(Servicio.id_servicio == servicio_id).first()

    if not persona or not servicio:
        raise HTTPException(status_code=404, detail="Persona o servicio no encontrado")

    nuevo = Agendamiento(
        persona_id=persona_id,
        servicio_id=servicio_id,
        fecha=fecha,
        hora=hora,
        observaciones=observaciones,
        estado=EstadoAgendamiento.pendiente
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {
        "message": "Servicio agendado correctamente",
        "agendamiento": nuevo
    }


# ==============================
# ❌ CANCELAR SERVICIO
# ==============================
@router.put("/servicio/{id}/cancelar")
def cancelar_servicio(id: int, db: Session = Depends(get_db)):
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    if ag.estado not in [EstadoAgendamiento.pendiente, EstadoAgendamiento.confirmado]:
        raise HTTPException(status_code=400, detail="No se puede cancelar este servicio")

    ag.estado = EstadoAgendamiento.cancelado
    db.commit()

    return {"message": "Servicio cancelado correctamente"}


# ==============================
# ✔️ FINALIZAR SERVICIO
# ==============================
@router.put("/servicio/{id}/finalizar")
def finalizar_servicio(id: int, db: Session = Depends(get_db)):
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    if ag.estado != EstadoAgendamiento.en_proceso:
        raise HTTPException(status_code=400, detail="El servicio no está en proceso")

    ag.estado = EstadoAgendamiento.finalizado

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
            "total": float(factura.total),
            "fecha": factura.fecha,
            "estado": factura.estado.value
        }
    }
