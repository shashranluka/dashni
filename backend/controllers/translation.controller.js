import { Translate } from '@google-cloud/translate/build/src/v2/index.js';

// ✅ Google Translate client-ის ინიციალიზაცია
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID, // თუ არ არის .env-ში, შეგიძლია პირდაპირ ჩაწერო
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export const getTranslationFromGoogle = async (req, res) => {
  console.log("getTranslation მოთხოვნა მიღებულია",req.params, req.body,req.query);
  
  try {
    const { words, targetLanguage, sourceLanguage = 'auto' } = req.query;

    // ✅ Input validation
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        error: 'სიტყვების მასივი აუცილებელია და უნდა იყოს არ-ცარიელი'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        error: 'სამიზნე ენა (targetLanguage) აუცილებელია'
      });
    }

    console.log('თარგმნის პარამეტრები:', {
      words: words,
      targetLanguage: targetLanguage,
      sourceLanguage: sourceLanguage,
      wordsCount: words.length
    });

    // ✅ Google Translate API-ზე მოთხოვნა
    const [translations] = await translate.translate(words, {
      from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      to: targetLanguage
    });

    // ✅ შედეგების დამუშავება
    const results = words.map((originalWord, index) => ({
      original: originalWord,
      translated: Array.isArray(translations) ? translations[index] : translations,
      confidence: 0.95, // Google არ აბრუნებს confidence-ს v2 API-ში
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage
    }));

    console.log('თარგმნა წარმატებით დასრულდა:', {
      originalCount: words.length,
      translatedCount: results.length,
      sample: results[0] // პირველი მაგალითი
    });

    // ✅ წარმატებული პასუხი
    res.status(200).json({
      success: true,
      data: results,
      meta: {
        totalWords: words.length,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        translatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Google Translate API შეცდომა:', error);

    // ✅ Error handling
    let errorMessage = 'თარგმნის სერვისში შეცდომა დაფიქსირდა';
    let statusCode = 500;

    if (error.code === 3) {
      errorMessage = 'არასწორი API Key ან პროექტი';
      statusCode = 401;
    } else if (error.code === 4) {
      errorMessage = 'API ლიმიტი ამოწურულია';
      statusCode = 429;
    } else if (error.code === 7) {
      errorMessage = 'მხარდაუჭერელი ენა';
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ მხარდაჭერილი ენების სია
export const getSupportedLanguages = async (req, res) => {
  try {
    const [languages] = await translate.getLanguages();
    
    res.status(200).json({
      success: true,
      data: languages,
      count: languages.length
    });
  } catch (error) {
    console.error('ენების სიის მიღების შეცდომა:', error);
    res.status(500).json({
      success: false,
      error: 'ენების სია ვერ ჩაიტვირთა'
    });
  }
};

// ✅ ენის დეტექცია
export const detectLanguage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'ტექსტი აუცილებელია'
      });
    }

    const [detection] = await translate.detect(text);
    
    res.status(200).json({
      success: true,
      data: {
        language: detection.language,
        confidence: detection.confidence
      }
    });
  } catch (error) {
    console.error('ენის დეტექციის შეცდომა:', error);
    res.status(500).json({
      success: false,
      error: 'ენის დეტექცია ვერ მოხერხდა'
    });
  }
};
