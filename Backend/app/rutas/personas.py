from fastapi import APIRouter

router = APIRouter(
    prefix="/personas",
    tags=["Personas"]
)

@router.get("/")
def listar_personas():
    return {"mensaje": "Listado de personas"}
