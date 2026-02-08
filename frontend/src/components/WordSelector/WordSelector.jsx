import { useState } from "react";
import "./WordSelector.scss";

export default function WordSelector({ allWords, onStartGame }) {
  const [selectionMode, setSelectionMode] = useState("sequential"); // sequential, random, manual
  const [wordCount, setWordCount] = useState(10);
  const [selectedWords, setSelectedWords] = useState([]);
  const [direction, setDirection] = useState("translation-to-word"); // translation-to-word, word-to-translation

  const handleWordToggle = (word) => {
    setSelectedWords(prev => {
      const wordId = word.the_word || word.word;
      const isSelected = prev.some(w => (w.the_word || w.word) === wordId);
      if (isSelected) {
        return prev.filter(w => (w.the_word || w.word) !== wordId);
      } else {
        return [...prev, word];
      }
    });
  };

  const handleStartGame = () => {
    let wordsToPlay = [];

    if (selectionMode === "sequential") {
      wordsToPlay = allWords.slice(0, Math.min(wordCount, allWords.length));
    } else if (selectionMode === "random") {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      wordsToPlay = shuffled.slice(0, Math.min(wordCount, allWords.length));
    } else if (selectionMode === "manual") {
      wordsToPlay = selectedWords;
    }

    if (wordsToPlay.length > 0) {
      onStartGame(wordsToPlay, direction);
    }
  };

  return (
    <div className="word-selector">
      
      <div className="direction-selection">
        <h3>თამაშის მიმართულება:</h3>
        <label>
          <input
            type="radio"
            value="translation-to-word"
            checked={direction === "translation-to-word"}
            onChange={(e) => setDirection(e.target.value)}
          />
          თარგმანი → უცხო სიტყვა
        </label>
        
        <label>
          <input
            type="radio"
            value="word-to-translation"
            checked={direction === "word-to-translation"}
            onChange={(e) => setDirection(e.target.value)}
          />
          უცხო სიტყვა → თარგმანი
        </label>
      </div>

      <h2>სიტყვების შერჩევა</h2>
      
      <div className="selection-mode">
        <label>
          <input
            type="radio"
            value="sequential"
            checked={selectionMode === "sequential"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          მიმდევრობით
        </label>
        
        <label>
          <input
            type="radio"
            value="random"
            checked={selectionMode === "random"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          შემთხვევითად
        </label>
        
        <label>
          <input
            type="radio"
            value="manual"
            checked={selectionMode === "manual"}
            onChange={(e) => setSelectionMode(e.target.value)}
          />
          მონიშვნით
        </label>
      </div>

      {(selectionMode === "sequential" || selectionMode === "random") && (
        <div className="word-count-input">
          <label>
            სიტყვების რაოდენობა:
            <input
              type="number"
              min="1"
              max={allWords.length}
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 1)}
            />
          </label>
        </div>
      )}

      {selectionMode === "manual" && (
        <div className="word-cards">
          <p>აირჩიეთ სიტყვები ({selectedWords.length} არჩეული):</p>
          <div className="cards-grid">
            {allWords.map((word, index) => {
              const wordId = word.the_word || word.word;
              const isSelected = selectedWords.some(w => (w.the_word || w.word) === wordId);
              const displayText = direction === "translation-to-word" 
                ? word.translation 
                : word.the_word;
              
              return (
                <div
                  key={index}
                  className={`word-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleWordToggle(word)}
                >
                  <div className="word">{displayText}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button 
        className="start-game-btn"
        onClick={handleStartGame}
        disabled={selectionMode === "manual" && selectedWords.length === 0}
      >
        თამაშის დაწყება
      </button>
    </div>
  );
}
