from sqlalchemy import (
    Column, Integer, String, Date, Time, Text, Enum, Boolean,
    ForeignKey, TIMESTAMP, DECIMAL, Float, DateTime
)
from datetime import datetime
from sqlalchemy.orm import relationship
from app.config.database import Base
import enum


# ---------------------------
# ENUMS
# ---------------------------
class EstadoAgendamiento(str, enum.Enum):
    pendiente = "pendiente"
    confirmado = "confirmado"
    en_proceso = "en_proceso"
    finalizado = "finalizado"
    cancelado = "cancelado"


class EstadoFactura(str, enum.Enum):
    emitida = "emitida"
    pagada = "pagada"
    anulada = "anulada"


class EstadoPago(str, enum.Enum):
    pendiente = "Pendiente"
    completado = "Completado"
    fallido = "Fallido"


# ---------------------------
# MODELOS BASE
# ---------------------------
class Direccion(Base):
    __tablename__ = "direccion"

    id_direccion = Column(Integer, primary_key=True, autoincrement=True)
    ciudad = Column(String(100))
    barrio = Column(String(100))
    direccion_detalle = Column(String(255))
    telefono = Column(String(20))

    personas = relationship("Persona", back_populates="direccion")


class Rol(Base):
    __tablename__ = "rol"

    id_rol = Column(Integer, primary_key=True, autoincrement=True)
    nombre_rol = Column(String(50), nullable=False)
    descripcion = Column(String(255))

    # Relaciones
    usuarios = relationship("Usuario", back_populates="rol")
    personas = relationship("Persona", back_populates="rol")


class Persona(Base):
    __tablename__ = "persona"

    id_persona = Column(Integer, primary_key=True, autoincrement=True)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100))
    fecha_nacimiento = Column(Date)
    tipo_identificacion_id = Column(Integer, ForeignKey("tipo_identificacion.id_tipo_identificacion"))
    identificacion = Column(String(50), unique=True)
    direccion_id = Column(Integer, ForeignKey("direccion.id_direccion"))
    telefono = Column(String(20))
    correo = Column(String(150))
    rol_id = Column(Integer, ForeignKey("rol.id_rol"))
    fecha_registro = Column(TIMESTAMP)

    tipo_identificacion = relationship("TipoIdentificacion", back_populates="personas")
    direccion = relationship("Direccion", back_populates="personas")
    rol = relationship("Rol", back_populates="personas")
    usuarios = relationship("Usuario", back_populates="persona")
    agendamientos = relationship("Agendamiento", back_populates="persona")
    facturas = relationship("Factura", back_populates="persona")


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    usuario = Column(String(80), unique=True, nullable=False)
    contrasena_hash = Column(String(255), nullable=False)
    persona_id = Column(Integer, ForeignKey("persona.id_persona"))
    rol_id = Column(Integer, ForeignKey("rol.id_rol"))  
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP)

    # Relaciones
    persona = relationship("Persona", back_populates="usuarios")
    rol = relationship("Rol", back_populates="usuarios")



class TipoIdentificacion(Base):
    __tablename__ = "tipo_identificacion"

    id_tipo_identificacion = Column(Integer, primary_key=True, autoincrement=True)
    nombre_tipo = Column(String(50), nullable=False)
    abreviacion = Column(String(10))

    personas = relationship("Persona", back_populates="tipo_identificacion")




class Servicio(Base):
    __tablename__ = "servicio"

    id_servicio = Column(Integer, primary_key=True, autoincrement=True)
    nombre_servicio = Column(String(120), nullable=False)
    descripcion = Column(Text)
    precio_base = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    duracion_minutos = Column(Integer, default=60)
    activo = Column(Boolean, default=True)

    agendamientos = relationship("Agendamiento", back_populates="servicio")


class Agendamiento(Base):
    __tablename__ = "agendamiento"

    id_agendamiento = Column(Integer, primary_key=True, autoincrement=True)
    persona_id = Column(Integer, ForeignKey("persona.id_persona"), nullable=False)
    servicio_id = Column(Integer, ForeignKey("servicio.id_servicio"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    estado = Column(Enum(EstadoAgendamiento), default=EstadoAgendamiento.pendiente)
    creado_en = Column(TIMESTAMP, default=datetime.now)
    observaciones = Column(Text)

    hora_inicio = Column(DateTime, nullable=True)
    hora_fin = Column(DateTime, nullable=True)
    horas_facturadas = Column(Float, nullable=True)

    estado = Column(Enum(EstadoAgendamiento), default=EstadoAgendamiento.pendiente)
    creado_en = Column(DateTime)

    persona = relationship("Persona", back_populates="agendamientos")
    servicio = relationship("Servicio", back_populates="agendamientos")
    
    # ✅ Relación nueva para conectar factura con agendamiento
    factura = relationship("Factura", back_populates="agendamiento", uselist=False)

 



# Agrega esta clase al final del archivo modelos.py

class FinalizacionServicio(Base):
    __tablename__ = "finalizacion_servicio"

    id_finalizacion = Column(Integer, primary_key=True, autoincrement=True)
    agendamiento_id = Column(Integer, ForeignKey("agendamiento.id_agendamiento"), nullable=False)
    fecha_finalizacion = Column(TIMESTAMP, default=datetime.now)
    observaciones = Column(Text)
    calificacion = Column(Integer) 

    agendamiento = relationship("Agendamiento", backref="finalizaciones")

class FormaPago(Base):
    __tablename__ = "forma_pago"

    id_forma_pago = Column(Integer, primary_key=True, autoincrement=True)
    nombre_forma = Column(String(80), nullable=False)
    descripcion = Column(String(255))

    facturas = relationship("Factura", back_populates="forma_pago")
    pagos = relationship("Pago", back_populates="forma_pago")


class Factura(Base):
    __tablename__ = "factura"

    id_factura = Column(Integer, primary_key=True, autoincrement=True)
    persona_id = Column(Integer, ForeignKey("persona.id_persona"))
    agendamiento_id = Column(Integer, ForeignKey("agendamiento.id_agendamiento"))  # ← AGREGAR
    fecha = Column(TIMESTAMP)
    total = Column(DECIMAL(12, 2), default=0.00)
    forma_pago_id = Column(Integer, ForeignKey("forma_pago.id_forma_pago"))
    estado = Column(Enum(EstadoFactura), default=EstadoFactura.emitida)

    persona = relationship("Persona", back_populates="facturas")
    forma_pago = relationship("FormaPago", back_populates="facturas")
    pagos = relationship("Pago", back_populates="factura")
    agendamiento = relationship("Agendamiento")






class Pago(Base):
    __tablename__ = "pago"

    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    id_factura = Column(Integer, ForeignKey("factura.id_factura"))
    id_forma_pago = Column(Integer, ForeignKey("forma_pago.id_forma_pago"))
    monto = Column(DECIMAL(10, 2))
    fecha_pago = Column(TIMESTAMP)
    estado = Column(Enum(EstadoPago), default=EstadoPago.pendiente)

    factura = relationship("Factura", back_populates="pagos")
    forma_pago = relationship("FormaPago", back_populates="pagos")
