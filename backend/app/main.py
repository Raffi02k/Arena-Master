from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .db import engine
from .routers import auth, tournaments

from sqlalchemy import text

app = FastAPI(title="Arena-Master API")

models.Base.metadata.create_all(bind=engine)

# Migration: Ensure created_at is BigInt for existing databases
try:
    with engine.connect() as conn:
        if not str(engine.url).startswith("sqlite"):
            conn.execute(text("ALTER TABLE tournaments ALTER COLUMN created_at TYPE BIGINT"))
            conn.commit()
except Exception as e:
    print(f"Migration notice: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for Vercel/Production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tournaments.router)

@app.get("/")
def root():
    return {"message": "Arena-Master API is running"}
