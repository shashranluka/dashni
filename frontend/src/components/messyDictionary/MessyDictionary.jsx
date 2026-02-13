import { useState, useMemo, useEffect } from "react";
import { trackGameStart, trackGameComplete } from "../../utils/analytics";
import "./MessyDictionary.scss";

// შერევის ფუნქცია თავად კომპონენტში
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
  gameMode = "random" // ← default value props-ში
}) {
  const [points, setPoints] = useState(0);
  const [tries, setTries] = useState(0);
  const [chosenWordIndex, setChosenWordIndex] = useState(0);
  const [wonWord, setWonWord] = useState({ word: "", translation: "" });
  const [isFixedVisible, setIsFixedVisible] = useState(false);
  const [wrongIndices, setWrongIndices] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);

  // Game start tracking - gameMode props-დან
  useEffect(() => {
    trackGameStart(gameMode, direction);
  }, []); // ← dependency array ცარიელია რადგან props mount-ზე არ იცვლება

  // Game complete tracking - gameMode props-დან
  useEffect(() => {
    if (gameFinished) {
      trackGameComplete(points, tries, gameMode);
    }
  }, [gameFinished, points, tries]); // ← gameMode dependency-ში არ ჭირდება

  if (!words || words.length === 0) {
    return <div className="messyDictionary">No words available</div>;
  }

  // words მასივიდან შევქმნათ cardsData ფორმატი
  const cardsData = words.map(w => ({
    word: w.the_word || w.word,
    translation: w.translation
  }));

  const topData = useMemo(() => getShuffled(cardsData), []);
  const bottomData = useMemo(() => getShuffled(cardsData), []);

  function clickNextHandler() {
    if (topData.length > 0) {
      setChosenWordIndex((prevIndex) => (prevIndex + 1) % topData.length);
      setTries(tries + 1);
    }
  }

  function handleRestart() {
    window.location.reload();
  }

  function clickCardHandler(index) {
    if (topData[chosenWordIndex].word === bottomData[index].word) {
      setPoints(points + 1);
      setTries(tries + 1);
      topData.splice(chosenWordIndex, 1);
      const removed = bottomData.splice(index, 1)[0];
      setWonWord(removed);
      setIsFixedVisible(true);
      setWrongIndices([]);

      setTimeout(() => {
        setIsFixedVisible(false);
        if (bottomData.length === 0) {
          setGameFinished(true);
        }
      }, 1000);
    } else {
      setTries(tries + 1);
      if (!wrongIndices.includes(index)) {
        setWrongIndices(prev => [...prev, index]);
      }
    }
  }

  if (gameFinished) {
    return (
      <div className="messyDictionary">
        <div className="game-finished-messy">
          <h2>თამაში დასრულდა! 🎉</h2>
          <div className="final-stats">
            <p>საბოლოო ქულა: <strong>{points}</strong></p>
            <p>ცდები: <strong>{tries}</strong></p>
            <p>სიზუსტე: <strong>{Math.round((points / tries) * 100)}%</strong></p>
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
      <div className="game-stats">
        <div className="stat">ქულა: {points}</div>
        <div className="stat">ცდები: {tries}</div>
      </div>
      
      <div className="topSpace">
        {bottomData.length > 0 && topData.length > 0 && (
          <div className="topDataDiv">
            <div className="chosenWordCard">
              {direction === "translation-to-word" 
                ? topData[chosenWordIndex]?.translation 
                : topData[chosenWordIndex]?.word}
            </div>
            <button className="nextButton" onClick={clickNextHandler}>
              გამოტოვება →
            </button>
          </div>
        )}
      </div>
      
      <div className="bottomSpace">
        {bottomData.map((card, index) => (
          <div
            key={index}
            className={`card ${wrongIndices.includes(index) ? 'hidden-text' : ''}`}
            onClick={() => clickCardHandler(index)}
          >
            <div className="cardFront">
              {direction === "translation-to-word" ? card.word : card.translation}
            </div>
          </div>
        ))}
      </div>
      
      {isFixedVisible && (
        <div className="fixed-won-word">
          <div className="won-word-animation">
            ✓ სწორია! {direction === "translation-to-word" ? wonWord.word : wonWord.translation}
          </div>
        </div>
      )}
    </div>
  );
}