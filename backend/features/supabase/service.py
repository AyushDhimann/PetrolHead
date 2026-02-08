"""
Supabase Service — CRUD for research sessions, results, and progress logs.
Falls back gracefully if Supabase is disabled or unavailable.
"""

import json
from typing import Optional, List, Any
from datetime import datetime

from config.logging_config import get_logger
from features.supabase.client import get_supabase

logger = get_logger("supabase_service")


class SupabaseService:
    """Persistence layer for research sessions using Supabase."""

    def _db(self):
        return get_supabase()

    # ── Sessions ──────────────────────────────────────────────

    def create_session(self, session_id: str, query: str, provider: str = None) -> bool:
        db = self._db()
        if not db:
            return False
        try:
            db.table("research_sessions").insert({
                "session_id": session_id,
                "query": query,
                "status": "pending",
                "provider": provider,
                "progress_percent": 0,
                "current_message": "Initializing...",
                "thought_summaries": [],
            }).execute()
            logger.info(f"[{session_id}] Session persisted to Supabase")
            return True
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to persist session: {e}")
            return False

    def update_session(self, session_id: str, data: dict) -> bool:
        db = self._db()
        if not db:
            return False
        try:
            # Convert enums to strings
            clean = {}
            for k, v in data.items():
                if hasattr(v, "value"):
                    clean[k] = v.value
                elif isinstance(v, list):
                    clean[k] = v
                else:
                    clean[k] = v

            db.table("research_sessions").update(clean).eq("session_id", session_id).execute()
            return True
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to update session: {e}")
            return False

    def get_session(self, session_id: str) -> Optional[dict]:
        db = self._db()
        if not db:
            return None
        try:
            res = db.table("research_sessions").select("*").eq("session_id", session_id).single().execute()
            return res.data
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to get session from Supabase: {e}")
            return None

    def list_sessions(self, limit: int = 50) -> List[dict]:
        db = self._db()
        if not db:
            return []
        try:
            res = db.table("research_sessions").select(
                "session_id, query, status, progress_percent, has_result, provider, started_at, completed_at"
            ).order("created_at", desc=True).limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.warning(f"Failed to list sessions: {e}")
            return []

    # ── Results ───────────────────────────────────────────────

    def save_result(self, session_id: str, raw_text: str, json_data: Optional[dict],
                    provider_used: str, fallback_used: bool = False,
                    fallback_reason: str = None, time_taken: float = None) -> bool:
        db = self._db()
        if not db:
            return False
        try:
            db.table("research_results").upsert({
                "session_id": session_id,
                "raw_text": raw_text,
                "json_data": json_data,
                "provider_used": provider_used,
                "fallback_used": fallback_used,
                "fallback_reason": fallback_reason,
                "time_taken_seconds": time_taken,
            }).execute()
            logger.info(f"[{session_id}] Result persisted to Supabase")
            return True
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to persist result: {e}")
            return False

    def get_result(self, session_id: str) -> Optional[dict]:
        db = self._db()
        if not db:
            return None
        try:
            res = db.table("research_results").select("*").eq("session_id", session_id).single().execute()
            return res.data
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to get result from Supabase: {e}")
            return None

    # ── Progress Logs ─────────────────────────────────────────

    def add_log(self, session_id: str, log_type: str, message: str,
                progress: int = 0, provider: str = None, metadata: dict = None) -> bool:
        db = self._db()
        if not db:
            return False
        try:
            db.table("research_logs").insert({
                "session_id": session_id,
                "log_type": log_type,
                "message": message,
                "progress_percent": progress,
                "provider": provider,
                "metadata": metadata or {},
            }).execute()
            return True
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to add log: {e}")
            return False

    def get_logs(self, session_id: str, limit: int = 100) -> List[dict]:
        db = self._db()
        if not db:
            return []
        try:
            res = db.table("research_logs").select("*").eq(
                "session_id", session_id
            ).order("created_at", desc=False).limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.warning(f"[{session_id}] Failed to get logs: {e}")
            return []

    # ── Extraction Cache ──────────────────────────────────────

    def get_cached_extraction(self, cache_key: str) -> Optional[dict]:
        """Get cached extraction data by cache key."""
        db = self._db()
        if not db:
            return None
        try:
            res = db.table("extraction_cache").select("extracted_data").eq(
                "cache_key", cache_key
            ).single().execute()
            if res.data:
                return res.data.get("extracted_data")
            return None
        except Exception as e:
            logger.debug(f"Cache miss for {cache_key}: {e}")
            return None

    def set_cached_extraction(self, cache_key: str, section: str,
                               text_hash: str, data: dict) -> bool:
        """Save extraction result to cache."""
        db = self._db()
        if not db:
            return False
        try:
            db.table("extraction_cache").upsert({
                "cache_key": cache_key,
                "section": section,
                "text_hash": text_hash,
                "extracted_data": data,
            }).execute()
            logger.info(f"Cached extraction: {cache_key}")
            return True
        except Exception as e:
            logger.warning(f"Failed to cache extraction {cache_key}: {e}")
            return False

    # ── Past Researches ───────────────────────────────────────

    def list_past_researches(self, limit: int = 50) -> List[dict]:
        """List past research sessions with their result info."""
        db = self._db()
        if not db:
            return []
        try:
            res = db.table("research_sessions").select(
                "session_id, query, status, provider, fallback_used, "
                "progress_percent, has_result, started_at, completed_at, "
                "time_taken_seconds, created_at"
            ).order("created_at", desc=True).limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.warning(f"Failed to list past researches: {e}")
            return []


# Singleton
supabase_service = SupabaseService()
