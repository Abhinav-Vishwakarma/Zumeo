import os
import io
import json
import uuid # To generate unique filenames
import shutil # To save uploaded file
from datetime import datetime, timedelta, timezone # For JWT expiration and timestamps
from typing import List, Optional # For Pydantic models

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr, Field # Import Field for default values
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from passlib.context import CryptContext
from jose import JWTError, jwt # For JWT handling
import fitz # PyMuPDF
import google.generativeai as genai # Google Gemini API
from bson import ObjectId # To work with MongoDB ObjectIds

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY") # IMPORTANT: Generate a strong secret key!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # Token expires in 30 minutes

# File Upload Configuration
UPLOAD_DIRECTORY = os.getenv("UPLOAD_DIRECTORY", "./uploaded_resumes")

# Credit Costs
DEFAULT_STARTING_CREDITS = 10
RESUME_CHECKER_COST = 2 # Example cost
ROADMAP_GENERATOR_COST = 3 # Example cost

# Ensure base upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# --- MongoDB Connection ---
client: MongoClient = None
db = None
users_collection = None
resumes_collection = None
tokens_collection = None # Collection for storing tokens
roadmaps_collection = None # Collection for storing roadmaps
credit_transactions_collection = None # New collection for credit transactions

async def connect_to_mongo():
    """Connects to MongoDB and initializes collections."""
    global client, db, users_collection, resumes_collection, tokens_collection, roadmaps_collection, credit_transactions_collection
    try:
        # Check if MONGO_URI and DATABASE_NAME are set
        if not MONGO_URI or not DATABASE_NAME:
             print("MONGO_URI or DATABASE_NAME environment variable not set.")
             # Depending on your needs, you might want to raise an exception here
             return

        client = MongoClient(MONGO_URI)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        db = client[DATABASE_NAME]
        users_collection = db.users
        resumes_collection = db.resumes
        tokens_collection = db.tokens # Initialize the tokens collection
        roadmaps_collection = db.roadmaps # Initialize the roadmaps collection
        credit_transactions_collection = db.credit_transactions # Initialize the transactions collection
        print("MongoDB connection successful!")
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
        # Raise an exception to prevent the app from starting without a DB connection
        raise ConnectionFailure(f"Failed to connect to MongoDB: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during MongoDB connection: {e}")
        raise Exception(f"An unexpected error occurred during MongoDB connection: {e}")


async def close_mongo_connection():
    """Closes the MongoDB connection."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")

# --- Password Hashing Configuration ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hashes a plain password."""
    return pwd_context.hash(password)

# --- JWT Token Handling ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") # Token URL for clients to get a token

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates a JWT access token."""
    if not SECRET_KEY:
         raise RuntimeError("JWT Secret Key not configured.") # Should be caught during startup

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire # Return token and expiration time

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to get the current authenticated user from the JWT token."""
    if not SECRET_KEY:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT Secret Key not configured on the server."
        )
    if users_collection is None:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not connected."
        )


    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Using email as the subject ('sub') in the token payload
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        # Optional: Check if the token exists in the database and is not marked as revoked
        # For simplicity, we are not implementing token revocation here,
        # but you would query the tokens_collection here.
        # token_doc = tokens_collection.find_one({"token": token, "revoked": False})
        # if not token_doc:
        #     raise credentials_exception


        # Check if the user exists in the database by email
        user = users_collection.find_one({"email": email})
        if user is None:
            raise credentials_exception
        return user # Return the user document from MongoDB
    except JWTError:
        raise credentials_exception
    except OperationFailure:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching user."
        )
    except Exception:
         raise credentials_exception # Catch any other unexpected errors during token validation

# --- Credit Management Functions ---
async def deduct_credits(user_id: str, amount: int, feature_name: str):
    """Deducts credits from a user's balance and records the transaction."""
    if users_collection is None or credit_transactions_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Atomically update the user's credit balance
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"credits": -amount}} # Decrement credits
        )

        if result.modified_count == 0:
             # This could happen if user_id is invalid or credits were already too low
             # We should ideally check balance before calling this function, but adding a check here too
             user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
             if user_doc and user_doc.get("credits", 0) < amount:
                  raise HTTPException(status_code=400, detail="Insufficient credits.")
             else:
                  # Unexpected case, maybe user_id was wrong or update failed silently
                  print(f"Warning: Failed to deduct credits for user {user_id}, amount {amount}, feature {feature_name}. Modified count was 0.")
                  raise HTTPException(status_code=500, detail="Failed to update credit balance.")


        # Record the transaction
        transaction_doc = {
            "user_id": user_id,
            "type": "deduction",
            "feature": feature_name,
            "amount": -amount, # Store as negative for deduction
            "timestamp": datetime.now(timezone.utc),
            # You could add more details like resume_id or roadmap_id here
        }
        credit_transactions_collection.insert_one(transaction_doc)

    except OperationFailure as e:
        print(f"Database error during credit deduction for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error during credit deduction.")
    except HTTPException:
         # Re-raise the insufficient credits error
         raise
    except Exception as e:
        print(f"An unexpected error occurred during credit deduction for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during credit deduction.")


