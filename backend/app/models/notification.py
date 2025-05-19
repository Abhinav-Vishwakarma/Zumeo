from datetime import datetime
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class Notification(Document):
    user_id: PydanticObjectId
    title: str
    message: str
    type: str  # "success", "info", "warning", "error"
    is_read: bool = False
    link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notifications"
        indexes = [
            "user_id",
            "is_read",
            "created_at"
        ]