import json
import time
from .db import SessionLocal, engine
from . import models
from .auth.jwt import get_password_hash

def seed_db():
    print("Creating tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Checking for existing test user...")
    test_user = db.query(models.User).filter(models.User.email == "test@example.com").first()
    
    if not test_user:
        print("Creating test user (test@example.com / password123)...")
        test_user = models.User(
            email="test@example.com",
            hashed_password=get_password_hash("password123")
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
    else:
        print("Test user already exists.")

    print("Checking for existing tournaments...")
    existing_tournaments = db.query(models.Tournament).filter(models.Tournament.user_id == test_user.id).first()
    
    if not existing_tournaments:
        print("Creating seed tournament...")
        demo_data = {
            "name": "Demo Tournament",
            "participants": ["Alice", "Bob", "Charlie", "David"],
            "matches": []
        }
        
        test_tourn = models.Tournament(
            id="demo-tourn-1",
            name="Demo Tournament",
            data=json.dumps(demo_data),
            created_at=int(time.time() * 1000),
            user_id=test_user.id
        )
        db.add(test_tourn)
        db.commit()
        print("Seed tournament created.")
    else:
        print("Tournaments already exist.")

    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_db()
