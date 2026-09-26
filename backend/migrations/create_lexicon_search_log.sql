-- ლოგირების ცხრილი ლექსიკონის ძიებისთვის
CREATE TABLE IF NOT EXISTS lexicon_search_log (
  id SERIAL PRIMARY KEY,
  query_text TEXT NOT NULL,
  lexicon_name TEXT,
  is_authenticated BOOLEAN NOT NULL,
  result_count INTEGER NOT NULL,
  result_size_bytes INTEGER NOT NULL,
  db_query_ms INTEGER NOT NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- სწრაფი ძიებისთვის
CREATE INDEX IF NOT EXISTS idx_lexicon_search_log_requested_at ON lexicon_search_log(requested_at);
