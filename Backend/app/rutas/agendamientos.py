# app/rutas/agendamientos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time, datetime
from decimal import Decimal, ROUND_HALF_UP
from pydantic import BaseModel

from app.config.database import get_db
from app.modelos.modelos import (
    Agendamiento,
    EstadoAgendamiento,
    FinalizacionServicio,
    Servicio,
    Persona,
    Factura,
    EstadoFactura,
)

# ✅ UN SOLO ROUTER
router = APIRouter(tags=["Agendamientos"])

# ---------------- SCHEMAS ----------------
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

class FinalizarRequest(BaseModel):
    agendamiento_id: int
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None
    forma_pago_id: Optional[int] = None

# ---------------- ENDPOINTS ADMIN ----------------
@router.get("/agendamientos_recientes")
def agendamientos_recientes(limite: int = 50, db: Session = Depends(get_db)):
    """
    Devuelve los agendamientos más recientes,
    listos para ser usados en el dashboard administrador.
    """
    try:
        ags = (
            db.query(Agendamiento)
            .order_by(Agendamiento.creado_en.desc())
            .limit(limite)
            .all()
        )

        resultado = []
        for a in ags:
            resultado.append({
                "id": a.id_agendamiento,
                "cliente": f"{a.persona.nombres} {a.persona.apellidos}",
                "servicio": a.servicio.nombre_servicio,
                "fecha": f"{a.fecha} {a.hora}",
                "estado": a.estado.value,
            })

        return resultado

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail="Error al obtener agendamientos recientes")

