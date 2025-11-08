from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time, datetime
from app.config.database import get_db
from app.modelos.modelos import (
    Agendamiento, EstadoAgendamiento, 
    FinalizacionServicio, Servicio, Persona
)
from pydantic import BaseModel

router = APIRouter(prefix="/agendamientos", tags=["Agendamientos"])

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
    
    # Información adicional
    persona: Optional[dict] = None
    servicio: Optional[dict] = None

    class Config:
        from_attributes = True

class FinalizacionCreate(BaseModel):
    agendamiento_id: int
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None  # 1-5 estrellas

class FinalizacionResponse(BaseModel):
    id_finalizacion: int
    agendamiento_id: int
    fecha_finalizacion: datetime
    observaciones: Optional[str] = None
    calificacion: Optional[int] = None

    class Config:
        from_attributes = True

# ==================== ENDPOINTS AGENDAMIENTOS ====================

@router.get("/", response_model=List[AgendamientoResponse])
def listar_agendamientos(
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Listar agendamientos con filtro opcional por estado
    Estados: pendiente, confirmado, en_proceso, finalizado, cancelado
    """
    query = db.query(Agendamiento)
    
    if estado:
        query = query.filter(Agendamiento.estado == estado)
    
    agendamientos = query.all()
    
    # Agregar información de persona y servicio
    resultado = []
    for agendamiento in agendamientos:
        agendamiento_dict = {
            "id_agendamiento": agendamiento.id_agendamiento,
            "persona_id": agendamiento.persona_id,
            "servicio_id": agendamiento.servicio_id,
            "fecha": agendamiento.fecha,
            "hora": agendamiento.hora,
            "estado": agendamiento.estado.value,
            "observaciones": agendamiento.observaciones,
            "persona": {
                "nombres": agendamiento.persona.nombres,
                "apellidos": agendamiento.persona.apellidos,
                "correo": agendamiento.persona.correo,
                "telefono": agendamiento.persona.telefono
            } if agendamiento.persona else None,
            "servicio": {
                "nombre_servicio": agendamiento.servicio.nombre_servicio,
                "precio_base": float(agendamiento.servicio.precio_base),
                "duracion_minutos": agendamiento.servicio.duracion_minutos
            } if agendamiento.servicio else None
        }
        resultado.append(agendamiento_dict)
    
    return resultado

@router.post("/", response_model=AgendamientoResponse, status_code=status.HTTP_201_CREATED)
def crear_agendamiento(agendamiento: AgendamientoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo agendamiento"""
    
    # Verificar que la persona existe
    persona = db.query(Persona).filter(Persona.id_persona == agendamiento.persona_id).first()
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona no encontrada"
        )
    
    # Verificar que el servicio existe
    servicio = db.query(Servicio).filter(Servicio.id_servicio == agendamiento.servicio_id).first()
    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )
    
    nuevo_agendamiento = Agendamiento(
        persona_id=agendamiento.persona_id,
        servicio_id=agendamiento.servicio_id,
        fecha=agendamiento.fecha,
        hora=agendamiento.hora,
        observaciones=agendamiento.observaciones,
        estado=EstadoAgendamiento.pendiente,
        creado_en=datetime.now()
    )
    db.add(nuevo_agendamiento)
    db.commit()
    db.refresh(nuevo_agendamiento)
    return nuevo_agendamiento

@router.get("/{id_agendamiento}", response_model=AgendamientoResponse)
def obtener_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    """Obtener un agendamiento por ID"""
    agendamiento = db.query(Agendamiento).filter(
        Agendamiento.id_agendamiento == id_agendamiento
    ).first()
    
    if not agendamiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamiento no encontrado"
        )
    return agendamiento

@router.put("/{id_agendamiento}/estado")
def actualizar_estado(
    id_agendamiento: int,
    nuevo_estado: EstadoAgendamiento,
    db: Session = Depends(get_db)
):
    """
    Actualizar estado de un agendamiento
    Estados: pendiente, confirmado, en_proceso, finalizado, cancelado
    """
    agendamiento = db.query(Agendamiento).filter(
        Agendamiento.id_agendamiento == id_agendamiento
    ).first()
    
    if not agendamiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamiento no encontrado"
        )
    
    agendamiento.estado = nuevo_estado
    db.commit()
    return {
        "message": "Estado actualizado correctamente",
        "nuevo_estado": nuevo_estado.value
    }

