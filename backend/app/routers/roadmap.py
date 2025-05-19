from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List
from app.dependencies import get_current_user
from app.models.user import User
from app.models.token import TokenBalance, TokenTransaction
from app.models.roadmap import CareerRoadmap, Milestone, Skill, Resource
from app.models.activity import Activity
from app.services.ai_service import GeminiAIService
from app.config import settings
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/roadmap", tags=["Career Roadmap"])

class GenerateRoadmapRequest(BaseModel):
    current_position: str
    target_position: str
    timeframe: str
    skills: List[str]
    experience_years: int

@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_roadmap(
    request: GenerateRoadmapRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate a career roadmap"""
    # Check if user has enough tokens
    token_balance = await TokenBalance.find_one({"user_id": current_user.id})
    if not token_balance or token_balance.balance < 3:  # Assuming 3 tokens for a roadmap
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient tokens. Please purchase more tokens."
        )
    
    try:
        # Use Gemini AI to generate roadmap
        roadmap_data = await GeminiAIService.generate_career_roadmap(
            request.current_position,
            request.target_position,
            request.timeframe,
            request.skills,
            request.experience_years
        )
        
        # Create milestones
        milestones = []
        for milestone in roadmap_data.get("milestones", []):
            milestones.append(
                Milestone(
                    title=milestone.get("title", ""),
                    description=milestone.get("description", ""),
                    timeframe=milestone.get("timeframe", ""),
                    skills=milestone.get("skills", []),
                    completed=False
                )
            )
        
        # Create skills
        skills = []
        for skill in roadmap_data.get("skills", []):
            resources = []
            for resource in skill.get("resources", []):
                resources.append(
                    Resource(
                        title=resource.get("title", ""),
                        url=resource.get("url", ""),
                        type=resource.get("type", "")
                    )
                )
            
            skills.append(
                Skill(
                    name=skill.get("name", ""),
                    category=skill.get("category", ""),
                    priority=skill.get("priority", "medium"),
                    resources=resources
                )
            )
        
        # Create roadmap record
        roadmap = CareerRoadmap(
            user_id=current_user.id,
            title=roadmap_data.get("title", f"Career Roadmap: {request.current_position} to {request.target_position}"),
            current_position=request.current_position,
            target_position=request.target_position,
            timeframe=request.timeframe,
            milestones=milestones,
            skills=skills,
            tokens_used=3
        )
        await roadmap.insert()
        
        # Deduct tokens
        token_balance.balance -= 3
        token_balance.transactions.append(
            TokenTransaction(
                type="usage",
                amount=-3,
                description="Career roadmap generation",
                metadata={"roadmap_id": str(roadmap.id)}
            )
        )
        token_balance.updated_at = datetime.utcnow()
        await token_balance.save()
        
        # Record activity
        activity = Activity(
            user_id=current_user.id,
            type="roadmap_generate",
            title="Career roadmap generated",
            metadata={"roadmap_id": str(roadmap.id)}
        )
        await activity.insert()
        
        return {
            "message": "Career roadmap generated successfully",
            "roadmap_id": str(roadmap.id),
            "title": roadmap.title,
            "milestones": [milestone.dict() for milestone in milestones],
            "skills": [skill.dict() for skill in skills],
            "tokens_used": 3,
            "tokens_remaining": token_balance.balance
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating roadmap: {str(e)}"
        )
