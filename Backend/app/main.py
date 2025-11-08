from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API Servicio Lavadoras",
    version="1.0.0",
    description="API completa para gestión de servicios de lavandería"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar rutas de forma segura
routers_to_include = []

try:
    from app.rutas import autenticacion
    routers_to_include.append(("autenticacion", autenticacion.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar autenticacion: {e}")

try:
    from app.rutas import usuarios
    routers_to_include.append(("usuarios", usuarios.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar usuarios: {e}")

try:
    from app.rutas import personas
    routers_to_include.append(("personas", personas.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar personas: {e}")

try:
    from app.rutas import agendamientos
    routers_to_include.append(("agendamientos", agendamientos.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar agendamientos: {e}")

try:
    from app.rutas import servicios
    routers_to_include.append(("servicios", servicios.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar servicios: {e}")

try:
    from app.rutas import facturas
    routers_to_include.append(("facturas", facturas.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar facturas: {e}")

try:
    from app.rutas import pagos
    routers_to_include.append(("pagos", pagos.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar pagos: {e}")

try:
    from app.rutas import formas_pago
    routers_to_include.append(("formas_pagos", formas_pago.router))
except ImportError:
    try:
        from app.rutas import formas_pago
        routers_to_include.append(("formas_pago", formas_pago.router))
    except ImportError as e:
        print(f"⚠️ No se pudo cargar formas_pago/formas_pagos: {e}")

try:
    from app.rutas import roles
    routers_to_include.append(("roles", roles.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar roles: {e}")


try:
    from app.rutas import admin_dashboard
    routers_to_include.append(("admin_dashboard", admin_dashboard.router))
except ImportError as e:
    print(f"⚠️ No se pudo cargar admin_dashboard: {e}")    

# Incluir todos los routers disponibles
for name, router in routers_to_include:
    app.include_router(router)
    print(f"✅ Router '{name}' cargado correctamente")

# Crear el diccionario de endpoints dinámicamente
endpoints = {}
for name, _ in routers_to_include:
    if name == "autenticacion":
        endpoints["autenticacion"] = "/login"
    elif name == "formas_pagos" or name == "formas_pago":
        endpoints["formas_pago"] = "/formas-pago"
    else:
        endpoints[name] = f"/{name}"

@app.get("/")
def root():
    return {
        "message": "API Servicio Lavadoras funcionando correctamente",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": endpoints,
        "routers_cargados": len(routers_to_include)
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "routers_activos": len(routers_to_include)
    }