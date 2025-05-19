from datetime import datetime
from typing import Optional, List, Dict
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field

class PaymentMethod(BaseModel):
    type: str  # "credit_card", "paypal", "crypto"
    last_four: Optional[str] = None
    expiry_date: Optional[str] = None

class Transaction(BaseModel):
    transaction_id: str
    date: datetime
    amount: float
    status: str  # "success", "failed", "pending"

class Subscription(Document):
    user_id: PydanticObjectId
    plan_id: str  # "free", "pro", "premium"
    status: str  # "active", "canceled", "expired"
    start_date: datetime
    end_date: Optional[datetime] = None
    renewal_date: Optional[datetime] = None
    payment_method: Optional[PaymentMethod] = None
    price: float
    currency: str = "USD"
    is_auto_renew: bool = True
    tokens_per_month: int
    features: List[str] = []
    transaction_history: List[Transaction] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "subscriptions"
        indexes = [
            "user_id",
            "status"
        ]

class SubscriptionCreate(BaseModel):
    plan_id: str
    payment_method: PaymentMethod