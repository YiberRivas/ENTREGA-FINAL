from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

# Esquema para registrar usuario
class PersonaCreate(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    telefono: Optional[str] = None
    tipo_identificacion_id: int = 1
    direccion_id: Optional[int] = None
    rol_id: int = 1
    fecha_registro: date

class UsuarioCreate(BaseModel):
    usuario: str
    contrasena: str
    persona: PersonaCreate

# Esquema para login
class LoginRequest(BaseModel):
    usuario: str
    contrasena: str

# Esquema de respuesta
class Token(BaseModel):
    access_token: str
    token_type: str

class UsuarioResponse(BaseModel):
    id_usuario: int
    usuario: str
    persona_id: Optional[int] = None
    activo: bool

    class Config:
        from_attributes = True