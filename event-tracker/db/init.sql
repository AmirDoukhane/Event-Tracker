CREATE TABLE IF NOT EXISTS events (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
