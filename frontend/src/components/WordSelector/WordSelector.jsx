import { useEffect, useState } from "react";
import "./WordSelector.scss";

export default function WordSelector({
  allWords,
  onSettingsChange,
  settingsTopContent = null,
  isOpen = false,
  onToggle,
}) {
  const [selectionMode, setSelectionMode] = useState("sequential");
  const [wordCount, setWordCount] = useState(allWords?.length ?? 0);
  const [direction, setDirection] = useState("translation-to-word");
  const [gameType, setGameType] = useState("cards");

  useEffect(() => {
    setWordCount((prev) => {
      const maxWords = allWords?.length ?? 0;
      return Math.min(prev || 0, maxWords);
    });
  }, [allWords]);

  useEffect(() => {
    if (typeof onSettingsChange !== "function") return;

    onSettingsChange({
      selectionMode,
      wordCount,
      direction,
      gameType,
    });
  }, [direction, gameType, onSettingsChange, selectionMode, wordCount]);

  return (
    <div className="word-selector">
      {isOpen && (
        <div id="word-selector-settings">
          <div className="compact-selects">
            {settingsTopContent}

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
              <span>თამაშის ტიპი:</span>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
              >
                <option value="anki">ანკისმაგვარი</option>
                <option value="cards">ბარათებით</option>
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
        </div>
      )}
    </div>
  );
}
