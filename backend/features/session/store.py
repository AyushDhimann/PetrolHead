"""
Session Store - In-memory session tracking for research progress.
Thread-safe with expiry support.
"""

import threading
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from config.logging_config import get_logger

logger = get_logger("session_store")


class SessionStore:
    """Thread-safe in-memory session store with progress tracking."""

    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._results: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def create_session(self, session_id: str, query: str):
        """Create a new research session."""
        with self._lock:
            self._sessions[session_id] = {
                "session_id": session_id,
                "query": query,
                "status": "pending",
                "provider": None,
                "fallback_used": False,
                "fallback_reason": None,
                "progress_percent": 0,
                "current_message": "Initializing...",
                "thought_summaries": [],
                "started_at": datetime.now().isoformat(),
                "completed_at": None,
                "time_taken_seconds": None,
                "has_result": False,
                "created_at": datetime.now().isoformat(),
            }
        logger.info(f"[{session_id}] Session created for query: {query[:80]}...")

    def update_progress(self, session_id: str, update: Any):
        """Update session progress. Accepts dict or ProgressUpdate."""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                logger.warning(f"[{session_id}] Session not found for progress update")
                return

            if isinstance(update, dict):
                data = update
            else:
                data = {
                    "status": update.status.value if hasattr(update.status, 'value') else str(update.status),
                    "message": update.message,
                    "progress_percent": update.progress_percent,
                }
                if update.provider:
                    data["provider"] = update.provider
                if update.thought_summary:
                    data["thought_summary"] = update.thought_summary

            if "status" in data:
                status_val = data["status"]
                if hasattr(status_val, 'value'):
                    status_val = status_val.value
                session["status"] = status_val
            if "message" in data:
                session["current_message"] = data["message"]
            if "progress_percent" in data:
                session["progress_percent"] = data["progress_percent"]
            if "provider" in data:
                session["provider"] = data["provider"]
            if "thought_summary" in data and data["thought_summary"]:
                session["thought_summaries"].append(data["thought_summary"])

            if session["status"] in ("completed", "failed"):
                session["completed_at"] = datetime.now().isoformat()
                started = datetime.fromisoformat(session["started_at"])
                session["time_taken_seconds"] = (datetime.now() - started).total_seconds()

    def set_result(self, session_id: str, raw_text: str, json_data: Optional[dict], research_result: Any):
        """Store the final research result."""
        with self._lock:
            self._results[session_id] = {
                "raw_text": raw_text,
                "json_data": json_data,
                "provider_used": research_result.provider_used if hasattr(research_result, 'provider_used') else None,
                "fallback_used": research_result.fallback_used if hasattr(research_result, 'fallback_used') else False,
                "fallback_reason": research_result.fallback_reason if hasattr(research_result, 'fallback_reason') else None,
                "time_taken_seconds": research_result.time_taken_seconds if hasattr(research_result, 'time_taken_seconds') else None,
            }
            session = self._sessions.get(session_id)
            if session:
                session["has_result"] = True
                if research_result and hasattr(research_result, 'fallback_used'):
                    session["fallback_used"] = research_result.fallback_used
                    session["fallback_reason"] = research_result.fallback_reason

        logger.info(f"[{session_id}] Result stored (json: {json_data is not None})")

    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data."""
        with self._lock:
            return self._sessions.get(session_id, None)

    def get_result(self, session_id: str) -> Optional[dict]:
        """Get result data."""
        with self._lock:
            return self._results.get(session_id, None)

    def list_sessions(self) -> list:
        """List all active sessions."""
        with self._lock:
            return [
                {
                    "session_id": sid,
                    "query": s.get("query", "")[:80],
                    "status": s.get("status"),
                    "progress_percent": s.get("progress_percent", 0),
                    "has_result": s.get("has_result", False),
                    "started_at": s.get("started_at"),
                }
                for sid, s in self._sessions.items()
            ]

    def cleanup_expired(self, expiry_hours: int = 24):
        """Remove expired sessions."""
        cutoff = datetime.now() - timedelta(hours=expiry_hours)
        with self._lock:
            expired = [
                sid for sid, s in self._sessions.items()
                if datetime.fromisoformat(s["created_at"]) < cutoff
            ]
            for sid in expired:
                del self._sessions[sid]
                self._results.pop(sid, None)
                logger.info(f"Cleaned up expired session: {sid}")


# Global singleton
session_store = SessionStore()
