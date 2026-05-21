/**
 * updateLexiconShowToUsers
 * PATCH /lexicons/:id
 * მხოლოდ admin-ს შეუძლია შეცვალოს show_to_users ველი.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const updateLexiconShowToUsers = async (req, res, next) => {
  console.log("updateLexiconShowToUsers called with:");
  const lexiconId = req.params.id;
  const { show_to_users } = req.body;
  if (typeof show_to_users !== "boolean") {
    return res.status(400).json({ message: "show_to_users must be boolean" });
  }
  try {
    const result = await pool.query(
      `UPDATE lexicons SET show_to_users = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [show_to_users, lexiconId]
    );
    console.log("updateLexiconShowToUsers result:", result.rows);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Lexicon not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
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

    const lexiconName = req.query?.lexicon_name;
    const likePattern = `%${queryText}%`;
    // admin + fromAdmin=true => ყველა ჩანაწერი, სხვაგან მხოლოდ show_to_users=true
    const isAdmin = req.user && req.user.role === "admin";
    const fromAdmin = req.query?.fromAdmin === "true";

    let sql = `SELECT id, text, lexicon_name, show_to_users, created_at, updated_at FROM lexicons WHERE text ILIKE $1`;
    const params = [likePattern];
    if (lexiconName) {
      sql += ' AND lexicon_name = $2';
      params.push(lexiconName);
    }
    // თუ არაა admin ან არაა fromAdmin=true, დავამატოთ show_to_users = true
    if (!(isAdmin && fromAdmin)) {
      sql += (params.length === 1 ? ' AND' : ' AND') + ' show_to_users = true';
    }
    sql += '\nORDER BY id DESC\nLIMIT 200';

    const queryStart = process.hrtime.bigint();
    const result = await pool.query(sql, params);
    const queryEnd = process.hrtime.bigint();
    const dbQueryMs = Number((queryEnd - queryStart) / 1000000n);

    // Prepare log data
    const isAuthenticated = !!req.user;
    const resultCount = result.rows.length;
    const resultSizeBytes = Buffer.byteLength(JSON.stringify(result.rows), 'utf8');
    pool.query(
      `INSERT INTO lexicon_search_log (query_text, lexicon_name, is_authenticated, result_count, result_size_bytes, db_query_ms)
       VALUES ($1, $2, $3, $4, $5, $6)` ,
      [queryText, lexiconName || null, isAuthenticated, resultCount, resultSizeBytes, dbQueryMs]
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
