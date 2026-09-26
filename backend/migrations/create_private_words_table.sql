-- Migration: Create private_words table
-- მიზანი: private_contributor მომხმარებელმა შეძლოს საკუთარი private სიტყვების შენახვა.

-- ქმნის private_words ცხრილს, თუ უკვე არ არსებობს.
CREATE TABLE IF NOT EXISTS private_words (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ერთსა და იმავე მომხმარებელზე სიტყვის დუბლიკატს ბლოკავს.
CREATE UNIQUE INDEX IF NOT EXISTS uq_private_words_user_word
ON private_words(user_id, word);

-- user_id-ით ფილტრაცია/მოძიება დაჩქარდება.
CREATE INDEX IF NOT EXISTS idx_private_words_user_id
ON private_words(user_id);
