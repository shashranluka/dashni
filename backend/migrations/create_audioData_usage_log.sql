-- Create table to log getAudioData usage
CREATE TABLE IF NOT EXISTS audioData_usage_log (
    id SERIAL PRIMARY KEY,
    is_authenticated BOOLEAN NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result_size_bytes INTEGER NOT NULL,
    db_query_ms INTEGER NOT NULL
);