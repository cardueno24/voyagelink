from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import AIConversation, Product, InventoryTransaction
from app.schemas.inventory import ChatRequest
from app.services.ai_service import chat_completion, settings
from app.services.forecast_service import generate_forecast

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/chat")
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    # Load conversation history
    history = (
        db.query(AIConversation)
        .filter(AIConversation.session_id == payload.session_id)
        .order_by(AIConversation.timestamp)
        .all()
    )
    messages = [{"role": r.role, "content": r.content} for r in history]
    messages.append({"role": "user", "content": payload.message})

    reply = chat_completion(messages)

    # Persist both turns
    db.add(AIConversation(session_id=payload.session_id, role="user", content=payload.message))
    db.add(AIConversation(
        session_id=payload.session_id,
        role="assistant",
        content=reply,
        model_used=settings.openrouter_model,
    ))
    db.commit()

    return {"reply": reply, "session_id": payload.session_id}


@router.get("/conversations/{session_id}")
def get_conversation(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(AIConversation)
        .filter(AIConversation.session_id == session_id)
        .order_by(AIConversation.timestamp)
        .all()
    )
    return [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in messages]


@router.post("/forecast/{product_id}")
def forecast_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    transactions = (
        db.query(InventoryTransaction)
        .filter(InventoryTransaction.product_id == product_id)
        .order_by(InventoryTransaction.timestamp.desc())
        .limit(30)
        .all()
    )

    product_dict = {
        "id": product.id,
        "sku": product.sku,
        "name": product.name,
        "category": product.category,
        "current_stock": product.current_stock,
        "reorder_point": product.reorder_point,
        "reorder_quantity": product.reorder_quantity,
        "unit_cost": product.unit_cost,
        "supplier": product.supplier,
        "lead_time_days": product.lead_time_days,
    }
    tx_list = [
        {
            "timestamp": str(t.timestamp),
            "transaction_type": t.transaction_type,
            "quantity": t.quantity,
        }
        for t in transactions
    ]

    forecast_text = generate_forecast(product_dict, tx_list)
    return {"product_id": product_id, "product_name": product.name, "forecast": forecast_text}


@router.post("/forecast/bulk")
def forecast_bulk(db: Session = Depends(get_db)):
    low_stock = db.query(Product).filter(Product.current_stock <= Product.reorder_point).all()
    results = []
    for product in low_stock:
        transactions = (
            db.query(InventoryTransaction)
            .filter(InventoryTransaction.product_id == product.id)
            .order_by(InventoryTransaction.timestamp.desc())
            .limit(30)
            .all()
        )
        product_dict = {
            "id": product.id, "sku": product.sku, "name": product.name,
            "category": product.category, "current_stock": product.current_stock,
            "reorder_point": product.reorder_point, "reorder_quantity": product.reorder_quantity,
            "unit_cost": product.unit_cost, "supplier": product.supplier,
            "lead_time_days": product.lead_time_days,
        }
        tx_list = [
            {"timestamp": str(t.timestamp), "transaction_type": t.transaction_type, "quantity": t.quantity}
            for t in transactions
        ]
        forecast_text = generate_forecast(product_dict, tx_list)
        results.append({"product_id": product.id, "product_name": product.name, "forecast": forecast_text})
    return results
