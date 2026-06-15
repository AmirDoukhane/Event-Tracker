from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.models import EventType


class EventCreate(BaseModel):
    user_id: str
    type: EventType
    payload: Optional[Any] = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    type: EventType
    created_at: datetime
    payload: Optional[Any] = None


class UserSummary(BaseModel):
    user_id: str
    total_events: int
    by_type: dict[str, int]
    first_event: Optional[datetime]
    last_event: Optional[datetime]
