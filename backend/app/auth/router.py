from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from app.auth.jwt import create_access_token
from app.auth.oauth import authenticate_google_user
from app.models.user import User, UserResponse, UserCreate
from app.config import settings
from app.utils.security import verify_password, get_password_hash
from app.dependencies import get_current_user
from app.models.token import TokenBalance, TokenTransaction
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token", response_model=dict)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with username and password"""
    user = await User.find_one({"email": form_data.username})
    
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await user.save()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            avatar=user.avatar,
            role=user.role,
            joined_date=user.joined_date
        )
    }

@router.post("/google", response_model=dict)
async def google_auth(token: str):
    """Authenticate with Google OAuth"""
    user = await authenticate_google_user(token)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            avatar=user.avatar,
            role=user.role,
            joined_date=user.joined_date
        )
    }

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    # Check if email already exists
    existing_user = await User.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    referral_code = str(uuid.uuid4())[:8]
    hashed_password = get_password_hash(user_data.password)
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        referral_code=referral_code
    )
    await user.insert()
    
    # Create token balance with free tokens
    token_balance = TokenBalance(
        user_id=user.id,
        balance=settings.FREE_TOKENS_ON_SIGNUP,
        transactions=[
            TokenTransaction(
                type="reward",
                amount=settings.FREE_TOKENS_ON_SIGNUP,
                description="Free tokens on signup"
            )
        ]
    )
    await token_balance.insert()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            avatar=user.avatar,
            role=user.role,
            joined_date=user.joined_date
        )
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        avatar=current_user.avatar,
        role=current_user.role,
        joined_date=current_user.joined_date
    )

@router.post("/logout")
async def logout(response: Response):
    """Logout user (client-side only)"""
    return {"message": "Successfully logged out"}