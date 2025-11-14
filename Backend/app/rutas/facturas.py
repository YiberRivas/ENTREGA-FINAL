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

# ⚠️ SIN PREFIJO — se agrega desde main.py
router = APIRouter(tags=["Facturas"])

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
    persona: Optional[PersonaResponse] = None
    total: Decimal
    forma_pago: Optional[FormaPagoResponse] = None
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True


# =========================
# 🔹 CRUD BÁSICO
# =========================
@router.get("/", response_model=List[FacturaResponse])
def listar_facturas(db: Session = Depends(get_db)):
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
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.persona), joinedload(Factura.forma_pago))
        .filter(Factura.id_factura == id_factura)
        .first()
    )
    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    return factura


@router.put("/{id_factura}/estado")
def actualizar_estado_factura(id_factura: int, nuevo_estado: EstadoFactura, db: Session = Depends(get_db)):
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()

    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    factura.estado = nuevo_estado
    db.commit()

    return {"message": "Estado de factura actualizado correctamente"}


@router.get("/persona/{persona_id}", response_model=List[FacturaResponse])
def obtener_facturas_persona(persona_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Factura)
        .options(joinedload(Factura.persona), joinedload(Factura.forma_pago))
        .filter(Factura.persona_id == persona_id)
        .all()
    )


# =========================
# 🧾 VISTA HTML
# =========================
@router.get("/ver/{factura_id}", response_class=HTMLResponse)
def ver_factura(factura_id: int, db: Session = Depends(get_db)):
    factura = (
        db.query(Factura)
        .options(joinedload(Factura.persona))
        .filter(Factura.id_factura == factura_id)
        .first()
    )

    if not factura:
        return HTMLResponse("<h1>Factura no encontrada</h1>", status_code=404)

    cliente = factura.persona

    css_content = """
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f1f1f1; }
        .factura { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        h1 { color: #007bff; }
        p { margin: 6px 0; }
        hr { margin: 20px 0; }
    """

    html_template = Template("""
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Factura N° {{ factura.id_factura }}</title>
        <style>{{ css }}</style>
    </head>
    <body>
        <div class="factura">
            <h1>🧾 Factura N° {{ factura.id_factura }}</h1>
            <p><strong>Cliente:</strong> {{ cliente.nombres }} {{ cliente.apellidos }}</p>
            <p><strong>Correo:</strong> {{ cliente.correo }}</p>
            <p><strong>Total:</strong> ${{ "{:,.2f}".format(factura.total) }}</p>
            <p><strong>Estado:</strong> {{ factura.estado }}</p>
            <p><strong>Fecha:</strong> {{ factura.fecha.strftime("%d/%m/%Y %H:%M") }}</p>
            <hr>
            <p style="text-align:center;color:#666;">Gracias por confiar en nosotros - Servilavadora S.A.S</p>
        </div>
    </body>
    </html>
    """)

    return HTMLResponse(html_template.render(
        factura=factura,
        cliente=cliente,
        css=css_content
    ))
