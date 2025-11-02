from fastapi import APIRouter

router = APIRouter(
    prefix="/facturas",
    tags=["Facturas"]
)

@router.get("/")
def listar_facturas():
    return {"mensaje": "Listado de facturas"}
