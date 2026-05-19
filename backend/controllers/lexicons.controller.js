import { pool } from "../server.js";

const CHUNK_SIZE = 800;

const splitIntoChunks = (rows, size) => {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
};

const normalizeRows = (sourceRows) => {
  if (!Array.isArray(sourceRows)) return [];

  const seen = new Set();

  return sourceRows
    .map((row) => {
      const text = (row?.text ?? "").toString().trim();
      const lexiconName = (row?.lexicon_name ?? "").toString().trim();

      if (!text || !lexiconName) return null;

      const dedupeKey = `${text.toLowerCase()}__${lexiconName.toLowerCase()}`;
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);

      return {
        text,
        lexicon_name: lexiconName,
      };
    })
    .filter(Boolean);
};

export const bulkInsertLexicons = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const sourceRows = req.body?.rows;
    if (!Array.isArray(sourceRows) || sourceRows.length === 0) {
      return res.status(400).json({ message: "rows array is required" });
    }

    const preparedRows = normalizeRows(sourceRows);
    const skipped = sourceRows.length - preparedRows.length;

    if (preparedRows.length === 0) {
      return res.status(400).json({
        message: "No valid rows to insert",
        received: sourceRows.length,
        inserted: 0,
        skipped,
      });
    }

    await client.query("BEGIN");

    let inserted = 0;
    const chunks = splitIntoChunks(preparedRows, CHUNK_SIZE);

    for (const chunk of chunks) {
      const values = [];
      const placeholders = chunk
        .map((row, index) => {
          const base = index * 2;
          values.push(row.text, row.lexicon_name);
          return `($${base + 1}, $${base + 2})`;
        })
        .join(", ");

      const query = `
        INSERT INTO lexicons (text, lexicon_name)
        VALUES ${placeholders}
        ON CONFLICT (text, lexicon_name) DO NOTHING
        RETURNING id
      `;

      const result = await client.query(query, values);
      inserted += result.rowCount;
    }

    await client.query("COMMIT");

    return res.status(201).json({
      received: sourceRows.length,
      inserted,
      skipped,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error in bulkInsertLexicons:", err);
    next(err);
  } finally {
    client.release();
  }
};

export const searchLexicons = async (req, res, next) => {
  try {
    const queryText = (req.query?.q ?? "").toString();
    if (queryText.length === 0) {
      return res.status(400).json({ message: "q query parameter is required" });
    }

    const likePattern = `%${queryText}%`;
    const result = await pool.query(
      `
        SELECT id, text, lexicon_name, created_at, updated_at
        FROM lexicons
        WHERE text ILIKE $1 OR lexicon_name ILIKE $1
        ORDER BY id DESC
        LIMIT 200
      `,
      [likePattern],
    );

    return res.status(200).json({
      query: queryText,
      count: result.rows.length,
      rows: result.rows,
    });
  } catch (err) {
    console.error("Error in searchLexicons:", err);
    next(err);
  }
};
