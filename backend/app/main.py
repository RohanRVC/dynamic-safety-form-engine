from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.exc import OperationalError

from app.config import get_settings
from app.database import engine, Base
from app.models import Branch, FormDefinition, FormSubmission
from app.routers import metadata_router, form_router, submission_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        _seed_default_branches()
    except OperationalError as e:
        err = str(e.orig) if hasattr(e, "orig") and e.orig else str(e)
        if "could not translate host name" in err or "No such host" in err:
            raise RuntimeError(
                "Cannot reach Supabase (DNS/network). Use SESSION POOLER instead of direct connection: "
                "In Supabase Dashboard click Connect → choose 'Session' mode → copy the URI → set as DATABASE_URL in .env. "
                "Session pooler uses aws-0-REGION.pooler.supabase.com and works on IPv4 networks."
            ) from e
        raise
    yield


def _seed_default_branches():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Branch).count() == 0:
            defaults = [
                Branch(name="Downtown Site", location="New York"),
                Branch(name="Central Site", location="Chicago"),
                Branch(name="Northeast Site", location="Boston"),
                Branch(name="West Coast Site", location="San Francisco"),
            ]
            db.add_all(defaults)
            db.commit()
    finally:
        db.close()


app = FastAPI(
    title="Dynamic Safety Form Engine",
    description="API for managing dynamic safety inspection forms",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metadata_router.router)
app.include_router(form_router.router)
app.include_router(submission_router.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
