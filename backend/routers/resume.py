from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from typing import List, Optional
import json
import os
from datetime import datetime
from bson import ObjectId

from database import resumes, serialize_id, parse_id
from models import Resume, ResumeCreate, ResumeUpdate, User
from auth import get_current_active_user
from services.ai_service import analyze_resume, extract_resume_data, check_fake_resume
from file_utils import save_upload_file, get_file_path, delete_file

router = APIRouter()

@router.post("/", response_model=Resume)
async def create_resume(
    resume: ResumeCreate, 
    current_user: User = Depends(get_current_active_user)
):
    resume_data = resume.dict()
    resume_data.update({
        "owner_id": str(current_user.id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = resumes.insert_one(resume_data)
    resume_data["_id"] = result.inserted_id
    
    return Resume(**serialize_id(resume_data))

@router.get("/", response_model=List[Resume])
async def get_user_resumes(
    current_user: User = Depends(get_current_active_user)
):
    user_resumes = []
    for resume in resumes.find({"owner_id": str(current_user.id)}):
        user_resumes.append(Resume(**serialize_id(resume)))
    return user_resumes

@router.get("/{resume_id}", response_model=Resume)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return Resume(**serialize_id(resume))

@router.put("/{resume_id}", response_model=Resume)
async def update_resume(
    resume_id: str,
    resume_update: ResumeUpdate,
    current_user: User = Depends(get_current_active_user)
):
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    update_data = {k: v for k, v in resume_update.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    resumes.update_one({"_id": parse_id(resume_id)}, {"$set": update_data})
    
    updated_resume = resumes.find_one({"_id": parse_id(resume_id)})
    return Resume(**serialize_id(updated_resume))

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete associated file if exists
    if resume.get("file_path"):
        delete_file(resume["file_path"])
    
    resumes.delete_one({"_id": parse_id(resume_id)})
    return {"detail": "Resume deleted successfully"}

@router.post("/upload", response_model=Resume)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    # Save file
    file_path = await save_upload_file(file, str(current_user.id))
    
    # Extract content from file (simplified for now)
    content = "Extracted content from uploaded resume"
    
    # Create resume record
    resume_data = {
        "title": title,
        "content": content,
        "file_path": file_path,
        "owner_id": str(current_user.id),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = resumes.insert_one(resume_data)
    resume_data["_id"] = result.inserted_id
    
    return Resume(**serialize_id(resume_data))

@router.get("/download/{resume_id}")
async def download_resume(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.get("file_path"):
        raise HTTPException(status_code=404, detail="No file associated with this resume")
    
    file_path = get_file_path(resume["file_path"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type="application/octet-stream"
    )

@router.post("/extract/{resume_id}", response_model=Resume)
async def extract_resume(
    resume_id: str,
    current_user: User = Depends(get_current_active_user)
):
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Extract data using AI service
    extracted_data = extract_resume_data(resume["content"])
    
    # Update resume with extracted data
    resumes.update_one(
        {"_id": parse_id(resume_id)},
        {"$set": {
            "extracted_data": json.dumps(extracted_data),
            "updated_at": datetime.utcnow()
        }}
    )
    
    updated_resume = resumes.find_one({"_id": parse_id(resume_id)})
    return Resume(**serialize_id(updated_resume))

@router.post("/analyze")
async def analyze_resume_endpoint(
    analysis_request: dict,
    current_user: User = Depends(get_current_active_user)
):
    resume_id = analysis_request.get("resume_id")
    job_description = analysis_request.get("job_description")
    
    resume = resumes.find_one({"_id": parse_id(resume_id), "owner_id": str(current_user.id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Analyze resume using AI service
    analysis_result = analyze_resume(resume["content"], job_description)
    
    # Update resume with feedback and score
    resumes.update_one(
        {"_id": parse_id(resume_id)},
        {"$set": {
            "feedback": analysis_result["feedback"],
            "score": analysis_result["score"],
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "resume_id": resume_id,
        "feedback": analysis_result["feedback"],
        "score": analysis_result["score"],
        "improvement_suggestions": analysis_result["improvement_suggestions"]
    }

@router.post("/check-fake")
async def check_fake_resume_endpoint(
    check_request: dict,
    current_user: User = Depends(get_current_active_user)
):
    resume_content = check_request.get("resume_content")
    if not resume_content:
        raise HTTPException(status_code=400, detail="Resume content is required")
    
    # Check if resume is fake using AI service
    check_result = check_fake_resume(resume_content)
    
    return {
        "is_fake": check_result["is_fake"],
        "confidence": check_result["confidence"],
        "explanation": check_result["explanation"]
    }
