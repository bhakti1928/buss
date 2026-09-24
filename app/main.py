import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

from app.database import engine, Base
from app import models
from app.routers import student, buspass, admins, payment

# Create all database tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bus Pass Management System API",
    description="Backend API for College Student Bus Pass Management System with PostgreSQL/Supabase and SQLAlchemy",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(student.router)
app.include_router(buspass.router)
app.include_router(admins.router)
app.include_router(payment.router)

# Mount Frontend static files directory
FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

# 6. ROOT ENDPOINT (as explicitly requested)
@app.get("/", tags=["General"])
def root():
    return {
        "message": "Bus Pass API Running"
    }

# Convenient Web Portal shortcut
@app.get("/portal", tags=["General"])
def web_portal():
    return RedirectResponse(url="/frontend/index.html")

# System health and ping endpoint
@app.get("/health", tags=["General"])
def health_check():
    return {
        "status": "healthy",
        "service": "Bus Pass Management System",
        "docs": "/docs",
        "frontend": "/frontend/index.html"
    }
