CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  img VARCHAR(500),
  is_admin BOOLEAN DEFAULT false,
  is_private_contributor BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create words table
CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  the_word VARCHAR(255) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  definition TEXT,
  part_of_speech VARCHAR(50),
  base_form VARCHAR(255),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on words
CREATE INDEX IF NOT EXISTS idx_words_language ON words(language);
CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  learned_word_ids INTEGER[] NOT NULL DEFAULT '{}',
  needs_learning_word_ids INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_results_no_overlap
    CHECK (NOT (learned_word_ids && needs_learning_word_ids))
);

CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_learned_gin ON results USING GIN (learned_word_ids);
CREATE INDEX IF NOT EXISTS idx_results_needs_gin ON results USING GIN (needs_learning_word_ids);

-- Create lexicons table
CREATE TABLE IF NOT EXISTS lexicons (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  lexicon_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on lexicons
CREATE INDEX IF NOT EXISTS idx_lexicons_name ON lexicons(lexicon_name);
CREATE UNIQUE INDEX IF NOT EXISTS uq_lexicons_text_name ON lexicons(text, lexicon_name);

-- Create private_words table
CREATE TABLE IF NOT EXISTS private_words (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on private_words
CREATE UNIQUE INDEX IF NOT EXISTS uq_private_words_user_word ON private_words(user_id, word);
CREATE INDEX IF NOT EXISTS idx_private_words_user_id ON private_words(user_id);
