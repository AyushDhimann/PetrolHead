"""
Pydantic Settings - loads all configuration from backend/.env
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from pathlib import Path


def _find_env_file() -> str:
    """Find the .env file relative to this config file."""
    config_dir = Path(__file__).parent
    backend_dir = config_dir.parent
    env_path = backend_dir / ".env"
    return str(env_path) if env_path.exists() else ""


class Settings(BaseSettings):
    # API Keys
    GEMINI_API_KEY: str = ""
    PERPLEXITY_API_KEY: str = ""

    # GCP
    GCP_PROJECT_NAME: str = ""
    GCP_PROJECT_NUMBER: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_ENABLED: bool = False

    # Provider
    PRIMARY_PROVIDER: str = "perplexity"
    FALLBACK_PROVIDER: str = "perplexity"
    AUTO_FALLBACK_ENABLED: bool = True

    # Gemini
    GEMINI_DEEP_RESEARCH_AGENT: str = "deep-research-pro-preview-12-2025"
    GEMINI_FLASH_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_THINKING_SUMMARIES: str = "auto"
    GEMINI_STREAM_ENABLED: bool = True
    GEMINI_POLL_INTERVAL_SECONDS: int = 10
    GEMINI_MAX_WAIT_MINUTES: int = 20
    GEMINI_STORE_INTERACTIONS: bool = True

    # Perplexity
    PERPLEXITY_MODEL: str = "sonar-deep-research"
    PERPLEXITY_STREAM_ENABLED: bool = True
    PERPLEXITY_MAX_TOKENS: int = 16000
    PERPLEXITY_REASONING_EFFORT: str = "high"

    # Converter
    CONVERTER_MODEL: str = "gemini-2.5-flash-lite"
    CONVERTER_ENABLED: bool = True
    CONVERTER_SKIP_IF_JSON: bool = True

    # Demo
    DEMO_MODE_ENABLED: bool = True
    DEMO_OUTPUTS_DIR: str = "demo_outputs"

    # Output
    OUTPUTS_DIR: str = "outputs"
    LOG_LEVEL: str = "DEBUG"
    LOG_TO_FILE: bool = True
    LOG_FILE_PATH: str = "outputs/logs/nawgati.log"
    SAVE_RAW_RESPONSES: bool = True
    SAVE_INTERMEDIATE_FILES: bool = True

    # Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Session
    SESSION_EXPIRY_HOURS: int = 24
    MAX_CONCURRENT_SESSIONS: int = 5

    # Feature Flags
    FEATURE_STREAMING_UI: bool = True
    FEATURE_PROGRESS_TRACKING: bool = True
    FEATURE_COOKIE_PERSISTENCE: bool = True
    FEATURE_DEMO_DASHBOARDS: bool = True
    FEATURE_LIVE_SEARCH: bool = True

    model_config = {
        "env_file": _find_env_file(),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
