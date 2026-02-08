"""
File Manager - Handles saving research outputs, logs, and intermediate files.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from config.settings import get_settings
from config.logging_config import get_logger

logger = get_logger("file_manager")


def _get_outputs_dir() -> Path:
    """Get the outputs directory (relative to backend/)."""
    backend_dir = Path(__file__).parent.parent
    settings = get_settings()
    return backend_dir / settings.OUTPUTS_DIR


def save_research_output(session_id: str, text: str, provider: str):
    """Save raw research output to file."""
    settings = get_settings()
    if not settings.SAVE_RAW_RESPONSES:
        return

    output_dir = _get_outputs_dir() / "research"
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{session_id}_{provider}_{timestamp}.txt"
    filepath = output_dir / filename

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# Research Output\n")
        f.write(f"# Session: {session_id}\n")
        f.write(f"# Provider: {provider}\n")
        f.write(f"# Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"# Length: {len(text)} chars\n")
        f.write(f"{'=' * 60}\n\n")
        f.write(text)

    logger.info(f"[{session_id}] Research output saved: {filepath}")
    return str(filepath)


def save_converted_json(session_id: str, json_data: dict):
    """Save converted JSON to file."""
    settings = get_settings()
    if not settings.SAVE_INTERMEDIATE_FILES:
        return

    output_dir = _get_outputs_dir() / "converted"
    output_dir.mkdir(parents=True, exist_ok=True)

    filepath = output_dir / f"{session_id}.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

    logger.info(f"[{session_id}] Converted JSON saved: {filepath}")
    return str(filepath)


def load_system_prompt() -> str:
    """Load the Perplexity system prompt from file."""
    backend_dir = Path(__file__).parent.parent
    prompt_path = backend_dir / "prompts" / "System Prompts" / "Perplexity_deep_research.txt"

    if not prompt_path.exists():
        logger.warning(f"System prompt not found: {prompt_path}")
        return ""

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()
