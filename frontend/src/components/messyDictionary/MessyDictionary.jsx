import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackGameStart, trackGameComplete } from "../../utils/analytics";
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
  const [isRevealed, setIsRevealed] = useState(false);

  const [topDeck, setTopDeck] = useState([]);
  const [bottomDeck, setBottomDeck] = useState([]);

  const hideTimerRef = useRef(null);

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
    setIsRevealed(false);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, [cardsData]);

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
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
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
      setChosenWordIndex((prev) => (nextTop.length ? prev % nextTop.length : 0));
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
  }

  function handleRevealClick() {
    if (!topDeck.length) return;
    const current = topDeck[chosenWordIndex];
    showFixedWord(current);
    setIsRevealed(true);
  }

  function handleLearned() {
    if (!wonWord.word) return;
    setLearnedWords((prev) => [...prev, wonWord]);

    // setLearnedWords((prev) => {
    //   const alreadyInNeeds = needsLearningWords.some((w) => w.id === wonWord.id);
    //   if (alreadyInNeeds) return prev;
    //   if (prev.some((w) => w.id === wonWord.id)) return prev;
    //   return [...prev, wonWord];
    // });

    removeWordFromDecks(wonWord.id);
    setIsFixedVisible(false);
    setIsRevealed(false);
  }

  function handleNeedsLearning() {
    if (!wonWord.word) return;
    setNeedsLearningWords((prev) => [...prev, wonWord]);
    removeWordFromDecks(wonWord.id);
    setIsFixedVisible(false);
    setIsRevealed(false);
  }

  function clickCardHandler(cardId) {
    if (!topDeck.length || !bottomDeck.length) return;

    const chosen = topDeck[chosenWordIndex];
    const clicked = bottomDeck.find((c) => c.id === cardId);
    if (!chosen || !clicked) return;

    if (chosen.id === clicked.id) {
      setPoints((p) => p + 1);
      setTries((t) => t + 1);
      setWrongIds([]);

      setLearnedWords((prev) => {
        const alreadyInNeeds = needsLearningWords.some((w) => w.id === clicked.id);
        if (alreadyInNeeds) return prev;
        if (prev.some((w) => w.id === clicked.id)) return prev;
        return [...prev, clicked];
      });

      const nextTop = topDeck.filter((c) => c.id !== chosen.id);
      const nextBottom = bottomDeck.filter((c) => c.id !== clicked.id);

      setTopDeck(nextTop);
      setBottomDeck(nextBottom);
      setChosenWordIndex((prev) => (nextTop.length ? prev % nextTop.length : 0));

      showFixedWord(clicked);
      setIsRevealed(false);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsFixedVisible(false);
        if (nextBottom.length === 0) {
          setGameFinished(true);
        }
      }, 2000);
    } else {
      setTries((t) => t + 1);
      setWrongIds((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));

      // const nextBottom = bottomDeck.filter((c) => c.id !== cardId);
      // setBottomDeck(nextBottom);
      // chosen სიტყვა გადავიდეს სასწავლში
      setNeedsLearningWords((prev) => [...prev, chosen, clicked]);

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

  if (gameFinished) {
    const accuracy = tries > 0 ? Math.round((points / tries) * 100) : 0;

    return (
      <div className="dictionary">
        <div className="game-finished-messy">
          <h2>თამაში დასრულდა! 🎉</h2>
          <div className="final-stats">
            <p>საბოლოო ქულა: <strong>{points}</strong></p>
            <p>მცდელობა: <strong>{tries}</strong></p>
            <p>სიზუსტე: <strong>{accuracy}%</strong></p>
          </div>

          <div className="words-summary">
            <div className="learned-words">
              <h3>✓ ნასწავლი სიტყვები ({learnedWords.length})</h3>
              <ul>
                {learnedWords.map((word) => (
                  <li key={word.id}>
                    {direction === "translation-to-word"
                      ? `${word.translation} → ${word.word}`
                      : `${word.word} → ${word.translation}`}
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
                      {direction === "translation-to-word"
                        ? `${word.translation} → ${word.word}`
                        : `${word.word} → ${word.translation}`}
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
    );
  }

  return (
    <div className="dictionary">
      <div className="game-panel">
        {gameType === "cards" && (
          <div className="game-stats">
            <div className="stat">ქულა: {points}</div>
            <div className="stat">მცდელობა: {tries}</div>
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
              {direction === "translation-to-word"
                ? topDeck[chosenWordIndex]?.translation
                : topDeck[chosenWordIndex]?.word}
            </div>
          </div>
        )}
      </div>
      {gameType === "anki" && (
        <div className="anki-controls">
          <button
            type="button"
            className="revealButton"
            onClick={handleRevealClick}
            disabled={!topDeck.length}
          >
            გამოჩენა
          </button>
          <div className="anki-remaining">დარჩენილია: {topDeck.length}</div>
        </div>
      )}
      {gameType === "cards" && (
        <div className="bottomSpace">
          {bottomDeck.map((card) => (
            <button
              type="button"
              key={card.id}
              className={`card ${wrongIds.includes(card.id) ? "hidden-text" : ""}`}
              onClick={() => clickCardHandler(card.id)}
            >
              <span className="cardFront">
                {direction === "translation-to-word" ? card.word : card.translation}
              </span>
            </button>
          ))}
        </div>
      )}

      {isFixedVisible && (
        <div className="fixed-won-word" role="status" aria-live="assertive">
          <div className="won-word-animation">
            {/* ✓ სწორია!{" "} */}
            {direction === "translation-to-word"
              ? `${wonWord.translation} → ${wonWord.word}`
              : `${wonWord.word} → ${wonWord.translation}`}
          </div>

          {isRevealed && (
            <div className="word-buttons">
              <button
                className="btn-learned"
                onClick={handleLearned}
              >
                ნასწავლი
              </button>
              <button
                className="btn-needs-learning"
                onClick={handleNeedsLearning}
              >
                სასწავლი
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}