from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modelos.modelos import Servicio

router = APIRouter(
    prefix="/servicios",
    tags=["Servicios"]
)

@router.get("/")
def listar_servicios(db: Session = Depends(get_db)):
    servicios = db.query(Servicio).all()
    return [
        {
            "id_servicio": s.id_servicio,
            "nombre_servicio": s.nombre_servicio,
            "descripcion": s.descripcion,
            "precio_base": float(s.precio_base),
            "duracion_minutos": s.duracion_minutos,
            "activo": s.activo
        }
        for s in servicios
    ]
