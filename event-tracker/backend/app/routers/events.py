from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event, EventType
from app.schemas import EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventOut, status_code=201)
def create_event(event: EventCreate, db: Session = Depends(get_db)) -> Event:
    db_event = Event(
        user_id=event.user_id,
        type=event.type,
        payload=event.payload,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/", response_model=list[EventOut])
def list_events(
    user_id: Optional[str] = None,
    type: Optional[EventType] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
) -> list[Event]:
    query = db.query(Event)
    if user_id:
        query = query.filter(Event.user_id == user_id)
    if type:
        query = query.filter(Event.type == type)
    return query.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()
