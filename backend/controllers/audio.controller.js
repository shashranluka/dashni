import { pool } from "../server.js";

export const getAudioData = async (req, res, next) => {
  try {
    console.log("Fetching audio data from database...");
    
    // audio_data-ს ამოღება
    const audioResult = await pool.query(
      'SELECT * FROM audio_data ORDER BY id ASC'
    );
    const audioData = audioResult.rows[0];
    console.log(audioData.content, "audio data fetched");
    
    // console.log(`Retrieved ${audioResult.rows} records from audio_data.`);
    
    // ყველა ტექსტიდან სიტყვების ამოღება
    const allWords = audioData.content
        .toLowerCase()
        // .replace(/[^\w\s]/g, '')
        // .replace(/[^\w\s]/g, '')
        .replace(/[.,!?;:"()-]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);
    console.log(`Extracted a total`,allWords);
    // უნიკალური სიტყვები
    const uniqueWords = [...new Set(allWords)];
    console.log(uniqueWords,`Found ${uniqueWords.length} unique words.`);
    
    // words ცხრილიდან შესაბამისი ჩანაწერების ამოღება
    const wordsResult = await pool.query(
      'SELECT the_word, translation FROM words WHERE the_word = ANY($1)',
      [uniqueWords]
    );
    
    console.log(`Retrieved ${wordsResult.rows.length} matching words from words table.`);
    
    // პასუხის ფორმირება
    res.status(200).json({
      audioData: audioResult.rows,
      words: wordsResult.rows,
      uniqueWords: uniqueWords
    });
    
  } catch (err) {
    next(err);
  }
};