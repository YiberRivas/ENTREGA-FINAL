from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from app.config.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(80), unique=True, nullable=False)
    contrasena_hash = Column(String(255), nullable=False)
    persona_id = Column(Integer, ForeignKey("persona.id_persona"))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP)

    persona = relationship("Persona", back_populates="usuario")
""" -------------------------------------------------------------------------------------------------------- """


