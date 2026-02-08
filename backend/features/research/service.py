"""
Research Orchestrator Service
Manages the full research pipeline: prompt building → LLM research → save output.
Handles provider fallback (Gemini → Perplexity).
"""

import json
import os
import time
from typing import Optional
from datetime import datetime

from config.settings import get_settings
from config.logging_config import get_logger
from features.research.gemini_client import GeminiDeepResearchClient
from features.research.perplexity_client import PerplexityResearchClient
from features.research.models import (
    ResearchStatus, ProviderType, ProgressUpdate, ResearchResult
)
from features.session.store import session_store
from utils.prompt_builder import build_research_prompt
from utils.file_manager import save_research_output, load_system_prompt

logger = get_logger("research_service")


class ResearchService:
    """Orchestrates the deep research pipeline with fallback support."""

    def __init__(self):
        self.settings = get_settings()
        self._gemini_client = None
        self._perplexity_client = None

    @property
    def gemini_client(self):
        if self._gemini_client is None:
            self._gemini_client = GeminiDeepResearchClient()
        return self._gemini_client

    @property
    def perplexity_client(self):
        if self._perplexity_client is None:
            self._perplexity_client = PerplexityResearchClient()
        return self._perplexity_client

    def _update_session(self, session_id: str, status: ResearchStatus,
                        message: str, progress: int = 0,
                        provider: str = None, thought: str = None):
        """Update session with progress."""
        update = ProgressUpdate(
            status=status,
            provider=provider,
            message=message,
            progress_percent=progress,
            thought_summary=thought,
        )
        session_store.update_progress(session_id, update)
        logger.info(f"[{session_id}] {status.value}: {message} ({progress}%)")

    async def run_research(self, query: str, session_id: str) -> ResearchResult:
        """
        Execute the full research pipeline.
        1. Build prompt from template + user query
        2. Try primary provider
        3. If fails, try fallback
        4. Save outputs
        """
        start_time = time.time()
        primary = self.settings.PRIMARY_PROVIDER
        fallback = self.settings.FALLBACK_PROVIDER
        fallback_used = False
        fallback_reason = None

        logger.info(f"[{session_id}] Starting research pipeline")
        logger.info(f"[{session_id}] Query: {query[:100]}...")
        logger.info(f"[{session_id}] Primary: {primary}, Fallback: {fallback}")

        # Step 1: Build prompt
        self._update_session(session_id, ResearchStatus.STARTED,
                             "Building research prompt...", 5, primary)
        prompt = build_research_prompt(query)
        logger.info(f"[{session_id}] Prompt built: {len(prompt)} chars")

        # Step 2: Run primary provider
        self._update_session(session_id, ResearchStatus.RESEARCHING,
                             f"Starting deep research with {primary}...", 10, primary)

        result = await self._run_provider(primary, prompt, session_id)

        # Step 3: Fallback if primary fails
        if result["status"] != "completed" and self.settings.AUTO_FALLBACK_ENABLED:
            fallback_reason = f"{primary} failed: {result.get('error', 'Unknown error')}"
            logger.warning(f"[{session_id}] Primary provider failed. Switching to {fallback}")
            self._update_session(
                session_id, ResearchStatus.RESEARCHING,
                f"{primary} failed. Switching to {fallback}...", 15, fallback
            )
            fallback_used = True
            result = await self._run_provider(fallback, prompt, session_id)

        # Step 4: Process result
        if result["status"] == "completed" and result.get("text"):
            self._update_session(
                session_id, ResearchStatus.PROCESSING,
                "Research complete. Processing output...", 80,
                fallback if fallback_used else primary,
            )

            # Save raw output
            provider_used = fallback if fallback_used else primary
            save_research_output(session_id, result["text"], provider_used)

            elapsed = time.time() - start_time
            self._update_session(
                session_id, ResearchStatus.COMPLETED,
                f"Research completed in {elapsed:.0f}s", 100, provider_used,
            )

            return ResearchResult(
                session_id=session_id,
                status=ResearchStatus.COMPLETED,
                provider_used=provider_used,
                fallback_used=fallback_used,
                fallback_reason=fallback_reason,
                raw_text=result["text"],
                interaction_id=result.get("interaction_id"),
                started_at=datetime.fromtimestamp(start_time).isoformat(),
                completed_at=datetime.now().isoformat(),
                time_taken_seconds=elapsed,
            )
        else:
            elapsed = time.time() - start_time
            error_msg = result.get("error", "Research failed")
            self._update_session(
                session_id, ResearchStatus.FAILED,
                f"Research failed: {error_msg}", 0,
            )
            return ResearchResult(
                session_id=session_id,
                status=ResearchStatus.FAILED,
                provider_used=fallback if fallback_used else primary,
                fallback_used=fallback_used,
                fallback_reason=fallback_reason,
                started_at=datetime.fromtimestamp(start_time).isoformat(),
                completed_at=datetime.now().isoformat(),
                time_taken_seconds=elapsed,
            )

    async def _run_provider(self, provider: str, prompt: str, session_id: str) -> dict:
        """Run research on a specific provider."""
        thoughts_collected = []

        def on_thought(thought):
            thoughts_collected.append(thought)
            self._update_session(
                session_id, ResearchStatus.STREAMING,
                thought[:200], min(70, 20 + len(thoughts_collected) * 5),
                provider, thought,
            )

        def on_text(text_chunk):
            # Just log streaming progress
            pass

        try:
            if provider == "gemini":
                if self.settings.GEMINI_STREAM_ENABLED:
                    return self.gemini_client.research_streaming(
                        prompt, session_id,
                        on_thought=on_thought,
                        on_text=on_text,
                    )
                else:
                    return self.gemini_client.research_sync(prompt, session_id)

            elif provider == "perplexity":
                system_prompt = load_system_prompt()
                if self.settings.PERPLEXITY_STREAM_ENABLED:
                    return self.perplexity_client.research_streaming(
                        prompt, system_prompt, session_id,
                        on_text=on_text,
                    )
                else:
                    return self.perplexity_client.research_sync(
                        prompt, system_prompt, session_id,
                    )
            else:
                return {"status": "failed", "error": f"Unknown provider: {provider}"}

        except Exception as e:
            logger.error(f"[{session_id}] Provider {provider} error: {e}", exc_info=True)
            return {"status": "failed", "error": str(e)}


# Singleton
research_service = ResearchService()
