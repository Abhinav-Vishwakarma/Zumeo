from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class TokenTransaction(BaseModel):
    type: str  # "purchase", "usage", "reward", "subscription", "referral"
    amount: int
    description: str
    metadata: Dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TokenBalance(Document):
    user_id: PydanticObjectId
    balance: int = 0
    transactions: List[TokenTransaction] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "token_balances"
        indexes = [
            "user_id"
        ]

class TokenPurchase(BaseModel):
    amount: int
    payment_method: str  # "credit_card", "paypal", "crypto"