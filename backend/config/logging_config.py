"""
Logging Configuration - Structured logging with rich output.
"""

import logging
import os
import sys
from pathlib import Path


_configured = False


def setup_logging(settings=None):
    """Configure logging for the application."""
    global _configured
    if _configured:
        return
    _configured = True

    level = getattr(settings, "LOG_LEVEL", "DEBUG") if settings else "DEBUG"
    log_level = getattr(logging, level.upper(), logging.DEBUG)

    # Create formatter
    formatter = logging.Formatter(
        fmt="%(asctime)s │ %(levelname)-8s │ %(name)-25s │ %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)

    # File handler
    if settings and settings.LOG_TO_FILE:
        log_path = Path(settings.LOG_FILE_PATH)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(str(log_path), encoding="utf-8")
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger."""
    return logging.getLogger(f"nawgati.{name}")
