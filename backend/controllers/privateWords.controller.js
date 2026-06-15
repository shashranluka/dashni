import { pool } from "../server.js";
import { deleteUserWordStatus } from "../services/userWordStatus.service.js";

// GET /private-words
// აბრუნებს მიმდინარე მომხმარებლის private სიტყვების სიას.
export const listPrivateWords = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const result = await pool.query(
      `SELECT id, user_id, word, definition, created_at, updated_at
       FROM private_words
       WHERE user_id = $1
       ORDER BY updated_at DESC, id DESC`,
      [userId]
    );

    return res.status(200).json({
      count: result.rows.length,
      rows: result.rows,
    });
  } catch (err) {
    return next(err);
  }
};

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

// PUT /private-words/:id
// აახლებს მიმდინარე მომხმარებლის private სიტყვას ID-ით.
export const updatePrivateWord = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const id = Number(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "არასწორი სიტყვის id" });
    }

    const word = (req.body?.word ?? "").toString().trim();
    const definition = (req.body?.definition ?? "").toString().trim();

    if (!word || !definition) {
      return res.status(400).json({ message: "word და definition სავალდებულოა" });
    }

    const result = await pool.query(
      `UPDATE private_words
       SET word = $1,
           definition = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, word, definition, created_at, updated_at`,
      [word, definition, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "სიტყვა ვერ მოიძებნა" });
    }

    return res.status(200).json({
      message: "Private სიტყვა წარმატებით განახლდა",
      data: result.rows[0],
    });
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ message: "ეს სიტყვა უკვე არსებობს" });
    }
    return next(err);
  }
};

// DELETE /private-words/:id
// შლის მიმდინარე მომხმარებლის private სიტყვას ID-ით.
export const deletePrivateWord = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const id = Number(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "არასწორი სიტყვის id" });
    }

    await deleteUserWordStatus({
      userId,
      wordId: id,
      source: "private",
    });

    const result = await pool.query(
      `DELETE FROM private_words
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "სიტყვა ვერ მოიძებნა" });
    }

    return res.status(200).json({ message: "Private სიტყვა წარმატებით წაიშალა" });
  } catch (err) {
    return next(err);
  }
};
