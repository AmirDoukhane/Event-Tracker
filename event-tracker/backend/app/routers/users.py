from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event
from app.schemas import UserSummary

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}/summary", response_model=UserSummary)
def get_user_summary(user_id: str, db: Session = Depends(get_db)) -> UserSummary:
    events = db.query(Event).filter(Event.user_id == user_id).all()

    if not events:
        raise HTTPException(status_code=404, detail="No events found for this user")

    by_type: dict[str, int] = {}
    for event in events:
        by_type[event.type.value] = by_type.get(event.type.value, 0) + 1

    dates = [e.created_at for e in events]

    return UserSummary(
        user_id=user_id,
        total_events=len(events),
        by_type=by_type,
        first_event=min(dates),
        last_event=max(dates),
    )
