from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

# ===============================
#   ESQUEMAS DE PERSONA
# ===============================
class PersonaBase(BaseModel):
    nombres: str
    apellidos: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    tipo_identificacion_id: int
    identificacion: Optional[str] = None
    telefono: Optional[str] = None
    correo: EmailStr
    direccion_id: Optional[int] = None
    rol_id: int = 1
    fecha_registro: Optional[date] = None


class PersonaCreate(PersonaBase):
    """Esquema para registrar una nueva persona."""
    pass


class PersonaResponse(PersonaBase):
    id_persona: int

    class Config:
        from_attributes = True


# ===============================
#   ESQUEMAS DE USUARIO
# ===============================
class UsuarioCreate(BaseModel):
    usuario: str
    contrasena: str
    persona: PersonaCreate


class UsuarioResponse(BaseModel):
    id_usuario: int
    usuario: str
    persona_id: Optional[int] = None
    activo: bool

    class Config:
        from_attributes = True


# ===============================
#   ESQUEMA LOGIN Y TOKEN
# ===============================
class LoginRequest(BaseModel):
    usuario: str
    contrasena: str


class Token(BaseModel):
    access_token: str
    token_type: str
