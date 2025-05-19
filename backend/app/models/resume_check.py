from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class SectionFeedback(BaseModel):
    name: str
    score: int
    feedback: str
    suggestions: List[str] = []

class KeywordMatch(BaseModel):
    keyword: str
    found: bool
    importance: str  # "high", "medium", "low"

class ResumeCheck(Document):
    user_id: PydanticObjectId
    resume_id: PydanticObjectId
    overall_score: int
    sections: List[SectionFeedback] = []
    keyword_matches: List[KeywordMatch] = []
    improvement_suggestions: List[str] = []
    tokens_used: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "resume_checks"
        indexes = [
            "user_id",
            "resume_id"
        ]