@router.delete("/{id_agendamiento}")
def eliminar_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    """Eliminar un agendamiento"""
    agendamiento = db.query(Agendamiento).filter(
        Agendamiento.id_agendamiento == id_agendamiento
    ).first()
    
    if not agendamiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamiento no encontrado"
        )
    
    db.delete(agendamiento)
    db.commit()
    return {"message": "Agendamiento eliminado correctamente"}

# ==================== ENDPOINTS FINALIZACIÓN ====================

@router.post("/finalizar", response_model=FinalizacionResponse, status_code=status.HTTP_201_CREATED)
def finalizar_servicio(finalizacion: FinalizacionCreate, db: Session = Depends(get_db)):
    """
    Registrar la finalización de un servicio
    - Actualiza el estado del agendamiento a "finalizado"
    - Registra observaciones y calificación
    """
    
    # Verificar que el agendamiento existe
    agendamiento = db.query(Agendamiento).filter(
        Agendamiento.id_agendamiento == finalizacion.agendamiento_id
    ).first()
    
    if not agendamiento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamiento no encontrado"
        )
    
    # Verificar que el agendamiento está en proceso
    if agendamiento.estado not in [EstadoAgendamiento.en_proceso, EstadoAgendamiento.confirmado]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El agendamiento debe estar en proceso o confirmado. Estado actual: {agendamiento.estado.value}"
        )
    
    # Validar calificación (1-5)
    if finalizacion.calificacion and (finalizacion.calificacion < 1 or finalizacion.calificacion > 5):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La calificación debe estar entre 1 y 5"
        )
    
    try:
        # Crear registro de finalización
        nueva_finalizacion = FinalizacionServicio(
            agendamiento_id=finalizacion.agendamiento_id,
            fecha_finalizacion=datetime.now(),
            observaciones=finalizacion.observaciones,
            calificacion=finalizacion.calificacion
        )
        db.add(nueva_finalizacion)
        
        # Actualizar estado del agendamiento a "finalizado"
        agendamiento.estado = EstadoAgendamiento.finalizado
        
        db.commit()
        db.refresh(nueva_finalizacion)
        
        return nueva_finalizacion
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al finalizar servicio: {str(e)}"
        )

@router.get("/finalizaciones/", response_model=List[FinalizacionResponse])
def listar_finalizaciones(db: Session = Depends(get_db)):
    """Listar todas las finalizaciones de servicios"""
    finalizaciones = db.query(FinalizacionServicio).all()
    return finalizaciones

@router.get("/finalizaciones/{id_agendamiento}", response_model=FinalizacionResponse)
def obtener_finalizacion_agendamiento(id_agendamiento: int, db: Session = Depends(get_db)):
    """Obtener la finalización de un agendamiento específico"""
    finalizacion = db.query(FinalizacionServicio).filter(
        FinalizacionServicio.agendamiento_id == id_agendamiento
    ).first()
    
    if not finalizacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró finalización para este agendamiento"
        )
    
    return finalizacion

@router.get("/persona/{persona_id}/historial")
def obtener_historial_persona(persona_id: int, db: Session = Depends(get_db)):
    """Obtener historial completo de servicios de una persona"""
    
    agendamientos = db.query(Agendamiento).filter(
        Agendamiento.persona_id == persona_id,
        Agendamiento.estado == EstadoAgendamiento.finalizado
    ).all()
    
    historial = []
    for agendamiento in agendamientos:
        finalizacion = db.query(FinalizacionServicio).filter(
            FinalizacionServicio.agendamiento_id == agendamiento.id_agendamiento
        ).first()
        
        historial.append({
            "id_agendamiento": agendamiento.id_agendamiento,
            "fecha": agendamiento.fecha,
            "hora": agendamiento.hora,
            "servicio": {
                "nombre": agendamiento.servicio.nombre_servicio,
                "precio": float(agendamiento.servicio.precio_base)
            },
            "finalizacion": {
                "fecha_finalizacion": finalizacion.fecha_finalizacion,
                "observaciones": finalizacion.observaciones,
                "calificacion": finalizacion.calificacion
            } if finalizacion else None
        })
    
    return {
        "persona_id": persona_id,
        "total_servicios": len(historial),
        "historial": historial
    }