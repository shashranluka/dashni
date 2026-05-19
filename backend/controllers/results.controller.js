import { pool } from "../server.js";

/**
 * შენახავს მომხმარებლის სიტყვების სტატუსს (ნასწავლი/სასწავლი)
 * UPSERT: თუ ჩანაწერი უკვე არსებობს, განახლდება; თუ არა, შეიქმნება
 * 
 * Request body: {
 *   learned_word_ids: INTEGER[],
 *   needs_learning_word_ids: INTEGER[]
 * }
 */
export const saveWordStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const {
      learned_word_ids = [],
      needs_learning_word_ids = [],
      remove_learned_word_ids = [],
      remove_needs_learning_word_ids = [],
    } = req.body || {};

    const toIntArray = (arr) =>
      Array.isArray(arr)
        ? arr
            .map((v) => Number(v))
            .filter((v) => Number.isInteger(v) && v > 0)
        : [];

    const incomingLearned = toIntArray(learned_word_ids);
    const incomingNeeds = toIntArray(needs_learning_word_ids);
    const removeLearned = toIntArray(remove_learned_word_ids);
    const removeNeeds = toIntArray(remove_needs_learning_word_ids);

    const existingResult = await pool.query(
      `SELECT learned_word_ids, needs_learning_word_ids
       FROM results
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    const currentLearned = existingResult.rows[0]?.learned_word_ids || [];
    const currentNeeds = existingResult.rows[0]?.needs_learning_word_ids || [];

    const learnedSet = new Set(currentLearned);
    const needsSet = new Set(currentNeeds);

    // Optional explicit removals
    for (const id of removeLearned) learnedSet.delete(id);
    for (const id of removeNeeds) needsSet.delete(id);

    // Move to learned: add there, remove from needs
    for (const id of incomingLearned) {
      learnedSet.add(id);
      needsSet.delete(id);
    }

    // Move to needs: add there, remove from learned
    for (const id of incomingNeeds) {
      needsSet.add(id);
      learnedSet.delete(id);
    }

    const nextLearned = [...learnedSet];
    const nextNeeds = [...needsSet];

    const upsertQuery = `
      INSERT INTO results (user_id, learned_word_ids, needs_learning_word_ids, updated_at)
      VALUES ($1, $2::INTEGER[], $3::INTEGER[], CURRENT_TIMESTAMP)
      ON CONFLICT (user_id)
      DO UPDATE SET
        learned_word_ids = EXCLUDED.learned_word_ids,
        needs_learning_word_ids = EXCLUDED.needs_learning_word_ids,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, learned_word_ids, needs_learning_word_ids, updated_at;
    `;

    const result = await pool.query(upsertQuery, [userId, nextLearned, nextNeeds]);

    return res.status(200).json({
      message: "სიტყვების სტატუსი განახლდა (merge)",
      data: result.rows[0],
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * იღებს მომხმარებლის სიტყვების სტატუსს
 * 
 * Response: {
 *   learned_word_ids: INTEGER[],
 *   needs_learning_word_ids: INTEGER[],
 *   updated_at: TIMESTAMP
 * }
 */
export const getWordStatus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const query = `
      SELECT id, user_id, learned_word_ids, needs_learning_word_ids, created_at, updated_at
      FROM results
      WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    // თუ ჩანაწერი არ მოიძებნა, ვაბრუნებთ ცარიელ მასივებს
    if (result.rows.length === 0) {
      return res.status(200).json({
        learned_word_ids: [],
        needs_learning_word_ids: [],
        updated_at: null,
      });
    }

    const row = result.rows[0];
    return res.status(200).json({
      learned_word_ids: row.learned_word_ids || [],
      needs_learning_word_ids: row.needs_learning_word_ids || [],
      updated_at: row.updated_at,
    });
  } catch (err) {
    return next(err);
  }
};
