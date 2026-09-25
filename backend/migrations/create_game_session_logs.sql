-- Migration: create game_session_logs table
CREATE TABLE IF NOT EXISTS game_session_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_authenticated BOOLEAN,
    segment_id INTEGER,
    direction TEXT,
    game_type TEXT,
    selection_mode TEXT,
    word_count INTEGER,
    word_filter TEXT,
    learned_word_ids INTEGER[],
    needs_learning_word_ids INTEGER[],
    score INTEGER,
    attempts INTEGER,
    params JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_session_logs_user_id ON game_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_game_session_logs_segment_id ON game_session_logs(segment_id);
CREATE INDEX IF NOT EXISTS idx_game_session_logs_created_at ON game_session_logs(created_at);
