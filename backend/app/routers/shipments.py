import random
import string
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.shipment import Shipment, ShipmentEvent
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut, ShipmentEventCreate, ShipmentEventOut

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


def generate_tracking_number() -> str:
    suffix = "".join(random.choices(string.digits, k=5))
    year = datetime.now().year
    return f"VL-{year}-{suffix}"


@router.get("", response_model=List[ShipmentOut])
def list_shipments(
    status: Optional[str] = Query(None),
    carrier: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Shipment)
    if status:
        query = query.filter(Shipment.status == status)
    if carrier:
        query = query.filter(Shipment.carrier == carrier)
    return query.order_by(Shipment.updated_at.desc()).all()


@router.post("", response_model=ShipmentOut, status_code=201)
def create_shipment(payload: ShipmentCreate, db: Session = Depends(get_db)):
    tracking = payload.tracking_number or generate_tracking_number()
    shipment = Shipment(
        tracking_number=tracking,
        carrier=payload.carrier,
        origin=payload.origin,
        destination=payload.destination,
        cargo_description=payload.cargo_description,
        estimated_delivery=payload.estimated_delivery,
        weight_kg=payload.weight_kg,
        notes=payload.notes,
        status="pending",
    )
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    # Create initial event
    event = ShipmentEvent(shipment_id=shipment.id, status="pending", description="Shipment created")
    db.add(event)
    db.commit()
    db.refresh(shipment)
    return shipment


@router.get("/stats")
def shipment_stats(db: Session = Depends(get_db)):
    statuses = ["pending", "in_transit", "customs", "delivered", "delayed"]
    counts = {s: db.query(Shipment).filter(Shipment.status == s).count() for s in statuses}
    total = db.query(Shipment).count()
    return {"total": total, "by_status": counts}


@router.get("/{shipment_id}", response_model=ShipmentOut)
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


@router.put("/{shipment_id}", response_model=ShipmentOut)
def update_shipment(shipment_id: int, payload: ShipmentUpdate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(shipment, field, value)
    db.commit()
    db.refresh(shipment)
    return shipment


@router.delete("/{shipment_id}", status_code=204)
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    db.delete(shipment)
    db.commit()


@router.post("/{shipment_id}/events", response_model=ShipmentEventOut, status_code=201)
def add_event(shipment_id: int, payload: ShipmentEventCreate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    event = ShipmentEvent(
        shipment_id=shipment_id,
        status=payload.status,
        location=payload.location,
        description=payload.description,
    )
    shipment.status = payload.status
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
