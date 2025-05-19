from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "career_platform")

# Create MongoDB client
try:
    client = MongoClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # Test connection
    client.admin.command('ping')
    logger.info(f"Connected to MongoDB database: {DB_NAME}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise

# Collections
users = db.users
resumes = db.resumes
roadmaps = db.roadmaps
business_connections = db.business_connections
tokens = db.tokens
token_transactions = db.token_transactions

# Helper function to convert MongoDB ObjectId to string
def serialize_id(obj):
    if isinstance(obj, dict) and '_id' in obj:
        obj['id'] = str(obj['_id'])
        del obj['_id']
    return obj

# Helper function to convert string ID to ObjectId
def parse_id(id_str):
    try:
        return ObjectId(id_str)
    except:
        return id_str
