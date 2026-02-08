"""
Prompt Builder - Constructs research prompts from templates and user input.
"""

import os
from pathlib import Path

from config.logging_config import get_logger

logger = get_logger("prompt_builder")

# The marker line in prompt.txt that should be replaced with user input
# Line 3 of prompt.txt contains the target fuel station
PROMPT_TARGET_PREFIX = "**Target: "


def _get_prompts_dir() -> Path:
    """Get the prompts directory."""
    return Path(__file__).parent.parent / "prompts"


def build_research_prompt(user_query: str) -> str:
    """
    Build the full research prompt by inserting user query into the template.
    Replaces line 3 of prompt.txt with the user's input.
    """
    prompt_path = _get_prompts_dir() / "User Prompts" / "prompt.txt"

    if not prompt_path.exists():
        logger.error(f"Prompt template not found: {prompt_path}")
        raise FileNotFoundError(f"Prompt template not found: {prompt_path}")

    with open(prompt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Line 3 (index 2) contains the target station
    # Replace it with user's input
    if len(lines) >= 3:
        lines[2] = f"**Target: {user_query}**\n"
    else:
        logger.warning("Prompt template has fewer than 3 lines")
        return f"Research the following fuel station: {user_query}"

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
