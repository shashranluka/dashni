-- Migration: Replace legacy results arrays with row-based user_word_status
-- Up
BEGIN;

DROP TABLE IF EXISTS results CASCADE;

CREATE TABLE IF NOT EXISTS user_word_status (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('public', 'private')),
  word_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('learned', 'needs')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_source_word UNIQUE (user_id, source, word_id)
);

CREATE INDEX IF NOT EXISTS idx_uws_user_source_status
  ON user_word_status (user_id, source, status);

CREATE INDEX IF NOT EXISTS idx_uws_user_source_word
  ON user_word_status (user_id, source, word_id);

COMMIT;

-- Down (Rollback)
-- BEGIN;
-- DROP TABLE IF EXISTS user_word_status CASCADE;
-- CREATE TABLE IF NOT EXISTS results (
--   id SERIAL PRIMARY KEY,
--   user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
--   learned_word_ids INTEGER[] NOT NULL DEFAULT '{}',
--   needs_learning_word_ids INTEGER[] NOT NULL DEFAULT '{}',
--   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT chk_results_no_overlap
--     CHECK (NOT (learned_word_ids && needs_learning_word_ids))
-- );
-- CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
-- CREATE INDEX IF NOT EXISTS idx_results_learned_gin ON results USING GIN (learned_word_ids);
-- CREATE INDEX IF NOT EXISTS idx_results_needs_gin ON results USING GIN (needs_learning_word_ids);
-- COMMIT;
