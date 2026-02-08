"""
Perplexity Deep Research Client
Uses the Agentic Research API with streaming support.
"""

import json
import os
import time
import httpx
from typing import Optional, Callable
from datetime import datetime

from config.settings import get_settings
from config.logging_config import get_logger

logger = get_logger("perplexity_client")


class PerplexityResearchClient:
    """Client for Perplexity Agentic Research API."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.PERPLEXITY_API_KEY
        self.base_url = "https://api.perplexity.ai"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        logger.info("Perplexity client initialized")

    def _build_messages(self, user_prompt: str, system_prompt: str) -> list:
        """Build messages array for the API."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})
        return messages

    def research_sync(
        self,
        user_prompt: str,
        system_prompt: str,
        session_id: str,
    ) -> dict:
        """
        Run Perplexity deep research synchronously.
        Returns dict with text, status, citations.
        """
        logger.info(f"[{session_id}] Starting Perplexity deep research (sync mode)")
        logger.info(f"[{session_id}] Model: {self.settings.PERPLEXITY_MODEL}")
        logger.info(f"[{session_id}] Prompt length: {len(user_prompt)} chars")
        start_time = time.time()

        messages = self._build_messages(user_prompt, system_prompt)

        payload = {
            "model": self.settings.PERPLEXITY_MODEL,
            "messages": messages,
        }

        try:
            with httpx.Client(timeout=600.0) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

            text = data["choices"][0]["message"]["content"]
            citations = data.get("citations", [])
            elapsed = time.time() - start_time

            logger.info(f"[{session_id}] Perplexity research completed in {elapsed:.1f}s")
            logger.info(f"[{session_id}] Response length: {len(text)} chars, Citations: {len(citations)}")

            return {
                "text": text,
                "status": "completed",
                "citations": citations,
                "time_taken": elapsed,
                "model": self.settings.PERPLEXITY_MODEL,
            }

        except httpx.HTTPStatusError as e:
            logger.error(f"[{session_id}] Perplexity API error: {e.response.status_code} - {e.response.text}")
            return {"text": None, "status": "failed", "error": str(e)}
        except Exception as e:
            logger.error(f"[{session_id}] Perplexity research error: {e}", exc_info=True)
            return {"text": None, "status": "failed", "error": str(e)}

    def research_streaming(
        self,
        user_prompt: str,
        system_prompt: str,
        session_id: str,
        on_text: Optional[Callable] = None,
        on_citation: Optional[Callable] = None,
    ) -> dict:
        """
        Run Perplexity deep research with streaming.
        """
        logger.info(f"[{session_id}] Starting Perplexity deep research (streaming mode)")
        start_time = time.time()

        messages = self._build_messages(user_prompt, system_prompt)

        payload = {
            "model": self.settings.PERPLEXITY_MODEL,
            "messages": messages,
            "stream": True,
        }

        collected_text = []
        citations = []

        try:
            with httpx.Client(timeout=600.0) as client:
                with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                ) as response:
                    response.raise_for_status()

                    for line in response.iter_lines():
                        if not line or not line.startswith("data: "):
                            continue

                        data_str = line[6:]  # Remove "data: " prefix

                        if data_str.strip() == "[DONE]":
                            break

                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")

                            if content:
                                collected_text.append(content)
                                if on_text:
                                    on_text(content)

                            # Check for citations in the final chunk
                            if "citations" in chunk:
                                citations = chunk["citations"]
                                if on_citation:
                                    on_citation(citations)

                        except json.JSONDecodeError:
                            continue

            full_text = "".join(collected_text)
            elapsed = time.time() - start_time
            logger.info(f"[{session_id}] Perplexity streaming complete. {len(full_text)} chars in {elapsed:.1f}s")

            return {
                "text": full_text if full_text else None,
                "status": "completed" if full_text else "failed",
                "citations": citations,
                "time_taken": elapsed,
                "model": self.settings.PERPLEXITY_MODEL,
            }

        except Exception as e:
            full_text = "".join(collected_text)
            elapsed = time.time() - start_time
            logger.error(f"[{session_id}] Perplexity streaming error: {e}", exc_info=True)

            if full_text:
                logger.info(f"[{session_id}] Partial text collected ({len(full_text)} chars)")
                return {
                    "text": full_text,
                    "status": "completed",
                    "citations": citations,
                    "time_taken": elapsed,
                    "partial": True,
                }

            return {"text": None, "status": "failed", "error": str(e)}
