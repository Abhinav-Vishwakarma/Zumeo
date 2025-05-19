from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Database and models
from database import roadmaps, serialize_id, parse_id # PyMongo collection
from models import (
    User, 
    RoadmapCreateRequest, # Using the new request model from models.py
    Roadmap as RoadmapResponse, # Use the main model for response
    RoadmapGenerateRequest,
    RoadmapGenerateResponse
)
# Auth
from auth import get_current_active_user
# AI Service
from services.ai_service import generate_career_roadmap # Assuming ai_service is in services package

router = APIRouter()

# Pydantic models (RoadmapCreate, RoadmapResponse, etc.) are assumed to be in models.py

@router.post("/", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap(
    roadmap_in: RoadmapCreateRequest, 
    current_user: User = Depends(get_current_active_user)
):
    # Generate roadmap content using AI service
    try:
        roadmap_content = generate_career_roadmap(
            current_role=roadmap_in.current_role,
            target_role=roadmap_in.target_role,
            experience_years=roadmap_in.experience_years,
            skills=roadmap_in.skills,
            preferences=roadmap_in.preferences
        )
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=503, detail=f"AI service unavailable or failed: {str(e)}")

    roadmap_data = {
        "title": roadmap_in.title,
        "content": roadmap_content,
        "owner_id": str(current_user.id),
        "current_role": roadmap_in.current_role,
        "target_role": roadmap_in.target_role,
        "experience_years": roadmap_in.experience_years,
        "skills": roadmap_in.skills,
        "preferences": roadmap_in.preferences,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = roadmaps.insert_one(roadmap_data)
    created_roadmap = roadmaps.find_one({"_id": result.inserted_id})
    
    if not created_roadmap:
        raise HTTPException(status_code=500, detail="Failed to create roadmap")
        
    return RoadmapResponse(**serialize_id(created_roadmap))

@router.get("/", response_model=List[RoadmapResponse])
def get_user_roadmaps(
    current_user: User = Depends(get_current_active_user)
):
    user_id_str = str(current_user.id)
    roadmaps_cursor = roadmaps.find({"owner_id": user_id_str})
    return [RoadmapResponse(**serialize_id(r)) for r in roadmaps_cursor]

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_active_user)
):
    obj_id = parse_id(roadmap_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format")

    roadmap = roadmaps.find_one({
        "_id": obj_id, 
        "owner_id": str(current_user.id)
    })
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return RoadmapResponse(**serialize_id(roadmap))

@router.delete("/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_active_user)
):
    obj_id = parse_id(roadmap_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format")

    result = roadmaps.delete_one({
        "_id": obj_id,
        "owner_id": str(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found or access denied")
    
    return None # For 204 response

@router.post("/generate", response_model=RoadmapGenerateResponse)
def generate_roadmap_endpoint( # Renamed from generate_roadmap to avoid conflict with function name
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    save: bool = Query(False, description="Save the generated roadmap to the database") # Use Query for query param
):
    try:
        roadmap_content = generate_career_roadmap(
            current_role=request.current_role,
            target_role=request.target_role,
            experience_years=request.experience_years,
            skills=request.skills,
            preferences=request.preferences
        )
    except Exception as e:
        # Log exception e
        raise HTTPException(status_code=503, detail=f"AI service unavailable or failed: {str(e)}")
    
    title = f"Roadmap: {request.current_role} to {request.target_role}"
    generated_roadmap_id = None
    
    if save:
        roadmap_data = {
            "title": title,
            "content": roadmap_content,
            "owner_id": str(current_user.id),
            "current_role": request.current_role,
            "target_role": request.target_role,
            "experience_years": request.experience_years,
            "skills": request.skills,
            "preferences": request.preferences,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = roadmaps.insert_one(roadmap_data)
        generated_roadmap_id = str(result.inserted_id) if result.inserted_id else None
        if not generated_roadmap_id:
            # Log this issue - insert_one should return an ID
            raise HTTPException(status_code=500, detail="Failed to save generated roadmap")

    return RoadmapGenerateResponse(
        title=title,
        content=roadmap_content,
        roadmap_id=generated_roadmap_id
    )