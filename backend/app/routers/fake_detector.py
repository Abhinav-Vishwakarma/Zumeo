from fastapi import APIRouter, Depends, HTTPException, status, Body
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.token import TokenBalance, TokenTransaction
from app.models.activity import Activity
from app.services.ai_service import GeminiAIService
from app.config import settings
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/fake-detector", tags=["Fake Resume Detector"])

class FakeDetectionRequest(BaseModel):
    resume_id: str

class FakeDetectionResult(BaseModel):
    authenticity: Dict[str, Any]
    verification_suggestions: List[str]

@router.post("/detect", response_model=Dict[str, Any])
async def detect_fake_resume(
    request: FakeDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """Detect potentially fake or exaggerated content in a resume"""
    # Check if resume exists and belongs to user
    resume = await Resume.get(request.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if user has enough tokens
    token_balance = await TokenBalance.find_one({"user_id": current_user.id})
    if not token_balance or token_balance.balance < 3:  # Assuming 3 tokens for fake detection
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient tokens. Please purchase more tokens."
        )
    
    try:
        # Get resume text
        resume_text = resume.raw_text
        if not resume_text:
            # If raw text is not available, construct from content
            resume_text = ""
            if resume.content.personal_info:
                resume_text += f"{resume.content.personal_info.get('name', '')}\n"
                resume_text += f"{resume.content.personal_info.get('email', '')}\n"
                resume_text += f"{resume.content.personal_info.get('phone', '')}\n"
                resume_text += f"{resume.content.personal_info.get('location', '')}\n\n"
            
            if resume.content.summary:
                resume_text += f"SUMMARY:\n{resume.content.summary}\n\n"
            
            if resume.content.skills:
                resume_text += f"SKILLS:\n{', '.join(resume.content.skills)}\n\n"
            
            if resume.content.experience:
                resume_text += "EXPERIENCE:\n"
                for exp in resume.content.experience:
                    resume_text += f"{exp.get('company', '')} | {exp.get('title', '')} | {exp.get('dates', '')}\n"
                    for desc in exp.get('description', []):
                        resume_text += f"• {desc}\n"
                    resume_text += "\n"
            
            if resume.content.education:
                resume_text += "EDUCATION:\n"
                for edu in resume.content.education:
                    resume_text += f"{edu.get('degree', '')}, {edu.get('institution', '')}, {edu.get('dates', '')}\n"
                resume_text += "\n"
            
            if resume.content.certifications:
                resume_text += f"CERTIFICATIONS:\n{', '.join(resume.content.certifications)}\n\n"
        
        # Use Gemini AI to detect fake content
        detection_result = await GeminiAIService.detect_fake_resume(resume_text)
        
        # Deduct tokens
        token_balance.balance -= 3
        token_balance.transactions.append(
            TokenTransaction(
                type="usage",
                amount=-3,
                description="Fake resume detection",
                metadata={"resume_id": str(resume.id)}
            )
        )
        token_balance.updated_at = datetime.utcnow()
        await token_balance.save()
        
        # Record activity
        activity = Activity(
            user_id=current_user.id,
            type="fake_detect",
            title="Fake resume detection",
            metadata={"resume_id": str(resume.id)}
        )
        await activity.insert()
        
        return {
            "message": "Fake detection completed successfully",
            "resume_id": str(resume.id),
            "authenticity": detection_result.get("authenticity", {}),
            "verification_suggestions": detection_result.get("verification_suggestions", []),
            "tokens_used": 3,
            "tokens_remaining": token_balance.balance
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error detecting fake content: {str(e)}"
        )