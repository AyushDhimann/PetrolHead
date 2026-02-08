"""
Gemini Deep Research Client
Uses the Interactions API for deep research with streaming and resume support.
"""

import time
import json
import os
from typing import Optional, AsyncGenerator, Callable
from datetime import datetime

from config.settings import get_settings
from config.logging_config import get_logger

logger = get_logger("gemini_client")


class GeminiDeepResearchClient:
    """Client for Gemini Deep Research Agent via Interactions API."""

    def __init__(self):
        self.settings = get_settings()
        self._client = None
        self._init_client()

    def _init_client(self):
        """Initialize the Google GenAI client."""
        try:
            from google import genai
            self._client = genai.Client(api_key=self.settings.GEMINI_API_KEY)
            logger.info("Gemini client initialized successfully")
        except ImportError:
            logger.error("google-genai package not installed. Run: pip install google-genai")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise

    def _save_interaction_id(self, interaction_id: str, session_id: str):
        """Save interaction ID for future resume/recheck."""
        if not self.settings.GEMINI_STORE_INTERACTIONS:
            return
        interactions_dir = os.path.join(self.settings.OUTPUTS_DIR, "interactions")
        os.makedirs(interactions_dir, exist_ok=True)
        filepath = os.path.join(interactions_dir, f"{session_id}.json")
        data = {
            "interaction_id": interaction_id,
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
        }
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        logger.info(f"Saved interaction ID {interaction_id} for session {session_id}")

    def _load_interaction_id(self, session_id: str) -> Optional[str]:
        """Load a previously saved interaction ID."""
        filepath = os.path.join(self.settings.OUTPUTS_DIR, "interactions", f"{session_id}.json")
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                data = json.load(f)
            return data.get("interaction_id")
        return None

    def research_sync(self, prompt: str, session_id: str) -> dict:
        """
        Run deep research synchronously with polling.
        Returns dict with keys: text, interaction_id, status
        """
        logger.info(f"[{session_id}] Starting Gemini deep research (polling mode)")
        logger.info(f"[{session_id}] Agent: {self.settings.GEMINI_DEEP_RESEARCH_AGENT}")
        logger.info(f"[{session_id}] Prompt length: {len(prompt)} chars")
        start_time = time.time()

        try:
            interaction = self._client.interactions.create(
                input=prompt,
                agent=self.settings.GEMINI_DEEP_RESEARCH_AGENT,
                background=True,
            )
            interaction_id = interaction.id
            logger.info(f"[{session_id}] Research started. Interaction ID: {interaction_id}")
            self._save_interaction_id(interaction_id, session_id)

            max_polls = (self.settings.GEMINI_MAX_WAIT_MINUTES * 60) // self.settings.GEMINI_POLL_INTERVAL_SECONDS
            for i in range(max_polls):
                interaction = self._client.interactions.get(interaction_id)
                logger.debug(f"[{session_id}] Poll {i+1}/{max_polls}: status={interaction.status}")

                if interaction.status == "completed":
                    text = interaction.outputs[-1].text if interaction.outputs else ""
                    elapsed = time.time() - start_time
                    logger.info(f"[{session_id}] Research completed in {elapsed:.1f}s")
                    return {
                        "text": text,
                        "interaction_id": interaction_id,
                        "status": "completed",
                        "time_taken": elapsed,
                    }
                elif interaction.status == "failed":
                    error = getattr(interaction, 'error', 'Unknown error')
                    logger.error(f"[{session_id}] Research failed: {error}")
                    return {
                        "text": None,
                        "interaction_id": interaction_id,
                        "status": "failed",
                        "error": str(error),
                    }

                time.sleep(self.settings.GEMINI_POLL_INTERVAL_SECONDS)

            logger.error(f"[{session_id}] Research timed out after {self.settings.GEMINI_MAX_WAIT_MINUTES} minutes")
            return {
                "text": None,
                "interaction_id": interaction_id,
                "status": "timeout",
                "error": "Research timed out",
            }

        except Exception as e:
            logger.error(f"[{session_id}] Gemini research error: {e}", exc_info=True)
            return {"text": None, "status": "error", "error": str(e)}

    def research_streaming(
        self,
        prompt: str,
        session_id: str,
        on_thought: Optional[Callable] = None,
        on_text: Optional[Callable] = None,
        on_progress: Optional[Callable] = None,
    ) -> dict:
        """
        Run deep research with streaming support.
        Calls on_thought/on_text callbacks as data arrives.
        Supports reconnection on failure with wall-clock timeout.
        """
        logger.info(f"[{session_id}] Starting Gemini deep research (streaming mode)")
        start_time = time.time()
        max_wait_seconds = self.settings.GEMINI_MAX_WAIT_MINUTES * 60
        interaction_id = None
        last_event_id = None
        is_complete = False
        timed_out = False
        collected_text = []
        thoughts = []

        def _check_timeout() -> bool:
            """Return True if we've exceeded the wall-clock time limit."""
            return (time.time() - start_time) > max_wait_seconds

        def process_stream(event_stream):
            nonlocal interaction_id, last_event_id, is_complete, timed_out
            for event in event_stream:
                # Wall-clock timeout check inside stream processing
                if _check_timeout():
                    logger.warning(f"[{session_id}] Streaming timed out after {max_wait_seconds}s (inside stream)")
                    timed_out = True
                    return

                if event.event_type == "interaction.start":
                    interaction_id = event.interaction.id
                    logger.info(f"[{session_id}] Interaction started: {interaction_id}")
                    self._save_interaction_id(interaction_id, session_id)

                if event.event_id:
                    last_event_id = event.event_id

                if event.event_type == "content.delta":
                    if event.delta.type == "text":
                        text_chunk = event.delta.text
                        collected_text.append(text_chunk)
                        if on_text:
                            on_text(text_chunk)
                    elif event.delta.type == "thought_summary":
                        thought = event.delta.content.text
                        thoughts.append(thought)
                        logger.info(f"[{session_id}] Thought: {thought[:100]}...")
                        if on_thought:
                            on_thought(thought)

                if event.event_type in ["interaction.complete", "error"]:
                    is_complete = True
                    if event.event_type == "error":
                        logger.error(f"[{session_id}] Stream error event received")

        # Initial streaming request
        try:
            logger.info(f"[{session_id}] Creating streaming research request...")
            logger.info(f"[{session_id}] Max wait: {self.settings.GEMINI_MAX_WAIT_MINUTES} minutes")
            initial_stream = self._client.interactions.create(
                input=prompt,
                agent=self.settings.GEMINI_DEEP_RESEARCH_AGENT,
                background=True,
                stream=True,
                agent_config={
                    "type": "deep-research",
                    "thinking_summaries": self.settings.GEMINI_THINKING_SUMMARIES,
                },
            )
            process_stream(initial_stream)
        except Exception as e:
            logger.warning(f"[{session_id}] Initial stream connection dropped: {e}")

        # Reconnection loop with wall-clock timeout
        max_retries = 20
        retry_count = 0
        while not is_complete and not timed_out and interaction_id and retry_count < max_retries:
            # Check timeout before reconnecting
            if _check_timeout():
                logger.warning(f"[{session_id}] Streaming timed out after {max_wait_seconds}s (reconnection loop)")
                timed_out = True
                break

            retry_count += 1
            logger.info(f"[{session_id}] Reconnecting (attempt {retry_count})... from event {last_event_id}")
            time.sleep(2)
            try:
                resume_stream = self._client.interactions.get(
                    id=interaction_id,
                    stream=True,
                    last_event_id=last_event_id,
                )
                process_stream(resume_stream)
            except Exception as e:
                logger.warning(f"[{session_id}] Reconnection failed: {e}")

        elapsed = time.time() - start_time
        full_text = "".join(collected_text)

        if timed_out:
            logger.warning(f"[{session_id}] Research timed out after {elapsed:.1f}s. "
                         f"Collected {len(full_text)} chars, {len(thoughts)} thoughts")
            # If we collected text despite timeout, treat as completed
            status = "completed" if full_text else "timeout"
        else:
            status = "completed" if is_complete and full_text else "failed"

        logger.info(f"[{session_id}] Streaming {'timed out' if timed_out else 'complete'}. "
                    f"{len(full_text)} chars in {elapsed:.1f}s")

        return {
            "text": full_text if full_text else None,
            "interaction_id": interaction_id,
            "status": status,
            "thoughts": thoughts,
            "time_taken": elapsed,
        }

    def recheck_interaction(self, interaction_id: str) -> dict:
        """Recheck a previously started interaction without making a new API call."""
        logger.info(f"Rechecking interaction: {interaction_id}")
        try:
            interaction = self._client.interactions.get(interaction_id)
            if interaction.status == "completed":
                text = interaction.outputs[-1].text if interaction.outputs else ""
                return {"text": text, "status": "completed", "interaction_id": interaction_id}
            else:
                return {"text": None, "status": interaction.status, "interaction_id": interaction_id}
        except Exception as e:
            logger.error(f"Failed to recheck interaction {interaction_id}: {e}")
            return {"text": None, "status": "error", "error": str(e)}