# ---------------- ENDPOINTS GENERALES ----------------
@router.get("/", response_model=List[AgendamientoResponse])
def listar_agendamientos(estado: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Listar agendamientos. Si se pasa `estado` filtra por ese estado.
    """
    query = db.query(Agendamiento)
    if estado:
        try:
            enum_estado = getattr(EstadoAgendamiento, estado)
            query = query.filter(Agendamiento.estado == enum_estado)
        except Exception:
            query = query.filter(Agendamiento.estado == estado)

    agendamientos = query.all()
    resultado = []
    for ag in agendamientos:
        estado_val = ag.estado.value if hasattr(ag.estado, "value") else str(ag.estado)
        resultado.append({
            "id_agendamiento": getattr(ag, "id_agendamiento", getattr(ag, "id", None)),
            "persona_id": ag.persona_id,
            "servicio_id": ag.servicio_id,
            "fecha": ag.fecha,
            "hora": ag.hora,
            "estado": estado_val,
            "observaciones": ag.observaciones,
            "persona": {
                "nombres": ag.persona.nombres,
                "apellidos": ag.persona.apellidos,
                "correo": ag.persona.correo,
                "telefono": ag.persona.telefono,
                "identificacion": getattr(ag.persona, "identificacion", None)
            } if getattr(ag, "persona", None) else None,
            "servicio": {
                "nombre_servicio": ag.servicio.nombre_servicio,
                "precio_base": float(ag.servicio.precio_base),
                "duracion_minutos": ag.servicio.duracion_minutos
            } if getattr(ag, "servicio", None) else None
        })
    return resultado

@router.post("/", response_model=AgendamientoResponse, status_code=status.HTTP_201_CREATED)
def crear_agendamiento(ag: AgendamientoCreate, db: Session = Depends(get_db)):
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

    estado_val = nuevo.estado.value if hasattr(nuevo.estado, "value") else str(nuevo.estado)
    return {
        "id_agendamiento": getattr(nuevo, "id_agendamiento", getattr(nuevo, "id", None)),
        "persona_id": nuevo.persona_id,
        "servicio_id": nuevo.servicio_id,
        "fecha": nuevo.fecha,
        "hora": nuevo.hora,
        "estado": estado_val,
        "observaciones": nuevo.observaciones,
        "persona": {
            "nombres": nuevo.persona.nombres,
            "apellidos": nuevo.persona.apellidos,
            "correo": nuevo.persona.correo,
            "telefono": nuevo.persona.telefono,
            "identificacion": getattr(nuevo.persona, "identificacion", None)
        } if getattr(nuevo, "persona", None) else None,
        "servicio": {
            "nombre_servicio": nuevo.servicio.nombre_servicio,
            "precio_base": float(nuevo.servicio.precio_base),
            "duracion_minutos": nuevo.servicio.duracion_minutos
        } if getattr(nuevo, "servicio", None) else None
    }

@router.post("/iniciar/{id_agendamiento}")
def iniciar_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    """
    Marca inicio del servicio.
    """
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id_agendamiento).first()
    if not ag:
        ag = db.query(Agendamiento).filter(getattr(Agendamiento, "id", -1) == id_agendamiento).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    estado_actual = ag.estado.value if hasattr(ag.estado, "value") else str(ag.estado)
    en_proceso_value = EstadoAgendamiento.en_proceso.value if hasattr(EstadoAgendamiento.en_proceso, "value") else str(EstadoAgendamiento.en_proceso)
    if estado_actual == en_proceso_value:
        return {"message": "El agendamiento ya está en proceso"}

    if hasattr(ag, "hora_inicio"):
        ag.hora_inicio = datetime.now()
    ag.estado = EstadoAgendamiento.en_proceso
    db.commit()
    db.refresh(ag)

    return {
        "message": "Agendamiento iniciado",
        "id_agendamiento": getattr(ag, "id_agendamiento", getattr(ag, "id", None)),
        "hora_inicio": getattr(ag, "hora_inicio", None)
    }

@router.post("/finalizar")
def finalizar_servicio(data: FinalizarRequest, db: Session = Depends(get_db)):
    """
    Finaliza el servicio y genera factura.
    """
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == data.agendamiento_id).first()
    if not ag:
        ag = db.query(Agendamiento).filter(getattr(Agendamiento, "id", -1) == data.agendamiento_id).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")

    if not hasattr(ag, "hora_inicio") or not ag.hora_inicio:
        raise HTTPException(status_code=400, detail="El servicio no ha sido iniciado")

    hora_fin = datetime.now()
    total_segundos = (hora_fin - ag.hora_inicio).total_seconds()
    minutos = int(total_segundos // 60)
    horas_reales = round(minutos / 60, 2)

    horas_minimas = 3
    tarifa_hora = Decimal("3000")

    horas_facturables = Decimal(str(max(horas_minimas, horas_reales)))
    total_pagar = (tarifa_hora * horas_facturables).quantize(Decimal("1.00"), rounding=ROUND_HALF_UP)

    duracion_txt = f"Tiempo: {minutos // 60}h {minutos % 60}m"
    finalizacion = FinalizacionServicio(
        agendamiento_id=ag.id_agendamiento,
        fecha_finalizacion=hora_fin,
        observaciones=duracion_txt + (f" - {data.observaciones}" if data.observaciones else ""),
        calificacion=data.calificacion
    )
    db.add(finalizacion)

    ag.estado = EstadoAgendamiento.finalizado

    factura = Factura(
        persona_id=ag.persona_id,
        agendamiento_id=ag.id_agendamiento,
        total=total_pagar,
        forma_pago_id=data.forma_pago_id if data.forma_pago_id else None,
        fecha=datetime.now(),
        estado=EstadoFactura.emitida
    )
    db.add(factura)
    db.commit()
    db.refresh(factura)

    return {
        "message": "Servicio finalizado correctamente",
        "duracion_real_horas": float(horas_reales),
        "duracion_facturada": float(horas_facturables),
        "observaciones": duracion_txt,
        "factura": {
            "id_factura": getattr(factura, "id_factura", getattr(factura, "id", None)),
            "fecha": factura.fecha,
            "total": float(factura.total),
            "estado": factura.estado.value if hasattr(factura.estado, "value") else str(factura.estado),
            "forma_pago_id": factura.forma_pago_id
        },
        "cliente": {
            "nombres": ag.persona.nombres if ag.persona else None,
            "apellidos": ag.persona.apellidos if ag.persona else None,
            "identificacion": getattr(ag.persona, "identificacion", None) if ag.persona else None,
            "correo": ag.persona.correo if ag.persona else None,
            "telefono": ag.persona.telefono if ag.persona else None,
        } if getattr(ag, "persona", None) else None,
        "servicio": {
            "nombre_servicio": ag.servicio.nombre_servicio if getattr(ag, "servicio", None) else None,
            "precio_base": float(ag.servicio.precio_base) if getattr(ag, "servicio", None) else None,
        } if getattr(ag, "servicio", None) else None
    }

@router.get("/persona/{persona_id}/historial")
def obtener_historial_persona(persona_id: int, db: Session = Depends(get_db)):
    ags = db.query(Agendamiento).filter(Agendamiento.persona_id == persona_id).order_by(Agendamiento.fecha.desc()).all()
    historial = []
    for ag in ags:
        fin = db.query(FinalizacionServicio).filter(FinalizacionServicio.agendamiento_id == ag.id_agendamiento).first()
        factura = db.query(Factura).filter(Factura.agendamiento_id == ag.id_agendamiento).first()
        historial.append({
            "id_agendamiento": ag.id_agendamiento,
            "fecha": ag.fecha,
            "hora": ag.hora,
            "estado": ag.estado.value if hasattr(ag.estado, "value") else str(ag.estado),
            "servicio": {
                "nombre_servicio": ag.servicio.nombre_servicio if getattr(ag, "servicio", None) else None,
                "precio_base": float(ag.servicio.precio_base) if getattr(ag, "servicio", None) else None
            } if getattr(ag, "servicio", None) else None,
            "finalizacion": {
                "fecha_finalizacion": fin.fecha_finalizacion if fin else None,
                "observaciones": fin.observaciones if fin else None,
                "calificacion": fin.calificacion if fin else None
            } if fin else None,
            "factura": {
                "id_factura": factura.id_factura,
                "total": float(factura.total),
                "estado": factura.estado.value if hasattr(factura.estado, "value") else str(factura.estado)
            } if factura else None
        })
    return {
        "persona_id": persona_id,
        "total_servicios": len(historial),
        "historial": historial
    }

@router.delete("/{id_agendamiento}")
def eliminar_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id_agendamiento).first()
    if not ag:
        ag = db.query(Agendamiento).filter(getattr(Agendamiento, "id", -1) == id_agendamiento).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")
    db.delete(ag)
    db.commit()
    return {"message": "Agendamiento eliminado correctamente"}

@router.put("/{id_agendamiento}/estado")
def actualizar_estado(id_agendamiento: int, nuevo_estado: str, db: Session = Depends(get_db)):
    ag = db.query(Agendamiento).filter(Agendamiento.id_agendamiento == id_agendamiento).first()
    if not ag:
        ag = db.query(Agendamiento).filter(getattr(Agendamiento, "id", -1) == id_agendamiento).first()
    if not ag:
        raise HTTPException(status_code=404, detail="Agendamiento no encontrado")
    try:
        estado_enum = getattr(EstadoAgendamiento, nuevo_estado)
        ag.estado = estado_enum
    except Exception:
        ag.estado = nuevo_estado
    db.commit()
    db.refresh(ag)
    return {"message": f"Estado actualizado a {nuevo_estado}"}