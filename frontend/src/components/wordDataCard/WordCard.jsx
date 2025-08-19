import React, { useState, useCallback } from 'react';
import './WordCard.scss';

const WordCard = ({ 
  word,
  initialTranslation = '',
  isWordAdded = false,
  onAddWord,
  onEditTranslation,
  onRemoveWord,
  isProcessing = false,
  showRemoveButton = true,
  cardSize = 'medium' // 'small', 'medium', 'large'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [translation, setTranslation] = useState(initialTranslation);
  const [isHovered, setIsHovered] = useState(false);

  console.log('WordCard rendered for:', word);
  // ✅ Edit Mode Management
  const handleEditClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setTranslation(initialTranslation);
  }, [initialTranslation]);

  // ✅ Translation Management
  const handleTranslationChange = useCallback((e) => {
    setTranslation(e.target.value);
  }, []);

  const handleSaveTranslation = useCallback(async () => {
    const trimmedTranslation = translation.trim();
    
    if (!trimmedTranslation) {
      alert('გთხოვთ შეიყვანეთ თარგმანი');
      return;
    }

    try {
      if (onAddWord) {
        console.log('Word added:', word, trimmedTranslation, onAddWord);
        await onAddWord(word, trimmedTranslation);
        console.log('Word added:', word, trimmedTranslation);
      }
      if (onEditTranslation) {
        console.log('Word edited:', word, trimmedTranslation, onEditTranslation);
        await onEditTranslation(word, trimmedTranslation);
        console.log('Word edited:', word, trimmedTranslation);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('თარგმანის შენახვა ვერ მოხერხდა');
    }
  }, [translation, word, onAddWord, onEditTranslation]);

  // ✅ Remove Word
  const handleRemoveWord = useCallback((e) => {
    e.stopPropagation();
    if (onRemoveWord && window.confirm(`დარწმუნებული ხართ, რომ გსურთ "${word}" სიტყვის მოშორება?`)) {
      onRemoveWord(word);
    }
  }, [word, onRemoveWord]);

  // ✅ Keyboard Events
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveTranslation();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveTranslation, handleCancelEdit]);

  return (
    <div 
      className={`word-card ${cardSize} ${isWordAdded ? 'added' : ''} ${isEditing ? 'editing' : ''} ${isProcessing ? 'processing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✅ Header Section */}
      <div className="word-header">
        <div className="word-info">
          <span className="word-text">{word}</span>
          <div className="word-meta">
            {isWordAdded && (
              <span className="status-badge added" title="დამატებულია ბაზაში">
                ✅
              </span>
            )}
            <span className="word-length" title={`სიტყვის სიგრძე: ${word.length} სიმბოლო`}>
              {word.length}
            </span>
          </div>
        </div>

        {/* ✅ Action Buttons */}
        <div className="word-actions">
          {!isEditing ? (
            <>
              <button
                className="edit-button"
                onClick={handleEditClick}
                disabled={isProcessing}
                title="თარგმანის რედაქტირება"
              >
                ✏️
              </button>
              {showRemoveButton && isHovered && (
                <button
                  className="remove-button"
                  onClick={handleRemoveWord}
                  disabled={isProcessing}
                  title="სიტყვის მოშორება"
                >
                  🗑️
                </button>
              )}
            </>
          ) : (
            <div className="edit-actions">
              <button
                className="save-button"
                onClick={handleSaveTranslation}
                disabled={!translation.trim() || isProcessing}
                title="თარგმანის შენახვა"
              >
                ✓
              </button>
              <button
                className="cancel-button"
                onClick={handleCancelEdit}
                disabled={isProcessing}
                title="გაუქმება"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Translation Section */}
      <div className="translation-section">
        <div className="translation-header">
          <span className="translation-label">თარგმანი:</span>
          {isWordAdded && (
            <span className="translation-source" title="წყარო: მომხმარებლის ბაზა">
              📚
            </span>
          )}
        </div>

        <div className="translation-content">
          {isEditing ? (
            <div className="translation-input-container">
              <input
                type="text"
                className="translation-input"
                value={translation}
                onChange={handleTranslationChange}
                onKeyDown={handleKeyPress}
                placeholder="შეიყვანეთ თარგმანი..."
                autoFocus
                disabled={isProcessing}
              />
              <div className="input-hint">
                <small>Enter - შენახვა, Esc - გაუქმება</small>
              </div>
            </div>
          ) : (
            <div className="translation-display">
              {translation ? (
                <span className="translation-text">{translation}</span>
              ) : (
                <span className="no-translation">
                  {isWordAdded ? 'თარგმანი ვერ მოიძებნა' : 'თარგმანი არ არის დამატებული'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Footer (Optional Info) */}
      {(isHovered || isEditing) && (
        <div className="word-footer">
          <div className="word-stats">
            <span className="char-count" title="სიმბოლოების რაოდენობა">
              📊 {word.length} char
            </span>
            {translation && (
              <span className="translation-length" title="თარგმანის სიგრძე">
                → {translation.length} char
              </span>
            )}
          </div>
        </div>
      )}

      {/* ✅ Processing Overlay */}


      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner"></div>
          <span>მუშავდება...</span>
        </div>
      )}
    </div>
  );
};

export default WordCard;