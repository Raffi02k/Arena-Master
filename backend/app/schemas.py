from pydantic import BaseModel
from typing import Any

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TournamentCreate(BaseModel):
    id: str
    name: str
    data: Any

class TournamentResponse(BaseModel):
    id: str
    name: str
    data: Any
    created_at: int
    user_id: int
    
    class Config:
        from_attributes = True
