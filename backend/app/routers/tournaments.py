import json
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models, schemas
from ..auth.jwt import get_current_user

router = APIRouter(
    prefix="/tournaments",
    tags=["tournaments"]
)

@router.get("/", response_model=list[schemas.TournamentResponse])
def read_tournaments(session: Session = Depends(db.get_db), current_user: models.User = Depends(get_current_user)):
    tournaments = session.query(models.Tournament).filter(models.Tournament.user_id == current_user.id).order_by(models.Tournament.created_at.desc()).all()
    
    # Parse the stringified JSON data before returning
    res = []
    for t in tournaments:
        try:
            data = json.loads(t.data)
        except:
            data = {}
        res.append({
            "id": t.id,
            "name": t.name,
            "data": data,
            "created_at": t.created_at,
            "user_id": t.user_id
        })
    return res

@router.post("/")
def create_tournament(tourn: schemas.TournamentCreate, session: Session = Depends(db.get_db), current_user: models.User = Depends(get_current_user)):
    # Check if tournament already exists
    existing = session.query(models.Tournament).filter(models.Tournament.id == tourn.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tournament with this ID already exists")

    db_tourn = models.Tournament(
        id=tourn.id,
        name=tourn.name,
        data=json.dumps(tourn.data),
        created_at=int(time.time() * 1000),
        user_id=current_user.id
    )
    session.add(db_tourn)
    session.commit()
    return {"success": True}

@router.get("/{tournament_id}")
def read_tournament(tournament_id: str, session: Session = Depends(db.get_db), current_user: models.User = Depends(get_current_user)):
    tourn = session.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tourn:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tourn.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this tournament")
    
    try:
        data = json.loads(tourn.data)
        return data
    except:
        return {}

@router.patch("/{tournament_id}")
def update_tournament(tournament_id: str, payload: dict, session: Session = Depends(db.get_db), current_user: models.User = Depends(get_current_user)):
    data = payload.get("data")
    if not data:
        raise HTTPException(status_code=400, detail="Data payload is required")
        
    tourn = session.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tourn:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tourn.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this tournament")
        
    tourn.data = json.dumps(data)
    session.commit()
    return {"success": True}

@router.delete("/{tournament_id}")
def delete_tournament(tournament_id: str, session: Session = Depends(db.get_db), current_user: models.User = Depends(get_current_user)):
    tourn = session.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tourn:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tourn.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this tournament")
        
    session.delete(tourn)
    session.commit()
    return {"success": True}
