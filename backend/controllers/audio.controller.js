import { pool } from "../server.js";

export const getAudioData = async (req, res, next) => {
  try {
    console.log("Fetching audio segments...");
    
    // ამოიღე ყველა audio segment
    const segmentsResult = await pool.query(
      'SELECT id, time, text FROM audio_segments ORDER BY id ASC'
    );
    
    const segments = segmentsResult.rows;
    console.log(`Retrieved ${segments.length} segments`);
    
    // ყველა text-დან სიტყვების ამოღება
    const allTexts = segments.map(s => s.text).join(' ');
    
    const allWords = allTexts
      .toLowerCase()
      .replace(/[.,!?;:"()-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const uniqueWords = [...new Set(allWords)];
    console.log(`Found ${uniqueWords.length} unique words`);
    
    // words ცხრილიდან თარგმანები
    const wordsResult = await pool.query(
      'SELECT the_word, translation FROM words WHERE the_word = ANY($1)',
      [uniqueWords]
    );
    
    console.log(`Retrieved ${wordsResult.rows.length} translations`);
    
    res.status(200).json({
      segments: segments, // [{id, time, text}, ...]
      words: wordsResult.rows,
      uniqueWords: uniqueWords
    });
    
  } catch (err) {
    console.error('Error in getAudioData:', err);
    next(err);
  }
};

export const updateAudioSegmentText = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "სეგმენტის ID არასწორია" });
    }

    const text = (req.body?.text ?? "").trim();
    if (!text) {
      return res.status(400).json({ message: "ტექსტი სავალდებულოა" });
    }

    const result = await pool.query(
      "UPDATE audio_segments SET text=$1, updated_at=NOW() WHERE id=$2 RETURNING id, time, text",
      [text, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "სეგმენტი ვერ მოიძებნა" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error in updateAudioSegmentText:", err);
    next(err);
  }
};