async def add_credits(user_id: str, amount: int, transaction_details: str):
    """Adds credits to a user's balance and records the transaction."""
    if users_collection is None or credit_transactions_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    if amount <= 0:
         raise HTTPException(status_code=400, detail="Amount must be positive.")

    try:
        # Atomically update the user's credit balance
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"credits": amount}} # Increment credits
        )

        if result.modified_count == 0:
             # This could happen if user_id is invalid
             print(f"Warning: Failed to add credits for user {user_id}, amount {amount}. Modified count was 0.")
             raise HTTPException(status_code=404, detail="User not found.")

        # Record the transaction
        transaction_doc = {
            "user_id": user_id,
            "type": "purchase",
            "amount": amount,
            "timestamp": datetime.now(timezone.utc),
            "details": transaction_details # e.g., "Purchased 100 credits via Stripe"
        }
        credit_transactions_collection.insert_one(transaction_doc)

    except OperationFailure as e:
        print(f"Database error during credit addition for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error during credit addition.")
    except HTTPException:
         # Re-raise the user not found error
         raise
    except Exception as e:
        print(f"An unexpected error occurred during credit addition for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during credit addition.")


# --- Gemini API Configuration ---
if not GEMINI_API_KEY:
    print("GEMINI_API_KEY not found in environment variables. AI features will not work.")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    # Optional: Choose a model
    # model = genai.GenerativeModel('gemini-1.5-flash')
    # print("Gemini API configured.")

# --- Pydantic Models ---
class UserCreate(BaseModel):
    """Model for user registration requests."""
    username: str
    email: EmailStr
    password: str
    # Credits will be added by the backend with a default value

class UserLogin(BaseModel):
    """Model for user login requests (using email)."""
    email: str
    password: str

class Token(BaseModel):
    """Model for the JWT token response."""
    access_token: str
    token_type: str
    expires_at: datetime # Include expiration time in the response

class ResumeUploadResponse(BaseModel):
    """Model for the resume upload response."""
    message: str
    resume_id: str
    filename: str

class ATSCheckResponse(BaseModel):
    """Model for the ATS check response."""
    ats_score: int # Assuming a score out of 100
    suggestions: list[str]
    # You could add more fields here based on Gemini's output structure

class RoadmapRequest(BaseModel):
    """Model for the roadmap generation request."""
    current_role: str
    target_role: str
    years_of_experience: str # e.g., "0-1 years", "1-3 years"
    timeframe: str # e.g., "6 months", "1 year", "2 years"
    current_skills: str # comma separated string
    areas_of_interest: str # comma separated string
    preferred_learning_style: str # e.g., "visual", "auditory", "kinesthetic", "reading/writing"

class RoadmapNode(BaseModel):
    """Model for a node in the React Flow roadmap."""
    id: str
    type: str # e.g., "start", "step", "milestone", "skill", "project", "end"
    data: dict # Custom data for the node, e.g., {"label": "Learn Python"}
    position: dict # {"x": 0, "y": 0} - Initial position, might need frontend layout

class RoadmapEdge(BaseModel):
    """Model for an edge in the React Flow roadmap."""
    id: str
    source: str # Source node ID
    target: str # Target node ID
    type: Optional[str] = "smoothstep" # e.g., "smoothstep", "straight"
    animated: Optional[bool] = False
    label: Optional[str] = None

class RoadmapResponse(BaseModel):
    """Model for the roadmap generation response, formatted for React Flow."""
    roadmap_id: str
    nodes: List[RoadmapNode]
    edges: List[RoadmapEdge]
    generated_timestamp: datetime

class CreditPurchaseRequest(BaseModel):
    """Model for a credit purchase request."""
    amount: int
    transaction_details: str # e.g., "Stripe transaction ID xyz"

class CreditBalanceResponse(BaseModel):
    """Model for returning the user's credit balance."""
    credits: int

# --- FastAPI Application ---
app = FastAPI()

# Lifespan events to connect and close MongoDB
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    # Also check for SECRET_KEY on startup
    if not SECRET_KEY:
         print("FATAL ERROR: JWT SECRET_KEY environment variable not set!")
         # In a production app, you might want to raise an exception or exit here
         # For now, we'll print a warning, but JWT related endpoints will fail.


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def read_root():
    """Basic root endpoint."""
    return {"message": "Welcome to the Zuleo backend server!"}

