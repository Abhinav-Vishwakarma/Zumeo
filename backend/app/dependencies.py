import motor.motor_asyncio
from beanie import init_beanie
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime

from app.config import settings
from app.models.user import User
from app.models.resume import Resume
from app.models.subscription import Subscription
from app.models.token import TokenBalance
from app.models.activity import Activity
from app.models.resume_check import ResumeCheck
from app.models.roadmap import CareerRoadmap
from app.models.notification import Notification

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

async def init_db():
    """Initialize the database with Beanie ODM"""
    await init_beanie(
        database=db,
        document_models=[
            User,
            Resume,
            Subscription,
            TokenBalance,
            Activity,
            ResumeCheck,
            CareerRoadmap,
            Notification
        ]
    )

# JWT Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await User.get(user_id)
    if user is None:
        raise credentials_exception
    
    return user