from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
# Removed: from pydantic import BaseModel # Already in models
from datetime import datetime
from bson import ObjectId # For ID validation and conversion

# Database and models
from database import business_connections, serialize_id, parse_id # PyMongo collection
from models import (
    User, 
    BusinessConnectionCreate, 
    BusinessConnectionUpdate,
    BusinessConnection as BusinessConnectionResponse # Use the main model for response
)
# Auth
from auth import get_current_active_user # Your existing auth

router = APIRouter()

# Note: The Pydantic models BusinessConnectionCreate, BusinessConnectionResponse, 
# BusinessConnectionUpdate were previously defined in this file.
# It's good practice to have them in models.py. I'm assuming they are now in models.py
# based on the refactoring of models.py. If not, they should be moved there or imported.
# For this example, I'm using the ones from the modified models.py.

@router.post("/", response_model=BusinessConnectionResponse, status_code=status.HTTP_201_CREATED)
def create_business_connection(
    connection_in: BusinessConnectionCreate, 
    current_user: User = Depends(get_current_active_user)
):
    connection_data = connection_in.dict()
    connection_data["owner_id"] = str(current_user.id) # Store owner_id as string
    connection_data["status"] = "pending" # Default status
    connection_data["created_at"] = datetime.utcnow()
    connection_data["updated_at"] = datetime.utcnow()
    
    result = business_connections.insert_one(connection_data)
    created_connection = business_connections.find_one({"_id": result.inserted_id})
    
    if not created_connection:
        raise HTTPException(status_code=500, detail="Failed to create business connection")
        
    return BusinessConnectionResponse(**serialize_id(created_connection))

@router.get("/", response_model=List[BusinessConnectionResponse])
def get_user_business_connections(
    current_user: User = Depends(get_current_active_user)
):
    user_id_str = str(current_user.id)
    connections_cursor = business_connections.find({"owner_id": user_id_str})
    return [BusinessConnectionResponse(**serialize_id(conn)) for conn in connections_cursor]

@router.get("/{connection_id}", response_model=BusinessConnectionResponse)
def get_business_connection(
    connection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    obj_id = parse_id(connection_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid connection ID format")

    connection = business_connections.find_one({
        "_id": obj_id, 
        "owner_id": str(current_user.id)
    })
    if not connection:
        raise HTTPException(status_code=404, detail="Business connection not found")
    return BusinessConnectionResponse(**serialize_id(connection))

@router.put("/{connection_id}", response_model=BusinessConnectionResponse)
def update_business_connection(
    connection_id: str,
    connection_update: BusinessConnectionUpdate,
    current_user: User = Depends(get_current_active_user)
):
    obj_id = parse_id(connection_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid connection ID format")

    # Ensure the connection exists and belongs to the user
    existing_connection = business_connections.find_one({
        "_id": obj_id,
        "owner_id": str(current_user.id)
    })
    if not existing_connection:
        raise HTTPException(status_code=404, detail="Business connection not found or access denied")

    update_data = connection_update.dict(exclude_unset=True) # Get only provided fields
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
        
    update_data["updated_at"] = datetime.utcnow()
    
    result = business_connections.update_one(
        {"_id": obj_id, "owner_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business connection not found or update failed")
    
    updated_doc = business_connections.find_one({"_id": obj_id})
    return BusinessConnectionResponse(**serialize_id(updated_doc))

@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business_connection(
    connection_id: str,
    current_user: User = Depends(get_current_active_user)
):
    obj_id = parse_id(connection_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid connection ID format")

    result = business_connections.delete_one({
        "_id": obj_id,
        "owner_id": str(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Business connection not found or access denied")
    
    return None # For 204 response

@router.post("/{connection_id}/status/{new_status}", response_model=BusinessConnectionResponse)
def update_connection_status(
    connection_id: str,
    new_status: str, # Changed from 'status' to 'new_status' to avoid conflict
    current_user: User = Depends(get_current_active_user)
):
    if new_status not in ["pending", "connected", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'pending', 'connected', or 'rejected'")
    
    obj_id = parse_id(connection_id)
    if not obj_id:
        raise HTTPException(status_code=400, detail="Invalid connection ID format")

    result = business_connections.update_one(
        {"_id": obj_id, "owner_id": str(current_user.id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business connection not found or update failed")
        
    updated_doc = business_connections.find_one({"_id": obj_id})
    return BusinessConnectionResponse(**serialize_id(updated_doc))