"""
Converter Router - Endpoints for plaintext-to-JSON conversion.
"""

from fastapi import APIRouter, HTTPException
from config.logging_config import get_logger
from features.converter.models import ConvertRequest, ConvertResponse
from features.converter.service import converter_service

logger = get_logger("converter_router")
router = APIRouter()


@router.post("/convert", response_model=ConvertResponse)
async def convert_report(request: ConvertRequest):
    """Convert a plaintext research report to dashboard JSON."""
    session_id = request.session_id or "manual"
    logger.info(f"[{session_id}] Manual conversion request: {len(request.text)} chars")

    try:
        json_data = await converter_service.convert_to_dashboard_json(
            request.text, session_id
        )
        if json_data:
            return ConvertResponse(
                session_id=session_id,
                status="completed",
                json_data=json_data,
            )
        else:
            return ConvertResponse(
                session_id=session_id,
                status="failed",
                error="Failed to convert report to JSON",
            )
    except Exception as e:
        logger.error(f"[{session_id}] Conversion endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
