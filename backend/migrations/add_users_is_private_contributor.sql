-- Migration: Add is_private_contributor flag to users
-- მიზანი: ყველა არსებულ და ახალ მომხმარებელს ჰქონდეს private contributor სტატუსი default-ად true-ით.

-- ამატებს users ცხრილში ახალ სვეტს, თუ ის უკვე არ არსებობს.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_private_contributor BOOLEAN;

-- აყენებს default მნიშვნელობას true-ზე, რომ ახალი ჩანაწერები ავტომატურად true იყოს.
ALTER TABLE users
ALTER COLUMN is_private_contributor SET DEFAULT true;

-- ავსებს არსებულ ჩანაწერებში NULL მნიშვნელობებს true-ით.
UPDATE users
SET is_private_contributor = true
WHERE is_private_contributor IS NULL;

-- კრძალავს NULL მნიშვნელობებს მომავალში (სვეტი ხდება სავალდებულო).
ALTER TABLE users
ALTER COLUMN is_private_contributor SET NOT NULL;
