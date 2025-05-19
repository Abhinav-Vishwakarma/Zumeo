from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Optional, Dict, Any
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.token import TokenBalance, TokenTransaction
from app.models.resume_check import ResumeCheck, SectionFeedback, KeywordMatch
from app.models.activity import Activity
from app.services.ai_service import GeminiAIService
from app.config import settings
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/resume-checker", tags=["Resume Checker"])

class CheckResumeRequest(BaseModel):
    resume_id: str
    job_description: Optional[str] = None

@router.post("/check", status_code=status.HTTP_200_OK)
async def check_resume(
    request: CheckResumeRequest,
    current_user: User = Depends(get_current_user)
):
    """Check a resume against ATS and provide feedback"""
    # Check if resume exists and belongs to user
    resume = await Resume.get(request.resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if user has enough tokens
    token_balance = await TokenBalance.find_one({"user_id": current_user.id})
    if not token_balance or token_balance.balance < 2:  # Assuming 2 tokens for a check
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
        
        # Use Gemini AI to analyze the resume
        analysis = await GeminiAIService.analyze_resume(resume_text, request.job_description)
        
        # Create sections feedback
        sections = []
        for section in analysis.get("sections", []):
            sections.append(
                SectionFeedback(
                    name=section.get("name", ""),
                    score=section.get("score", 0),
                    feedback=section.get("feedback", ""),
                    suggestions=section.get("suggestions", [])
                )
            )
        
        # Create keyword matches
        keyword_matches = []
        for keyword in analysis.get("keyword_matches", []):
            keyword_matches.append(
                KeywordMatch(
                    keyword=keyword.get("keyword", ""),
                    found=keyword.get("found", False),
                    importance=keyword.get("importance", "medium")
                )
            )
        
        # Create resume check record
        resume_check = ResumeCheck(
            user_id=current_user.id,
            resume_id=resume.id,
            overall_score=analysis.get("overall_score", 0),
            sections=sections,
            keyword_matches=keyword_matches,
            improvement_suggestions=analysis.get("improvement_suggestions", []),
            tokens_used=2
        )
        await resume_check.insert()
        
        # Update resume ATS score
        resume.ats_score = analysis.get("overall_score", 0)
        await resume.save()
        
        # Deduct tokens
        token_balance.balance -= 2
        token_balance.transactions.append(
            TokenTransaction(
                type="usage",
                amount=-2,
                description="Resume check",
                metadata={"resume_id": str(resume.id), "check_id": str(resume_check.id)}
            )
        )
        token_balance.updated_at = datetime.utcnow()
        await token_balance.save()
        
        # Record activity
        activity = Activity(
            user_id=current_user.id,
            type="resume_check",
            title="Resume checked",
            metadata={"resume_id": str(resume.id), "check_id": str(resume_check.id)}
        )
        await activity.insert()
        
        return {
            "message": "Resume checked successfully",
            "check_id": str(resume_check.id),
            "overall_score": resume_check.overall_score,
            "sections": [section.dict() for section in sections],
            "keyword_matches": [keyword.dict() for keyword in keyword_matches],
            "improvement_suggestions": resume_check.improvement_suggestions,
            "tokens_used": 2,
            "tokens_remaining": token_balance.balance
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking resume: {str(e)}"
        )

@router.post("/improve-section", status_code=status.HTTP_200_OK)
async def improve_resume_section(
    resume_id: str = Body(...),
    section_type: str = Body(...),
    section_text: str = Body(...),
    current_user: User = Depends(get_current_user)
):
    """Improve a specific section of a resume"""
    # Check if resume exists and belongs to user
    resume = await Resume.get(resume_id)
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if user has enough tokens
    token_balance = await TokenBalance.find_one({"user_id": current_user.id})
    if not token_balance or token_balance.balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient tokens. Please purchase more tokens."
        )
    
    try:
        # Use Gemini AI to improve the section
        improved_text = await GeminiAIService.improve_resume_section(section_text, section_type)
        
        # Deduct token
        token_balance.balance -= 1
        token_balance.transactions.append(
            TokenTransaction(
                type="usage",
                amount=-1,
                description=f"Resume section improvement ({section_type})",
                metadata={"resume_id": str(resume.id)}
            )
        )
        token_balance.updated_at = datetime.utcnow()
        await token_balance.save()
        
        # Record activity
        activity = Activity(
            user_id=current_user.id,
            type="resume_improve",
            title=f"Resume section improved ({section_type})",
            metadata={"resume_id": str(resume.id)}
        )
        await activity.insert()
        
        return {
            "message": "Resume section improved successfully",
            "original_text": section_text,
            "improved_text": improved_text,
            "tokens_used": 1,
            "tokens_remaining": token_balance.balance
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error improving resume section: {str(e)}"
        )
