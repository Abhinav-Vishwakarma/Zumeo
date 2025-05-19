from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Union # Added Union
import os
from dotenv import load_dotenv
from bson import ObjectId

# Assuming database.py is in the same directory or accessible
from database import users, serialize_id # parse_id is not used here but often useful
# Assuming models.py is in the same directory or accessible
from models import User, UserInDB, PyObjectId # User for response, UserInDB for internal auth logic

# Load environment variables
load_dotenv()

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-please-change") # Ensure this is a strong key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token URL in Swagger/OpenAPI
# The tokenUrl should point to your /auth/token endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token") # Assuming /auth is the prefix for auth routes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user_by_username(username: str) -> Optional[UserInDB]: # Changed function name for clarity
    user_data = users.find_one({"username": username})
    if user_data:
        # Ensure all fields required by UserInDB are present, or handle missing ones
        # serialize_id converts _id to id (which is PyObjectId in UserInDB)
        # Pydantic will validate if all required fields for UserInDB are met
        return UserInDB(**serialize_id(user_data))
    return None

def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    user = get_user_by_username(username)
    if not user:
        return None # Keep it explicit for no user found
    if not verify_password(password, user.hashed_password):
        return None # Keep it explicit for wrong password
    return user # Returns UserInDB instance

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default expiry if not provided
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User: # Returns User model instance
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Fetch user data for the User model (which doesn't include hashed_password)
    user_data = users.find_one({"username": username}) 
    if user_data is None:
        raise credentials_exception
    
    # Create User model instance. It will map _id to id.
    # Ensure user_data has all necessary fields for the 'User' Pydantic model.
    # Typically: username, email, full_name, is_admin, is_active, created_at, updated_at, id (_id)
    return User(**serialize_id(user_data))


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active: # User model has is_active
        raise HTTPException(status_code=403, detail="Inactive user") # 403 Forbidden is more appropriate
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not an admin user")
    return current_user