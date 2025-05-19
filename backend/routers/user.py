from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional # List is not used here directly
from datetime import datetime

# Database and models
from database import users, serialize_id, parse_id # PyMongo collection
from models import User, UserUpdate, PasswordChange # User is also response model here
# Auth
from auth import get_current_active_user, get_password_hash, verify_password # verify_password moved from inline import

router = APIRouter()

# Pydantic models are assumed to be in models.py
# UserResponse was defined, but User model itself can be used for response.
# For clarity, let's define a UserResponse or use User.
class UserProfileResponse(User): # Inherit from User model for profile responses
    pass


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_active_user) # current_user is already a User model instance
):
    # current_user is already populated correctly by get_current_active_user
    # which uses serialize_id.
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    user_update_in: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    update_data = user_update_in.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    current_user_id_obj = parse_id(str(current_user.id)) # Get current user's ObjectId

    # Check if username is being updated and is unique
    if "username" in update_data and update_data["username"] != current_user.username:
        if users.find_one({"username": update_data["username"], "_id": {"$ne": current_user_id_obj}}):
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email is being updated and is unique
    if "email" in update_data and update_data["email"] != current_user.email:
        if users.find_one({"email": update_data["email"], "_id": {"$ne": current_user_id_obj}}):
            raise HTTPException(status_code=400, detail="Email already registered")
            
    update_data["updated_at"] = datetime.utcnow()
    
    result = users.update_one(
        {"_id": current_user_id_obj},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        # This shouldn't happen if current_user is valid
        raise HTTPException(status_code=404, detail="User not found for update")
        
    updated_user_doc = users.find_one({"_id": current_user_id_obj})
    if not updated_user_doc:
        raise HTTPException(status_code=500, detail="Could not retrieve updated user profile")
    return UserProfileResponse(**serialize_id(updated_user_doc))

@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    password_change_in: PasswordChange,
    current_user: User = Depends(get_current_active_user) # User model has hashed_password via UserInDB in auth.py
):
    # The User model populated by get_current_user does not include hashed_password by default.
    # We need the UserInDB model or fetch the user document directly to get hashed_password.
    user_doc_from_db = users.find_one({"_id": parse_id(str(current_user.id))})
    if not user_doc_from_db or "hashed_password" not in user_doc_from_db:
        raise HTTPException(status_code=404, detail="User not found or password information missing.")

    if not verify_password(password_change_in.current_password, user_doc_from_db["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    new_hashed_password = get_password_hash(password_change_in.new_password)
    
    users.update_one(
        {"_id": parse_id(str(current_user.id))},
        {"$set": {"hashed_password": new_hashed_password, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Password changed successfully"} # Changed from detail to message for consistency

@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account( # This is a soft delete
    current_user: User = Depends(get_current_active_user)
):
    users.update_one(
        {"_id": parse_id(str(current_user.id))},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Account deactivated successfully"} # Changed from detail to message