@app.post("/register")
async def register_user(user: UserCreate):
    """Endpoint to register a new user."""
    if users_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    # Check if user already exists by email
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    # Optional: Check if username exists if you want usernames to be unique too
    # if users_collection.find_one({"username": user.username}):
    #     raise HTTPException(status_code=400, detail="Username already registered")


    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create user document - Add the initial credits field
    user_doc = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "credits": DEFAULT_STARTING_CREDITS # Initialize with default credits
    }

    # Insert user into database
    try:
        insert_result = users_collection.insert_one(user_doc)
        # Return the user ID as a string
        return {"message": "User registered successfully", "user_id": str(insert_result.inserted_id)}
    except OperationFailure as e:
        print(f"Error inserting user into DB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")


@app.post("/login", response_model=Token)
async def login_user(user: UserLogin):
    """Endpoint to log in a user and return a JWT token (using email)."""
    if users_collection is None or tokens_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    # Find the user by email
    db_user = users_collection.find_one({"email": user.email})

    # Check if user exists and verify password
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create an access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Using email as the subject ('sub') in the token payload
    access_token, expires_at = create_access_token(
        data={"sub": db_user["email"]},
        expires_delta=access_token_expires
    )

    # Store token information in the tokens collection
    token_doc = {
        "token": access_token,
        "user_id": str(db_user["_id"]), # Store the user's ObjectId as a string
        "issued_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "revoked": False # Add a field for potential token revocation
    }

    try:
        tokens_collection.insert_one(token_doc)
    except OperationFailure as e:
        print(f"Database error storing token for user {db_user['email']}: {e}")
        # Log the error but still return the token, as the token itself is valid
        pass # Or raise HTTPException if token storage is critical

    return {"access_token": access_token, "token_type": "bearer", "expires_at": expires_at}


