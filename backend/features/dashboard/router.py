"""
Dashboard Router - Endpoints for serving dashboard data (demo + live).
"""

from fastapi import APIRouter, HTTPException
from config.logging_config import get_logger
from features.dashboard.service import dashboard_service
from features.session.store import session_store

logger = get_logger("dashboard_router")
router = APIRouter()


@router.get("/demos")
async def list_demos():
    """List all available demo dashboards."""
    return {
        "demos": dashboard_service.get_demo_list(),
        "count": len(dashboard_service.get_demo_list()),
    }


@router.get("/demo/{demo_id}")
async def get_demo(demo_id: str):
    """Get demo dashboard JSON data."""
    data = dashboard_service.get_demo_data(demo_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Demo {demo_id} not found")
    return {
        "demo_id": demo_id,
        "data": data,
    }


@router.get("/demo/{demo_id}/text")
async def get_demo_text(demo_id: str):
    """Get demo plaintext report."""
    text = dashboard_service.get_demo_text(demo_id)
    if text is None:
        raise HTTPException(status_code=404, detail=f"Demo text {demo_id} not found")
    return {
        "demo_id": demo_id,
        "text": text,
    }


@router.get("/live/{session_id}")
async def get_live_dashboard(session_id: str):
    """Get live research dashboard JSON data."""
    data = dashboard_service.get_live_dashboard(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Dashboard not ready or not found")
    return {
        "session_id": session_id,
        "data": data,
    }


@router.get("/past-researches")
async def list_past_researches():
    """List all past research sessions (from Supabase or memory)."""
    # Try Supabase first via session_store
    sessions = session_store.list_sessions()
    return {
        "researches": sessions,
        "count": len(sessions),
    }
