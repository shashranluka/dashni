import React, { useState, useCallback } from 'react';
import newRequest from '../../utils/newRequest';
import { autoTranslate } from '../../utils/autoTranslate';
import FoundWords from '../foundWords/FoundWords'; // ✅ ახალი კომპონენტის იმპორტი
import './WordsTranslator.scss';
import NewWords from '../newWords/NewWords';

const WordsTranslator = ({ selectedWords, language = 'en', userId }) => {
  // ✅ State Management
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [error, setError] = useState(null);
  
  // ✅ Edit ფუნქციონალისთვის State-ები (WordCardsGenerator-ის მსგავსად)
  const [editingWordIndex, setEditingWordIndex] = useState(null);
  const [tempTranslations, setTempTranslations] = useState({});
  const [wordsToAdd, setWordsToAdd] = useState([]);
  
  // ✅ Google Translate API-სთვის State-ები
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [autoTranslateError, setAutoTranslateError] = useState(null);

  // ✅ Toggle განყოფილების გახსნა/დახურვა
  const toggleSection = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // ✅ სიტყვების შემოწმება ბაზაში
  const checkWordsInDatabase = useCallback(async () => {
    if (selectedWords.size === 0) {
      setError("გთხოვთ აირჩიოთ სიტყვები შემოწმებისთვის");
      return;
    }

    setIsChecking(true);
    setError(null);
    setCheckResults(null);
    // ✅ Edit state-ების გასუფთავება
    setEditingWordIndex(null);
    setTempTranslations({});
    setWordsToAdd([]);
    setAutoTranslateError(null);

    try {
      const wordsArray = Array.from(selectedWords);
      
      console.log(`🔍 ბაზაში შემოწმება: ${wordsArray.length} სიტყვა`);

      const response = await newRequest.get(`/words/translate`, {
        params: {
          wordsToTranslate: wordsArray,
          language: language,
          test: "check",
        },
      });

      console.log("✅ შემოწმების შედეგი:", response.data);

      const translatedWords = response.data || [];
      const translatedWordsList = translatedWords.map(item => item.word?.toLowerCase()).filter(Boolean);
      
      const newWords = wordsArray.filter(word => 
        !translatedWordsList.includes(word.toLowerCase())
      );

      setCheckResults({
        totalWords: wordsArray.length,
        translatedWords: translatedWords,
        newWords: newWords,
        translatedCount: translatedWords.length,
        newCount: newWords.length
      });

      console.log(`📊 შედეგი: ${translatedWords.length} ნაპოვნი, ${newWords.length} ახალი`);

    } catch (error) {
      console.error("❌ შემოწმების შეცდომა:", error);
      setError(error.response?.data?.message || "ბაზის შემოწმება ვერ მოხერხდა");
    } finally {
      setIsChecking(false);
    }
  }, [selectedWords, language]);

  // ✅ შედეგების გასუფთავება
  const clearResults = useCallback(() => {
    setCheckResults(null);
    setError(null);
    setEditingWordIndex(null);
    setTempTranslations({});
    setWordsToAdd([]);
    setAutoTranslateError(null);
  }, []);

  // ✅ სიტყვის რედაქტირების დაწყება
  const startEditingWord = useCallback((wordIndex, word) => {
    setEditingWordIndex(wordIndex);
    setTempTranslations(prev => ({
      ...prev,
      [wordIndex]: ''
    }));
    console.log(`📝 Edit რეჟიმის დაწყება სიტყვისთვის: ${word} (index: ${wordIndex})`);
  }, []);

  // ✅ რედაქტირების გაუქმება
  const cancelEditingWord = useCallback(() => {
    const currentIndex = editingWordIndex;
    setEditingWordIndex(null);
    setTempTranslations(prev => {
      const newTemp = { ...prev };
      delete newTemp[currentIndex];
      return newTemp;
    });
    console.log("❌ Edit რეჟიმის გაუქმება");
  }, [editingWordIndex]);

  // ✅ თარგმანის შეცვლა input-ში
  const handleTranslationChange = useCallback((wordIndex, translation) => {
    setTempTranslations(prev => ({
      ...prev,
      [wordIndex]: translation
    }));
  }, []);

  // ✅ სიტყვის მასივში დამატება
  const addWordToList = useCallback((wordIndex, word) => {
    const translation = tempTranslations[wordIndex]?.trim();

    if (!translation) {
      setError('გთხოვთ შეიყვანოთ თარგმანი');
      return;
    }

    const newWordEntry = {
      word: word,
      translation: translation,
      language: language,
      difficulty: 'beginner',
      category: 'general',
      addedAt: new Date().toISOString(),
      id: Date.now(),
      autoTranslated: false // ✅ ხელით თარგმნილი
    };

    console.log(`✅ სიტყვის სიაში დამატება: ${word} → ${translation}`);

    setWordsToAdd(prev => {
      const alreadyExists = prev.some(item => item.word === word);
      if (alreadyExists) {
        setError('ეს სიტყვა უკვე დამატებულია სიაში');
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
    setError(null);

  }, [tempTranslations, language]);

  // ✅ Google Translate ავტომატური თარგმნა
  const handleAutoTranslate = useCallback(async () => {
    if (!checkResults?.newWords || checkResults.newWords.length === 0) {
      setError('ახალი სიტყვები არ არსებობს თარგმნისთვის');
      return;
    }

    // ✅ მხოლოდ ის სიტყვები, რომლებიც ჯერ არ დამატებულა სიაში
    const wordsToTranslate = checkResults.newWords.filter(word =>
      !wordsToAdd.some(item => item.word === word)
    );

    if (wordsToTranslate.length === 0) {
      setError('ყველა სიტყვა უკვე დამატებულია სიაში');
      return;
    }

    setIsAutoTranslating(true);
    setAutoTranslateError(null);
    setError(null);

    try {
      console.log('🌐 Google Translate ავტომატური თარგმნა იწყება...', wordsToTranslate);

      const targetLanguage = 'ka'; // ქართული
      const sourceLanguage = language;

      const translations = await autoTranslate(wordsToTranslate, targetLanguage, sourceLanguage);

      console.log('✅ მიღებული თარგმანები:', translations);

      const newWordEntries = translations.data.map(translationData => ({
        word: translationData.original,
        translation: translationData.translated,
        language: language,
        difficulty: 'beginner',
        category: 'general',
        confidence: translationData.confidence,
        autoTranslated: true, // ✅ Google Translate-ით თარგმნილი
        addedAt: new Date().toISOString(),
        id: Date.now() + Math.random() // უნიკალური ID
      }));

      setWordsToAdd(prev => [...prev, ...newWordEntries]);

      console.log(`🎉 წარმატებით დაემატა ${newWordEntries.length} Google Translate-ით თარგმნილი სიტყვა`);

    } catch (error) {
      console.error('❌ Google Translate-ის შეცდომა:', error);
      setAutoTranslateError(error.message || 'ავტომატური თარგმნა ვერ მოხერხდა');
    } finally {
      setIsAutoTranslating(false);
    }
  }, [checkResults?.newWords, wordsToAdd, language]);

  // ✅ სიტყვის სიიდან მოშორება
  const removeWordFromList = useCallback((wordToRemove) => {
    setWordsToAdd(prev => prev.filter(item => item.word !== wordToRemove));
    console.log('სიტყვა წაიშალა სიიდან:', wordToRemove);
  }, []);

  // ✅ ყველა სიტყვის ბაზაში შენახვა
  const saveWordsToDatabase = useCallback(async () => {
    if (wordsToAdd.length === 0) {
      setError('სიტყვები არ არის დასამატებელი');
      return;
    }

    try {
      console.log('💾 სიტყვების შენახვა დაიწყო:', wordsToAdd);
      
      const response = await newRequest.post('/words', {wordsToAdd, userId});
      console.log('✅ სიტყვები წარმატებით დაემატა:', response.data);
      
      setCheckResults(prev => {
        if (!prev) return prev;

        const newTranslatedWords = wordsToAdd.map(wordEntry => ({
          word: wordEntry.word,
          translation: wordEntry.translation,
          isPrivate: false,
          userId: null,
          createdAt: wordEntry.addedAt
        }));

        return {
          ...prev,
          translatedWords: [...prev.translatedWords, ...newTranslatedWords],
          translatedCount: prev.translatedWords.length + newTranslatedWords.length
        };
      });

      setWordsToAdd([]);
      setError(null);
      
      console.log(`🎉 ${wordsToAdd.length} სიტყვა წარმატებით შეინახა ბაზაში!`);

    } catch (error) {
      console.error('❌ სიტყვების შენახვის შეცდომა:', error);
      setError(error.response?.data?.message || 'სიტყვების შენახვა ვერ მოხერხდა');
    }
  }, [wordsToAdd]);

  // ✅ Enter/Escape key ჰენდლერი
  const handleKeyPress = useCallback((event, wordIndex, word) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addWordToList(wordIndex, word);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditingWord();
    }
  }, [addWordToList, cancelEditingWord]);

  return (
    <div className={`words-checker-section ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ✅ Header */}
      <div className="section-header" onClick={toggleSection}>
        <h3 className="section-title">🔍 სიტყვების ბაზაში შემოწმება და თარგმნა</h3>
        <button 
          type="button" 
          className="collapse-toggle"
          title={isCollapsed ? "გაშლა" : "ჩაკეცვა"}
        >
          {isCollapsed ? '▶️' : '🔽'}
        </button>
      </div>

      {/* ✅ Content */}
      <div className={`checker-content ${isCollapsed ? 'hidden' : 'visible'}`}>
        {/* ✅ Control Panel */}
        <div className="checker-controls">
          <div className="check-info">
            <span className="words-count">
              არჩეული: <strong>{selectedWords.size}</strong> სიტყვა
            </span>
            {language && (
              <span className="language-info">
                ენა: <strong>{language.toUpperCase()}</strong>
              </span>
            )}
            {wordsToAdd.length > 0 && (
              <span className="pending-count">
                მზად არის: <strong>{wordsToAdd.length}</strong> თარგმანი
              </span>
            )}
          </div>

          <div className="check-actions">
            <button
              onClick={checkWordsInDatabase}
              disabled={selectedWords.size === 0 || isChecking}
              className="check-btn"
            >
              {isChecking ? (
                <>🔄 შემოწმება...</>
              ) : (
                <>🔍 ბაზაში შემოწმება</>
              )}
            </button>

            {checkResults && (
              <button
                onClick={clearResults}
                className="clear-results-btn"
              >
                🗑️ გასუფთავება
              </button>
            )}

            {wordsToAdd.length > 0 && (
              <button
                onClick={saveWordsToDatabase}
                className="save-all-btn"
              >
                💾 ყველას შენახვა ({wordsToAdd.length})
              </button>
            )}
          </div>
        </div>

        {/* ✅ Error Display */}
        {error && (
          <div className="check-error">
            <span className="error-message">❌ {error}</span>
          </div>
        )}

        {/* ✅ Results Display */}
        {checkResults && (
          <div className="check-results">
            {/* ✅ Summary */}
            <div className="results-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-number">{checkResults.totalWords}</span>
                  <span className="stat-label">სულ შემოწმდა</span>
                </div>
                <div className="stat-item translated">
                  <span className="stat-number">{checkResults.translatedCount}</span>
                  <span className="stat-label">ნაპოვნია ბაზაში</span>
                </div>
                <div className="stat-item new">
                  <span className="stat-number">{checkResults.newCount}</span>
                  <span className="stat-label">ახალი სიტყვები</span>
                </div>
                {wordsToAdd.length > 0 && (
                  <div className="stat-item pending">
                    <span className="stat-number">{wordsToAdd.length}</span>
                    <span className="stat-label">მზად შენახვისთვის</span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ FoundWords კომპონენტის გამოყენება */}
            <FoundWords foundWords={checkResults.translatedWords} />

            {/* ✅ New Words - Editable */}
            <NewWords newWords={checkResults.newWords} />
            {/* ✅ ახალი სიტყვები - უცვლელი */}
            {checkResults.newWords.length > 0 && (
              <div className="new-words">
                <h4 className="words-title">🆕 ახალი სიტყვები ({checkResults.newCount})</h4>
                
                {/* ✅ Google Translate ღილაკი */}
                <div className="auto-translate-section">
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isAutoTranslating || checkResults.newWords.filter(word =>
                      !wordsToAdd.some(item => item.word === word)
                    ).length === 0}
                    className="auto-translate-button"
                  >
                    {isAutoTranslating ? (
                      <>🔄 Google Translate-ით თარგმნა...</>
                    ) : (
                      <>
                        🌐 Google Translate ავტომატური თარგმნა ({checkResults.newWords.filter(word =>
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
                      💡 Google Translate API-ს დახმარებით ავტომატურად თარგმნის ყველა ახალ სიტყვას ქართულად.
                    </small>
                  </div>
                </div>

                <div className="words-grid new-words">
                  {checkResults.newWords.map((word, index) => (
                    <div
                      key={`new-${index}`}
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
                              onKeyDown={(e) => handleKeyPress(e, index, word)}
                              className="translation-input"
                              autoFocus
                            />

                            <div className="edit-actions">
                              <button
                                type="button"
                                onClick={() => addWordToList(index, word)}
                                className="add-word-button"
                                disabled={!tempTranslations[index]?.trim()}
                                title="დადასტურება"
                              >
                                ✅
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingWord}
                                className="cancel-button"
                                title="გაუქმება"
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
                                '🌐 Google Translate-ით დამატებული' :
                                '✅ ხელით დამატებული'
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
                    ✨ დააჭირეთ ბარათს ხელით თარგმანისთვის ან გამოიყენეთ Google Translate ავტომატური თარგმნა.
                  </small>
                </div>
              </div>
            )}

            {/* ✅ დასამატებელი სიტყვების სია - განსხვავებული იკონებით */}
            {wordsToAdd.length > 0 && (
              <div className="words-to-add-section">
                <h4 className="section-title">
                  📋 დასამატებელი სიტყვები ({wordsToAdd.length})
                </h4>

                <div className="words-to-add-list">
                  {wordsToAdd.map((wordEntry) => (
                    <div 
                      key={wordEntry.id} 
                      className={`word-to-add-item ${wordEntry.autoTranslated ? 'auto-translated' : 'manual-translated'}`}
                    >
                      <div className="word-info">
                        <div className="word-main-info">
                          <span className="word-text">{wordEntry.word}</span>
                          <span className="word-translation">→ {wordEntry.translation}</span>
                        </div>
                        
                        {/* ✅ თარგმნის ტიპის ინდიკატორი */}
                        <div className="translation-indicator">
                          {wordEntry.autoTranslated ? (
                            <span 
                              className="auto-badge" 
                              title={`Google Translate ავტომატური თარგმანი${wordEntry.confidence ? ` (${Math.round(wordEntry.confidence * 100)}% ზუსტობა)` : ''}`}
                            >
                              🌐
                            </span>
                          ) : (
                            <span className="manual-badge" title="ხელით შეყვანილი თარგმანი">
                              ✋
                            </span>
                          )}
                        </div>
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

                {/* ✅ სტატისტიკა */}
                <div className="words-to-add-stats">
                  <div className="stat-badges">
                    <span className="manual-count">
                      ✋ ხელით: {wordsToAdd.filter(w => !w.autoTranslated).length}
                    </span>
                    <span className="auto-count">
                      🌐 Google: {wordsToAdd.filter(w => w.autoTranslated).length}
                    </span>
                  </div>
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

            {/* ✅ თუ ყველა სიტყვა ნაპოვნია */}
            {checkResults.newCount === 0 && checkResults.translatedCount > 0 && wordsToAdd.length === 0 && (
              <div className="all-found-message">
                🎉 ყველა არჩეული სიტყვა უკვე არსებობს ბაზაში!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordsTranslator;