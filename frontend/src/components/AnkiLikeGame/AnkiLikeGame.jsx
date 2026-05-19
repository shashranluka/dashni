import { useState, useEffect, useRef } from "react";
import { toDisplayText } from "../../utils/georgiaNormalize";
import newRequest from "../../utils/newRequest";
import "./AnkiLikeGame.scss";

function AnkiLikeGame({ words, direction = "translation-to-word" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandom, setIsRandom] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const [learnedWords, setLearnedWords] = useState([]);
  const [needsLearningWords, setNeedsLearningWords] = useState([]);
  const [isRevealVisible, setIsRevealVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (words && words.length > 0) {
      setDisplayWords([...words]);
      setCurrentIndex(0);
      setIsGameFinished(false);
      setLearnedWords([]);
      setNeedsLearningWords([]);
      setIsRevealVisible(false);
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [words]);

  // Load initial learned/needs data from server on component mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const loadInitialData = async () => {
      try {
        const response = await newRequest.get("/results/word-status");
        if (response?.data?.learned_word_ids && response?.data?.needs_learning_word_ids) {
          // Load the learned/needs words based on IDs if needed
          // For now, we'll just fetch them to verify the endpoint works
          console.log("Loaded word status:", response.data);
        }
      } catch (err) {
        // Silently fail if not logged in or endpoint doesn't exist
        console.log("Could not load initial word status");
      }
    };

    loadInitialData();
  }, []);

  const handleSaveResults = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const learnedIds = learnedWords
        .map((w) => w?.id ?? w?.word_id)
        .filter((id) => id !== undefined && id !== null);
      console.log("Learned word IDs to save:", learnedIds);
      const needsIds = needsLearningWords
        .map((w) => w?.id ?? w?.word_id)
        .filter((id) => id !== undefined && id !== null);
      console.log("Needs learning word IDs to save:", needsIds);
      if (learnedIds.length + needsIds.length === 0) {
        setSaveError("შენახვა ვერ მოხერხდა: სიტყვების id არ მოიძებნა");
        return;
      }

      await newRequest.post("/results/word-status", {
        learned_word_ids: learnedIds,
        needs_learning_word_ids: needsIds,
      });
      console.log("Word status saved successfully");

      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err?.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!words || words.length === 0) {
    return <div className="anki-like-game">No words available</div>;
  }

  const currentWord = displayWords[currentIndex] || words[0];

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleToggleRandom = () => {
    const newIsRandom = !isRandom;
    setIsRandom(newIsRandom);

    if (newIsRandom) {
      setDisplayWords(shuffleArray(words));
    } else {
      setDisplayWords([...words]);
    }

    setCurrentIndex(0);
    setIsGameFinished(false);
    setLearnedWords([]);
    setNeedsLearningWords([]);
    setIsRevealVisible(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const addUniqueWord = (setter, wordObj) => {
    setter((prev) => {
      const key = (item) => `${item?.id ?? item?.word_id ?? ""}__${item?.the_word || item?.word || ""}__${item?.translation || ""}`;
      const targetKey = key(wordObj);
      if (prev.some((item) => key(item) === targetKey)) {
        return prev;
      }
      return [...prev, wordObj];
    });
  };

  const goToNextWord = () => {
    if (currentIndex < displayWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealVisible(false);
      return;
    }

    setIsGameFinished(true);
    setIsRevealVisible(false);
  };

  const handleNeedsLearning = () => {
    addUniqueWord(setNeedsLearningWords, currentWord);
    goToNextWord();
  };

  const handleLearned = () => {
    addUniqueWord(setLearnedWords, currentWord);
    goToNextWord();
  };

  const handleRestart = () => {
    if (isRandom) {
      setDisplayWords(shuffleArray(words));
    }
    setCurrentIndex(0);
    setIsGameFinished(false);
    setLearnedWords([]);
    setNeedsLearningWords([]);
    setIsRevealVisible(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const isTranslationToWord = direction === "translation-to-word";
  const currentPromptText = isTranslationToWord
    ? currentWord.translation
    : currentWord.the_word || currentWord.word || "";
  const revealText = isTranslationToWord
    ? currentWord.the_word || currentWord.word || ""
    : currentWord.translation || "";
  const revealButtonLabel = isTranslationToWord
    ? "სიტყვის ჩვენება"
    : "თარგმანის ჩვენება";

  const formatPair = (wordObj) => {
    const wordText = wordObj?.the_word || wordObj?.word || "";
    const translationText = wordObj?.translation || "";
    return isTranslationToWord
      ? `${translationText} → ${wordText}`
      : `${wordText} → ${translationText}`;
  };

  return (
    <div className="anki-like-game">
      <div className="game-header">
        <h2>სიტყვების გამოცნობა</h2>
        <div className="mode-toggle">
          <div className="toggle-container">
            <span className={`toggle-label ${!isRandom ? "active" : ""}`}>
              📋 მიმდევრობით
            </span>
            <div className="toggle-switch" onClick={handleToggleRandom}>
              <div
                className={`toggle-slider ${isRandom ? "random" : "sequential"}`}
              ></div>
            </div>
            <span className={`toggle-label ${isRandom ? "active" : ""}`}>
              🔀 შემთხვევითი
            </span>
          </div>
        </div>
        <div className="progress">
          სიტყვა {currentIndex + 1} / {displayWords.length || words.length}
        </div>
      </div>

      <div className="game-content">
        <div className="word-display">
          <h3>{isTranslationToWord ? "თარგმნე სიტყვა:" : "მიუთითე თარგმანი:"}</h3>
          <p className="word">{toDisplayText(currentPromptText)}</p>
          {!isGameFinished && (
            <>
              {!isRevealVisible && (
                <button
                  type="button"
                  className="reveal-btn"
                  onClick={() => setIsRevealVisible(true)}
                >
                  {revealButtonLabel}
                </button>
              )}
              {isRevealVisible && (
                <p className="revealed-word">{toDisplayText(revealText)}</p>
              )}
            </>
          )}
          {/* {currentWord.file_path && (
            <audio controls src={currentWord.file_path} className="word-audio">
              Your browser does not support the audio element.
            </audio>
          )} */}
        </div>

        {isGameFinished ? (
          <div className="result correct">
            <div className="game-finished">
              <h3>თამაში დასრულდა!</h3>

              {isSaving && (
                <p className="saving-status">💾 ინახება...</p>
              )}
              {saveError && (
                <p className="save-error">⚠️ შენახვა ვერ მოხერხდა: {saveError}</p>
              )}
              {saveSuccess && !isSaving && !saveError && (
                <p className="save-success">✓ შენახულია</p>
              )}

              <div className="words-summary">
                <div className="learned-words">
                  <h4>ნასწავლი სიტყვები ({learnedWords.length})</h4>
                  <ul>
                    {learnedWords.map((word, index) => (
                      <li key={`learned-${index}`}>
                        {toDisplayText(formatPair(word))}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="needs-learning-words">
                  <h4>სასწავლი სიტყვები ({needsLearningWords.length})</h4>
                  <ul>
                    {needsLearningWords.map((word, index) => (
                      <li key={`needs-${index}`}>
                        {toDisplayText(formatPair(word))}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button onClick={handleRestart} className="restart-btn">
                თავიდან დაწყება
              </button>
              <button
                type="button"
                onClick={handleSaveResults}
                className="restart-btn"
                disabled={
                  isSaving || learnedWords.length + needsLearningWords.length === 0
                }
              >
                {isSaving ? "ინახება..." : "შენახვა"}
              </button>
            </div>
          </div>
        ) : (
          <div className="result correct">
            <button onClick={handleNeedsLearning} className="next-btn">
              სასწავლი
            </button>
            <button onClick={handleLearned} className="next-btn">
              ნასწავლი
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnkiLikeGame;
