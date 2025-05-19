from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime

# Helper for MongoDB ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, (ObjectId, PyObjectId)):
            return v
        if ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Base model with ID handling for MongoDB documents
class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            PyObjectId: str # Ensure PyObjectId is also serialized to string
        }
        # For Pydantic V1, orm_mode = True allows populating from attributes (e.g. Mongo dicts)
        # if you use Pydantic V2+, this would be from_attributes = True
        orm_mode = True


# User models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None # Ensure this is handled carefully for uniqueness in routes

class UserInDB(MongoBaseModel, UserBase):
    hashed_password: str
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(MongoBaseModel, UserBase): # This is typically used for responses
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Removed SQLAlchemy relationships

# Resume models
class ResumeBase(BaseModel):
    title: str
    content: str # Could be large, consider if it should always be fetched
    file_path: Optional[str] = None

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    file_path: Optional[str] = None
    # Add other fields that can be updated, e.g., extracted_data, feedback, score
    extracted_data: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None


class ResumeInDB(MongoBaseModel, ResumeBase):
    owner_id: str # Stored as string representation of User's ObjectId
    extracted_data: Optional[str] = None # Assuming JSON string for now
    feedback: Optional[str] = None
    score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Resume(MongoBaseModel, ResumeBase): # For API responses
    owner_id: str
    extracted_data: Optional[Dict[str, Any]] = None # Prefer dict for response if data is JSON
    feedback: Optional[str] = None
    score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Removed SQLAlchemy relationships

# Roadmap models
class RoadmapBase(BaseModel):
    title: str
    content: str # This is the AI generated roadmap

class RoadmapCreateRequest(BaseModel): # For request body when creating a roadmap with AI generation
    title: str
    current_role: str
    target_role: str
    experience_years: int
    skills: List[str]
    preferences: Optional[str] = None

class RoadmapInDB(MongoBaseModel, RoadmapBase):
    owner_id: str # Stored as string representation of User's ObjectId
    # Fields from RoadmapCreateRequest if they need to be stored as well
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    preferences: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Roadmap(MongoBaseModel, RoadmapBase): # For API responses
    owner_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    preferences: Optional[str] = None
    # Removed SQLAlchemy relationships

# Roadmap AI Generation specific models (already present and seem fine)
class RoadmapGenerateRequest(BaseModel):
    current_role: str
    target_role: str
    experience_years: int
    skills: List[str]
    preferences: Optional[str] = None

class RoadmapGenerateResponse(BaseModel):
    title: str
    content: str
    roadmap_id: Optional[str] = None # ID of the saved roadmap if applicable

# Business Connection models
class BusinessConnectionBase(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class BusinessConnectionCreate(BusinessConnectionBase):
    pass

class BusinessConnectionUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None # "pending", "connected", "rejected"
    notes: Optional[str] = None

class BusinessConnectionInDB(MongoBaseModel, BusinessConnectionBase):
    owner_id: str # Stored as string representation of User's ObjectId
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BusinessConnection(MongoBaseModel, BusinessConnectionBase): # For API responses
    owner_id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Removed SQLAlchemy relationships

# Token models
class TokenBase(BaseModel):
    amount: int = 0

# This model is for the user's token balance document
class TokenInDB(MongoBaseModel, TokenBase):
    owner_id: str # Stored as string representation of User's ObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TokenResponse(MongoBaseModel, TokenBase): # For API responses about token balance
    owner_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Removed SQLAlchemy relationships

# Token Transaction models
class TokenTransactionCreate(BaseModel): # Request to purchase or use tokens
    amount: int # Positive for purchase, could be positive for use (deducted in logic)
    description: str

class TokenTransactionInDB(MongoBaseModel):
    token_id: str # ID of the parent Token document (User's token balance doc)
    owner_id: str # Stored as string representation of User's ObjectId, for easier querying
    amount: int # Can be positive (purchase) or negative (use)
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TokenTransactionResponse(MongoBaseModel): # For API responses
    token_id: str
    owner_id: str
    amount: int
    description: str
    created_at: datetime

# Authentication models (seem fine, already in use)
class AuthTokenResponse(BaseModel): # Renamed from TokenResponse to avoid clash with Token balance model
    access_token: str
    token_type: str
    user_id: str
    username: str
    email: EmailStr # Changed to EmailStr for validation
    is_admin: bool

class PasswordChange(BaseModel):
    current_password: str
    new_password: str