from sqlalchemy import Column, String, Integer, ForeignKey, BigInteger
from fastapi.security import OAuth2PasswordBearer
from .db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    data = Column(String) # JSON string
    created_at = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
