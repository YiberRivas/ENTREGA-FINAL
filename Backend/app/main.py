from fastapi import FastAPI
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import SessionLocal
from app.modelos.modelos import Rol

# Importar todas las rutas
from app.rutas import (
    autenticacion, usuarios, personas, servicios, agendamientos,
    facturas, pagos, formas_pago, roles, admin_dashboard,
    cliente_dashboard, clientes
)

app = FastAPI(
    title="API Servicio Lavadoras",
    version="1.0.0",
    description="API completa para gestión de servicios de lavandería"
)

# Configuración CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga de rutas
routers_map = {
    "autenticacion": autenticacion.router,
    "usuarios": usuarios.router,
    "personas": personas.router,
    "servicios": servicios.router,
    "agendamientos": agendamientos.router,
    "facturas": facturas.router,
    "pagos": pagos.router,
    "formas_pago": formas_pago.router,
    "roles": roles.router,
    "admin_dashboard": admin_dashboard.router,
    "cliente_dashboard": cliente_dashboard.router,
    "clientes": clientes.router
}

router_prefixes = {
    "autenticacion": "/autenticacion",
    "usuarios": "/usuarios",
    "personas": "/personas",
    "servicios": "/servicios",
    "agendamientos": "/agendamientos",
    "facturas": "/facturas",
    "pagos": "/pagos",
    "formas_pago": "/formas_pago",
    "roles": "/roles",
    "admin_dashboard": "/admin",
    "cliente_dashboard": "/cliente",
    "clientes": "/clientes",
}

for name, router in routers_map.items():
    prefix = router_prefixes.get(name, f"/{name}")
    app.include_router(router, prefix=prefix)
    print(f"✅ Router '{name}' cargado en: {prefix}")

@app.get("/")
def root():
    return {
        "message": "API Servicio Lavadoras funcionando correctamente 🚀",
        "version": "1.0.0",
        "docs": "/docs",
        "routers": list(router_prefixes.values())
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

def crear_roles_base():
    db: Session = SessionLocal()
    try:
        roles = ["Administrador", "Cliente"]
        for nombre in roles:
            if not db.query(Rol).filter(Rol.nombre_rol == nombre).first():
                nuevo_rol = Rol(nombre_rol=nombre)
                db.add(nuevo_rol)
        db.commit()
        print("✅ Roles base creados correctamente.")
    except Exception as e:
        print(f"⚠️ Error al crear roles base: {e}")
    finally:
        db.close()

crear_roles_base()


# estoy editanto este archivo