"""
Session Router - Endpoints for session and progress tracking.
"""

from fastapi import APIRouter, HTTPException
from config.logging_config import get_logger
from features.session.store import session_store

logger = get_logger("session_router")
router = APIRouter()


@router.get("/list")
async def list_sessions():
    """List all active research sessions."""
    sessions = session_store.list_sessions()
    return {"sessions": sessions, "count": len(sessions)}


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get session status and progress."""
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/result")
async def get_session_result(session_id: str):
    """Get session result data."""
    result = session_store.get_result(session_id)
    if not result:
        session = session_store.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return {
            "session_id": session_id,
            "status": session.get("status"),
            "has_result": False,
            "message": session.get("current_message", ""),
        }
    return {
        "session_id": session_id,
        "has_result": True,
        **result,
    }
