"""Seed the VoyageLink database with realistic sample data."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from app.database import SessionLocal
from app.models.shipment import Shipment, ShipmentEvent
from app.models.inventory import Product, InventoryTransaction

db = SessionLocal()

# ── Shipments ──────────────────────────────────────────────────────────────
shipments_data = [
    dict(tracking_number="VL-2025-001", carrier="FedEx Freight",     origin="Shanghai, CN",    destination="Los Angeles, US", status="delivered",  weight_kg=320.5, cargo_description="Electronics components", estimated_delivery=date.today()-timedelta(days=2), actual_delivery=date.today()-timedelta(days=1)),
    dict(tracking_number="VL-2025-002", carrier="Maersk Line",       origin="Rotterdam, NL",   destination="New York, US",    status="in_transit", weight_kg=1240.0, cargo_description="Industrial machinery",  estimated_delivery=date.today()+timedelta(days=5)),
    dict(tracking_number="VL-2025-003", carrier="DHL Express",       origin="Mumbai, IN",      destination="Chicago, US",     status="customs",    weight_kg=85.2,  cargo_description="Textile goods",         estimated_delivery=date.today()+timedelta(days=2)),
    dict(tracking_number="VL-2025-004", carrier="UPS Supply Chain",  origin="Shenzhen, CN",    destination="Seattle, US",     status="delayed",    weight_kg=410.0, cargo_description="Consumer electronics",  estimated_delivery=date.today()-timedelta(days=1), notes="Port congestion delay at origin"),
    dict(tracking_number="VL-2025-005", carrier="Evergreen Marine",  origin="Busan, KR",       destination="Long Beach, US",  status="in_transit", weight_kg=2100.0, cargo_description="Auto parts",           estimated_delivery=date.today()+timedelta(days=8)),
    dict(tracking_number="VL-2025-006", carrier="FedEx Freight",     origin="Frankfurt, DE",   destination="Miami, US",       status="pending",    weight_kg=55.0,  cargo_description="Pharmaceuticals",       estimated_delivery=date.today()+timedelta(days=3)),
    dict(tracking_number="VL-2025-007", carrier="DHL Express",       origin="Tokyo, JP",       destination="Houston, US",     status="delivered",  weight_kg=178.5, cargo_description="Precision instruments", estimated_delivery=date.today()-timedelta(days=4), actual_delivery=date.today()-timedelta(days=3)),
    dict(tracking_number="VL-2025-008", carrier="MSC",               origin="Singapore, SG",   destination="Savannah, US",    status="in_transit", weight_kg=890.0, cargo_description="Chemical raw materials", estimated_delivery=date.today()+timedelta(days=12)),
]

for s in shipments_data:
    if not db.query(Shipment).filter_by(tracking_number=s["tracking_number"]).first():
        db.add(Shipment(**s))

db.commit()

# ── Products ───────────────────────────────────────────────────────────────
products_data = [
    dict(sku="ELC-001", name="Microcontroller Unit MCU-32",   category="Electronics",  current_stock=145,  reorder_point=50,  reorder_quantity=200, unit_cost=12.50, supplier="Shenzhen Tech Co.",   lead_time_days=14),
    dict(sku="ELC-002", name="OLED Display 2.8 inch",         category="Electronics",  current_stock=8,    reorder_point=25,  reorder_quantity=100, unit_cost=8.75,  supplier="Shenzhen Tech Co.",   lead_time_days=10),
    dict(sku="IND-001", name="Industrial Bearing 6205",       category="Industrial",   current_stock=320,  reorder_point=100, reorder_quantity=500, unit_cost=3.20,  supplier="SKF Distribution",    lead_time_days=7),
    dict(sku="IND-002", name="Hydraulic Seal Kit HK-40",      category="Industrial",   current_stock=12,   reorder_point=30,  reorder_quantity=150, unit_cost=22.00, supplier="Parker Hannifin",     lead_time_days=5),
    dict(sku="TEX-001", name="Cotton Fabric Roll 100m",       category="Textile",      current_stock=480,  reorder_point=100, reorder_quantity=300, unit_cost=45.00, supplier="Mumbai Mills Ltd.",   lead_time_days=21),
    dict(sku="TEX-002", name="Polyester Thread 1kg Spool",    category="Textile",      current_stock=95,   reorder_point=50,  reorder_quantity=200, unit_cost=6.50,  supplier="Mumbai Mills Ltd.",   lead_time_days=14),
    dict(sku="PHM-001", name="Vitamin C Powder 25kg",         category="Pharma",       current_stock=6,    reorder_point=20,  reorder_quantity=50,  unit_cost=180.00,supplier="Roche Ingredients",  lead_time_days=30),
    dict(sku="PHM-002", name="Sterile Vials 10ml (box/100)",  category="Pharma",       current_stock=240,  reorder_point=80,  reorder_quantity=400, unit_cost=35.00, supplier="Gerresheimer AG",    lead_time_days=15),
    dict(sku="AUT-001", name="Brake Pad Set BPS-220",         category="Auto Parts",   current_stock=185,  reorder_point=60,  reorder_quantity=300, unit_cost=18.40, supplier="Bosch Auto Parts",   lead_time_days=7),
    dict(sku="AUT-002", name="Oil Filter OF-4477",            category="Auto Parts",   current_stock=22,   reorder_point=40,  reorder_quantity=200, unit_cost=4.90,  supplier="Bosch Auto Parts",   lead_time_days=7),
]

for p in products_data:
    if not db.query(Product).filter_by(sku=p["sku"]).first():
        db.add(Product(**p))

db.commit()

print("✓ Seeded", len(shipments_data), "shipments and", len(products_data), "products.")
db.close()
