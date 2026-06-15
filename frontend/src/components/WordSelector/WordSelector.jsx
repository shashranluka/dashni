import { useEffect, useState } from "react";
import { arrangeWords } from "../../utils/arrange";
import "./WordSelector.scss";

export default function WordSelector({
  allWords,
  savedLearnedIds = [],
  savedNeedsIds = [],
  allWordCount,
  onSettingsChange,
  settingsTopContent = null,
  isOpen = false,
  onToggle,
}) {
  const [selectionMode, setSelectionMode] = useState("sequential");
  const [wordCount, setWordCount] = useState(allWords?.length ?? 0);
  const [direction, setDirection] = useState("translation-to-word");
  const [wordFilter, setWordFilter] = useState("all");

  const arranged = arrangeWords(allWords || [], savedLearnedIds, savedNeedsIds);
  const learnedCount = arranged.learned.length;
  const needsCount = arranged.needs.length;
  const newCount = arranged.fresh.length;

  useEffect(() => {
    setWordCount(allWords?.length ?? 0);
  }, [allWords]);

  useEffect(() => {
    if (typeof onSettingsChange !== "function") return;

    onSettingsChange({
      selectionMode,
      wordCount,
      direction,
      wordFilter,
    });
  }, [direction, onSettingsChange, selectionMode, wordCount, wordFilter]);

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
              <span>სიტყვების ფილტრი:</span>
              <select
                value={wordFilter}
                onChange={(e) => setWordFilter(e.target.value)}
              >
                <option value="all">ყველა ({allWordCount ?? allWords?.length ?? 0})</option>
                <option value="needs">სასწავლი ({needsCount})</option>
                <option value="learned">ნასწავლი ({learnedCount})</option>
                <option value="new">ახალი ({newCount})</option>
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
