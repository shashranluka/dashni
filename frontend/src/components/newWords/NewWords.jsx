import React from 'react';
import WordCard from '../wordDataCard/WordCard';
import './NewWords.scss';

const NewWords = ({ 
  newWords = [], 
  onAddWord, 
  onSaveAll, 
  wordsToAdd = [],
  onRemoveFromToAdd,
  onClearToAdd,
  onSaveWordsToAdd,
  isProcessing = false
}) => {
  // ✅ WordCard handlers
  const handleWordAdd = async (word, translation) => {
    await onAddWord(word, translation);
  };

  const handleWordRemove = (word) => {
    // Logic to remove word from newWords array
    console.log('Removing word:', word);
  };

  if (newWords.length === 0) {
    return null;
  }

  return (
    <div className="new-words">
      <div className="section-header">
        <h4 className="words-title">
          🆕 ახალი სიტყვები ({newWords.length})
        </h4>
        {newWords.length > 1 && (
          <button 
            className="save-all-btn"
            onClick={() => onSaveAll(newWords)}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ მუშავდება...' : '💾 ყველას შენახვა'}
          </button>
        )}
      </div>

      {/* ✅ WordCard-ების გამოყენება */}
      <div className="words-grid">
        {newWords.map((word, index) => {
          const wordInToAdd = wordsToAdd.find(w => w.word === word);
          
          return (
            <WordCard
              key={`word-${index}`}
              word={word}
              initialTranslation={wordInToAdd?.translation || ''}
              isWordAdded={!!wordInToAdd}
              onAddWord={handleWordAdd}
              onRemoveWord={handleWordRemove}
              isProcessing={isProcessing}
              cardSize="medium"
              showRemoveButton={true}
            />
          );
        })}
      </div>

      {/* ✅ Words to Add Section - უცვლელი */}
      {wordsToAdd.length > 0 && (
        <div className="words-to-add-section">
          <div className="section-header">
            <h5 className="section-title">
              📝 დასამატებელი სიტყვები ({wordsToAdd.length})
            </h5>
          </div>

          <div className="words-to-add-list">
            {wordsToAdd.map((item, index) => (
              <div key={`to-add-${index}`} className="word-to-add-item">
                <div className="word-info">
                  <span className="word-text">{item.word}</span>
                  <span className="word-translation">→ {item.translation}</span>
                </div>
                <button
                  className="remove-word-button"
                  onClick={() => onRemoveFromToAdd(index)}
                  title="სიიდან მოშორება"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="words-to-add-actions">
            <button
              className="clear-list-button"
              onClick={onClearToAdd}
            >
              🗑️ სიის გასუფთავება
            </button>
            <button
              className="save-words-button"
              onClick={onSaveWordsToAdd}
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ ინახება...' : '💾 ბაზაში შენახვა'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewWords;