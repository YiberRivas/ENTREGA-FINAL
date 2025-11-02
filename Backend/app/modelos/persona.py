from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base

class Persona(Base):
    __tablename__ = "persona"

    id_persona = Column(Integer, primary_key=True, index=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    tipo_identificacion_id = Column(Integer, nullable=False)
    identificacion = Column(String(50), unique=True, nullable=False)
    direccion_id = Column(Integer, nullable=True)
    telefono = Column(String(20), nullable=True)
    correo = Column(String(100), unique=True, nullable=False)
    rol_id = Column(Integer, nullable=False)
    fecha_registro = Column(String(50), nullable=True)

    usuario = relationship("Usuario", back_populates="persona", uselist=False)

