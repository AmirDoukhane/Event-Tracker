import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


from app.main import app

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_create_event():
    response = client.post("/events/", json={"user_id": "user1", "type": "login"})
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "user1"
    assert data["type"] == "login"
    assert "id" in data
    assert "created_at" in data


def test_create_event_invalid_type():
    response = client.post("/events/", json={"user_id": "user1", "type": "invalid"})
    assert response.status_code == 422


def test_list_events():
    client.post("/events/", json={"user_id": "user1", "type": "login"})
    client.post("/events/", json={"user_id": "user1", "type": "transaction"})
    response = client.get("/events/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_events_filter_by_user():
    client.post("/events/", json={"user_id": "user1", "type": "login"})
    client.post("/events/", json={"user_id": "user2", "type": "login"})
    response = client.get("/events/?user_id=user1")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["user_id"] == "user1"


def test_list_events_filter_by_type():
    client.post("/events/", json={"user_id": "user1", "type": "login"})
    client.post("/events/", json={"user_id": "user1", "type": "transaction"})
    response = client.get("/events/?type=login")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_user_summary():
    client.post("/events/", json={"user_id": "user1", "type": "login"})
    client.post("/events/", json={"user_id": "user1", "type": "login"})
    client.post("/events/", json={"user_id": "user1", "type": "transaction"})
    response = client.get("/users/user1/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_events"] == 3
    assert data["by_type"]["login"] == 2
    assert data["by_type"]["transaction"] == 1
    assert data["first_event"] is not None
    assert data["last_event"] is not None


def test_user_summary_not_found():
    response = client.get("/users/unknown_user/summary")
    assert response.status_code == 404
