from pydantic import BaseModel
from typing import Optional

class UsuarioBase(BaseModel):
    usuario: str

class UsuarioCrear(UsuarioBase):
    contrasena: str
    persona_id: Optional[int] = None

class UsuarioRespuesta(UsuarioBase):
    id_usuario: int
    activo: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
