"""
Supabase Client — singleton for database operations.
"""

import traceback
from typing import Optional
from config.settings import get_settings
from config.logging_config import get_logger

logger = get_logger("supabase_client")

_client = None
_init_failed = False  # Sentinel to stop retrying after failure


def get_supabase():
    """Get or create Supabase client singleton."""
    global _client, _init_failed
    settings = get_settings()

    if not settings.SUPABASE_ENABLED:
        return None

    if _init_failed:
        return None

    if _client is None:
        try:
            from supabase import create_client
            _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully")
        except ImportError as e:
            _init_failed = True
            logger.error(f"supabase import failed: {e}\n{traceback.format_exc()}")
            return None
        except Exception as e:
            _init_failed = True
            logger.error(f"Supabase init failed: {e}\n{traceback.format_exc()}")
            return None

    return _client
