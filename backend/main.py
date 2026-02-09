"""
PetrolHead Backend - FastAPI Application Entry Point
"""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.settings import get_settings
from config.logging_config import setup_logging, get_logger
from features.research.router import router as research_router
from features.converter.router import router as converter_router
from features.dashboard.router import router as dashboard_router
from features.session.router import router as session_router
from features.cache.router import router as cache_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - startup and shutdown."""
    logger = get_logger("main")
    settings = get_settings()
    setup_logging(settings)
    logger.info("=" * 60)
    logger.info("PETROLHEAD Backend Starting")
    logger.info(f"Primary Provider: {settings.PRIMARY_PROVIDER}")
    logger.info(f"Fallback Provider: {settings.FALLBACK_PROVIDER}")
    logger.info(f"Demo Mode: {settings.DEMO_MODE_ENABLED}")
    logger.info(f"Streaming: {settings.FEATURE_STREAMING_UI}")
    logger.info("=" * 60)

    # Create output directories
    os.makedirs(os.path.join(settings.OUTPUTS_DIR, "research"), exist_ok=True)
    os.makedirs(os.path.join(settings.OUTPUTS_DIR, "converted"), exist_ok=True)
    os.makedirs(os.path.join(settings.OUTPUTS_DIR, "logs"), exist_ok=True)
    os.makedirs(os.path.join(settings.OUTPUTS_DIR, "interactions"), exist_ok=True)

    yield

    logger.info("PETROLHEAD Backend Shutting Down")


app = FastAPI(
    title="PetrolHead - Fuel Station Profile Dashboard API",
    description="AI-powered deep research & dashboard generation for fuel stations",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(research_router, prefix="/api/research", tags=["Research"])
app.include_router(converter_router, prefix="/api/converter", tags=["Converter"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(session_router, prefix="/api/session", tags=["Session"])
app.include_router(cache_router, prefix="/api/cache", tags=["Cache"])


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "petrolhead-backend",
        "primary_provider": settings.PRIMARY_PROVIDER,
        "demo_mode": settings.DEMO_MODE_ENABLED,
    }