@app.post("/upload-resume/", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to upload a PDF resume, save it to the server in a user-specific folder,
    and store metadata in the database.
    Requires JWT authentication.
    """
    if resumes_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # Create a user-specific directory path
    user_upload_directory = os.path.join(UPLOAD_DIRECTORY, str(current_user["_id"]))

    # Ensure the user-specific directory exists
    os.makedirs(user_upload_directory, exist_ok=True)

    # Generate a unique filename within the user's directory
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(user_upload_directory, unique_filename)

    try:
        # Save the file to the server
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Store resume metadata in the database
        resume_metadata = {
            "filename": file.filename, # Original filename
            "saved_filename": unique_filename, # Unique filename on server
            "filepath": file_path, # Store the full path including user ID
            "uploader_id": str(current_user["_id"]), # Store the uploader's user ID (as string)
            "upload_timestamp": datetime.now(timezone.utc),
            "analysis_data": None # Field to store analysis results later
        }

        insert_result = resumes_collection.insert_one(resume_metadata)
        resume_id = str(insert_result.inserted_id)

        return ResumeUploadResponse(
            message="Resume uploaded successfully",
            resume_id=resume_id,
            filename=file.filename
        )

    except OperationFailure as e:
        # If database operation fails, try to clean up the saved file
        if os.path.exists(file_path):
            os.remove(file_path)
        print(f"Database error during resume upload: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during metadata storage")
    except Exception as e:
        # Catch any other file saving errors
        print(f"Error saving file: {e}")
        # If file was partially written, try to clean up
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error saving file: {e}")


@app.get("/analyze-resume/{resume_id}")
async def analyze_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to retrieve a saved resume, extract text,
    send to Gemini for analysis, and return structured data.
    Requires JWT authentication.
    """
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=500, detail="Gemini API key not configured on the server.")
    if resumes_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Validate resume_id format
        if not ObjectId.is_valid(resume_id):
             raise HTTPException(status_code=400, detail="Invalid resume ID format.")

        # Find the resume metadata in the database
        # Ensure the resume belongs to the current user for security
        resume_metadata = resumes_collection.find_one({
            "_id": ObjectId(resume_id),
            "uploader_id": str(current_user["_id"])
        })

        if not resume_metadata:
            raise HTTPException(status_code=404, detail="Resume not found or you do not have permission to access it.")

        file_path = resume_metadata["filepath"]

        # Check if the file exists on the server
        if not os.path.exists(file_path):
             # If file is missing but metadata exists, log a warning
             print(f"Warning: File not found for resume_id {resume_id} at path {file_path} during analysis attempt.")
             raise HTTPException(status_code=500, detail="Resume file not found on the server.")

        # Use PyMuPDF to extract text from the saved file
        try:
            doc = fitz.open(file_path)
            text = ""
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text += page.get_text()
            doc.close()
        except fitz.FileDataError:
             raise HTTPException(status_code=400, detail="Invalid PDF file format or corrupted file.")
        except Exception as e:
             print(f"Error extracting text from PDF {file_path}: {e}")
             raise HTTPException(status_code=500, detail="Error extracting text from PDF.")


        if not text:
             raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        # --- Send text to Gemini API ---
        # Ensure the model name is correct and available
        model_name = 'gemini-1.5-flash' # Or 'gemini-1.5-pro'
        try:
            model = genai.GenerativeModel(model_name)
        except Exception as e:
             print(f"Error loading Gemini model {model_name}: {e}")
             raise HTTPException(status_code=500, detail=f"Error loading Gemini model {model_name}.")


        # Define the prompt for Gemini
        # Added instructions to ensure JSON format
        prompt = f"""
        Analyze the following resume text and extract key details.
        Also, provide constructive suggestions for improvement.
        Format the output strictly as a JSON object. Do not include any markdown formatting like ```json.
        The JSON object should have the following structure:
        {{
            "name": "Extracted Name",
            "contact": {{
                "email": "Extracted Email",
                "phone": "Extracted Phone",
                "linkedin": "Extracted LinkedIn URL (if available)",
                "github": "Extracted GitHub URL (if available)",
                "website": "Extracted Personal Website URL (if available)"
            }},
            "summary": "Extracted Summary/Objective (if available)",
            "experience": [
                {{
                    "title": "Job Title",
                    "company": "Company Name",
                    "dates": "Start Date - End Date",
                    "description": "Job Description/Responsibilities"
                }}
                // ... more experience entries
            ],
            "education": [
                {{
                    "degree": "Degree Name",
                    "institution": "Institution Name",
                    "dates": "Start Date - End Date or Graduation Year"
                }}
                // ... more education entries
            ],
            "skills": [
                "Skill 1", "Skill 2", // ... list of skills
            ],
            "projects": [
                 {{
                    "name": "Project Name",
                    "description": "Project Description",
                    "link": "Project Link (if available)"
                 }}
                 // ... more project entries
            ],
            "certifications": [
                 "Certification 1", "Certification 2", // ... list of certifications
            ],
            "awards": [
                 "Award 1", "Award 2", // ... list of awards
            ],
            "suggestions_for_improvement": [
                "Suggestion 1",
                "Suggestion 2",
                // ... list of suggestions
            ],
            "raw_text": {json.dumps(text)} # Include raw text for debugging/reference, properly escaped
        }}

        Resume Text:
        {text}
        """

        # Generate content using Gemini
        try:
            response = model.generate_content(prompt)
        except Exception as e:
             print(f"Error calling Gemini API: {e}")
             raise HTTPException(status_code=500, detail=f"Error calling Gemini API: {e}")


        # Check if the response contains text and attempt to parse it as JSON
        if not response.text:
             print("Gemini API returned an empty response text.")
             raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        # Attempt to parse the response text as JSON directly
        try:
            # Clean up potential markdown code block wrappers if Gemini still includes them
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                 json_string = response_text[len("```json"):].rstrip("```").strip()
            else:
                 json_string = response_text # Assume the entire response is JSON

            resume_data = json.loads(json_string)

            # Optional: Store the analysis data back in the database
            resumes_collection.update_one(
                {"_id": ObjectId(resume_id)},
                {"$set": {"analysis_data": resume_data}}
            )

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from Gemini response: {e}")
            print(f"Gemini raw response text: {response.text}")
            # If JSON decoding fails, return the raw text for debugging
            raise HTTPException(status_code=500, detail=f"Could not parse Gemini response as JSON. Raw response: {response.text}")
        except OperationFailure as e:
             print(f"Database error while updating analysis data for resume_id {resume_id}: {e}")
             # Continue and return the data even if DB update fails
             pass # Or raise HTTPException if storing analysis is critical
        except Exception as e:
             print(f"Unexpected error processing Gemini response or updating DB: {e}")
             raise HTTPException(status_code=500, detail=f"Unexpected error processing Gemini response: {e}")

        return resume_data

    except OperationFailure:
         raise HTTPException(status_code=500, detail="Database error while retrieving resume metadata.")
    except Exception as e:
        print(f"An unexpected error occurred during resume analysis: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during analysis: {e}")


