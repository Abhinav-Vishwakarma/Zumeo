from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
import logging

# Import routers
from routers import auth, user, resume, roadmap, business, token

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create upload directory if it doesn't exist
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Career Platform API")

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/users", tags=["Users"])
app.include_router(resume.router, prefix="/resumes", tags=["Resumes"])
app.include_router(roadmap.router, prefix="/roadmaps", tags=["Roadmaps"])
app.include_router(business.router, prefix="/business", tags=["Business Connections"])
app.include_router(token.router, prefix="/tokens", tags=["Tokens"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Career Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
