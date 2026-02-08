"""
Converter Service - Converts plaintext research reports to dashboard-ready JSON.
Uses Gemini 2.5 Flash Lite for fast, cheap JSON conversion.
"""

import json
import os
import time
from typing import Optional

from config.settings import get_settings
from config.logging_config import get_logger
from utils.file_manager import save_converted_json

logger = get_logger("converter_service")

CONVERSION_PROMPT = """You are a data architect specializing in dashboard UI design. Convert the following fuel station research report into a well-structured JSON object optimized for rendering on a masonry bento-grid dashboard.

CRITICAL REQUIREMENTS:
1. The JSON must be a single valid JSON object (no markdown, no code fences, no explanation text)
2. Create logical top-level sections that map to dashboard cards/sections
3. Each top-level key should be a clear category (e.g., "executive_summary", "entity_profile", "location_intelligence", "financial_metrics", etc.)
4. Use descriptive, human-readable key names in snake_case
5. Include ALL information from the report - do NOT summarize or lose any data points
6. For numerical data, use actual numbers not strings
7. For scores/ratings, use a 0-100 scale where applicable
8. Arrays for lists of items (competitors, services, etc.)
9. Nested objects for related data groupings
10. Add a "dashboard_meta" section with: report_title, station_name, brand, location, generated_on, data_confidence
11. Add a "scorecard" section if the report has any ratings or scores
12. Make sure every piece of information has context (don't just have orphan values)

The output MUST be valid JSON only. No text before or after the JSON.

RESEARCH REPORT TO CONVERT:
"""


class ConverterService:
    """Converts research reports to dashboard-ready JSON."""

    def __init__(self):
        self.settings = get_settings()
        self._client = None

    def _get_client(self):
        """Lazy-init Gemini client for conversion."""
        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.settings.GEMINI_API_KEY)
                logger.info(f"Converter client initialized (model: {self.settings.CONVERTER_MODEL})")
            except Exception as e:
                logger.error(f"Failed to init converter client: {e}")
                raise
        return self._client

    def _try_parse_json(self, text: str) -> Optional[dict]:
        """Attempt to parse text as JSON, handling common issues."""
        if not text:
            return None

        # Try direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try stripping markdown code fences
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Try finding JSON object boundaries
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except json.JSONDecodeError:
                pass

        logger.warning("Could not parse response as JSON")
        return None

    async def convert_to_dashboard_json(
        self, report_text: str, session_id: str
    ) -> Optional[dict]:
        """
        Convert a plaintext report to dashboard JSON using Gemini Flash Lite.
        """
        # First check if the input is already valid JSON
        if self.settings.CONVERTER_SKIP_IF_JSON:
            existing = self._try_parse_json(report_text)
            if existing:
                logger.info(f"[{session_id}] Input is already valid JSON. Skipping conversion.")
                save_converted_json(session_id, existing)
                return existing

        if not self.settings.CONVERTER_ENABLED:
            logger.warning(f"[{session_id}] Converter disabled. Returning None.")
            return None

        logger.info(f"[{session_id}] Starting report-to-JSON conversion")
        logger.info(f"[{session_id}] Model: {self.settings.CONVERTER_MODEL}")
        logger.info(f"[{session_id}] Report length: {len(report_text)} chars")
        start_time = time.time()

        try:
            client = self._get_client()

            full_prompt = CONVERSION_PROMPT + report_text

            response = client.models.generate_content(
                model=self.settings.CONVERTER_MODEL,
                contents=full_prompt,
            )

            response_text = response.text
            elapsed = time.time() - start_time
            logger.info(f"[{session_id}] Conversion response received in {elapsed:.1f}s")
            logger.info(f"[{session_id}] Response length: {len(response_text)} chars")

            # Parse JSON
            json_data = self._try_parse_json(response_text)

            if json_data:
                logger.info(f"[{session_id}] JSON conversion successful. Top-level keys: {list(json_data.keys())}")
                save_converted_json(session_id, json_data)
                return json_data
            else:
                # Save raw response for debugging
                raw_path = os.path.join(self.settings.OUTPUTS_DIR, "converted", f"{session_id}_raw.txt")
                with open(raw_path, "w", encoding="utf-8") as f:
                    f.write(response_text)
                logger.error(f"[{session_id}] Failed to parse JSON from conversion response. Raw saved to {raw_path}")
                return None

        except Exception as e:
            logger.error(f"[{session_id}] Conversion error: {e}", exc_info=True)
            return None


# Singleton
converter_service = ConverterService()
