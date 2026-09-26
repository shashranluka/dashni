-- რთავს pgcrypto extension-ს მხოლოდ მაშინ, თუ ჯერ არ არის ჩართული.
-- ეს საჭიროა gen_random_uuid() ფუნქციისთვის, რომ UUID მნიშვნელობები უსაფრთხოდ
-- და ავტომატურად დავაგენერიროთ PostgreSQL-ის დონეზე.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- არსებულ users ცხრილს ამატებს uuid სვეტს უსაფრთხო და მრავალჯერ გაშვებად ფორმატში.
-- IF NOT EXISTS იცავს მიგრაციას შეცდომისგან, თუ ეს სვეტი უკვე დამატებულია
-- (მაგალითად სხვა გარემოში ან წინა გაშვებით).
ALTER TABLE users
ADD COLUMN IF NOT EXISTS uuid UUID;

-- აყენებს default წესს, რომ ახალი ჩანაწერის INSERT-ზე uuid ავტომატურად შეიქმნას.
-- შედეგად აპლიკაციის კოდს ცალკე uuid გენერაცია აღარ სჭირდება ყველა create ოპერაციაზე.
ALTER TABLE users
ALTER COLUMN uuid SET DEFAULT gen_random_uuid();

-- ავსებს uuid-ს უკვე არსებულ მომხმარებლებზე, რომლებიც ამ მიგრაციამდე იყო შექმნილი.
-- WHERE uuid IS NULL პირობა იცავს არსებულ uuid მნიშვნელობებს გადაწერისგან
-- და განაახლებს მხოლოდ ცარიელ (NULL) ჩანაწერებს.
UPDATE users
SET uuid = gen_random_uuid()
WHERE uuid IS NULL;

-- აწესებს NOT NULL შეზღუდვას, რათა მომავალში uuid სავალდებულო იყოს ყველა მომხმარებლისთვის.
-- ეს ნაბიჯი უსაფრთხოა ახლა, რადგან წინა UPDATE-ში NULL მნიშვნელობები უკვე შეივსო.
ALTER TABLE users
ALTER COLUMN uuid SET NOT NULL;

-- ქმნის უნიკალურ ინდექსს uuid სვეტზე:
-- 1) უზრუნველყოფს uuid მნიშვნელობების უნიკალურობას მონაცემთა მთლიანობისთვის,
-- 2) აჩქარებს uuid-ით მოძებნას ავტორიზაციის flow-ში.
-- IF NOT EXISTS აქაც იცავს განმეორებით გაშვებისას შეცდომისგან.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_uuid ON users(uuid);
