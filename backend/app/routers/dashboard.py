from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import verify_token
from app.database import get_db
from app.models.shipment import Shipment
from app.models.inventory import Product

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"], dependencies=[Depends(verify_token)])


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    statuses = ["pending", "in_transit", "customs", "delivered", "delayed"]
    shipment_counts = {s: db.query(Shipment).filter(Shipment.status == s).count() for s in statuses}
    total_shipments = db.query(Shipment).count()

    recent_shipments = (
        db.query(Shipment)
        .order_by(Shipment.updated_at.desc())
        .limit(5)
        .all()
    )

    products = db.query(Product).all()
    total_skus = len(products)
    alert_count = sum(1 for p in products if p.current_stock <= p.reorder_point)
    total_value = sum((p.current_stock * p.unit_cost) for p in products if p.unit_cost)

    return {
        "shipments": {
            "total": total_shipments,
            "by_status": shipment_counts,
            "recent": [
                {
                    "id": s.id,
                    "tracking_number": s.tracking_number,
                    "carrier": s.carrier,
                    "origin": s.origin,
                    "destination": s.destination,
                    "status": s.status,
                    "updated_at": s.updated_at,
                }
                for s in recent_shipments
            ],
        },
        "inventory": {
            "total_skus": total_skus,
            "alert_count": alert_count,
            "total_value": round(total_value, 2),
        },
    }
