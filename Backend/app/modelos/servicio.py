from fastapi import APIRouter

router = APIRouter(
    prefix="/servicios",
    tags=["Servicios"]
)

@router.get("/")
def listar_servicios():
    return {"mensaje": "Listado de servicios"}
