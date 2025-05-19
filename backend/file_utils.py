import os
import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
import uuid
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "5242880"))  # 5MB default

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_user_upload_dir(user_id: str) -> str:
    """Create and return a user-specific upload directory"""
    user_dir = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

async def save_upload_file(upload_file: UploadFile, user_id: str, filename: Optional[str] = None) -> str:
    """
    Save an uploaded file to the user's upload directory
    Returns the file path relative to the upload directory
    """
    try:
        # Check file size
        file_size = 0
        content = await upload_file.read()
        file_size = len(content)
        
        if file_size > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE/1024/1024:.1f}MB"
            )
        
        # Reset file pointer
        await upload_file.seek(0)
        
        # Generate unique filename if not provided
        if not filename:
            file_extension = Path(upload_file.filename).suffix if upload_file.filename else ""
            filename = f"{uuid.uuid4()}{file_extension}"
        
        # Get user upload directory
        user_dir = get_user_upload_dir(user_id)
        
        # Create full file path
        file_path = os.path.join(user_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        # Return relative path
        return os.path.join(user_id, filename)
    
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    finally:
        await upload_file.close()

def get_file_path(relative_path: str) -> str:
    """Get the full file path from a relative path"""
    return os.path.join(UPLOAD_DIR, relative_path)

def delete_file(relative_path: str) -> bool:
    """Delete a file given its relative path"""
    try:
        full_path = get_file_path(relative_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return False
