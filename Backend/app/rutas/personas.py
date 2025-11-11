from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modelos.modelos import Persona

router = APIRouter(
    prefix="/personas",
    tags=["Personas"]
)

@router.get("/")
def listar_personas(db: Session = Depends(get_db)):
    personas = db.query(Persona).all()
    # Retornar lista de diccionarios CON identificacion
    return [
        {
            "id_persona": p.id_persona,
            "nombres": p.nombres,
            "apellidos": p.apellidos,
            "identificacion": p.identificacion,  # ← ESTO FALTABA
            "correo": p.correo,
            "telefono": p.telefono,
            "direccion_id": p.direccion_id,
            "direccion": {
                "direccion_detalle": p.direccion.direccion_detalle if p.direccion else None
            } if p.direccion else None
        }
        for p in personas
    ]