from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 — registers all ORM models before create_all

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoyageLink API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import shipments, inventory, ai, dashboard  # noqa: E402

app.include_router(shipments.router)
app.include_router(inventory.router)
app.include_router(ai.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "VoyageLink"}
