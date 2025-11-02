from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import jwt  # Import directo
from app.config.database import get_db
from app.modelos.usuario import Usuario
from app.seguridad.hash import verificar_hash

router = APIRouter(
    prefix="/login",
    tags=["Autenticación"]
)

SECRET_KEY = "clave_secreta_super_segura"
ALGORITHM = "HS256"

@router.post("/")
def login_usuario(datos: dict, db: Session = Depends(get_db)):
    usuario = datos.get("usuario")
    contrasena = datos.get("contrasena")

    db_usuario = db.query(Usuario).filter(Usuario.usuario == usuario).first()
    if not db_usuario:
        raise HTTPException(status_code=400, detail="Usuario no encontrado")

    if not verificar_hash(contrasena, db_usuario.contrasena_hash):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")

    token = jwt.encode({"sub": usuario}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": db_usuario.usuario,
        "id_usuario": db_usuario.id_usuario
    }
