"""
Research Router - FastAPI endpoints for deep research operations.
"""

import uuid
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException

from config.settings import get_settings
from config.logging_config import get_logger
from features.research.models import ResearchRequest, ResearchStatusResponse, ResearchStatus
from features.research.service import research_service
from features.converter.service import converter_service
from features.session.store import session_store

logger = get_logger("research_router")
router = APIRouter()


@router.post("/start")
async def start_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """
    Start a new deep research session.
    Returns session ID immediately, research runs in background.
    """
    settings = get_settings()
    session_id = str(uuid.uuid4())

    logger.info(f"New research request: query='{request.query[:80]}...', session={session_id}")

    # Initialize session
    session_store.create_session(session_id, request.query)

    # Run research in background
    background_tasks.add_task(_run_research_pipeline, session_id, request.query)

    return {
        "session_id": session_id,
        "status": "started",
        "message": f"Research started with {settings.PRIMARY_PROVIDER}",
        "provider": settings.PRIMARY_PROVIDER,
    }


async def _run_research_pipeline(session_id: str, query: str):
    """Full pipeline: research → convert → save."""
    try:
        # Step 1: Deep research
        result = await research_service.run_research(query, session_id)

        if result.status == ResearchStatus.COMPLETED and result.raw_text:
            # Step 2: Convert to JSON
            session_store.update_progress(session_id, {
                "status": ResearchStatus.CONVERTING,
                "message": "Converting research report to dashboard JSON...",
                "progress_percent": 85,
            })

            json_data = await converter_service.convert_to_dashboard_json(
                result.raw_text, session_id
            )

            if json_data:
                session_store.set_result(session_id, result.raw_text, json_data, result)
                session_store.update_progress(session_id, {
                    "status": ResearchStatus.COMPLETED,
                    "message": "Dashboard ready!",
                    "progress_percent": 100,
                })
            else:
                # JSON conversion failed, still mark as completed with raw text
                session_store.set_result(session_id, result.raw_text, None, result)
                session_store.update_progress(session_id, {
                    "status": ResearchStatus.COMPLETED,
                    "message": "Research complete (JSON conversion pending)",
                    "progress_percent": 95,
                })
        else:
            session_store.update_progress(session_id, {
                "status": ResearchStatus.FAILED,
                "message": "Research failed. Please try again.",
                "progress_percent": 0,
            })

    except Exception as e:
        logger.error(f"[{session_id}] Pipeline error: {e}", exc_info=True)
        session_store.update_progress(session_id, {
            "status": ResearchStatus.FAILED,
            "message": f"Pipeline error: {str(e)}",
            "progress_percent": 0,
        })


@router.get("/status/{session_id}")
async def get_research_status(session_id: str):
    """Get the current status of a research session."""
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/result/{session_id}")
async def get_research_result(session_id: str):
    """Get the complete result of a research session."""
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = session_store.get_result(session_id)
    if not result:
        return {
            "session_id": session_id,
            "status": session.get("status", "unknown"),
            "has_result": False,
        }

    return {
        "session_id": session_id,
        "status": "completed",
        "has_result": True,
        "json_data": result.get("json_data"),
        "raw_text": result.get("raw_text"),
        "provider_used": result.get("provider_used"),
        "fallback_used": result.get("fallback_used", False),
        "fallback_reason": result.get("fallback_reason"),
        "time_taken_seconds": result.get("time_taken_seconds"),
    }
