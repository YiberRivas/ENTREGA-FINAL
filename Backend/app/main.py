from fastapi import FastAPI
from app.rutas import usuarios, agendamientos, autenticacion
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo a ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(usuarios.router)
app.include_router(agendamientos.router)
app.include_router(autenticacion.router)