@app.get("/download-resume/{resume_id}")
async def download_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to download a previously uploaded resume file.
    Requires JWT authentication.
    """
    if resumes_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Validate resume_id format
        if not ObjectId.is_valid(resume_id):
             raise HTTPException(status_code=400, detail="Invalid resume ID format.")

        # Find the resume metadata in the database
        # Ensure the resume belongs to the current user for security
        resume_metadata = resumes_collection.find_one({
            "_id": ObjectId(resume_id),
            "uploader_id": str(current_user["_id"])
        })

        if not resume_metadata:
            raise HTTPException(status_code=404, detail="Resume not found or you do not have permission to access it.")

        file_path = resume_metadata["filepath"]

        # Check if the file exists on the server
        if not os.path.exists(file_path):
             print(f"Warning: File not found for resume_id {resume_id} at path {file_path} during download attempt.")
             # Consider removing the metadata if the file is permanently gone
             raise HTTPException(status_code=500, detail="Resume file not found on the server.")

        # Return the file as a FileResponse
        return FileResponse(path=file_path, filename=resume_metadata["filename"], media_type="application/pdf")

    except OperationFailure:
         raise HTTPException(status_code=500, detail="Database error while retrieving resume metadata for download.")
    except Exception as e:
        print(f"An unexpected error occurred during resume download: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during download: {e}")


@app.delete("/delete-resume/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to delete a previously uploaded resume file and its metadata.
    Requires JWT authentication.
    """
    if resumes_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Validate resume_id format
        if not ObjectId.is_valid(resume_id):
             raise HTTPException(status_code=400, detail="Invalid resume ID format.")

        # Find the resume metadata in the database
        # Ensure the resume belongs to the current user for security
        resume_metadata = resumes_collection.find_one({
            "_id": ObjectId(resume_id),
            "uploader_id": str(current_user["_id"])
        })

        if not resume_metadata:
            raise HTTPException(status_code=404, detail="Resume not found or you do not have permission to delete it.")

        file_path = resume_metadata["filepath"]

        # Attempt to delete the file from the server
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Deleted file: {file_path}")
            except OSError as e:
                print(f"Error deleting file {file_path}: {e}")
                # Log the error but proceed to delete metadata
                pass # Or raise HTTPException if file deletion is critical

        # Delete the resume metadata from the database
        delete_result = resumes_collection.delete_one({"_id": ObjectId(resume_id)})

        if delete_result.deleted_count == 1:
            return {"message": "Resume deleted successfully"}
        else:
            # This case should ideally not happen if find_one succeeded, but good for robustness
            print(f"Warning: Metadata for resume_id {resume_id} not found during deletion attempt.")
            raise HTTPException(status_code=404, detail="Resume metadata not found.")

    except OperationFailure as e:
         print(f"Database error during resume deletion: {e}")
         raise HTTPException(status_code=500, detail="Database error during deletion.")
    except Exception as e:
        print(f"An unexpected error occurred during resume deletion: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during deletion: {e}")

