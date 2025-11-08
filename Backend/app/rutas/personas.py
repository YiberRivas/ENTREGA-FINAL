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
    # Retornar lista de diccionarios
    return [
        {
            "id_persona": p.id_persona,
            "nombres": p.nombres,
            "apellidos": p.apellidos,
            "correo": p.correo,
            "telefono": p.telefono
        }
        for p in personas
    ]
