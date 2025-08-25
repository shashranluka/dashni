import React, { useState, useCallback } from 'react';
import WordCard from '../wordCard/WordCard';
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
  // ✅ ახალი state - pending changes tracking
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // ✅ WordCard handlers
  const handleWordAdd = async (word, translation) => {
    // WordCard-ში ცვლილება ჯერ pending-ში ინახება
    setPendingChanges(prev => ({
      ...prev,
      [word]: {
        word,
        translation,
        action: 'add',
        timestamp: Date.now()
      }
    }));
    
    console.log('Word added to pending changes:', word, translation);
  };

  const handleWordEdit = async (word, newTranslation) => {
    // თარგმანის რედაქტირება pending-ში ინახება
    setPendingChanges(prev => ({
      ...prev,
      [word]: {
        word,
        translation: newTranslation,
        action: 'edit',
        timestamp: Date.now()
      }
    }));
    
    console.log('Word edit added to pending changes:', word, newTranslation);
  };

  const handleWordRemove = (word) => {
    // WordCard-ის წაშლა
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[word];
      console.log('Word removed from pending changes:', word,newChanges);
      return newChanges;
    });
    
    console.log('Removing word from pending changes:', word);
  };

  // ✅ ახალი ფუნქცია - pending changes-ების შენახვა
  const handleSavePendingChanges = useCallback(async () => {
    const pendingArray = Object.values(pendingChanges);
    
    if (pendingArray.length === 0) {
      alert('💡 შენახვისთვის ცვლილებები არ არის');
      return;
    }

    setIsSavingChanges(true);
    
    try {
      // ✅ თითოეული pending change-ის შენახვა
      for (const change of pendingArray) {
        if (change.action === 'add') {
          await onAddWord(change.word, change.translation);
        } else if (change.action === 'edit') {
          // თუ onEditWord prop არსებობს
          if (typeof onEditWord === 'function') {
            await onEditWord(change.word, change.translation);
          } else {
            // ალტერნატიულად onAddWord-ით
            await onAddWord(change.word, change.translation);
          }
        }
      }

      // ✅ წარმატების შემდეგ pending changes-ების გასუფთავება
      setPendingChanges({});
      
      // ✅ Success feedback
      alert(`✅ ${pendingArray.length} სიტყვა წარმატებით შენახულია!`);
      
    } catch (error) {
      console.error('Error saving pending changes:', error);
      alert('❌ შენახვისას მოხდა შეცდომა. კიდევ სცადეთ.');
    } finally {
      setIsSavingChanges(false);
    }
  }, [pendingChanges, onAddWord]);

  // ✅ Pending changes-ების გასუფთავება
  const handleClearPendingChanges = useCallback(() => {
    if (Object.keys(pendingChanges).length === 0) {
      return;
    }

    if (window.confirm('დარწმუნებული ხართ, რომ გსურთ ყველა ცვლილების გაუქმება?')) {
      setPendingChanges({});
      console.log('Pending changes cleared');
    }
  }, [pendingChanges]);

  if (newWords.length === 0) {
    return null;
  }

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="new-words">
      <div className="section-header">
        <h4 className="words-title">
          🆕 ახალი სიტყვები ({newWords.length})
        </h4>
        
        <div className="header-actions">
          {/* ✅ ახალი "დამახსოვრება" ღილაკი */}
          {pendingCount > 0 && (
            <div className="pending-changes-controls">
              <button
                className="save-pending-btn"
                onClick={handleSavePendingChanges}
                disabled={isSavingChanges || isProcessing}
                title={`${pendingCount} ცვლილების შენახვა`}
              >
                {isSavingChanges ? (
                  <>⏳ ინახება...</>
                ) : (
                  <>💾 დამახსოვრება ({pendingCount})</>
                )}
              </button>
              
              <button
                className="clear-pending-btn"
                onClick={handleClearPendingChanges}
                disabled={isSavingChanges || isProcessing}
                title="ცვლილებების გაუქმება"
              >
                🗑️
              </button>
            </div>
          )}

          {/* ✅ არსებული "ყველას შენახვა" ღილაკი */}
          {newWords.length > 1 && (
            <button 
              className="save-all-btn"
              onClick={() => onSaveAll(newWords)}
              disabled={isProcessing || isSavingChanges}
            >
              {isProcessing ? '⏳ მუშავდება...' : '💾 ყველას შენახვა'}
            </button>
          )}
        </div>
      </div>

      {/* ✅ Pending Changes Info */}
      {pendingCount > 0 && (
        <div className="pending-changes-info">
          <div className="info-content">
            <span className="info-icon">📝</span>
            <span className="info-text">
              {pendingCount} ცვლილება მზადაა შენახვისთვის
            </span>
            <div className="pending-preview">
              {Object.values(pendingChanges).slice(0, 3).map((change, index) => (
                <span key={index} className="pending-item">
                  {change.word} → {change.translation}
                  {index < Math.min(Object.values(pendingChanges).length, 3) - 1 && ', '}
                </span>
              ))}
              {pendingCount > 3 && <span className="more-indicator">...</span>}
            </div>
          </div>
        </div>
      )}

      {/* ✅ WordCard-ების გამოყენება */}
      <div className="words-grid">
        {newWords.map((word, index) => {
          console.log('Rendering word card for:', word);
          const wordInToAdd = wordsToAdd.find(w => w.word === word);
          const pendingChange = pendingChanges[word];
          
          return (
            <WordCard
              key={`new-word-${index}`}
              word={word}
              initialTranslation={
                pendingChange?.translation || 
                wordInToAdd?.translation || 
                ''
              }
              isWordAdded={!!wordInToAdd || !!pendingChange}
              onAddWord={handleWordAdd}
              onEditTranslation={handleWordEdit}
              onRemoveWord={handleWordRemove}
              isProcessing={isProcessing || isSavingChanges}
              cardSize="medium"
              showRemoveButton={true}
              // ✅ ახალი prop - pending indicator
              isPending={!!pendingChange}
              pendingAction={pendingChange?.action}
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
              disabled={isProcessing || isSavingChanges}
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