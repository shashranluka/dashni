import newRequest from './newRequest';

/**
 * ავტომატური თარგმნის ფუნქცია
 * @param {Array} words - სიტყვების მასივი თარგმნისთვის
 * @param {string} targetLanguage - სამიზნე ენის კოდი (ka, en, de, ...)
 * @param {string} sourceLanguage - წყარო ენის კოდი (ოფციონალური, auto detection)
 * @returns {Promise<Array>} - თარგმნილი სიტყვების მასივი
 */
export const autoTranslate = async (words, targetLanguage, sourceLanguage = 'auto') => {
  if (!words || words.length === 0) {
    throw new Error('სიტყვების მასივი ცარიელია');
  }

  if (!targetLanguage) {
    throw new Error('სამიზნე ენა არ არის მითითებული');
  }

  try {
    console.log('ავტომატური თარგმნა იწყება...', {
      words,
      targetLanguage,
      sourceLanguage,
      count: words.length
    });

    // ✅ Backend API-ზე მოთხოვნა
    const response = await newRequest.get('/translation/google', {
      params: {
        words: words,
        targetLanguage,
        sourceLanguage
      }
    });

    const translations = response.data;
    
    console.log('თარგმნა დასრულდა:', {
      original: words,
      translated: translations,
      success: true
    });

    return translations;

  } catch (error) {
    console.error('ავტომატური თარგმნის შეცდომა:', error);
    
    // ✅ Error handling დეტალური ინფორმაციით
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'ავტომატური თარგმნა ვერ მოხერხდა';
    
    throw new Error(errorMessage);
  }
};

/**
 * ცალკე სიტყვის თარგმნა
 * @param {string} word - სიტყვა
 * @param {string} targetLanguage - სამიზნე ენა
 * @returns {Promise<string>} - თარგმნილი სიტყვა
 */
export const translateSingleWord = async (word, targetLanguage) => {
  const translations = await autoTranslate([word], targetLanguage);
  return translations[0] || word;
};

/**
 * ნაწილობრივი თარგმნა (chunks-ით)
 * @param {Array} words - სიტყვების დიდი მასივი
 * @param {string} targetLanguage - სამიზნე ენა
 * @param {number} chunkSize - chunk-ის ზომა (default: 50)
 * @returns {Promise<Array>} - თარგმნილი სიტყვები
 */
export const translateInChunks = async (words, targetLanguage, chunkSize = 50) => {
  const chunks = [];
  
  // მასივის დაყოფა chunks-ად
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }

  const allTranslations = [];

  // ყოველი chunk-ის თარგმნა
  for (let i = 0; i < chunks.length; i++) {
    console.log(`თარგმნა chunk ${i + 1}/${chunks.length}...`);
    
    const chunkTranslations = await autoTranslate(chunks[i], targetLanguage);
    allTranslations.push(...chunkTranslations);
    
    // Rate limiting თავიდან ასაცილებლად
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
    }
  }

  return allTranslations;
};