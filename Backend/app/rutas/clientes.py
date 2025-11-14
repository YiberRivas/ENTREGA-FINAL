# app/rutas/clientes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, time
from app.config.database import get_db
from app.modelos.modelos import (
    Usuario,
    Persona,
    Servicio,
    Agendamiento,
    EstadoAgendamiento
)
from app.seguridad.auth import obtener_usuario_actual

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# ============================================================
# 👤 PERFIL DEL CLIENTE
# ============================================================
@router.get("/perfil")
def obtener_perfil(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """Obtener datos del perfil del usuario autenticado"""

    persona = db.query(Persona).filter(
        Persona.id_persona == usuario_actual.persona_id
    ).first()

    if not persona:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    return persona


@router.put("/perfil")
def actualizar_perfil(
    datos: dict,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """Actualizar datos del perfil del cliente"""

    persona = db.query(Persona).filter(
        Persona.id_persona == usuario_actual.persona_id
    ).first()

    if not persona:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    # Campos permitidos
    campos_validos = ["nombres", "apellidos", "correo", "telefono", "direccion"]

    for campo, valor in datos.items():
        if campo in campos_validos and valor is not None:
            setattr(persona, campo, valor)

    db.commit()
    db.refresh(persona)

    return {
        "mensaje": "Perfil actualizado correctamente",
        "persona": persona
    }


# ============================================================
# 📅 AGENDAR NUEVO SERVICIO
# ============================================================
@router.post("/agendar/{id_servicio}")
def agendar_servicio(
    id_servicio: int,
    fecha: date,
    hora: Optional[time] = None,
    observaciones: Optional[str] = None,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """Permite al cliente agendar un servicio"""

    servicio = db.query(Servicio).filter(
        Servicio.id_servicio == id_servicio
    ).first()

    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    nuevo_ag = Agendamiento(
        persona_id=usuario_actual.persona_id,
        servicio_id=id_servicio,
        fecha=fecha,
        hora=hora,
        observaciones=observaciones,
        estado=EstadoAgendamiento.pendiente
    )

    db.add(nuevo_ag)
    db.commit()
    db.refresh(nuevo_ag)

    return {
        "mensaje": "Servicio agendado correctamente",
        "agendamiento": {
            "id": nuevo_ag.id_agendamiento,
            "fecha": nuevo_ag.fecha,
            "hora": nuevo_ag.hora,
            "estado": nuevo_ag.estado.value
        }
    }


# ============================================================
# 📜 HISTORIAL DE SERVICIOS DEL CLIENTE
# ============================================================
@router.get("/historial")
def historial_servicios(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    """Historial de todos los servicios del cliente"""

    ags = (
        db.query(Agendamiento)
        .filter(Agendamiento.persona_id == usuario_actual.persona_id)
        .order_by(Agendamiento.fecha.desc())
        .all()
    )

    historial = []

    for ag in ags:
        servicio = db.query(Servicio).filter(
            Servicio.id_servicio == ag.servicio_id
        ).first()

        historial.append({
            "id_agendamiento": ag.id_agendamiento,
            "fecha": ag.fecha,
            "hora": ag.hora,
            "estado": ag.estado.value,
            "servicio": servicio.nombre_servicio if servicio else "N/A",
            "precio": float(servicio.precio_base) if servicio else 0.0
        })

    return {
        "persona_id": usuario_actual.persona_id,
        "total_servicios": len(historial),
        "historial": historial
    }
