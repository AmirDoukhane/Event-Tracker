import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, JSON
from app.database import Base


class EventType(str, enum.Enum):
    login = "login"
    transaction = "transaction"
    report = "report"


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    type = Column(Enum(EventType), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = Column(JSON, nullable=True)
