from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class ResumeContent(BaseModel):
    personal_info: Dict[str, Any] = {}
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    references: List[Dict[str, Any]] = []

class Resume(Document):
    user_id: PydanticObjectId
    name: str
    content: ResumeContent = Field(default_factory=ResumeContent)
    raw_text: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    is_template: bool = False
    template_id: Optional[PydanticObjectId] = None
    status: str = "draft"  # "draft", "published"
    visibility: str = "private"  # "private", "public", "shared"
    shared_with: List[PydanticObjectId] = []
    ats_score: Optional[int] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "resumes"
        indexes = [
            "user_id",
            "status",
            "visibility"
        ]

class ResumeCreate(BaseModel):
    name: str
    content: Optional[ResumeContent] = None
    template_id: Optional[str] = None
    
class ResumeUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[ResumeContent] = None
    status: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[List[str]] = None