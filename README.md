# VoyageLink

Supply chain management platform with AI-powered forecasting. Tracks shipments, manages inventory, and provides demand forecasts via an integrated AI assistant.

## Stack

- **Frontend**: React 18 + Vite, TailwindCSS, React Query, Recharts
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **AI**: OpenRouter API (GPT-4o-mini by default)

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Configure environment

Copy `.env` and fill in your values:

```bash
cp .env .env.local
```

Key variables:

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | API key from [openrouter.ai](https://openrouter.ai) |
| `ADMIN_USERNAME` | Login username (default: `admin`) |
| `ADMIN_PASSWORD` | Login password (default: `voyagelink`) |
| `JWT_SECRET` | Secret for signing tokens — **change this in production** |

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py          # optional: load sample data
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Default credentials

```
Username: admin
Password: voyagelink
```

## Features

- **Dashboard** — shipment status overview, inventory metrics, recent activity
- **Shipments** — full CRUD, status tracking with event timeline, carrier/status filtering, pagination
- **Inventory** — product management, stock adjustments, low-stock alerts, category filtering, pagination
- **Forecasting** — AI-generated 30-day demand forecasts per product with stock history charts
- **AI Assistant** — multi-turn chat for supply chain questions, powered by OpenRouter

## Notes

- SQLite is used for simplicity. For production, switch to PostgreSQL by updating `DATABASE_URL`.
- The `.env` file contains secrets — do not commit it to a public repository.
