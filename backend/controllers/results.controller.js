import { pool } from "../server.js";

/**
 * შენახავს მომხმარებლის სიტყვების სტატუსს (ნასწავლი/სასწავლი)
 * UPSERT: თუ ჩანაწერი უკვე არსებობს, განახლდება; თუ არა, შეიქმნება
 * 
 * Request body: {
 *   learned_words: Array<{ word_id: INTEGER, source: "public" | "private" }>,
 *   needs_learning_words: Array<{ word_id: INTEGER, source: "public" | "private" }>
 * }
 */
export const saveWordStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const {
      learned_words = [],
      needs_learning_words = [],
    } = req.body || {};

    const toWordEntries = (arr, status) => {
      if (!Array.isArray(arr)) return [];

      return arr
        .map((item) => {
          const wordId = Number(item?.word_id ?? item?.id);
          if (!Number.isInteger(wordId) || wordId <= 0) return null;

          const source =
            item?.source === "private"
              ? "private"
              : item?.source === "public"
                ? "public"
                : null;

          if (!source) return null;

          return { word_id: wordId, source, status };
        })
        .filter(Boolean);
    };

    const incomingLearnedEntries = toWordEntries(learned_words, "learned");
    const incomingNeedsEntries = toWordEntries(needs_learning_words, "needs");

    const incomingMap = new Map();
    const makeKey = (source, wordId) => `${source}:${wordId}`;

    for (const entry of incomingLearnedEntries) {
      incomingMap.set(makeKey(entry.source, entry.word_id), entry);
    }

    for (const entry of incomingNeedsEntries) {
      incomingMap.set(makeKey(entry.source, entry.word_id), entry);
    }

    const rowsToUpsert = [...incomingMap.values()];

    if (rowsToUpsert.length === 0) {
      return res.status(200).json({
        message: "სტატუსის განახლებისთვის ვალიდური მონაცემები არ მოიძებნა",
        upserted_count: 0,
      });
    }

    await client.query("BEGIN");

    await client.query(
      `WITH input_rows AS (
         SELECT DISTINCT ON (r.source, r.word_id)
           r.source,
           r.word_id,
           r.status
         FROM jsonb_to_recordset($2::jsonb) AS r(source TEXT, word_id INTEGER, status TEXT)
       )
       INSERT INTO user_word_status (user_id, source, word_id, status, updated_at)
       SELECT $1, source, word_id, status, CURRENT_TIMESTAMP
       FROM input_rows
       ON CONFLICT (user_id, source, word_id)
       DO UPDATE SET
         status = EXCLUDED.status,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(rowsToUpsert)],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "სიტყვების სტატუსი განახლდა",
      upserted_count: rowsToUpsert.length,
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    return next(err);
  } finally {
    client.release();
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
  console.log("getWordStatus called", req.user?.id);
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "ავტორიზაცია აუცილებელია" });
    }

    const requestedSource = req.query?.source;
    const normalizedSource =
      requestedSource === "private"
        ? "private"
        : requestedSource === "public"
          ? "public"
          : null;

    if (!requestedSource || !normalizedSource) {
      return res.status(400).json({ message: "source უნდა იყოს public ან private" });
    }

    const result = await pool.query(
      `SELECT source, word_id, status, updated_at
       FROM user_word_status
       WHERE user_id = $1 AND source = $2;`,
      [userId, normalizedSource],
    );

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
