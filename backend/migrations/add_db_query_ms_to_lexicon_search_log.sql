-- უკვე არსებულ lexicon_search_log ცხრილს ვუმატებთ DB ძებნის დროს მილიწამებში.
-- default 0 იცავს ძველ ჩანაწერებს და NOT NULL შეზღუდვას.
ALTER TABLE lexicon_search_log
ADD COLUMN IF NOT EXISTS db_query_ms INTEGER NOT NULL DEFAULT 0;

ALTER TABLE lexicon_search_log
ADD COLUMN IF NOT EXISTS lexicon_name TEXT;
