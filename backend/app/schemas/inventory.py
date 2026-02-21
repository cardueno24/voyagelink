from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TransactionCreate(BaseModel):
    transaction_type: str  # received | sold | adjustment
    quantity: int
    reference: Optional[str] = None
    notes: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    transaction_type: str
    quantity: int
    reference: Optional[str]
    notes: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    sku: str
    name: str
    category: Optional[str] = None
    current_stock: int = 0
    reorder_point: int = 10
    reorder_quantity: int = 100
    unit_cost: Optional[float] = None
    supplier: Optional[str] = None
    lead_time_days: int = 7


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    reorder_point: Optional[int] = None
    reorder_quantity: Optional[int] = None
    unit_cost: Optional[float] = None
    supplier: Optional[str] = None
    lead_time_days: Optional[int] = None


class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    category: Optional[str]
    current_stock: int
    reorder_point: int
    reorder_quantity: int
    unit_cost: Optional[float]
    supplier: Optional[str]
    lead_time_days: int
    created_at: datetime
    updated_at: datetime
    transactions: List[TransactionOut] = []

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    session_id: str
    message: str
