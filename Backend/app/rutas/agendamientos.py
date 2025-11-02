from fastapi import APIRouter

router = APIRouter(
    prefix="/agendamientos",
    tags=["Agendamientos"]
)

@router.get("/")
def listar_agendamientos():
    return {"mensaje": "Listado de agendamientos"}
