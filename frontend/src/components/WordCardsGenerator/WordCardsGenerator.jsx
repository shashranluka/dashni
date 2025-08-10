import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import newRequest from '../../utils/newRequest';
import { autoTranslate } from '../../utils/autoTranslate';
import './WordCardsGenerator.scss';

const WordCardsGenerator = ({ subtitles, onWordsGenerated }) => {
  // ✅ Context და State
  const { language, isLanguageSelected } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardsData, setCardsData] = useState(null);
  const [wordsToAdd, setWordsToAdd] = useState([]);
  const [editingWordIndex, setEditingWordIndex] = useState(null);
  const [tempTranslations, setTempTranslations] = useState({});
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [autoTranslateError, setAutoTranslateError] = useState(null);

  // ✅ სიტყვების გენერირების ფუნქცია
  const generateWordsFromSubtitles = () => {
    const cleanSubtitles = subtitles?.trim();

    if (!cleanSubtitles) {
      console.log('სუბტიტრები ცარიელია');
      return [];
    }

    try {
      // 🎯 Timestamp-ების წაშლა
      const textWithoutTimestamps = cleanSubtitles
        .replace(/^\d+:\d+$/gm, '')
        .replace(/\d+:\d+/g, '');

      // 🎯 ტექსტის გაწმენდა
      const cleanText = textWithoutTimestamps
        .toLowerCase()
        .replace(/[^\w\s']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 🎯 სიტყვებად დაყოფა
      const wordsArray = cleanText
        .split(' ')
        .filter(word => word.length > 1);

      // 🎯 უნიკალური სიტყვები
      const uniqueWords = [...new Set(wordsArray)];
      const sortedWords = uniqueWords.sort();

      console.log(`გენერირებულია ${sortedWords.length} უნიკალური სიტყვა:`, sortedWords);
      return sortedWords;

    } catch (error) {
      console.error('სიტყვების გენერირების შეცდომა:', error);
      return [];
    }
  };

  // ✅ POST Method-ით სიტყვების შემოწმება
  const translateWords = async (wordsArray, language) => {
    try {
      console.log('🔍 ვთარგმნი სიტყვებს:', { count: wordsArray.length, language });
      
      // ✅ თუ სიტყვები ძალიან ბევრია, chunks-ად ვყოფთ
      if (wordsArray.length > 1000) {
        console.log('🔄 ბევრი სიტყვაა - chunking...');
        
        const chunkSize = 500;
        const chunks = [];
        for (let i = 0; i < wordsArray.length; i += chunkSize) {
          chunks.push(wordsArray.slice(i, i + chunkSize));
        }
        
        const allResults = [];
        console.log(`📦 გაყოფილია ${chunks.length} chunk-ად`);
        
        for (let i = 0; i < chunks.length; i++) {
          console.log(`🔄 ვამუშავებ chunk ${i + 1}/${chunks.length} (${chunks[i].length} სიტყვა)`);
          
          const response = await newRequest.post("/words/translate", {
            wordsToTranslate: chunks[i],
            language: language
          });
          
          allResults.push(...response.data);
          
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log(`✅ ყველა chunk დამუშავებულია. სულ ნაპოვნი: ${allResults.length}`);
        return allResults;
        
      } else {
        // ✅ ნორმალური POST request
        console.log('🔄 ნორმალური processing...');
        const response = await newRequest.get("/words/translate", {
          wordsToTranslate: wordsArray,
          language: language
        });
        
        console.log('✅ თარგმნის პასუხი:', { found: response.data.length });
        return response.data;
      }

    } catch (error) {
      console.error('❌ თარგმნის შეცდომა:', error);
      throw error;
    }
  };

  // ✅ ბარათების გენერირება
  const generateCards = async () => {
    console.log('🎯 ბარათების გენერირება იწყება...');
    
    try {
      setIsGenerating(true);
      
      const words = generateWordsFromSubtitles();
      if (!words || words.length === 0) {
        console.log('❌ სიტყვები ვერ გენერირებულა');
        return;
      }

      console.log(`📊 გენერირებული სიტყვები: ${words.length}`);

      // ✅ POST request-ით ძებნა
      const existingWordsData = await translateWords(words, language.code);
      
      // ✅ არსებული და ახალი სიტყვების გამიჯვნა
      const existingWords = existingWordsData.map(wordObj => wordObj.word);
      const newWords = words.filter(word => !existingWords.includes(word));

      console.log(`🟢 ბაზაში არსებული: ${existingWords.length}`);
      console.log(`🔵 ახალი სიტყვები: ${newWords.length}`);

      const cardsResult = {
        existingsInDatabase: existingWordsData,
        newWords: newWords,
        allWords: words
      };

      setCardsData(cardsResult);
      
      // ✅ Parent კომპონენტისთვის callback
      if (onWordsGenerated) {
        onWordsGenerated(cardsResult);
      }

      console.log('✅ ბარათები წარმატებით გენერირებულა');

    } catch (error) {
      console.error('❌ ბარათების გენერირების შეცდომა:', error);
      setCardsData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ ბარათის რედაქტირების დაწყება
  const startEditingWord = (wordIndex, word) => {
    setEditingWordIndex(wordIndex);
    setTempTranslations(prev => ({
      ...prev,
      [wordIndex]: ''
    }));
  };

  // ✅ რედაქტირების გაუქმება
  const cancelEditingWord = () => {
    setEditingWordIndex(null);
    setTempTranslations(prev => {
      const newTemp = { ...prev };
      delete newTemp[editingWordIndex];
      return newTemp;
    });
  };

  // ✅ თარგმანის შეცვლა input-ში
  const handleTranslationChange = (wordIndex, translation) => {
    setTempTranslations(prev => ({
      ...prev,
      [wordIndex]: translation
    }));
  };

  // ✅ სიტყვის მასივში დამატება
  const addWordToList = (wordIndex, word) => {
    const translation = tempTranslations[wordIndex]?.trim();

    if (!translation) {
      alert('გთხოვთ შეიყვანოთ თარგმანი');
      return;
    }

    const newWordEntry = {
      word: word,
      translation: translation,
      language: language.code,
      difficulty: 'beginner',
      category: 'general',
      addedAt: new Date().toISOString()
    };

    setWordsToAdd(prev => {
      const alreadyExists = prev.some(item => item.word === word);
      if (alreadyExists) {
        alert('ეს სიტყვა უკვე დამატებულია სიაში');
        return prev;
      }
      return [...prev, newWordEntry];
    });

    setEditingWordIndex(null);
    setTempTranslations(prev => {
      const newTemp = { ...prev };
      delete newTemp[wordIndex];
      return newTemp;
    });

    console.log('სიტყვა დაემატა სიაში:', newWordEntry);
  };

  // ✅ სიტყვის სიიდან მოშორება
  const removeWordFromList = (wordToRemove) => {
    setWordsToAdd(prev => prev.filter(item => item.word !== wordToRemove));
    console.log('სიტყვა წაიშალა სიიდან:', wordToRemove);
  };

  // ✅ ავტომატური თარგმნის ფუნქცია
  const handleAutoTranslate = async () => {
    if (!cardsData?.newWords || cardsData.newWords.length === 0) {
      alert('ახალი სიტყვები არ არსებობს თარგმნისთვის');
      return;
    }

    if (!language?.code) {
      alert('ენა არ არის არჩეული');
      return;
    }

    const wordsToTranslate = cardsData.newWords.filter(word =>
      !wordsToAdd.some(item => item.word === word)
    );

    if (wordsToTranslate.length === 0) {
      alert('ყველა სიტყვა უკვე დამატებულია სიაში');
      return;
    }

    setIsAutoTranslating(true);
    setAutoTranslateError(null);

    try {
      console.log('ავტომატური თარგმნა იწყება...', wordsToTranslate);

      const targetLanguage = 'ka';
      const sourceLanguage = language.code;

      const translations = await autoTranslate(wordsToTranslate, targetLanguage, sourceLanguage);

      console.log('მიღებული თარგმანები:', translations);

      const newWordEntries = translations.data.map(translationData => ({
        word: translationData.original,
        translation: translationData.translated,
        language: language.code,
        difficulty: 'beginner',
        category: 'general',
        confidence: translationData.confidence,
        autoTranslated: true,
        addedAt: new Date().toISOString()
      }));

      setWordsToAdd(prev => [...prev, ...newWordEntries]);

      console.log(`წარმატებით დაემატა ${newWordEntries.length} ავტომატურად თარგმნილი სიტყვა`);

    } catch (error) {
      console.error('ავტომატური თარგმნის შეცდომა:', error);
      setAutoTranslateError(error.message);
    } finally {
      setIsAutoTranslating(false);
    }
  };

  // ✅ ყველა სიტყვის ბაზაში შენახვა
  const saveWordsToDatabase = async () => {
    if (wordsToAdd.length === 0) {
      alert('სიტყვები არ არის დასამატებელი');
      return;
    }

    try {
      console.log('სიტყვების შენახვა დაიწყო:', wordsToAdd);
      const response = await newRequest.post('/words', wordsToAdd);
      console.log('სიტყვები წარმატებით დაემატა:', response.data);
      setWordsToAdd([]);
      alert('სიტყვები წარმატებით დაემატა ბაზაში');
    } catch (error) {
      console.error('სიტყვების შენახვის შეცდომა:', error);
      alert(error.response?.data?.message || 'სიტყვების შენახვა ვერ მოხერხდა');
    }
  };

  return (
    <div className="word-cards-generator">
      {/* ✅ გენერირების ღილაკი */}
      <div className="generator-controls">
        <button
          type="button"
          onClick={generateCards}
          disabled={!subtitles?.trim() || isGenerating}
          className="generate-button"
        >
          {isGenerating ? (
            <>🔄 გენერირება მიმდინარეობს...</>
          ) : (
            <>📝 ბარათების გენერირება სუბტიტრებიდან</>
          )}
        </button>
      </div>

      {/* ✅ გენერირებული ბარათების ჩვენება */}
      {cardsData && (
        <div className="generated-cards-section">
          <div className="cards-header">
            <h3>გენერირებული სიტყვების ბარათები</h3>
            <div className="cards-summary">
              <span className="existing-count">
                🟢 ბაზაში არსებული: {cardsData.existingsInDatabase?.length || 0}
              </span>
              <span className="new-count">
                🔵 ახალი სიტყვები: {cardsData.newWords?.length || 0}
              </span>
            </div>
          </div>

          {/* ✅ ბაზაში არსებული სიტყვები */}
          {cardsData.existingsInDatabase && cardsData.existingsInDatabase.length > 0 && (
            <div className="existing-words-section">
              <h4 className="section-title">
                🟢 ბაზაში უკვე არსებული სიტყვები
              </h4>
              <div className="words-grid existing-words">
                {cardsData.existingsInDatabase.map((wordData, index) => (
                  <div
                    key={wordData._id || index}
                    className="word-card existing-card"
                    title={`თარგმანი: ${wordData.translation || 'მიუწვდომელია'}`}
                  >
                    <div className="word-text">
                      {wordData.word}
                    </div>
                    <div className="word-translation">
                      {wordData.translation || 'თარგმანი მიუწვდომელია'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="section-info">
                <small>
                  💡 ეს სიტყვები უკვე არსებობს ბაზაში.
                </small>
              </div>
            </div>
          )}

          {/* ✅ ახალი სიტყვები */}
          {cardsData.newWords && cardsData.newWords.length > 0 && (
            <div className="new-words-section">
              <h4 className="section-title">
                🔵 ახალი სიტყვები (ბაზაში არ არსებობს)
              </h4>

              {/* ✅ ავტომატური თარგმნა */}
              <div className="auto-translate-section">
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isAutoTranslating || !language?.code}
                  className="auto-translate-button"
                >
                  {isAutoTranslating ? (
                    <>🔄 თარგმნა მიმდინარეობს...</>
                  ) : (
                    <>
                      🌐 ავტომატური თარგმნა ({cardsData.newWords.filter(word =>
                        !wordsToAdd.some(item => item.word === word)
                      ).length} სიტყვა)
                    </>
                  )}
                </button>

                {autoTranslateError && (
                  <div className="auto-translate-error">
                    <span className="error-message">❌ {autoTranslateError}</span>
                  </div>
                )}

                <div className="auto-translate-info">
                  <small>
                    💡 ავტომატურად თარგმნის ყველა ახალ სიტყვას.
                    Target ენა: {language?.code === 'en' ? 'ქართული' : 'ინგლისური'}
                  </small>
                </div>
              </div>

              <div className="words-grid new-words">
                {cardsData.newWords.map((word, index) => (
                  <div
                    key={index}
                    className={`word-card new-card ${editingWordIndex === index ? 'editing' : ''}`}
                  >
                    {/* ✅ რედაქტირების რეჟიმი */}
                    {editingWordIndex === index ? (
                      <div className="word-edit-mode">
                        <div className="word-text editing">
                          {word}
                        </div>

                        <div className="translation-input-section">
                          <input
                            type="text"
                            placeholder="შეიყვანეთ თარგმანი..."
                            value={tempTranslations[index] || ''}
                            onChange={(e) => handleTranslationChange(index, e.target.value)}
                            className="translation-input"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addWordToList(index, word);
                              }
                              if (e.key === 'Escape') {
                                cancelEditingWord();
                              }
                            }}
                          />

                          <div className="edit-actions">
                            <button
                              type="button"
                              onClick={() => addWordToList(index, word)}
                              className="add-word-button"
                              disabled={!tempTranslations[index]?.trim()}
                            >
                              ✅
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingWord}
                              className="cancel-button"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ✅ ნორმალური რეჟიმი */
                      <div
                        className="word-normal-mode"
                        onClick={() => startEditingWord(index, word)}
                      >
                        <div className="word-text">
                          {word}
                        </div>

                        {wordsToAdd.some(item => item.word === word) ? (
                          <div className={`added-badge ${wordsToAdd.find(item => item.word === word)?.autoTranslated ? 'auto' : ''}`}>
                            {wordsToAdd.find(item => item.word === word)?.autoTranslated ?
                              '🤖 ავტომატურად დამატებული' :
                              '✅ დამატებული'
                            }
                          </div>
                        ) : (
                          <div className="add-instruction">
                            📝 დააჭირეთ თარგმანისთვის
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="section-info">
                <small>
                  ✨ დააჭირეთ ბარათს ხელით თარგმანისთვის ან გამოიყენეთ ავტომატური თარგმნა.
                </small>
              </div>
            </div>
          )}

          {/* ✅ Empty state */}
          {(!cardsData.existingsInDatabase || cardsData.existingsInDatabase.length === 0) &&
            (!cardsData.newWords || cardsData.newWords.length === 0) && (
              <div className="no-words-message">
                <p>😔 სიტყვები ვერ გენერირებულა. შეამოწმეთ სუბტიტრები.</p>
              </div>
            )}
        </div>
      )}

      {/* ✅ დასამატებელი სიტყვების სია */}
      {wordsToAdd.length > 0 && (
        <div className="words-to-add-section">
          <h4 className="section-title">
            📋 დასამატებელი სიტყვები ({wordsToAdd.length})
          </h4>

          <div className="words-to-add-list">
            {wordsToAdd.map((wordEntry, index) => (
              <div key={index} className={`word-to-add-item ${wordEntry.autoTranslated ? 'auto-translated' : ''}`}>
                <div className="word-info">
                  <span className="word-text">{wordEntry.word}</span>
                  <span className="word-translation">→ {wordEntry.translation}</span>
                  {wordEntry.autoTranslated && (
                    <span className="auto-badge" title={`ავტომატური თარგმნა (${Math.round((wordEntry.confidence || 0) * 100)}% ზუსტობა)`}>
                      🤖
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeWordFromList(wordEntry.word)}
                  className="remove-word-button"
                  title="სიიდან მოშორება"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="words-to-add-actions">
            <button
              type="button"
              onClick={() => setWordsToAdd([])}
              className="clear-list-button"
            >
              🗑️ სიის გასუფთავება
            </button>
            <button
              type="button"
              onClick={saveWordsToDatabase}
              className="save-words-button"
            >
              💾 ყველა სიტყვის ბაზაში შენახვა ({wordsToAdd.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCardsGenerator;