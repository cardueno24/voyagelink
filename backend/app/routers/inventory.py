from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Product, InventoryTransaction
from app.schemas.inventory import ProductCreate, ProductUpdate, ProductOut, TransactionCreate, TransactionOut

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/products", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = Query(None),
    low_stock: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if low_stock:
        query = query.filter(Product.current_stock <= Product.reorder_point)
    return query.order_by(Product.name).all()


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{payload.sku}' already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


@router.post("/products/{product_id}/transactions", response_model=TransactionOut, status_code=201)
def add_transaction(product_id: int, payload: TransactionCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    transaction = InventoryTransaction(product_id=product_id, **payload.model_dump())
    product.current_stock += payload.quantity
    if product.current_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below zero")
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/alerts", response_model=List[ProductOut])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.current_stock <= Product.reorder_point).order_by(Product.current_stock).all()


@router.get("/stats")
def inventory_stats(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    total_skus = len(products)
    alert_count = sum(1 for p in products if p.current_stock <= p.reorder_point)
    total_value = sum((p.current_stock * p.unit_cost) for p in products if p.unit_cost)
    return {"total_skus": total_skus, "alert_count": alert_count, "total_value": round(total_value, 2)}
