from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class Resource(BaseModel):
    title: str
    url: str
    type: str  # "course", "book", "article", etc.

class Skill(BaseModel):
    name: str
    category: str  # "technical", "soft", etc.
    priority: str  # "high", "medium", "low"
    resources: List[Resource] = []

class Milestone(BaseModel):
    title: str
    description: str
    timeframe: str
    skills: List[str] = []
    completed: bool = False

class CareerRoadmap(Document):
    user_id: PydanticObjectId
    title: str
    current_position: str
    target_position: str
    timeframe: str  # "6 months", "1 year", "5 years"
    milestones: List[Milestone] = []
    skills: List[Skill] = []
    tokens_used: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "career_roadmaps"
        indexes = [
            "user_id"
        ]