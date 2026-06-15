import { useMemo, useState, useEffect, useRef } from "react";
import { toDisplayText } from "../../utils/georgiaNormalize";
import AnkiLikeGame from "../AnkiLikeGame/AnkiLikeGame";
import MessyDictionary from "../messyDictionary/MessyDictionary";
import WordSelector from "../WordSelector/WordSelector";
import "./WordGamePanel.scss";

const defaultWordStatus = {
  learned_word_ids: [],
  needs_learning_word_ids: [],
  learned_words: [],
  needs_learning_words: [],
};

function getShuffled(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function WordGamePanel({
  words = [],
  wordStatus = defaultWordStatus,
  getWordSource,
  allowCompose = false,
  composeWords = [],
  isSoundEnabled: initialSoundEnabled = true,
}) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(Boolean(initialSoundEnabled));
  const [gameStarted, setGameStarted] = useState(false);
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState(null);
  const [direction, setDirection] = useState("translation-to-word");
  const [gameType, setGameType] = useState("cards");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [manualSelectedWords, setManualSelectedWords] = useState([]);
  const [selectorSettings, setSelectorSettings] = useState({
    selectionMode: "sequential",
    wordCount: 0,
    direction: "translation-to-word",
    wordFilter: "all",
  });

  const [composeCards, setComposeCards] = useState([]);
  const [composeBoardWords, setComposeBoardWords] = useState([]);
  const [usedComposeCardIds, setUsedComposeCardIds] = useState([]);
  const clearSoundRef = useRef(null);

  useEffect(() => {
    setIsSoundEnabled(Boolean(initialSoundEnabled));
  }, [initialSoundEnabled]);

  useEffect(() => {
    setManualSelectedWords([]);
    setSelectorSettings((prev) => ({
      ...prev,
      wordCount: words.length,
    }));
  }, [words]);

  useEffect(() => {
    clearSoundRef.current = new Audio("/sounds/clear.mp3");
    clearSoundRef.current.preload = "auto";

    return () => {
      if (!clearSoundRef.current) return;
      clearSoundRef.current.pause();
      clearSoundRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (isSoundEnabled || !clearSoundRef.current) return;
    clearSoundRef.current.pause();
    clearSoundRef.current.currentTime = 0;
  }, [isSoundEnabled]);

  const resolveWordSource = (word) => {
    if (typeof getWordSource === "function") {
      return getWordSource(word);
    }
    if (word?.source === "private") return "private";
    if (word?.is_private === true) return "private";
    return "public";
  };

  const learnedSourceSet = useMemo(
    () =>
      new Set(
        (wordStatus?.learned_words || []).map(
          (item) => `${item?.source || "public"}:${item?.word_id}`,
        ),
      ),
    [wordStatus?.learned_words],
  );

  const needsSourceSet = useMemo(
    () =>
      new Set(
        (wordStatus?.needs_learning_words || []).map(
          (item) => `${item?.source || "public"}:${item?.word_id}`,
        ),
      ),
    [wordStatus?.needs_learning_words],
  );

  const learnedIdSet = useMemo(
    () => new Set(wordStatus?.learned_word_ids || []),
    [wordStatus?.learned_word_ids],
  );

  const needsIdSet = useMemo(
    () => new Set(wordStatus?.needs_learning_word_ids || []),
    [wordStatus?.needs_learning_word_ids],
  );

  const filteredWords = useMemo(() => {
    const filter = selectorSettings.wordFilter;

    if (filter === "all") return words;

    return words.filter((word) => {
      const id = word?.id;
      if (id === undefined || id === null) return false;

      const source = resolveWordSource(word);
      const key = `${source}:${id}`;

      const isLearned = learnedSourceSet.size
        ? learnedSourceSet.has(key)
        : learnedIdSet.has(id);
      const isNeeds = needsSourceSet.size
        ? needsSourceSet.has(key)
        : needsIdSet.has(id);

      if (filter === "learned") return isLearned;
      if (filter === "needs") return isNeeds;
      if (filter === "new") return !isLearned && !isNeeds;

      return true;
    });
  }, [
    words,
    selectorSettings.wordFilter,
    learnedSourceSet,
    learnedIdSet,
    needsSourceSet,
    needsIdSet,
  ]);

  const selectorLearnedIds = useMemo(
    () =>
      words
        .filter((word) => {
          const id = word?.id;
          if (id === undefined || id === null) return false;
          const source = resolveWordSource(word);
          const key = `${source}:${id}`;
          return learnedSourceSet.size ? learnedSourceSet.has(key) : learnedIdSet.has(id);
        })
        .map((word) => word.id),
    [words, learnedSourceSet, learnedIdSet],
  );

  const selectorNeedsIds = useMemo(
    () =>
      words
        .filter((word) => {
          const id = word?.id;
          if (id === undefined || id === null) return false;
          const source = resolveWordSource(word);
          const key = `${source}:${id}`;
          return needsSourceSet.size ? needsSourceSet.has(key) : needsIdSet.has(id);
        })
        .map((word) => word.id),
    [words, needsSourceSet, needsIdSet],
  );

  const getWordsBySelectionMode = () => {
    const { selectionMode, wordCount } = selectorSettings;

    if (selectionMode === "manual") return manualSelectedWords;

    if (selectionMode === "random") {
      return getShuffled(filteredWords).slice(
        0,
        Math.min(wordCount, filteredWords.length),
      );
    }

    return filteredWords.slice(0, Math.min(wordCount, filteredWords.length));
  };

  const startGameWithType = (nextGameType) => {
    const pickedWords = getWordsBySelectionMode();
    if (!pickedWords.length) return;

    const wordsWithSource = pickedWords.map((word) => ({
      ...word,
      source: resolveWordSource(word),
    }));

    setSelectedWords(wordsWithSource);
    setDirection(selectorSettings.direction);
    setGameType(nextGameType);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setIsSettingsOpen(false);
    setGameStarted(true);
  };

  const handleComposeMode = () => {
    if (!allowCompose || !composeWords.length) return;

    const cards = composeWords.map((word, index) => ({
      id: `${index}-${word}`,
      text: word,
    }));

    setComposeCards(getShuffled(cards));
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setSelectedWords(null);
    setIsSettingsOpen(false);
    setGameStarted(false);
    setIsComposeMode(true);
  };

  const handleComposeCardClick = (card) => {
    if (!card || usedComposeCardIds.includes(card.id)) return;

    setComposeBoardWords((prev) => [...prev, card.text]);
    setUsedComposeCardIds((prev) => [...prev, card.id]);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  const playClearSound = () => {
    if (!isSoundEnabled || !clearSoundRef.current) return;

    clearSoundRef.current.currentTime = 0;
    clearSoundRef.current.play().catch(() => {});
  };

  const handleComposeClearBoard = () => {
    if (!composeBoardWords.length) return;

    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    playClearSound();
  };

  const handleManualWordToggle = (word) => {
    const wordId = word?.the_word || word?.word;
    if (!wordId) return;

    setManualSelectedWords((prev) => {
      const exists = prev.some((item) => (item?.the_word || item?.word) === wordId);
      if (exists) {
        return prev.filter((item) => (item?.the_word || item?.word) !== wordId);
      }
      return [...prev, word];
    });
  };

  const isStartDisabled =
    filteredWords.length === 0 ||
    (selectorSettings.selectionMode === "manual" && manualSelectedWords.length === 0);

  return (
    <>
      <div className="listen-action-buttons">
        <button
          type="button"
          className={`settings-toggle-btn${isSettingsOpen ? " is-open" : ""}`}
          onClick={() => {
            setIsSettingsOpen((prev) => {
              const next = !prev;
              if (next) {
                setIsComposeMode(false);
                setGameStarted(false);
              }
              return next;
            });
          }}
          aria-expanded={isSettingsOpen}
          aria-controls="word-selector-settings"
        >
          პარამეტრები
        </button>

        <button
          type="button"
          className="start-anki-btn"
          onClick={() => startGameWithType("anki")}
          disabled={isStartDisabled}
        >
          დახარისხება
        </button>

        <button
          type="button"
          className="start-game-btn"
          onClick={() => startGameWithType("cards")}
          disabled={isStartDisabled}
        >
          თამაში
        </button>

        {allowCompose ? (
          <button
            type="button"
            className="compose-text-btn"
            onClick={handleComposeMode}
            disabled={!composeWords.length}
          >
            შედგენა
          </button>
        ) : null}

        <button
          type="button"
          className={`sound-toggle-btn${isSoundEnabled ? "" : " muted"}`}
          onClick={handleToggleSound}
          aria-label={isSoundEnabled ? "ხმის გამორთვა" : "ხმის ჩართვა"}
          title={isSoundEnabled ? "ხმის გამორთვა" : "ხმის ჩართვა"}
        >
          <span aria-hidden="true">{isSoundEnabled ? "🔊" : "🔇"}</span>
        </button>
      </div>

      {!isComposeMode && !gameStarted ? (
        <WordSelector
          savedLearnedIds={selectorLearnedIds}
          savedNeedsIds={selectorNeedsIds}
          allWordCount={words.length}
          allWords={words}
          onSettingsChange={setSelectorSettings}
          isOpen={isSettingsOpen}
        />
      ) : null}

      {!isComposeMode &&
      !gameStarted &&
      selectorSettings.selectionMode === "manual" ? (
        <div className="listen-word-cards">
          <p>აირჩიეთ სიტყვები ({manualSelectedWords.length} არჩეული):</p>
          <div className="cards-grid">
            {filteredWords.map((word, index) => {
              const wordId = word.the_word || word.word;
              const isSelected = manualSelectedWords.some(
                (item) => (item?.the_word || item?.word) === wordId,
              );
              const displayText = toDisplayText(
                selectorSettings.direction === "translation-to-word"
                  ? word.translation
                  : word.the_word || word.word,
              );

              return (
                <div
                  key={index}
                  className={`word-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleManualWordToggle(word)}
                >
                  <div className="word">{displayText}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {isComposeMode ? (
        <div className="game-section compose-section">
          <div className="compose-board">
            <div className="compose-board-header">
              <div className="compose-board-label">ტექსტის დაფა</div>
              <button
                type="button"
                className="compose-clear-btn"
                onClick={handleComposeClearBoard}
                disabled={!composeBoardWords.length}
              >
                გასუფთავება
              </button>
            </div>
            <div className="compose-board-content">
              {composeBoardWords.length
                ? toDisplayText(composeBoardWords.join(" "))
                : "ტექსტის ასაწყობად დააწკაპუნე ქვემოთ მოცემულ ბარათებზე"}
            </div>
          </div>

          {composeCards.length ? (
            <div className="compose-cards-grid">
              {composeCards.map((card) => (
                <div
                  key={card.id}
                  className={`compose-word-card ${usedComposeCardIds.includes(card.id) ? "used" : ""}`}
                  onClick={() => handleComposeCardClick(card)}
                  role="button"
                  tabIndex={0}
                  aria-label={toDisplayText(card.text)}
                >
                  {toDisplayText(card.text)}
                </div>
              ))}
            </div>
          ) : (
            <div className="compose-empty">ამ რეჟიმისთვის სიტყვები ვერ მოიძებნა.</div>
          )}
        </div>
      ) : null}

      {!isComposeMode && gameStarted ? (
        <div className="game-section">
          {gameType === "anki" ? (
            <AnkiLikeGame words={selectedWords} direction={direction} />
          ) : (
            <MessyDictionary
              words={selectedWords}
              direction={direction}
              gameType={gameType}
              isSoundEnabled={isSoundEnabled}
            />
          )}
        </div>
      ) : null}
    </>
  );
}
