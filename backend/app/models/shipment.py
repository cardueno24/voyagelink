from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, nullable=False, index=True)
    carrier = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    estimated_delivery = Column(Date, nullable=True)
    actual_delivery = Column(Date, nullable=True)
    weight_kg = Column(Float, nullable=True)
    cargo_description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    events = relationship("ShipmentEvent", back_populates="shipment", cascade="all, delete-orphan")


class ShipmentEvent(Base):
    __tablename__ = "shipment_events"

    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    shipment = relationship("Shipment", back_populates="events")
