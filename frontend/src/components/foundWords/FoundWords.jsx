import React from 'react';
import './FoundWords.scss';
import WordCard from '../wordCard/WordCard';

const FoundWords = ({ foundWords = [] }) => {
  if (foundWords.length === 0) {
    return null;
  }

  return (
    <div className="found-words">
      <h4 className="found-words-title">
        ✅ ნაპოვნია ბაზაში ({foundWords.length})
      </h4>
      
      <div className="found-words-list">
        {foundWords.map((item, index) => (
          <div key={`found-${index}`} className="found-word-item">
            <div className="word-content">
              <span className="word-text">{item.word}</span>
              {item.translation && (
                <span className="word-translation">→ {item.translation}</span>
              )}
            </div>
            
            {/* ✅ დამატებითი ინფორმაცია */}
            <div className="word-metadata">
              {item.isPrivate && (
                <span className="private-badge" title="პირადი სიტყვა">
                  🔒
                </span>
              )}
              {item.createdAt && (
                <span className="date-badge" title={`დამატებულია: ${new Date(item.createdAt).toLocaleDateString()}`}>
                  📅
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="found-words-footer">
        <small className="found-words-info">
          💡 ეს სიტყვები უკვე არსებობს ბაზაში და არ საჭიროებს თარგმნას.
        </small>
      </div>
    </div>
  );
};

export default FoundWords;