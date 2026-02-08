"""
Dashboard Service - Serves demo and live dashboard data.
"""

import json
import os
from typing import Optional, List
from pathlib import Path

from config.settings import get_settings
from config.logging_config import get_logger

logger = get_logger("dashboard_service")

# Demo data mapping
DEMO_MAP = {
    "1": {
        "json_file": "JSONS/DO1.json",
        "text_file": "PlainTexts/DO1.txt",
        "name": "Sher Service Station",
        "brand": "IndianOil",
        "location": "Pankha Road, Janakpuri, New Delhi",
    },
    "2": {
        "json_file": "JSONS/DO2.json",
        "text_file": "PlainTexts/DO2.txt",
        "name": "Jay Garud Gas Station",
        "brand": "IndianOil",
        "location": "Block B, Janakpuri, New Delhi",
    },
    "3": {
        "json_file": "JSONS/DO3.json",
        "text_file": "PlainTexts/DO3.txt",
        "name": "Jai Shree Ganesh Filling Station",
        "brand": "Bharat Petroleum (BPCL)",
        "location": "NH-44, GT Karnal Road, Alipur, Delhi",
    },
}


class DashboardService:
    """Serves dashboard data for demos and live sessions."""

    def __init__(self):
        self.settings = get_settings()

    def _get_demo_dir(self) -> Path:
        """Get the demo outputs directory."""
        backend_dir = Path(__file__).parent.parent.parent
        return backend_dir / self.settings.DEMO_OUTPUTS_DIR

    def get_demo_list(self) -> List[dict]:
        """Get list of available demo dashboards."""
        demos = []
        for demo_id, info in DEMO_MAP.items():
            demos.append({
                "id": demo_id,
                "name": info["name"],
                "brand": info["brand"],
                "location": info["location"],
            })
        return demos

    def get_demo_data(self, demo_id: str) -> Optional[dict]:
        """Load demo dashboard JSON data."""
        if demo_id not in DEMO_MAP:
            logger.warning(f"Demo ID {demo_id} not found")
            return None

        demo_info = DEMO_MAP[demo_id]
        json_path = self._get_demo_dir() / demo_info["json_file"]

        if not json_path.exists():
            logger.error(f"Demo JSON file not found: {json_path}")
            return None

        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.info(f"Loaded demo {demo_id}: {demo_info['name']} ({len(str(data))} chars)")
            return data
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in demo {demo_id}: {e}")
            return None

    def get_demo_text(self, demo_id: str) -> Optional[str]:
        """Load demo plaintext report."""
        if demo_id not in DEMO_MAP:
            return None

        demo_info = DEMO_MAP[demo_id]
        text_path = self._get_demo_dir() / demo_info["text_file"]

        if not text_path.exists():
            return None

        with open(text_path, "r", encoding="utf-8") as f:
            return f.read()

    def get_live_dashboard(self, session_id: str) -> Optional[dict]:
        """Load a live research result JSON."""
        json_path = Path(self.settings.OUTPUTS_DIR) / "converted" / f"{session_id}.json"
        if not json_path.exists():
            return None

        try:
            with open(json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None


# Singleton
dashboard_service = DashboardService()
