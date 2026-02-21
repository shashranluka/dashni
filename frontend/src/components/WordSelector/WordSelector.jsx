import { useEffect, useState } from "react";
import "./WordSelector.scss";

export default function WordSelector({ allWords, onStartGame }) {
  const [selectionMode, setSelectionMode] = useState("sequential");
  const [wordCount, setWordCount] = useState(allWords?.length ?? 0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [direction, setDirection] = useState("translation-to-word");

  useEffect(() => {
    setWordCount(allWords?.length ?? 0);
    setSelectedWords([]);
  }, [allWords]);

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
      <div className="compact-selects">
        <label className="compact-field">
          <span>თამაშის მიმართულება:</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
          >
            <option value="translation-to-word">თარგმანი → უცხო სიტყვა</option>
            <option value="word-to-translation">უცხო სიტყვა → თარგმანი</option>
          </select>
        </label>

        <label className="compact-field">
          <span>სიტყვების შერჩევა:</span>
          <select
            value={selectionMode}
            onChange={(e) => setSelectionMode(e.target.value)}
          >
            <option value="sequential">მიმდევრობით</option>
            <option value="random">შემთხვევითად</option>
            <option value="manual">მონიშვნით</option>
          </select>
        </label>

        {(selectionMode === "sequential" || selectionMode === "random") && (
          <label className="compact-field compact-count-field">
            <span>სიტყვების რაოდენობა:</span>
            <input
              type="number"
              min="0"
              max={allWords.length}
              value={wordCount}
              onChange={(e) =>
                setWordCount(
                  Math.max(
                    0,
                    Math.min(Number(e.target.value) || 0, allWords.length)
                  )
                )
              }
            />
          </label>
        )}
      </div>

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
        disabled={
          allWords.length === 0 ||
          (selectionMode === "manual" && selectedWords.length === 0)
        }
      >
        თამაშის დაწყება
      </button>
    </div>
  );
}
