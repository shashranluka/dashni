import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { trackGameStart, trackGameComplete } from "../../utils/analytics";
import { toDisplayText } from "../../utils/georgiaNormalize";
import "./MessyDictionary.scss";

function getShuffled(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function MessyDictionary({
  words,
  direction = "translation-to-word",
  gameMode = "random",
  gameType = "cards",
  isSoundEnabled = true,
}) {
  const [points, setPoints] = useState(0);
  const [tries, setTries] = useState(0);
  const [chosenWordIndex, setChosenWordIndex] = useState(0);
  const [wonWord, setWonWord] = useState({ word: "", translation: "" });
  const [isFixedVisible, setIsFixedVisible] = useState(false);
  const [wrongIds, setWrongIds] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [learnedWords, setLearnedWords] = useState([]);
  const [needsLearningWords, setNeedsLearningWords] = useState([]);
  const [playStyle, setPlayStyle] = useState(
    gameType === "cards" ? "cards" : "typing",
  );
  const [typingAnswer, setTypingAnswer] = useState("");
  const [typingFeedback, setTypingFeedback] = useState(null);

  const [topDeck, setTopDeck] = useState([]);
  const [bottomDeck, setBottomDeck] = useState([]);

  const hideTimerRef = useRef(null);
  const successSoundRef = useRef(null);
  const errorSoundRef = useRef(null);

  const cardsData = useMemo(() => {
    if (!Array.isArray(words)) return [];
    return words
      .map((w, idx) => {
        const word = w?.the_word || w?.word || "";
        const translation = w?.translation || "";
        if (!word || !translation) return null;
        return {
          id: w?.id ?? `${word}__${translation}__${idx}`,
          word,
          translation,
        };
      })
      .filter(Boolean);
  }, [words]);

  const resetGame = useCallback(() => {
    const shuffledTop = getShuffled(cardsData);
    const shuffledBottom = getShuffled(cardsData);

    setTopDeck(shuffledTop);
    setBottomDeck(shuffledBottom);
    setPoints(0);
    setTries(0);
    setChosenWordIndex(0);
    setWonWord({ word: "", translation: "" });
    setIsFixedVisible(false);
    setWrongIds([]);
    setGameFinished(false);
    setLearnedWords([]);
    setNeedsLearningWords([]);
    setPlayStyle(gameType === "cards" ? "cards" : "typing");
    setTypingAnswer("");
    setTypingFeedback(null);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, [cardsData, gameType]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    trackGameStart(gameMode, direction);
  }, [gameMode, direction]);

  useEffect(() => {
    if (gameFinished) {
      trackGameComplete(points, tries, gameMode);
    }
  }, [gameFinished, points, tries, gameMode]);

  useEffect(() => {
    successSoundRef.current = new Audio("/sounds/success.mp3");
    successSoundRef.current.preload = "auto";

    errorSoundRef.current = new Audio("/sounds/error.mp3");
    errorSoundRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    if (isSoundEnabled) return;

    if (successSoundRef.current) {
      successSoundRef.current.pause();
      successSoundRef.current.currentTime = 0;
    }

    if (errorSoundRef.current) {
      errorSoundRef.current.pause();
      errorSoundRef.current.currentTime = 0;
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      if (successSoundRef.current) {
        successSoundRef.current.pause();
        successSoundRef.current.currentTime = 0;
      }

      if (errorSoundRef.current) {
        errorSoundRef.current.pause();
        errorSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!cardsData.length) {
    return <div className="dictionary">No words available</div>;
  }

  function showFixedWord(wordObj) {
    if (!wordObj) return;

    setWonWord(wordObj);
    setIsFixedVisible(true);
  }

  function removeWordFromDecks(wordId) {
    setTopDeck((prevTop) => {
      const nextTop = prevTop.filter((c) => c.id !== wordId);
      setChosenWordIndex((prev) =>
        nextTop.length ? prev % nextTop.length : 0,
      );
      return nextTop;
    });

    setBottomDeck((prevBottom) => {
      const nextBottom = prevBottom.filter((c) => c.id !== wordId);
      if (nextBottom.length === 0) {
        setGameFinished(true);
      }
      return nextBottom;
    });
  }

  function clickNextHandler() {
    if (!topDeck.length) return;
    setChosenWordIndex((prev) => (prev + 1) % topDeck.length);
    setTries((t) => t + 1);
    setTypingFeedback(null);
  }

  function playFeedbackSound(type) {
    if (!isSoundEnabled) return;

    const targetSoundRef = type === "success" ? successSoundRef : errorSoundRef;
    if (!targetSoundRef.current) return;

    targetSoundRef.current.currentTime = 0;
    targetSoundRef.current.play().catch(() => {});
  }

  function markLearnedWord(wordObj) {
    setLearnedWords((prev) => {
      const alreadyInNeeds = needsLearningWords.some((w) => w.id === wordObj.id);
      if (alreadyInNeeds) return prev;
      if (prev.some((w) => w.id === wordObj.id)) return prev;
      return [...prev, wordObj];
    });
  }

  function normalizeAnswer(value = "") {
    return value.toString().trim().toLowerCase();
  }

  function handleTypingSubmit(e) {
    e.preventDefault();
    if (!topDeck.length) return;

    const current = topDeck[chosenWordIndex];
    if (!current) return;

    const expected =
      direction === "translation-to-word" ? current.word : current.translation;
    const isCorrect =
      normalizeAnswer(typingAnswer) === normalizeAnswer(expected);

    setTries((t) => t + 1);

    if (isCorrect) {
      playFeedbackSound("success");
      setPoints((p) => p + 1);
      markLearnedWord(current);
      showFixedWord(current);
      removeWordFromDecks(current.id);
      setTypingAnswer("");
      setTypingFeedback({ correct: true, expected });

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsFixedVisible(false);
      }, 1800);
      return;
    }

    playFeedbackSound("error");
    setNeedsLearningWords((prev) => [...prev, current]);
    setTypingFeedback({ correct: false, expected });
  }

  function clickCardHandler(cardId) {
    if (!topDeck.length || !bottomDeck.length) return;

    const chosen = topDeck[chosenWordIndex];
    const clicked = bottomDeck.find((c) => c.id === cardId);
    if (!chosen || !clicked) return;

    if (chosen.id === clicked.id) {
      playFeedbackSound("success");
      setPoints((p) => p + 1);
      setTries((t) => t + 1);
      setWrongIds([]);
      markLearnedWord(clicked);

      const nextTop = topDeck.filter((c) => c.id !== chosen.id);
      const nextBottom = bottomDeck.filter((c) => c.id !== clicked.id);

      setTopDeck(nextTop);
      setBottomDeck(nextBottom);
      setChosenWordIndex((prev) =>
        nextTop.length ? prev % nextTop.length : 0,
      );

      showFixedWord(clicked);
      setTypingFeedback(null);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsFixedVisible(false);
        if (nextBottom.length === 0) {
          setGameFinished(true);
        }
      }, 2000);
    } else {
      playFeedbackSound("error");
      setTries((t) => t + 1);
      setWrongIds((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));

      // const nextBottom = bottomDeck.filter((c) => c.id !== cardId);
      // setBottomDeck(nextBottom);
      // chosen სიტყვა გადავიდეს სასწავლში
      setNeedsLearningWords((prev) => [...prev, chosen, clicked]);
      setTypingFeedback(null);

      // if (nextBottom.length === 0) {
      //   if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      //   hideTimerRef.current = setTimeout(() => {
      //     setGameFinished(true);
      //   }, 500);
      // }
    }
  }

  function handleRestart() {
    resetGame();
  }

  const fixedWonWordOverlay =
    isFixedVisible && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed-won-word-overlay"
            role="status"
            aria-live="assertive"
          >
            <div className="won-word-animation">
              {toDisplayText(
                direction === "translation-to-word"
                  ? `${wonWord.translation} → ${wonWord.word}`
                  : `${wonWord.word} → ${wonWord.translation}`,
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  if (gameFinished) {
    const accuracy = tries > 0 ? Math.round((points / tries) * 100) : 0;

    return (
      <>
        <div className="dictionary">
          <div className="game-finished-messy">
            <h2>თამაში დასრულდა! 🎉</h2>
            <div className="final-stats">
              <p>
                საბოლოო ქულა: <strong>{points}</strong>
              </p>
              <p>
                მცდელობა: <strong>{tries}</strong>
              </p>
              <p>
                სიზუსტე: <strong>{accuracy}%</strong>
              </p>
            </div>

            <div className="words-summary">
              <div className="learned-words">
                <h3>✓ ნასწავლი სიტყვები ({learnedWords.length})</h3>
                <ul>
                  {learnedWords.map((word) => (
                    <li key={word.id}>
                      {toDisplayText(
                        direction === "translation-to-word"
                          ? `${word.translation} → ${word.word}`
                          : `${word.word} → ${word.translation}`,
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {needsLearningWords.length > 0 && (
                <div className="needs-learning">
                  <h3>📚 სასწავლი სიტყვები ({needsLearningWords.length})</h3>
                  <ul>
                    {needsLearningWords.map((word) => (
                      <li key={word.id}>
                        {toDisplayText(
                          direction === "translation-to-word"
                            ? `${word.translation} → ${word.word}`
                            : `${word.word} → ${word.translation}`,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button onClick={handleRestart} className="restart-btn">
              თავიდან დაწყება
            </button>
          </div>
        </div>
        {fixedWonWordOverlay}
      </>
    );
  }

  return (
    <>
      <div className="dictionary">
        <div className="play-style-switch" role="group" aria-label="თამაშის რეჟიმი">
          <button
            type="button"
            className={playStyle === "cards" ? "active" : ""}
            onClick={() => {
              setPlayStyle("cards");
              setTypingFeedback(null);
            }}
          >
            ბარათები
          </button>
          <button
            type="button"
            className={playStyle === "typing" ? "active" : ""}
            onClick={() => {
              setPlayStyle("typing");
              setTypingFeedback(null);
            }}
          >
            აკრეფა
          </button>
        </div>

        <div className="game-panel">
          {playStyle === "cards" && (
            <div className="game-stats">
              <div className="stat">ქულა: {points}</div>
              <div className="stat">მცდელობა: {tries}</div>
            </div>
          )}
          {playStyle === "typing" && (
            <div className="game-stats">
              <div className="stat">ქულა: {points}</div>
              <div className="stat">მცდელობა: {tries}</div>
              <div className="stat">დარჩენილია: {topDeck.length}</div>
            </div>
          )}
          <button
            type="button"
            className="nextButton"
            onClick={clickNextHandler}
            aria-label="გამოტოვება"
          >
            <span className="next-icon"></span>
          </button>
        </div>

        <div className="topSpace">
          {topDeck.length > 0 && (
            <div className="topDataDiv">
              <div className="chosenWordCard" aria-live="polite">
                {toDisplayText(
                  direction === "translation-to-word"
                    ? topDeck[chosenWordIndex]?.translation
                    : topDeck[chosenWordIndex]?.word,
                )}
              </div>
            </div>
          )}
        </div>

        {playStyle === "typing" && (
          <div className="typing-area">
            <form onSubmit={handleTypingSubmit} className="typing-form">
              <input
                type="text"
                value={typingAnswer}
                onChange={(e) => setTypingAnswer(e.target.value)}
                placeholder={
                  direction === "translation-to-word"
                    ? "შეიყვანე უცხო სიტყვა..."
                    : "შეიყვანე თარგმანი..."
                }
                autoFocus
                className="typing-input"
              />
              <button type="submit" className="typing-submit-btn">
                შემოწმება
              </button>
            </form>

            {typingFeedback && (
              <div
                className={`typing-feedback ${typingFeedback.correct ? "correct" : "incorrect"}`}
              >
                {typingFeedback.correct ? (
                  <p>✓ სწორია</p>
                ) : (
                  <p>
                    ✗ არასწორია. სწორი პასუხი: {" "}
                    <strong>{toDisplayText(typingFeedback.expected)}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {playStyle === "cards" && (
          <div className="bottomSpace">
            {bottomDeck.map((card) => (
              <button
                type="button"
                key={card.id}
                className={`card ${wrongIds.includes(card.id) ? "hidden-text" : ""}`}
                onClick={() => clickCardHandler(card.id)}
              >
                <span className="cardFront">
                  {toDisplayText(
                    direction === "translation-to-word"
                      ? card.word
                      : card.translation,
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {fixedWonWordOverlay}
    </>
  );
}
