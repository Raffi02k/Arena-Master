import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Create database file in the same directory as this script, or specify a path
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'tournaments.db')}")

# WAL mode is recommended for SQLite to allow concurrent reads and writes
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
with engine.connect() as con:
    con.exec_driver_sql("PRAGMA journal_mode=WAL;")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
