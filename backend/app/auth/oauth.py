from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
from app.config import settings
from app.models.user import User
from app.models.token import TokenBalance, TokenTransaction
from datetime import datetime
import uuid

async def verify_google_token(token: str):
    """Verify Google OAuth token and get user info"""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        
        # Check if the token is issued by Google
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid issuer"
            )
        
        return idinfo
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

async def authenticate_google_user(token: str):
    """Authenticate user with Google OAuth"""
    user_info = await verify_google_token(token)
    
    # Check if user exists
    user = await User.find_one({"email": user_info["email"]})
    
    if not user:
        # Create new user
        referral_code = str(uuid.uuid4())[:8]
        user = User(
            name=user_info["name"],
            email=user_info["email"],
            avatar=user_info.get("picture"),
            google_id=user_info["sub"],
            is_email_verified=user_info.get("email_verified", False),
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
    else:
        # Update existing user
        user.last_login = datetime.utcnow()
        user.google_id = user_info["sub"]
        user.avatar = user_info.get("picture", user.avatar)
        await user.save()
    
    return user