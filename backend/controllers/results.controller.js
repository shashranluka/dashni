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
      learned_words = [],
      needs_learning_words = [],
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

    const toWordEntries = (arr, fallbackSource = "public") => {
      if (!Array.isArray(arr)) return [];

      return arr
        .map((item) => {
          const wordId = Number(item?.word_id ?? item?.id);
          if (!Number.isInteger(wordId) || wordId <= 0) return null;

          const source = item?.source === "private" ? "private" : fallbackSource;

          return { word_id: wordId, source };
        })
        .filter(Boolean);
    };

    const incomingLearnedEntries = [
      ...incomingLearned.map((wordId) => ({ word_id: wordId, source: "public" })),
      ...toWordEntries(learned_words),
    ];

    const incomingNeedsEntries = [
      ...incomingNeeds.map((wordId) => ({ word_id: wordId, source: "public" })),
      ...toWordEntries(needs_learning_words),
    ];

    const removeLearnedEntries = removeLearned.map((wordId) => ({ word_id: wordId, source: "public" }));
    const removeNeedsEntries = removeNeeds.map((wordId) => ({ word_id: wordId, source: "public" }));

    const existingResult = await pool.query(
      `SELECT source, word_id, status
       FROM user_word_status
       WHERE user_id = $1`,
      [userId],
    );

    const statusMap = new Map();
    const makeKey = (source, wordId) => `${source}:${wordId}`;

    for (const row of existingResult.rows) {
      statusMap.set(makeKey(row.source, row.word_id), {
        source: row.source,
        word_id: row.word_id,
        status: row.status,
      });
    }

    for (const entry of removeLearnedEntries) {
      statusMap.delete(makeKey(entry.source, entry.word_id));
    }
    for (const entry of removeNeedsEntries) {
      statusMap.delete(makeKey(entry.source, entry.word_id));
    }

    for (const entry of incomingLearnedEntries) {
      statusMap.set(makeKey(entry.source, entry.word_id), {
        source: entry.source,
        word_id: entry.word_id,
        status: "learned",
      });
    }

    for (const entry of incomingNeedsEntries) {
      statusMap.set(makeKey(entry.source, entry.word_id), {
        source: entry.source,
        word_id: entry.word_id,
        status: "needs",
      });
    }

    const nextRows = [...statusMap.values()];

    await pool.query("BEGIN");

    await pool.query("DELETE FROM user_word_status WHERE user_id = $1", [userId]);

    for (const row of nextRows) {
      await pool.query(
        `INSERT INTO user_word_status (user_id, source, word_id, status, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [userId, row.source, row.word_id, row.status],
      );
    }

    await pool.query("COMMIT");

    const learnedRows = nextRows.filter((row) => row.status === "learned");
    const needsRows = nextRows.filter((row) => row.status === "needs");

    const learnedWordIds = [...new Set(learnedRows.map((row) => row.word_id))];
    const needsWordIds = [...new Set(needsRows.map((row) => row.word_id))];

    return res.status(200).json({
      message: "სიტყვების სტატუსი განახლდა (user_word_status)",
      learned_word_ids: learnedWordIds,
      needs_learning_word_ids: needsWordIds,
      learned_words: learnedRows,
      needs_learning_words: needsRows,
    });
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
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
      SELECT source, word_id, status, updated_at
      FROM user_word_status
      WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    // თუ ჩანაწერი არ მოიძებნა, ვაბრუნებთ ცარიელ მასივებს
    if (result.rows.length === 0) {
      return res.status(200).json({
        learned_word_ids: [],
        needs_learning_word_ids: [],
        learned_words: [],
        needs_learning_words: [],
        updated_at: null,
      });
    }

    const learnedRows = result.rows.filter((row) => row.status === "learned");
    const needsRows = result.rows.filter((row) => row.status === "needs");

    const learnedWordIds = [...new Set(learnedRows.map((row) => row.word_id))];
    const needsWordIds = [...new Set(needsRows.map((row) => row.word_id))];

    const updatedAt = result.rows
      .map((row) => row.updated_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || null;

    return res.status(200).json({
      learned_word_ids: learnedWordIds,
      needs_learning_word_ids: needsWordIds,
      learned_words: learnedRows,
      needs_learning_words: needsRows,
      updated_at: updatedAt,
    });
  } catch (err) {
    return next(err);
  }
};
