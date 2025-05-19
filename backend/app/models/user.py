from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field

class SocialProfile(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None

class UserPreferences(BaseModel):
    email_notifications: bool = True
    dark_mode: bool = True
    language: str = "en"

class User(Document):
    name: str
    email: EmailStr
    hashed_password: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    joined_date: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    role: str = "user"  # "user", "admin"
    is_email_verified: bool = False
    two_factor_enabled: bool = False
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    social_profiles: SocialProfile = Field(default_factory=SocialProfile)
    referral_code: Optional[str] = None
    referred_by: Optional[PydanticObjectId] = None
    google_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "google_id",
            "referral_code"
        ]

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    social_profiles: Optional[SocialProfile] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    role: str
    joined_date: datetime