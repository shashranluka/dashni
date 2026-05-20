import { pool } from "../server.js";

const CHUNK_SIZE = 800;

/**
 * splitIntoChunks
 * იღებს მასივს (rows) და ყოფს მას თანაბარ ნაწილებად (chunks) მოცემული ზომის (size) მიხედვით.
 * გამოიყენება დიდი მოცულობის მონაცემების ბაზაში ჩასაწერად ნაწილ-ნაწილ,
 * რათა თავიდან ავიცილოთ PostgreSQL-ის პარამეტრების ლიმიტის გადაჭარბება.
 *
 * @param {Array} rows  - ჩასასმელი მწკრივების სრული მასივი
 * @param {number} size - ყოველი chunk-ის მაქსიმალური სიდიდე
 * @returns {Array[]}   - chunk მასივების მასივი
 */
const splitIntoChunks = (rows, size) => {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
};

/**
 * normalizeRows
 * ამუშავებს და ასუფთავებს შემომავალ მწკრივებს ბაზაში ჩაწერამდე:
 *   - ჭრის ზედმეტ სივრცეებს (trim) text და lexicon_name ველებიდან
 *   - გამორიცხავს ცარიელ ან undefined მნიშვნელობებს
 *   - შლის დუბლიკატებს (text + lexicon_name კომბინაციის მიხედვით, case-insensitive)
 *
 * @param {any[]} sourceRows - HTTP მოთხოვნიდან მიღებული ნედლი მონაცემები
 * @returns {{ text: string, lexicon_name: string }[]} - გასუფთავებული, უნიკალური მწკრივები
 */
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

/**
 * bulkInsertLexicons
 * POST /lexicons/bulk (ან შესაბამისი route)
 *
 * იღებს req.body.rows მასივს და ასხამს ლექსიკონის ჩანაწერებს (text, lexicon_name)
 * PostgreSQL-ის ბაზაში ერთ ტრანზაქციაში. ოპერაცია მიმდინარეობს ასე:
 *   1. ამოწმებს, რომ rows მასივი არ არის ცარიელი
 *   2. normalizeRows-ით ასუფთავებს და შლის დუბლიკატებს
 *   3. splitIntoChunks-ით ყოფს CHUNK_SIZE (800) ზომის ნაწილებად
 *   4. ყოველ chunk-ს ჩაწერს ON CONFLICT DO NOTHING პირობით (ბაზაში უკვე არსებული
 *      (text, lexicon_name) წყვილი გამოტოვდება)
 *   5. წარმატების შემთხვევაში აბრუნებს { received, inserted, skipped } სტატისტიკას
 *   6. შეცდომის შემთხვევაში ახდენს ROLLBACK-ს და next(err)-ს გადასცემს
 *
 * @param {import('express').Request}  req  - Express მოთხოვნა; req.body.rows - ჩასასმელი მასივი
 * @param {import('express').Response} res  - Express პასუხი
 * @param {import('express').NextFunction} next - შემდეგი middleware შეცდომის დამუშავებისთვის
 */
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

/**
 * searchLexicons
 * GET /lexicons/search?q=<ძებნის_ტექსტი>
 *
 * ეძებს ლექსიკონში ჩანაწერებს, რომელთა text ველი შეიცავს მოცემულ სტრინგს (q).
 * ძებნა ხდება ILIKE ოპერატორით, ანუ case-insensitive. შედეგი დალაგებულია
 * id-ის კლებადი თანმიმდევრობით და შეზღუდულია 200 ჩანაწერამდე.
 * არარსებული ან ცარიელი q პარამეტრის შემთხვევაში აბრუნებს 400 შეცდომას.
 *
 * @param {import('express').Request}  req  - Express მოთხოვნა; req.query.q - საძიებო სტრინგი
 * @param {import('express').Response} res  - Express პასუხი: { query, count, rows }
 * @param {import('express').NextFunction} next - შემდეგი middleware შეცდომის დამუშავებისთვის
 */
export const searchLexicons = async (req, res, next) => {
  try {
    const queryText = (req.query?.q ?? "").toString();
    if (queryText.length === 0) {
      return res.status(400).json({ message: "q query parameter is required" });
    }

    const likePattern = `%${queryText}%`;
    const queryStart = process.hrtime.bigint();
    const result = await pool.query(
      `
        SELECT id, text, lexicon_name, created_at, updated_at
        FROM lexicons
        WHERE text ILIKE $1
        ORDER BY id DESC
        LIMIT 200
      `,
      [likePattern],
    );
    const queryEnd = process.hrtime.bigint();
    const dbQueryMs = Number((queryEnd - queryStart) / 1000000n);

    // Prepare log data
    const isAuthenticated = !!req.user;
    const resultCount = result.rows.length;
    // ზომა ითვლება JSON.stringify-ით, რომ რეალური გადაცემული ბაიტები მივიღოთ
    const resultSizeBytes = Buffer.byteLength(JSON.stringify(result.rows), 'utf8');

    // Insert log row (async, მაგრამ შეცდომა არ აფერხებს ძებნის შედეგს)
    pool.query(
      `INSERT INTO lexicon_search_log (query_text, is_authenticated, result_count, result_size_bytes, db_query_ms)
       VALUES ($1, $2, $3, $4, $5)` ,
      [queryText, isAuthenticated, resultCount, resultSizeBytes, dbQueryMs]
    ).catch((e) => console.error('Failed to log lexicon search:', e));

    return res.status(200).json({
      query: queryText,
      count: resultCount,
      rows: result.rows,
    });
  } catch (err) {
    console.error("Error in searchLexicons:", err);
    next(err);
  }
};
