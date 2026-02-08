"""
Cache Router - Endpoints for Supabase-backed extraction cache.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from config.logging_config import get_logger

logger = get_logger("cache_router")
router = APIRouter()


class CacheSetRequest(BaseModel):
    cache_key: str
    section: str
    text_hash: str
    data: dict


@router.get("/get/{cache_key}")
async def get_cached(cache_key: str):
    """Get cached extraction data."""
    try:
        from features.supabase.service import supabase_service
        result = supabase_service.get_cached_extraction(cache_key)
        return {"data": result}
    except Exception as e:
        logger.warning(f"Cache get error: {e}")
        return {"data": None}


@router.post("/set")
async def set_cached(request: CacheSetRequest):
    """Save extraction data to cache."""
    try:
        from features.supabase.service import supabase_service
        success = supabase_service.set_cached_extraction(
            request.cache_key, request.section,
            request.text_hash, request.data
        )
        return {"success": success}
    except Exception as e:
        logger.warning(f"Cache set error: {e}")
        return {"success": False}
