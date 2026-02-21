from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    current_stock = Column(Integer, nullable=False, default=0)
    reorder_point = Column(Integer, nullable=False, default=10)
    reorder_quantity = Column(Integer, nullable=False, default=100)
    unit_cost = Column(Float, nullable=True)
    supplier = Column(String, nullable=True)
    lead_time_days = Column(Integer, default=7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    transactions = relationship("InventoryTransaction", back_populates="product", cascade="all, delete-orphan")


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String, nullable=False)  # received | sold | adjustment
    quantity = Column(Integer, nullable=False)
    reference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="transactions")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    model_used = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
