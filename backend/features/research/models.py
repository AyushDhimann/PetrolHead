"""
Research Models - Pydantic models for the research feature.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class ProviderType(str, Enum):
    GEMINI = "gemini"
    PERPLEXITY = "perplexity"


class ResearchStatus(str, Enum):
    PENDING = "pending"
    STARTED = "started"
    RESEARCHING = "researching"
    STREAMING = "streaming"
    PROCESSING = "processing"
    CONVERTING = "converting"
    COMPLETED = "completed"
    FAILED = "failed"


class ResearchRequest(BaseModel):
    query: str = Field(..., description="Fuel station name, URL or description")


class ProgressUpdate(BaseModel):
    status: ResearchStatus
    provider: Optional[str] = None
    message: str = ""
    progress_percent: int = 0
    thought_summary: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class ResearchResult(BaseModel):
    session_id: str
    status: ResearchStatus
    provider_used: str
    fallback_used: bool = False
    fallback_reason: Optional[str] = None
    raw_text: Optional[str] = None
    json_data: Optional[dict] = None
    interaction_id: Optional[str] = None
    progress_history: List[ProgressUpdate] = []
    started_at: str = ""
    completed_at: Optional[str] = None
    time_taken_seconds: Optional[float] = None


class ResearchStatusResponse(BaseModel):
    session_id: str
    status: ResearchStatus
    provider: str
    fallback_used: bool = False
    fallback_reason: Optional[str] = None
    progress_percent: int = 0
    current_message: str = ""
    thought_summaries: List[str] = []
    started_at: str = ""
    completed_at: Optional[str] = None
    time_taken_seconds: Optional[float] = None
    has_result: bool = False
