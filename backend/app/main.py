from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.dependencies import init_db
from app.auth.router import router as auth_router
from app.routers.users import router as users_router
from app.routers.resumes import router as resumes_router
from app.routers.subscriptions import router as subscriptions_router
from app.routers.tokens import router as tokens_router
from app.routers.resume_checker import router as resume_checker_router
from app.routers.resume_extractor import router as resume_extractor_router
from app.routers.resume_builder import router as resume_builder_router
from app.routers.roadmap import router as roadmap_router
from app.routers.fake_detector import router as fake_detector_router
from app.routers.business_connect import router as business_connect_router

app = FastAPI(
    title=settings.APP_NAME,
    description="API for ResumeAI platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_db_client():
    await init_db()

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes_router, prefix=settings.API_V1_PREFIX)
app.include_router(subscriptions_router, prefix=settings.API_V1_PREFIX)
app.include_router(tokens_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_checker_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_extractor_router, prefix=settings.API_V1_PREFIX)
app.include_router(resume_builder_router, prefix=settings.API_V1_PREFIX)
app.include_router(roadmap_router, prefix=settings.API_V1_PREFIX)
app.include_router(fake_detector_router, prefix=settings.API_V1_PREFIX)
app.include_router(business_connect_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {"message": "Welcome to ResumeAI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}