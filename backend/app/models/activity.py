from datetime import datetime
from typing import Optional, Dict, Any
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class Activity(Document):
    user_id: PydanticObjectId
    type: str  # "resume_check", "resume_build", "roadmap", "token_purchase", etc.
    title: str
    description: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "activities"
        indexes = [
            "user_id",
            "type",
            "created_at"
        ]