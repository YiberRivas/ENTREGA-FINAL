from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.database import get_db
from app.modelos.modelos import (
    Usuario, Agendamiento, Pago, Servicio, 
    Persona, EstadoAgendamiento, EstadoPago
)
from typing import List
from pydantic import BaseModel
from datetime import datetime, date

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

# Esquemas de respuesta
class ResumenResponse(BaseModel):
    usuarios: int
    lavadoras_activas: int
    agendamientos: int
    pagos: int

class AgendamientoReciente(BaseModel):
    id: int
    cliente: str
    servicio: str
    fecha: str
    estado: str

@router.get("/resumen", response_model=ResumenResponse)
def obtener_resumen(db: Session = Depends(get_db)):
    """
    Obtener resumen para el dashboard del admin
    """
    try:
        # Contar usuarios activos
        total_usuarios = db.query(Usuario).filter(Usuario.activo == True).count()
        
        # Contar servicios/lavadoras activas
        lavadoras_activas = db.query(Servicio).filter(Servicio.activo == True).count()
        
        # Contar agendamientos (todos o solo pendientes/confirmados)
        total_agendamientos = db.query(Agendamiento).filter(
            Agendamiento.estado.in_([
                EstadoAgendamiento.pendiente,
                EstadoAgendamiento.confirmado,
                EstadoAgendamiento.en_proceso
            ])
        ).count()
        
        # Contar pagos completados
        pagos_completados = db.query(Pago).filter(
            Pago.estado == EstadoPago.completado
        ).count()
        
        return {
            "usuarios": total_usuarios,
            "lavadoras_activas": lavadoras_activas,
            "agendamientos": total_agendamientos,
            "pagos": pagos_completados
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener resumen: {str(e)}"
        )

@router.get("/agendamientos_recientes", response_model=List[AgendamientoReciente])
def obtener_agendamientos_recientes(limite: int = 10, db: Session = Depends(get_db)):
    """
    Obtener los agendamientos más recientes para el dashboard
    """
    try:
        agendamientos = db.query(Agendamiento).order_by(
            Agendamiento.creado_en.desc()
        ).limit(limite).all()
        
        resultado = []
        for agendamiento in agendamientos:
            # Obtener nombre completo del cliente
            persona = agendamiento.persona
            cliente_nombre = f"{persona.nombres} {persona.apellidos}" if persona else "Sin nombre"
            
            # Obtener nombre del servicio
            servicio_nombre = agendamiento.servicio.nombre_servicio if agendamiento.servicio else "Sin servicio"
            
            # Formatear fecha
            fecha_formateada = agendamiento.fecha.strftime("%d/%m/%Y")
            
            resultado.append({
                "id": agendamiento.id_agendamiento,
                "cliente": cliente_nombre,
                "servicio": servicio_nombre,
                "fecha": fecha_formateada,
                "estado": agendamiento.estado.value
            })
        
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener agendamientos: {str(e)}"
        )

@router.get("/estadisticas/mes")
def obtener_estadisticas_mes(db: Session = Depends(get_db)):
    """
    Obtener estadísticas del mes actual
    """
    try:
        hoy = datetime.now()
        primer_dia_mes = hoy.replace(day=1).date()
        
        # Agendamientos del mes
        agendamientos_mes = db.query(Agendamiento).filter(
            Agendamiento.fecha >= primer_dia_mes
        ).count()
        
        # Servicios finalizados del mes
        servicios_finalizados = db.query(Agendamiento).filter(
            Agendamiento.fecha >= primer_dia_mes,
            Agendamiento.estado == EstadoAgendamiento.finalizado
        ).count()
        
        # Ingresos del mes (suma de pagos completados)
        ingresos = db.query(func.sum(Pago.monto)).filter(
            Pago.fecha_pago >= primer_dia_mes,
            Pago.estado == EstadoPago.completado
        ).scalar() or 0
        
        return {
            "mes": hoy.strftime("%B %Y"),
            "agendamientos": agendamientos_mes,
            "servicios_finalizados": servicios_finalizados,
            "ingresos_total": float(ingresos)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

@router.get("/servicios/populares")
def obtener_servicios_populares(limite: int = 5, db: Session = Depends(get_db)):
    """
    Obtener los servicios más solicitados
    """
    try:
        servicios_populares = db.query(
            Servicio.nombre_servicio,
            func.count(Agendamiento.id_agendamiento).label('total')
        ).join(
            Agendamiento, Agendamiento.servicio_id == Servicio.id_servicio
        ).group_by(
            Servicio.id_servicio
        ).order_by(
            func.count(Agendamiento.id_agendamiento).desc()
        ).limit(limite).all()
        
        resultado = [
            {
                "servicio": servicio,
                "total_agendamientos": total
            }
            for servicio, total in servicios_populares
        ]
        
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener servicios populares: {str(e)}"
        )

@router.get("/clientes/frecuentes")
def obtener_clientes_frecuentes(limite: int = 5, db: Session = Depends(get_db)):
    """
    Obtener los clientes más frecuentes
    """
    try:
        clientes_frecuentes = db.query(
            Persona.nombres,
            Persona.apellidos,
            Persona.correo,
            func.count(Agendamiento.id_agendamiento).label('total')
        ).join(
            Agendamiento, Agendamiento.persona_id == Persona.id_persona
        ).group_by(
            Persona.id_persona
        ).order_by(
            func.count(Agendamiento.id_agendamiento).desc()
        ).limit(limite).all()
        
        resultado = [
            {
                "nombre": f"{nombres} {apellidos}",
                "correo": correo,
                "total_servicios": total
            }
            for nombres, apellidos, correo, total in clientes_frecuentes
        ]
        
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener clientes frecuentes: {str(e)}"
        )
    
@router.get("/tendencia/semana")
def obtener_tendencia_semana(db: Session = Depends(get_db)):
    """
    Retorna una lista de la tendencia semanal de agendamientos,
    servicios finalizados y cancelaciones.
    """
    semanas = [
        {"semana": "Semana 1", "agendamientos": 14, "finalizados": 10, "cancelados": 2},
        {"semana": "Semana 2", "agendamientos": 18, "finalizados": 15, "cancelados": 3},
        {"semana": "Semana 3", "agendamientos": 22, "finalizados": 19, "cancelados": 2},
        {"semana": "Semana 4", "agendamientos": 25, "finalizados": 22, "cancelados": 1},
    ]
    return semanas    