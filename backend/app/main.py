from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .db import engine
from .routers import auth, tournaments

app = FastAPI(title="Arena-Master API")

models.Base.metadata.create_all(bind=engine)

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
