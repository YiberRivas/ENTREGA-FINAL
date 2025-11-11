from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.config.database import get_db
from app.modelos.modelos import Factura, EstadoFactura
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from jinja2 import Template

# ✅ Router principal
router = APIRouter(prefix="/facturas", tags=["Facturas"])

# =========================
# 📦 ESQUEMAS
# =========================
class PersonaResponse(BaseModel):
    id_persona: int
    nombres: str
    apellidos: str
    correo: str

    class Config:
        from_attributes = True


class FormaPagoResponse(BaseModel):
    id_forma_pago: int
    nombre_forma: str

    class Config:
        from_attributes = True


class FacturaCreate(BaseModel):
    persona_id: int
    total: Decimal
    forma_pago_id: Optional[int] = 1  # Valor por defecto


class FacturaResponse(BaseModel):
    id_factura: int
    persona: Optional [PersonaResponse] = None
    total: Decimal
    forma_pago: Optional[FormaPagoResponse] = None
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True


# =========================
# 🔹 CRUD BÁSICO DE FACTURAS
# =========================
@router.get("/", response_model=List[FacturaResponse])
def listar_facturas(db: Session = Depends(get_db)):
    """Listar todas las facturas con datos del cliente y forma de pago"""
    try:
        facturas = (
            db.query(Factura)
            .options(joinedload(Factura.persona), joinedload(Factura.forma_pago))
            .all()
        )
        return facturas
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener facturas: {str(e)}"
        )


@router.post("/", response_model=FacturaResponse, status_code=status.HTTP_201_CREATED)
def crear_factura(factura: FacturaCreate, db: Session = Depends(get_db)):
    """Crear una nueva factura"""
    try:
        nueva_factura = Factura(
            persona_id=factura.persona_id,
            total=factura.total,
            forma_pago_id=factura.forma_pago_id,
            fecha=datetime.now(),
            estado=EstadoFactura.emitida,
        )
        db.add(nueva_factura)
        db.commit()
        db.refresh(nueva_factura)
        return nueva_factura
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear factura: {str(e)}"
        )


@router.get("/{id_factura}", response_model=FacturaResponse)
def obtener_factura(id_factura: int, db: Session = Depends(get_db)):
    """Obtener una factura por ID"""
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.persona), joinedload(Factura.forma_pago))
        .filter(Factura.id_factura == id_factura)
        .first()
    )
    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Factura no encontrada"
        )
    return factura


@router.put("/{id_factura}/estado")
def actualizar_estado_factura(
    id_factura: int, nuevo_estado: EstadoFactura, db: Session = Depends(get_db)
):
    """Actualizar estado de una factura"""
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()
    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Factura no encontrada"
        )

    factura.estado = nuevo_estado
    db.commit()
    return {"message": "Estado de factura actualizado correctamente"}


@router.get("/persona/{persona_id}", response_model=List[FacturaResponse])
def obtener_facturas_persona(persona_id: int, db: Session = Depends(get_db)):
    """Obtener todas las facturas de una persona"""
    return (
        db.query(Factura)
        .options(joinedload(Factura.persona), joinedload(Factura.forma_pago))
        .filter(Factura.persona_id == persona_id)
        .all()
    )


# =========================
# 🧾 VISTA HTML DE FACTURA
# =========================
@router.get("/ver/{factura_id}", response_class=HTMLResponse)
def ver_factura(factura_id: int, db: Session = Depends(get_db)):
    """Vista HTML de una factura específica (para QR o navegador)"""
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.persona))
        .filter(Factura.id_factura == factura_id)
        .first()
    )
    if not factura:
        return HTMLResponse("<h1>Factura no encontrada</h1>", status_code=404)

    cliente = factura.persona

    # CSS básico inline
    css_content = """
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .factura {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #17a2b8; }
        .info { margin: 10px 0; }
        hr { margin: 20px 0; }
    """

    html_template = Template("""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura N° {{ factura.id_factura }}</title>
        <style>{{ css }}</style>
    </head>
    <body>
        <div class="factura">
            <h1>🧾 Factura N° {{ factura.id_factura }}</h1>
            <div class="info">
                <p><strong>Cliente:</strong> {{ cliente.nombres }} {{ cliente.apellidos }}</p>
                <p><strong>Correo:</strong> {{ cliente.correo }}</p>
                <p><strong>Total:</strong> ${{ "{:,.2f}".format(factura.total) }}</p>
                <p><strong>Estado:</strong> {{ factura.estado }}</p>
                <p><strong>Fecha:</strong> {{ factura.fecha.strftime("%d/%m/%Y %H:%M") }}</p>
            </div>
            <hr>
            <p style="text-align: center; color: #666;">
                Gracias por su compra - Servilavadora S.A.S
            </p>
        </div>
    </body>
    </html>
    """)

    html_content = html_template.render(
        factura=factura, 
        cliente=cliente, 
        css=css_content
    )

    return HTMLResponse(content=html_content)