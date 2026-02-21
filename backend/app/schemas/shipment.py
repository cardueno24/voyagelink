from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ShipmentEventCreate(BaseModel):
    status: str
    location: Optional[str] = None
    description: Optional[str] = None


class ShipmentEventOut(BaseModel):
    id: int
    status: str
    location: Optional[str]
    description: Optional[str]
    timestamp: datetime

    model_config = {"from_attributes": True}


class ShipmentCreate(BaseModel):
    carrier: str
    origin: str
    destination: str
    cargo_description: Optional[str] = None
    estimated_delivery: Optional[date] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None
    tracking_number: Optional[str] = None


class ShipmentUpdate(BaseModel):
    carrier: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[str] = None
    cargo_description: Optional[str] = None
    estimated_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None


class ShipmentOut(BaseModel):
    id: int
    tracking_number: str
    carrier: str
    origin: str
    destination: str
    status: str
    estimated_delivery: Optional[date]
    actual_delivery: Optional[date]
    weight_kg: Optional[float]
    cargo_description: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    events: List[ShipmentEventOut] = []

    model_config = {"from_attributes": True}
