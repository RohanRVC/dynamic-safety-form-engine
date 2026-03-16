# Dynamic Safety Form Engine

A full-stack, production-quality dynamic form engine for safety inspections. Administrators create custom form templates with schema-driven fields, logic rules, and dynamic data sources. Users fill forms, upload videos, and submit inspection data.

Live Link-: https://dynamic-safety-form-engine.vercel.app/

<img width="1919" height="991" alt="image" src="https://github.com/user-attachments/assets/c9bff883-f8b0-4c55-b9f0-8fe1cb1650cc" />

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  Vite + TailwindCSS + Shadcn UI + Framer Motion         │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │Form      │ │Form Renderer │ │ Logic Engine      │     │
│  │Builder   │ │(Dynamic)     │ │ (Conditional UI)  │     │
│  └──────────┘ └──────────────┘ └──────────────────┘     │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────────┐
│                    Backend (FastAPI)                      │
│  Pydantic Validation + SQLAlchemy ORM + Alembic          │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │Metadata  │ │Form Defs     │ │ Submissions       │     │
│  │Router    │ │Router        │ │ Router            │     │
│  └──────────┘ └──────────────┘ └──────────────────┘     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│              PostgreSQL (Supabase)                        │
│  branches │ form_definitions (JSONB) │ form_submissions   │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | React, Vite, TailwindCSS v4, Shadcn UI, Framer Motion  |
| Forms     | React Hook Form, Zod Validation                        |
| State     | Zustand                                                 |
| Backend   | FastAPI, Pydantic, SQLAlchemy, Alembic                  |
| Database  | PostgreSQL with JSONB fields (Supabase)                 |
| Storage   | Supabase Storage (video uploads)                        |

## Features

- **Form Builder** — Drag-and-drop field editor with live preview
- **Dynamic Schema** — JSON-driven forms stored as JSONB
- **Logic Engine** — Conditional visibility, dynamic required, highlight styling
- **Dynamic Data Sources** — Dropdowns auto-populate from API endpoints
- **Video Upload** — Capture and attach inspection videos
- **Schema Versioning** — Auto-incremented versions per template
- **Form Duplication** — One-click clone of form templates
- **Submission History** — Paginated, filterable submission records
- **Dashboard** — Overview with stats, alerts, recent submissions
- **Dark Mode** — System-aware theme toggle
- **Glassmorphism UI** — Premium SaaS-grade design

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Python** >= 3.11
- **PostgreSQL** (or Supabase account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run server (must be running before using the UI)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Quick check:** Open `http://127.0.0.1:8000/docs` — if you see Swagger, the API is up. If the Dashboard shows **Not Found** for Forms/Branches/Submissions, the frontend is not reaching this server (see Troubleshooting below).

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

**Local API URL:** The repo includes `frontend/.env.development` with `VITE_API_URL=http://127.0.0.1:8000` so the browser calls the backend directly (avoids proxy/404 issues on Windows). **Restart `npm run dev`** after any `.env` change. If you prefer the Vite proxy only, remove or comment out `VITE_API_URL` in that file.

### Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Troubleshooting: Dashboard shows "Not Found" and zeros

1. **Backend must be running** on port 8000 before opening the app.
2. Open **`http://127.0.0.1:8000/docs`** — if this fails, start uvicorn from `backend/` (see above).
3. If you still see **Not Found** in the red banner, ensure `frontend/.env.development` has `VITE_API_URL=http://127.0.0.1:8000` and **restart** the Vite dev server.
4. Your Supabase data is **not deleted** — the UI was failing to load because the API requests returned 404 until the backend is reachable.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive Swagger documentation.

### Endpoints

| Method | Endpoint                              | Description                |
|--------|---------------------------------------|----------------------------|
| GET    | `/metadata/branches`                  | List all branches          |
| POST   | `/metadata/branches`                  | Create a branch            |
| DELETE | `/metadata/branches/{id}`             | Delete a branch            |
| GET    | `/forms/definitions`                  | List all form templates    |
| POST   | `/forms/definitions`                  | Create form template       |
| GET    | `/forms/definitions/{id}`             | Get form by ID             |
| POST   | `/forms/definitions/{id}/duplicate`   | Duplicate a form           |
| DELETE | `/forms/definitions/{id}`             | Delete a form              |
| POST   | `/forms/{form_id}/submission`         | Submit form data           |
| GET    | `/forms/{form_id}/submissions`        | List submissions (paginated)|
| GET    | `/forms/submissions/all`              | All submissions (paginated)|
| GET    | `/health`                             | Health check               |

### Example: Create Form Template

```json
POST /forms/definitions
{
  "name": "Equipment Inspection",
  "schema": {
    "fields": [
      {
        "id": "equipment_type",
        "type": "select",
        "label": "Equipment Type",
        "options": ["Forklift", "Crane", "Truck"],
        "required": true
      },
      {
        "id": "depth",
        "type": "number",
        "label": "Inspection Depth"
      },
      {
        "id": "damage",
        "type": "radio_group",
        "label": "Is there damage?",
        "options": ["Yes", "No"]
      }
    ]
  },
  "logic_rules": [
    {
      "condition": { "field": "depth", "operator": ">=", "value": 4 },
      "action": { "type": "highlight", "target": "depth" }
    }
  ]
}
```

### Example: Submit Form Data

```json
POST /forms/1/submission
{
  "branch_id": 1,
  "data": {
    "equipment_type": "Forklift",
    "depth": 5,
    "damage": "Yes"
  }
}
```

## Database Schema

```sql
-- branches
id          SERIAL PRIMARY KEY
name        VARCHAR(255) NOT NULL
location    VARCHAR(255) NOT NULL
created_at  TIMESTAMPTZ DEFAULT NOW()

-- form_definitions
id          SERIAL PRIMARY KEY
name        VARCHAR(255) NOT NULL
schema_json JSONB NOT NULL
logic_rules JSONB DEFAULT '[]'
version     INTEGER DEFAULT 1
created_at  TIMESTAMPTZ DEFAULT NOW()

-- form_submissions
id              SERIAL PRIMARY KEY
form_id         INTEGER REFERENCES form_definitions(id)
branch_id       INTEGER REFERENCES branches(id)
submission_data JSONB NOT NULL
created_at      TIMESTAMPTZ DEFAULT NOW()
```

## Deployment

| Component | Platform     |
|-----------|--------------|
| Frontend  | Vercel       |
| Backend   | Render / Railway |
| Database  | Supabase PostgreSQL |

### Deploy Frontend to Vercel

```bash
cd frontend
npx vercel --prod
```

Set `VITE_API_URL` environment variable to your deployed backend URL.

### Deploy Backend to Render

1. Create a new Web Service on Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env`

## Project Structure

```
dynamic-safety-form-engine/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── config.py            # Pydantic settings
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic layer
│   │   ├── routers/             # API route handlers
│   │   └── utils/               # Schema & logic validators
│   ├── migrations/              # Alembic migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormBuilder/     # Drag-and-drop form builder
│   │   │   ├── FormRenderer/    # Dynamic form renderer
│   │   │   ├── LogicEngine/     # Conditional logic evaluator
│   │   │   ├── FieldEditor/     # Field properties panel
│   │   │   ├── SchemaParser/    # Live form preview
│   │   │   ├── VideoUploader/   # Video upload component
│   │   │   └── ui/              # Shadcn UI components
│   │   ├── pages/               # Route pages
│   │   ├── services/api.js      # Axios API client
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state stores
│   │   └── lib/utils.js         # Utility functions
│   └── package.json
└── README.md
```

## License

Rohan Vinay Chaudhary