@app.get("/check-resume-ats/{resume_id}", response_model=ATSCheckResponse)
async def check_resume_ats(
    resume_id: str,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to perform an ATS check simulation on a saved resume using Gemini API.
    Requires JWT authentication and deducts credits.
    """
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=500, detail="Gemini API key not configured on the server.")
    if resumes_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    # --- Credit Check and Deduction ---
    if current_user.get("credits", 0) < RESUME_CHECKER_COST:
         raise HTTPException(status_code=400, detail="Insufficient credits to perform ATS check.") # Or 402 Payment Required

    try:
        # Validate resume_id format
        if not ObjectId.is_valid(resume_id):
             raise HTTPException(status_code=400, detail="Invalid resume ID format.")

        # Find the resume metadata in the database
        # Ensure the resume belongs to the current user for security
        resume_metadata = resumes_collection.find_one({
            "_id": ObjectId(resume_id),
            "uploader_id": str(current_user["_id"])
        })

        if not resume_metadata:
            raise HTTPException(status_code=404, detail="Resume not found or you do not have permission to access it.")

        file_path = resume_metadata["filepath"]

        # Check if the file exists on the server
        if not os.path.exists(file_path):
             print(f"Warning: File not found for resume_id {resume_id} at path {file_path} during ATS check attempt.")
             raise HTTPException(status_code=500, detail="Resume file not found on the server.")

        # Use PyMuPDF to extract text from the saved file
        try:
            doc = fitz.open(file_path)
            text = ""
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                text += page.get_text()
            doc.close()
        except fitz.FileDataError:
             raise HTTPException(status_code=400, detail="Invalid PDF file format or corrupted file.")
        except Exception as e:
             print(f"Error extracting text from PDF {file_path}: {e}")
             raise HTTPException(status_code=500, detail="Error extracting text from PDF.")


        if not text:
             raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        # --- Deduct credits AFTER successful preliminary checks ---
        await deduct_credits(str(current_user["_id"]), RESUME_CHECKER_COST, "Resume Checker")

        # --- Send text to Gemini API for ATS check ---
        model_name = 'gemini-1.5-flash' # Or 'gemini-1.5-pro'
        try:
            model = genai.GenerativeModel(model_name)
        except Exception as e:
             print(f"Error loading Gemini model {model_name}: {e}")
             raise HTTPException(status_code=500, detail=f"Error loading Gemini model {model_name}.")

        # Define the prompt for ATS check simulation
        # Instruct Gemini to provide a score and suggestions in JSON format
        prompt = f"""
        Analyze the following resume text from the perspective of an Applicant Tracking System (ATS).
        Assess its formatting, structure, keyword density (relevant to general job applications),
        clarity, and overall scannability by automated systems.

        Provide an ATS compatibility score out of 100.
        Also, list specific, actionable suggestions to improve the resume's ATS score and general effectiveness.

        Format the output strictly as a JSON object. Do not include any markdown formatting like ```json.
        The JSON object should have the following structure:
        {{
            "ats_score": 0, // Integer score out of 100
            "suggestions": [
                "Suggestion 1",
                "Suggestion 2",
                // ... list of suggestions for improvement
            ]
        }}

        Resume Text:
        {text}
        """

        # Generate content using Gemini
        try:
            response = model.generate_content(prompt)
        except Exception as e:
             print(f"Error calling Gemini API for ATS check: {e}")
             raise HTTPException(status_code=500, detail=f"Error calling Gemini API: {e}")

        # Check if the response contains text and attempt to parse it as JSON
        if not response.text:
             print("Gemini API returned an empty response text for ATS check.")
             raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        # Attempt to parse the response text as JSON directly
        try:
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                 json_string = response_text[len("```json"):].rstrip("```").strip()
            else:
                 json_string = response_text # Assume the entire response is JSON

            ats_data = json.loads(json_string)

            # Basic validation of the expected JSON structure
            if not isinstance(ats_data.get("ats_score"), int) or not isinstance(ats_data.get("suggestions"), list):
                 print(f"Gemini response did not match expected ATS JSON structure: {response.text}")
                 raise HTTPException(status_code=500, detail="Gemini API returned unexpected format for ATS check.")

            # Optional: Store the ATS analysis data back in the database
            # You might want a separate field for ATS analysis vs general analysis
            # resumes_collection.update_one(
            #     {"_id": ObjectId(resume_id)},
            #     {"$set": {"ats_analysis_data": ats_data}}
            # )

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from Gemini response for ATS check: {e}")
            print(f"Gemini raw response text: {response.text}")
            raise HTTPException(status_code=500, detail=f"Could not parse Gemini response as JSON for ATS check. Raw response: {response.text}")
        except OperationFailure as e:
             print(f"Database error while updating ATS analysis data for resume_id {resume_id}: {e}")
             pass # Continue and return the data even if DB update fails
        except Exception as e:
             print(f"Unexpected error processing Gemini response or updating DB for ATS check: {e}")
             raise HTTPException(status_code=500, detail=f"Unexpected error processing Gemini response for ATS check: {e}")

        return ats_data

    except HTTPException:
         # Re-raise HTTPExceptions (like insufficient credits)
         raise
    except OperationFailure:
         raise HTTPException(status_code=500, detail="Database error while retrieving resume metadata for ATS check.")
    except Exception as e:
        print(f"An unexpected error occurred during ATS check: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during ATS check: {e}")

@app.post("/generate-roadmap/", response_model=RoadmapResponse)
async def generate_roadmap(
    roadmap_request: RoadmapRequest,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to generate a personalized career roadmap using Gemini API.
    Requires JWT authentication and deducts credits.
    """
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=500, detail="Gemini API key not configured on the server.")
    if roadmaps_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    # --- Credit Check and Deduction ---
    if current_user.get("credits", 0) < ROADMAP_GENERATOR_COST:
         raise HTTPException(status_code=400, detail="Insufficient credits to generate roadmap.") # Or 402 Payment Required

    try:
        model_name = 'gemini-1.5-flash' # Or 'gemini-1.5-pro' - Choose based on complexity needs and cost
        try:
            model = genai.GenerativeModel(model_name)
        except Exception as e:
             print(f"Error loading Gemini model {model_name}: {e}")
             raise HTTPException(status_code=500, detail=f"Error loading Gemini model {model_name}.")

        # --- Deduct credits BEFORE calling Gemini API ---
        await deduct_credits(str(current_user["_id"]), ROADMAP_GENERATOR_COST, "Roadmap Generator")

        # Construct a detailed prompt for Gemini
        prompt = f"""
        Generate a personalized career roadmap based on the following user information.
        The roadmap should be structured as a series of steps and milestones to help the user transition
        from their current role to their target role within the specified timeframe.
        Include key skills to learn, projects to build, and potential learning resources or activities.
        Consider the user's current skills, areas of interest, and preferred learning style.

        Format the output strictly as a JSON object containing two arrays: "nodes" and "edges", suitable for visualization with React Flow.
        Do not include any markdown formatting like ```json.

        The "nodes" array should contain objects with the following structure:
        {{
            "id": "unique_node_id_string",
            "type": "string_representing_node_type", // e.g., "start", "step", "milestone", "skill", "project", "end"
            "data": {{ "label": "Node Title or Description" }}, # Data to be displayed in the node
            "position": {{ "x": 0, "y": 0 }} # Placeholder position, frontend will handle layout
        }}

        The "edges" array should contain objects with the following structure:
        {{
            "id": "unique_edge_id_string", # e.g., "edge-start-step1"
            "source": "source_node_id",
            "target": "target_node_id",
            "type": "string_representing_edge_type", # e.g., "smoothstep", "straight" (optional, default to "smoothstep")
            "animated": boolean, # true or false (optional)
            "label": "Edge Label" # Optional label for the edge
        }}

        Ensure the roadmap is logical, progressive, and achievable within the given timeframe.
        Break down larger goals into smaller, manageable steps.
        Include a clear start node (representing the current state) and an end node (representing achieving the target role).

        User Information:
        Current Role: {roadmap_request.current_role}
        Target Role: {roadmap_request.target_role}
        Years of Experience: {roadmap_request.years_of_experience}
        Timeframe: {roadmap_request.timeframe}
        Current Skills: {roadmap_request.current_skills}
        Areas of Interest: {roadmap_request.areas_of_interest}
        Preferred Learning Style: {roadmap_request.preferred_learning_style}
        """

        # Generate content using Gemini
        try:
            response = model.generate_content(prompt)
        except Exception as e:
             print(f"Error calling Gemini API for roadmap generation: {e}")
             # If Gemini fails AFTER deducting credits, you might consider refunding credits.
             # This adds complexity (e.g., what if refund fails?). For simplicity, we don't refund here.
             raise HTTPException(status_code=500, detail=f"Error calling Gemini API: {e}")

        # Check if the response contains text and attempt to parse it as JSON
        if not response.text:
             print("Gemini API returned an empty response text for roadmap generation.")
             raise HTTPException(status_code=500, detail="Gemini API returned an empty response.")

        # Attempt to parse the response text as JSON directly
        try:
            response_text = response.text.strip()
            # Clean up potential markdown code block wrappers
            if response_text.startswith("```json"):
                 json_string = response_text[len("```json"):].rstrip("```").strip()
            else:
                 json_string = response_text # Assume the entire response is JSON

            roadmap_data = json.loads(json_string)

            # Basic validation of the expected JSON structure for React Flow
            if not isinstance(roadmap_data.get("nodes"), list) or not isinstance(roadmap_data.get("edges"), list):
                 print(f"Gemini response did not match expected roadmap JSON structure: {response.text}")
                 raise HTTPException(status_code=500, detail="Gemini API returned unexpected format for roadmap.")

            # Add metadata before storing in DB
            roadmap_doc = {
                "uploader_id": str(current_user["_id"]),
                "generated_timestamp": datetime.now(timezone.utc),
                "request_data": roadmap_request.model_dump(), # Store the original request data
                "roadmap_data": roadmap_data # Store the generated nodes and edges
            }

            insert_result = roadmaps_collection.insert_one(roadmap_doc)
            roadmap_id = str(insert_result.inserted_id)

            # Prepare the response model
            response_roadmap_data = RoadmapResponse(
                roadmap_id=roadmap_id,
                nodes=roadmap_data.get("nodes", []),
                edges=roadmap_data.get("edges", []),
                generated_timestamp=roadmap_doc["generated_timestamp"]
            )

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from Gemini response for roadmap: {e}")
            print(f"Gemini raw response text: {response.text}")
            raise HTTPException(status_code=500, detail=f"Could not parse Gemini response as JSON for roadmap. Raw response: {response.text}")
        except OperationFailure as e:
             print(f"Database error while storing roadmap for user {current_user['email']}: {e}")
             # If DB storage fails, you might still want to return the generated data
             # For now, we raise an error. Adjust based on desired behavior.
             raise HTTPException(status_code=500, detail="Internal server error during roadmap storage.")
        except Exception as e:
             print(f"Unexpected error processing Gemini response or storing roadmap: {e}")
             raise HTTPException(status_code=500, detail=f"An unexpected error occurred during roadmap generation: {e}")

        return response_roadmap_data

    except HTTPException:
         # Re-raise HTTPExceptions (like insufficient credits)
         raise
    except Exception as e:
        print(f"An unexpected error occurred during roadmap generation: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during roadmap generation: {e}")

# Optional: Add an endpoint to retrieve a saved roadmap by ID
@app.get("/get-roadmap/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: str,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to retrieve a previously generated roadmap by its ID.
    Requires JWT authentication.
    """
    if roadmaps_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Validate roadmap_id format
        if not ObjectId.is_valid(roadmap_id):
             raise HTTPException(status_code=400, detail="Invalid roadmap ID format.")

        # Find the roadmap in the database, ensuring it belongs to the current user
        roadmap_doc = roadmaps_collection.find_one({
            "_id": ObjectId(roadmap_id),
            "uploader_id": str(current_user["_id"])
        })

        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found or you do not have permission to access it.")

        # Prepare the response model from the stored data
        response_roadmap_data = RoadmapResponse(
            roadmap_id=str(roadmap_doc["_id"]),
            nodes=roadmap_doc.get("roadmap_data", {}).get("nodes", []),
            edges=roadmap_doc.get("roadmap_data", {}).get("edges", []),
            generated_timestamp=roadmap_doc["generated_timestamp"]
        )

        return response_roadmap_data

    except OperationFailure as e:
         print(f"Database error while retrieving roadmap {roadmap_id}: {e}")
         raise HTTPException(status_code=500, detail="Database error while retrieving roadmap.")
    except Exception as e:
        print(f"An unexpected error occurred while retrieving roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while retrieving roadmap: {e}")


# Optional: Add an endpoint to list all roadmaps for the current user
@app.get("/list-roadmaps/", response_model=List[RoadmapResponse])
async def list_roadmaps(
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to list all roadmaps generated by the current user.
    Requires JWT authentication.
    """
    if roadmaps_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Find all roadmaps for the current user
        roadmap_docs = roadmaps_collection.find({"uploader_id": str(current_user["_id"])})

        roadmaps_list = []
        for doc in roadmap_docs:
            # Construct the response model for each roadmap
            roadmaps_list.append(RoadmapResponse(
                roadmap_id=str(doc["_id"]),
                nodes=doc.get("roadmap_data", {}).get("nodes", []),
                edges=doc.get("roadmap_data", {}).get("edges", []),
                generated_timestamp=doc["generated_timestamp"]
            ))

        return roadmaps_list

    except OperationFailure as e:
         print(f"Database error while listing roadmaps for user {current_user['email']}: {e}")
         raise HTTPException(status_code=500, detail="Database error while listing roadmaps.")
    except Exception as e:
        print(f"An unexpected error occurred while listing roadmaps: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while listing roadmaps: {e}")

@app.post("/buy-credits/")
async def buy_credits(
    purchase_request: CreditPurchaseRequest,
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to simulate buying credits.
    Requires JWT authentication.
    """
    try:
        await add_credits(
            user_id=str(current_user["_id"]),
            amount=purchase_request.amount,
            transaction_details=purchase_request.transaction_details
        )
        return {"message": f"Successfully added {purchase_request.amount} credits."}
    except HTTPException:
         # Re-raise HTTPExceptions from add_credits
         raise
    except Exception as e:
        print(f"An unexpected error occurred during credit purchase for user {current_user['email']}: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during credit purchase: {e}")

@app.get("/credits/", response_model=CreditBalanceResponse)
async def get_credits(
    current_user: dict = Depends(get_current_user) # Protect this endpoint with JWT
):
    """
    Endpoint to get the current user's credit balance.
    Requires JWT authentication.
    """
    if users_collection is None:
         raise HTTPException(status_code=500, detail="Database not connected.")

    try:
        # Retrieve the user document to get the credit balance
        user_doc = users_collection.find_one({"_id": ObjectId(current_user["_id"])})
        if not user_doc:
             # This case should ideally not happen if get_current_user succeeded
             raise HTTPException(status_code=404, detail="User not found.")

        return CreditBalanceResponse(credits=user_doc.get("credits", 0)) # Return 0 if credits field is missing

    except OperationFailure as e:
         print(f"Database error while fetching credits for user {current_user['email']}: {e}")
         raise HTTPException(status_code=500, detail="Database error while fetching credits.")
    except Exception as e:
        print(f"An unexpected error occurred while fetching credits: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while fetching credits: {e}")


# To run this application, save the code as main.py and run:
# uvicorn main:app --reload
# Make sure you have a .env file with MONGO_URI, DATABASE_NAME, GEMINI_API_KEY, and SECRET_KEY defined.
# Also, ensure the directory specified by UPLOAD_DIRECTORY exists or is created.
