from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Database and models
from database import tokens, token_transactions, serialize_id, parse_id # PyMongo collections
from models import (
    User, 
    TokenResponse, # This is for the balance
    TokenTransactionCreate, 
    TokenTransactionResponse
)
# Auth
from auth import get_current_active_user

router = APIRouter()

# Pydantic models are assumed to be in models.py

@router.get("/balance", response_model=TokenResponse)
def get_token_balance(
    current_user: User = Depends(get_current_active_user)
):
    user_id_str = str(current_user.id)
    token_balance_doc = tokens.find_one({"owner_id": user_id_str})
    
    if not token_balance_doc:
        # Create a new token balance document for the user if it doesn't exist
        new_token_data = {
            "owner_id": user_id_str,
            "amount": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = tokens.insert_one(new_token_data)
        token_balance_doc = tokens.find_one({"_id": result.inserted_id})
        if not token_balance_doc:
             raise HTTPException(status_code=500, detail="Failed to initialize token balance")

    return TokenResponse(**serialize_id(token_balance_doc))

@router.post("/purchase", response_model=TokenResponse)
def purchase_tokens(
    transaction_in: TokenTransactionCreate,
    current_user: User = Depends(get_current_active_user)
):
    if transaction_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive for purchase")
    
    user_id_str = str(current_user.id)
    
    # Get or create token balance document for user
    token_balance_doc = tokens.find_one({"owner_id": user_id_str})
    if not token_balance_doc:
        new_token_data = { "owner_id": user_id_str, "amount": 0, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
        insert_result = tokens.insert_one(new_token_data)
        token_balance_doc_id = insert_result.inserted_id
    else:
        token_balance_doc_id = token_balance_doc["_id"]

    # Update token amount: Use $inc for atomic increment
    update_result = tokens.update_one(
        {"_id": token_balance_doc_id, "owner_id": user_id_str}, # ensure we update the correct doc
        {"$inc": {"amount": transaction_in.amount}, "$set": {"updated_at": datetime.utcnow()}},
        upsert=True # This will create the document if it doesn't exist with owner_id and amount:0 initially.
                    # However, explicit creation above is clearer for initial amount.
                    # If using upsert=True with $inc, ensure initial structure is what you expect.
                    # Let's stick to explicit creation for clarity and control.
    )
    
    if update_result.matched_count == 0 and not update_result.upserted_id:
         # Fallback if find_one initially missed and upsert didn't trigger as expected or failed
        current_balance_doc = tokens.find_one({"owner_id": user_id_str})
        if not current_balance_doc: # Still not there, something is wrong
            raise HTTPException(status_code=500, detail="Failed to update token balance.")
        # If it exists now, it means the initial find_one was stale or there was a race. Retry inc.
        update_result = tokens.update_one(
            {"_id": current_balance_doc["_id"]},
            {"$inc": {"amount": transaction_in.amount}, "$set": {"updated_at": datetime.utcnow()}},
        )
        if update_result.matched_count == 0:
             raise HTTPException(status_code=500, detail="Failed to update token balance after retry.")


    # Create transaction record
    transaction_data = {
        "token_id": str(token_balance_doc_id), # Link to the user's token balance document
        "owner_id": user_id_str,
        "amount": transaction_in.amount, # Positive for purchase
        "description": transaction_in.description,
        "created_at": datetime.utcnow()
    }
    token_transactions.insert_one(transaction_data)
    
    updated_token_balance_doc = tokens.find_one({"_id": token_balance_doc_id})
    return TokenResponse(**serialize_id(updated_token_balance_doc))

@router.post("/use", response_model=TokenResponse)
def use_tokens(
    transaction_in: TokenTransactionCreate, # Amount here is the amount to *use* (positive value)
    current_user: User = Depends(get_current_active_user)
):
    if transaction_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount to use must be positive")
    
    user_id_str = str(current_user.id)
    token_to_use = transaction_in.amount

    # Get token record for user
    token_balance_doc = tokens.find_one({"owner_id": user_id_str})
    if not token_balance_doc:
        raise HTTPException(status_code=404, detail="No token balance found. Purchase tokens first.")
    
    # Check if user has enough tokens
    if token_balance_doc["amount"] < token_to_use:
        raise HTTPException(status_code=400, detail="Insufficient token balance")
    
    # Deduct tokens: Use $inc with a negative value
    update_result = tokens.update_one(
        {"_id": token_balance_doc["_id"], "owner_id": user_id_str, "amount": {"$gte": token_to_use}}, # Atomic check and update
        {"$inc": {"amount": -token_to_use}, "$set": {"updated_at": datetime.utcnow()}}
    )

    if update_result.matched_count == 0:
        # This means either the document wasn't found (unlikely if checked before)
        # or the amount condition (amount >= token_to_use) failed due to a concurrent update.
        current_actual_balance = tokens.find_one({"_id": token_balance_doc["_id"]})
        if current_actual_balance and current_actual_balance["amount"] < token_to_use:
            raise HTTPException(status_code=400, detail="Insufficient token balance due to concurrent update or change.")
        else:
            # Could be a different rare race condition or document gone.
            raise HTTPException(status_code=500, detail="Failed to use tokens. Please try again.")

    # Create transaction record (negative amount for usage)
    transaction_data = {
        "token_id": str(token_balance_doc["_id"]),
        "owner_id": user_id_str,
        "amount": -token_to_use, # Store as negative to indicate deduction
        "description": transaction_in.description,
        "created_at": datetime.utcnow()
    }
    token_transactions.insert_one(transaction_data)
    
    updated_token_balance_doc = tokens.find_one({"_id": token_balance_doc["_id"]})
    return TokenResponse(**serialize_id(updated_token_balance_doc))

@router.get("/transactions", response_model=List[TokenTransactionResponse])
def get_token_transactions(
    current_user: User = Depends(get_current_active_user)
):
    user_id_str = str(current_user.id)
    # Get transactions for the user
    transactions_cursor = token_transactions.find({"owner_id": user_id_str}).sort("created_at", -1) # Sort by most recent
    
    return [TokenTransactionResponse(**serialize_id(t)) for t in transactions_cursor]