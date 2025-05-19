from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
import os
import uuid
import aiofiles
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeContent
from app.models.token import TokenBalance, TokenTransaction
from app.models.activity import Activity
from app.services.pdf_service import PDFService
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/resume-extractor", tags=["Resume Extractor"])

@router.post("/extract", status_code=status.HTTP_200_OK)
async def extract_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Extract data from a resume file"""
    # Check file type
    if not file.filename.endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, and DOCX files are supported"
        )
    
    # Check file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    await file.seek(0)  # Reset file pointer
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds the maximum allowed size of {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB"
        )
    
    # Check if user has enough tokens
    token_balance = await TokenBalance.find_one({"user_id": current_user.id})
    if not token_balance or token_balance.balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient tokens. Please purchase more tokens."
        )
    
    try:
        # Save file temporarily
        file_extension = os.path.splitext(file.filename)[1]
        temp_file_name = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.join(settings.UPLOAD_DIR, temp_file_name)
        
        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Save the file
        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            await out_file.write(content)
        
        # Extract data from PDF
        if file_extension.lower() == '.pdf':
            extracted_data = await PDFService.extract_resume_data(temp_file_path)
        else:
            # For DOC/DOCX, you would need to implement a different extraction method
            # This is a placeholder
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="DOC/DOCX extraction not implemented yet"
            )
        
        # Create resume in database
        resume_content = ResumeContent(
            personal_info=extracted_data["personal_info"],
            summary=extracted_data["summary"],
            skills=extracted_data["skills"],
            experience=extracted_data["experience"],
            education=extracted_data["education"],
            certifications=extracted_data["certifications"]
        )
        
        resume = Resume(
            user_id=current_user.id,
            name=f"Extracted Resume - {datetime.utcnow().strftime('%Y-%m-%d')}",
            content=resume_content,
            raw_text=await PDFService.extract_text_from_pdf(temp_file_path),
            file_size=file_size,
            file_type=file_extension.lower().replace('.', '')
        )
        await resume.insert()
        
        # Deduct token
        token_balance.balance -= 1
        token_balance.transactions.append(
            TokenTransaction(
                type="usage",
                amount=-1,
                description="Resume extraction",
                metadata={"resume_id": str(resume.id)}
            )
        )
        token_balance.updated_at = datetime.utcnow()
        await token_balance.save()
        
        # Record activity
        activity = Activity(
            user_id=current_user.id,
            type="resume_extract",
            title="Resume extracted",
            metadata={"resume_id": str(resume.id)}
        )
        await activity.insert()
        
        # Clean up temporary file
        os.remove(temp_file_path)
        
        return {
            "message": "Resume extracted successfully",
            "resume_id": str(resume.id),
            "extracted_data": extracted_data,
            "tokens_used": 1,
            "tokens_remaining": token_balance.balance
        }
    
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting resume: {str(e)}"
        )