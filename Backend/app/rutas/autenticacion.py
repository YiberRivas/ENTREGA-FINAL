from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.esquemas.esquemas import LoginRequest, Token
from app.modelos.modelos import Usuario
from app.seguridad import verify_password, create_access_token

router = APIRouter(prefix="/login", tags=["Autenticación"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login de usuario"""
    # Buscar usuario en la BD
    usuario = db.query(Usuario).filter(Usuario.usuario == request.usuario).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar contraseña
    if not verify_password(request.contrasena, usuario.contrasena_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )
    
    # Verificar si está activo
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Crear token
    access_token = create_access_token(
        data={"sub": usuario.usuario, "user_id": usuario.id_usuario}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}