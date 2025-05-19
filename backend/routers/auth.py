from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime # Added datetime
from auth import get_current_active_user
import logging

# Assuming database.py is in the parent directory or accessible via PYTHONPATH
from database import users, serialize_id # Make sure 'users' collection is correctly imported
# Updated model import
from models import UserCreate, User, AuthTokenResponse as TokenResponse # Renamed here
# Assuming auth.py (with core logic) is in the parent directory or accessible
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    # get_current_active_user, # This is imported but not used in this file directly, usually used in other route files
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=User)
def register_user(user_in: UserCreate): # Changed user to user_in to avoid conflict with User model
    # Check if username exists
    if users.find_one({"username": user_in.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    if users.find_one({"email": user_in.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "username": user_in.username,
        "email": user_in.email,
        "hashed_password": hashed_password,
        "full_name": user_in.full_name,
        "is_admin": False, # Default value
        "is_active": True,  # Default value, activate on registration
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = users.insert_one(user_data)
    # To return the created user, fetch it or use the inserted_id with the input data
    # The User model expects an 'id' field, serialize_id handles _id -> id
    
    # Construct the user object for the response, ensuring all fields for User model are present
    created_user_doc = users.find_one({"_id": result.inserted_id})
    if not created_user_doc:
         raise HTTPException(status_code=500, detail="Failed to create user.")

    return User(**serialize_id(created_user_doc))


@router.post("/token", response_model=TokenResponse) # Uses the renamed AuthTokenResponse
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password) # This returns UserInDB or False
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user.id), # user.id is PyObjectId, convert to string
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }

# The /me route is typically in user.py or a similar protected routes file,
# but if it was intended here, it would use get_current_active_user.
# For example:
# from auth import get_current_active_user
@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user