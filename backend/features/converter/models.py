"""
Converter Models
"""

from pydantic import BaseModel
from typing import Optional


class ConvertRequest(BaseModel):
    text: str
    session_id: Optional[str] = None


class ConvertResponse(BaseModel):
    session_id: Optional[str] = None
    status: str
    json_data: Optional[dict] = None
    error: Optional[str] = None
