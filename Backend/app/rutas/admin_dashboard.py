from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modelos.modelos import Usuario, Servicio, Agendamiento, Pago
from app.seguridad.auth import obtener_usuario_actual

# Este router NO debe tener prefijo aquí
# El prefijo "/admin" lo añade main.py
router = APIRouter(tags=["Admin Dashboard"])

# ==========================
# 🔐 Función auxiliar
# ==========================
def verificar_admin(usuario: Usuario):
    """Verifica que el usuario tenga rol de administrador."""
    if not usuario or not usuario.rol or usuario.rol.nombre_rol.lower() != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: solo administradores pueden acceder a este recurso."
        )

# ==========================
# 📊 RESUMEN GENERAL
# ==========================
@router.get("/resumen")
def obtener_resumen(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_admin(usuario)

    try:
        total_usuarios = db.query(Usuario).filter(Usuario.activo == True).count()
        lavadoras_activas = db.query(Servicio).filter(Servicio.activo == True).count()
        total_agendamientos = db.query(Agendamiento).count()
        pagos_completados = db.query(Pago).count()

        return {
            "usuarios": total_usuarios,
            "lavadoras_activas": lavadoras_activas,
            "agendamientos": total_agendamientos,
            "pagos": pagos_completados
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener resumen: {str(e)}"
        )

# ==========================
# 🗓️ AGENDAMIENTOS RECIENTES
# ==========================
@router.get("/agendamientos_recientes")
def obtener_agendamientos_recientes(
    limite: int = 50,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_admin(usuario)

    try:
        agendamientos = (
            db.query(Agendamiento)
            .order_by(Agendamiento.fecha.desc())
            .limit(limite)
            .all()
        )

        return [
            {
                "id": a.id_agendamiento,
                "cliente": f"{a.persona.nombres} {a.persona.apellidos}" if a.persona else "N/A",
                "servicio": a.servicio.nombre_servicio if a.servicio else "N/A",
                "fecha": a.fecha.strftime("%Y-%m-%d"),
                "estado": a.estado,
            }
            for a in agendamientos
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener agendamientos: {str(e)}"
        )

# ==========================
# 📈 ESTADÍSTICAS DEL MES
# ==========================
@router.get("/estadisticas/mes")
def obtener_estadisticas_mes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_admin(usuario)

    try:
        from datetime import datetime

        mes_actual = datetime.now().strftime("%B")
        total_agendamientos = db.query(Agendamiento).count()
        finalizados = db.query(Agendamiento).filter(Agendamiento.estado == "finalizado").count()
        ingresos_total = db.query(Pago).count()

        return {
            "mes": mes_actual.capitalize(),
            "agendamientos": total_agendamientos,
            "servicios_finalizados": finalizados,
            "ingresos_total": ingresos_total
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

# ==========================
# 🥇 SERVICIOS POPULARES
# ==========================
@router.get("/servicios/populares")
def obtener_servicios_populares(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_admin(usuario)

    try:
        servicios = db.query(Servicio).all()
        resultado = []

        for s in servicios:
            total_agendamientos = (
                db.query(Agendamiento)
                .filter(Agendamiento.servicio_id == s.id_servicio)
                .count()
            )
            resultado.append({
                "servicio": s.nombre_servicio,
                "total_agendamientos": total_agendamientos
            })

        return resultado

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener servicios populares: {str(e)}"
        )

# ==========================
# 📊 TENDENCIA SEMANAL
# ==========================
@router.get("/tendencia/semana")
def obtener_tendencia_semanal(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    verificar_admin(usuario)

    try:
        tendencia = [
            {"semana": "Semana 1", "agendamientos": 12, "finalizados": 8, "cancelados": 2},
            {"semana": "Semana 2", "agendamientos": 15, "finalizados": 10, "cancelados": 1},
            {"semana": "Semana 3", "agendamientos": 20, "finalizados": 14, "cancelados": 3},
            {"semana": "Semana 4", "agendamientos": 18, "finalizados": 15, "cancelados": 2},
        ]
        return tendencia

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener tendencia semanal: {str(e)}"
        )
