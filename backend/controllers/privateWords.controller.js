import { pool } from "../server.js";

// POST /private-words
// ამატებს ან აახლებს მიმდინარე private_contributor მომხმარებლის private სიტყვას.
export const upsertPrivateWord = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const word = (req.body?.word ?? "").toString().trim();
    const definition = (req.body?.definition ?? "").toString().trim();

    if (!word || !definition) {
      return res.status(400).json({ message: "word და definition სავალდებულოა" });
    }

    const result = await pool.query(
      `INSERT INTO private_words (user_id, word, definition)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, word)
       DO UPDATE SET
         definition = EXCLUDED.definition,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, word, definition, created_at, updated_at`,
      [userId, word, definition]
    );

    return res.status(201).json({
      message: "Private სიტყვა წარმატებით შეინახა",
      data: result.rows[0],
    });
  } catch (err) {
    return next(err);
  }
};
