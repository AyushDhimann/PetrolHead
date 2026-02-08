"""
Prompt Builder - Constructs research prompts from templates and user input.
"""

import os
import re
from pathlib import Path

from config.logging_config import get_logger

logger = get_logger("prompt_builder")

# The marker line in prompt.txt that should be replaced with user input
# Line 3 of prompt.txt contains the target fuel station
PROMPT_TARGET_PREFIX = "**Target: "

# Patterns that indicate a Google Maps URL
_MAPS_URL_PATTERNS = [
    re.compile(r"https?://(?:www\.)?google\.[a-z.]+/maps", re.IGNORECASE),
    re.compile(r"https?://maps\.google\.[a-z.]+", re.IGNORECASE),
    re.compile(r"https?://goo\.gl/maps", re.IGNORECASE),
    re.compile(r"https?://maps\.app\.goo\.gl", re.IGNORECASE),
]


def _is_maps_url(query: str) -> bool:
    """Check if the query looks like a Google Maps URL."""
    return any(p.search(query.strip()) for p in _MAPS_URL_PATTERNS)


def _build_maps_target(url: str) -> str:
    """
    Build a target string that instructs the AI to resolve
    a Google Maps link to a real station name first.
    """
    return (
        f"{url}\n\n"
        "IMPORTANT: The target above is a Google Maps URL, not a station name. "
        "Your FIRST step MUST be to open / resolve this URL to identify the actual "
        "fuel station name, full address, and brand. Then proceed with the full "
        "research using that resolved identity. If the URL cannot be resolved, "
        "extract any place name or coordinates visible in the URL and research "
        "that instead. Do NOT research the URL itself — research the station it points to."
    )


def _get_prompts_dir() -> Path:
    """Get the prompts directory."""
    return Path(__file__).parent.parent / "prompts"


def build_research_prompt(user_query: str) -> str:
    """
    Build the full research prompt by inserting user query into the template.
    Replaces line 3 of prompt.txt with the user's input.
    Handles Google Maps URLs by adding resolution instructions.
    """
    prompt_path = _get_prompts_dir() / "User Prompts" / "prompt.txt"

    if not prompt_path.exists():
        logger.error(f"Prompt template not found: {prompt_path}")
        raise FileNotFoundError(f"Prompt template not found: {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Detect Google Maps URL and add resolution instructions
    target = user_query
    if _is_maps_url(user_query):
        logger.info(f"Detected Google Maps URL input — adding resolution instructions")
        target = _build_maps_target(user_query.strip())

    # Line 3 (index 2) contains the target station
    # Replace it with user's input
    if len(lines) >= 3:
        lines[2] = f"**Target: {target}**\n"
    else:
        logger.warning("Prompt template has fewer than 3 lines")
        return f"Research the following fuel station: {target}"

    prompt = "".join(lines)
    logger.info(f"Built research prompt: {len(prompt)} chars, target: {user_query[:80]}...")
    return prompt


def load_system_prompt() -> str:
    """Load the Perplexity system prompt."""
    prompt_path = _get_prompts_dir() / "System Prompts" / "Perplexity_deep_research.txt"

    if not prompt_path.exists():
        logger.warning(f"System prompt not found: {prompt_path}")
        return ""

    with open(prompt_path, "r", encoding="utf-8") as f:
        content = f.read()

    logger.info(f"Loaded system prompt: {len(content)} chars")
    return content
