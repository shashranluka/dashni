import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import newRequest from "../../utils/newRequest";
import { toDisplayText } from "../../utils/georgiaNormalize";
import AnkiLikeGame from "../../components/AnkiLikeGame/AnkiLikeGame";
import MessyDictionary from "../../components/messyDictionary/MessyDictionary";
import WordSelector from "../../components/WordSelector/WordSelector";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import EpisodePicker from "../../components/EpisodePicker/EpisodePicker";
import "./AudioToWordGame.scss";

function AudioToWordGame() {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWords, setSelectedWords] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isComposeMode, setIsComposeMode] = useState(false);
  const [composeCards, setComposeCards] = useState([]);
  const [composeBoardWords, setComposeBoardWords] = useState([]);
  const [usedComposeCardIds, setUsedComposeCardIds] = useState([]);
  const [direction, setDirection] = useState("translation-to-word");
  const [gameType, setGameType] = useState("cards");
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [seekTrigger, setSeekTrigger] = useState(0);
  const [manualSelectedWords, setManualSelectedWords] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [savedLearnedIds, setSavedLearnedIds] = useState([]);
  const [savedNeedsIds, setSavedNeedsIds] = useState([]);
  const [selectorSettings, setSelectorSettings] = useState({
    selectionMode: "sequential",
    wordCount: 0,
    direction: "translation-to-word",
    wordFilter: "all",
  });

  const hasFetchedAudio = useRef(false);
  const hasFetchedResults = useRef(false);
  const audiofilePath = useRef(
    "src/assets/audio_files/adas_mier_moyolili_zghapari.m4a",
  );
  const clearSoundRef = useRef(null);

  useEffect(() => {
    const fetchAudioData = async () => {
      if (hasFetchedAudio.current) return;
      hasFetchedAudio.current = true;

      try {
        const response = await newRequest.get("/audio");
        setGameData(response.data);

        // თავიდან ავტომატურად აირჩიოს პირველი სეგმენტი
        const firstSegment = response?.data?.segments?.[0] ?? null;
        setSelectedSegment(firstSegment);

        console.log("Fetched audio data:", response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAudioData();
  }, []);

  useEffect(() => {
    if (hasFetchedResults.current) return;
    hasFetchedResults.current = true;

    const fetchSavedWordStatus = async () => {
      try {
        const response = await newRequest.get("/results/word-status");
        setSavedLearnedIds(response?.data?.learned_word_ids || []);
        setSavedNeedsIds(response?.data?.needs_learning_word_ids || []);
      } catch {
        // not logged in or endpoint unavailable — ignore
      }
    };

    fetchSavedWordStatus();
  }, []);

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

  const getShuffledWords = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getWordsBySelectionMode = () => {
    let words = [];

    const { selectionMode, wordCount, wordFilter } = selectorSettings;

    const baseWords = (() => {
      if (wordFilter === "learned") {
        return wordsForGame.filter((w) => savedLearnedIds.includes(w.id));
      }
      if (wordFilter === "needs") {
        return wordsForGame.filter((w) => savedNeedsIds.includes(w.id));
      }
      return wordsForGame;
    })();

    if (selectionMode === "sequential") {
      words = baseWords.slice(
        0,
        Math.min(wordCount, baseWords.length),
      );
    } else if (selectionMode === "random") {
      const shuffled = [...baseWords].sort(() => Math.random() - 0.5);
      words = shuffled.slice(
        0,
        Math.min(wordCount, baseWords.length),
      );
    } else if (selectionMode === "manual") {
      words = manualSelectedWords;
    }

    return words;
  };

  const startGameWithType = (nextGameType) => {
    const words = getWordsBySelectionMode();

    if (!words.length) return;

    setSelectedWords(words);
    setDirection(selectorSettings.direction);
    setGameType(nextGameType);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setIsSettingsOpen(false);
    setGameStarted(true);
  };

  const handleStartCardsGame = () => {
    startGameWithType("cards");
  };

  const handleStartAnkiGame = () => {
    startGameWithType("anki");
  };

  const handleSettingsChange = useCallback((nextSettings) => {
    setSelectorSettings(nextSettings);
  }, []);

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev) => {
      const nextIsOpen = !prev;

      if (nextIsOpen) {
        setIsComposeMode(false);
        setGameStarted(false);
      }

      return nextIsOpen;
    });
  };

  const handleManualWordToggle = (word) => {
    const wordId = word?.the_word || word?.word;
    if (!wordId) return;

    setManualSelectedWords((prev) => {
      const isSelected = prev.some((w) => (w.the_word || w.word) === wordId);
      if (isSelected) {
        return prev.filter((w) => (w.the_word || w.word) !== wordId);
      }
      return [...prev, word];
    });
  };

  const normalizeWord = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .replace(/[.,!?;:"()\-_/\\[\]{}…]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const wordsForGame = useMemo(() => {
    if (!selectedSegment?.text || !Array.isArray(gameData?.words)) {
      return [];
    }

    const segmentWordSet = new Set(
      normalizeWord(selectedSegment.text).split(" ").filter(Boolean),
    );

    return gameData.words.filter((wordObj) => {
      const candidateWords = [
        wordObj?.the_word,
        wordObj?.word,
        wordObj?.lemma,
        wordObj?.base_word,
      ]
        .map(normalizeWord)
        .filter(Boolean);

      return candidateWords.some((w) => segmentWordSet.has(w));
    });
  }, [selectedSegment?.text, gameData?.words]);

  const wordsForCompose = useMemo(() => {
    if (!selectedSegment?.text) {
      return [];
    }

    return selectedSegment.text
      .split(/\s+/)
      .map((word) =>
        word
          .trim()
          .replace(/^[.,!?;:"()\-_/\\[\]{}…]+|[.,!?;:"()\-_/\\[\]{}…]+$/g, ""),
      )
      .filter(Boolean);
  }, [selectedSegment?.text]);

  const handleComposeMode = () => {
    if (!wordsForCompose.length) return;
    const composeWordsWithIds = wordsForCompose.map((word, index) => ({
      id: `${index}-${word}`,
      text: word,
    }));

    setComposeCards(getShuffledWords(composeWordsWithIds));
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
    clearSoundRef.current.play().catch(() => { });
  };

  const handleComposeClearBoard = () => {
    if (!composeBoardWords.length) return;

    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    playClearSound();
  };

  useEffect(() => {
    setManualSelectedWords([]);
  }, [wordsForGame]);

  console.log("Selected segment:", selectedSegment);
  console.log("Words for game:", wordsForGame);

  const { wordFilter } = selectorSettings;
  const filteredWordsForGame = (() => {
    if (wordFilter === "learned") return wordsForGame.filter((w) => savedLearnedIds.includes(w.id));
    if (wordFilter === "needs") return wordsForGame.filter((w) => savedNeedsIds.includes(w.id));
    return wordsForGame;
  })();

  const isStartDisabled =
    filteredWordsForGame.length === 0 ||
    (selectorSettings.selectionMode === "manual" &&
      manualSelectedWords.length === 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="listen-page">
      <h1>ადას მიერ მოყოლილი ზღაპარი</h1>
      {/* {gameData && gameData.audioData && gameData.audioData[0] && ( */}
      <div className="audio-section">
        <AudioPlayer
          src={audiofilePath.current}
          segments={gameData?.segments || []}
          startTime={selectedSegment?.time}
          seekTrigger={seekTrigger}
        />
      </div>
      {/* // )} */}
      {gameData && gameData.words && (
        <>
          <EpisodePicker
            episodes={gameData?.segments || []}
            activeEpisodeId={selectedSegment?.id ?? null}
            setSelectedEpisode={setSelectedSegment}
            setSeekTrigger={setSeekTrigger}
          />

          {!selectedSegment ? (
            <div className="segment-hint">
              აირჩიე ეპიზოდი ზემოთ მოცემული ღილაკებიდან სათამაშოდ სიტყვების
              ასარჩევად
            </div>
          ) : null}

          <div className="listen-action-buttons">
            <button
              type="button"
              className={`settings-toggle-btn${isSettingsOpen ? " is-open" : ""}`}
              onClick={handleSettingsToggle}
              aria-expanded={isSettingsOpen}
              aria-controls="word-selector-settings"
            >
              პარამეტრები
            </button>

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
          {!isComposeMode && !gameStarted && (
            <WordSelector
              savedLearnedIds={savedLearnedIds}
              savedNeedsIds={savedNeedsIds}
              allWordCount={wordsForGame.length}
              allWords={wordsForGame}
              onSettingsChange={handleSettingsChange}
              isOpen={isSettingsOpen}
            />
          )}
          <h2 className="segment-info-title">
            ეპიზოდი {selectedSegment?.id ?? "-"} - სიტყვების რაოდენობა:{" "}
            {wordsForGame.length}
          </h2>

          {!isComposeMode && !gameStarted && (
            <div className="listen-mode-buttons" style={{ display: "flex", flexDirection: "column", gap: "0.7rem", alignItems: "stretch", maxWidth: 220, margin: "0 auto 1.5rem auto" }}>
              <button
                type="button"
                className="start-anki-btn"
                onClick={handleStartAnkiGame}
                disabled={isStartDisabled}
                style={{ width: "100%" }}
              >
                დახარისხება
              </button>
              <button
                type="button"
                className="start-game-btn"
                onClick={handleStartCardsGame}
                disabled={isStartDisabled}
                style={{ width: "100%" }}
              >
                თამაში
              </button>
              <button
                type="button"
                className="compose-text-btn"
                onClick={handleComposeMode}
                disabled={!wordsForCompose.length}
                style={{ width: "100%" }}
              >
                შედგენა
              </button>
            </div>
          )}

          {!isComposeMode &&
            !gameStarted &&
            selectorSettings.selectionMode === "manual" && (
              <div className="listen-word-cards">
                <p>აირჩიეთ სიტყვები ({manualSelectedWords.length} არჩეული):</p>
                <div className="cards-grid">
                  {wordsForGame.map((word, index) => {
                    const wordId = word.the_word || word.word;
                    const isSelected = manualSelectedWords.some(
                      (w) => (w.the_word || w.word) === wordId,
                    );
                    const displayText = toDisplayText(
                      selectorSettings.direction === "translation-to-word"
                        ? word.translation
                        : word.the_word,
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
            )}

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
                  {composeBoardWords.length > 0
                    ? toDisplayText(composeBoardWords.join(" "))
                    : "ტექსტის ასაწყობად დააწკაპუნე ქვემოთ მოცემულ ბარათებზე"}
                </div>
              </div>

              {composeCards.length > 0 ? (
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
                <div className="compose-empty">
                  ამ ეპიზოდისთვის სიტყვები ვერ მოიძებნა.
                </div>
              )}
            </div>
          ) : gameStarted ? (
            <div className="game-section">
              {gameType === "anki" ? (
                <AnkiLikeGame
                  words={selectedWords}
                  direction={direction}
                />
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
      )}
    </div>
  );
}

export default AudioToWordGame;
