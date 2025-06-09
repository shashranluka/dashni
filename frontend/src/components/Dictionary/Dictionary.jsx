import { useState, useMemo } from "react";
import "./Dictionary.scss";
import { getShuffled } from "../../getData";

export default function Dictionary(props) {
  
  const {
    setPartOfGame, 
    cardsData,
    points,
    setPoints,
    tries,
    setTries,
  } = props;
  const [chosenWordIndex, setChosenWordIndex] = useState(0);
  const [wonWord, setWonWord] = useState([{ word: "", translation: "" }]);
  const [isFixedVisible, setIsFixedVisible] = useState(false);
  // დავამატოთ სტეიტი არასწორად არჩეული ბარათების ინდექსებისთვის
  const [wrongIndices, setWrongIndices] = useState([]);

  const topData = useMemo(() => getShuffled(cardsData), []);
  const bottomData = useMemo(() => getShuffled(cardsData), []);
  const wonWords = useMemo(() => [], []);

  function clickNextHandler() {
    setChosenWordIndex((prevIndex) => (prevIndex + 1) % topData.length);
    setTries(tries + 1);
  }
  
  function clickCardHandler(index) {
    if (topData[chosenWordIndex].word === bottomData[index].word) {
      // სწორი პასუხის შემთხვევაში
      setPoints(points + 1);
      setTries(tries + 1);
      wonWords.push(topData.splice(chosenWordIndex, 1)[0]);
      setWonWord(bottomData.splice(index, 1));
      setIsFixedVisible(true);
      
      // სწორი პასუხის შემთხვევაში გავასუფთაოთ ყველა არასწორი ინდექსი
      setWrongIndices([]);
      
      setTimeout(() => {
        setIsFixedVisible(false);
      }, 3000);
    } else {
      // არასწორი პასუხის შემთხვევაში
      setTries(tries + 1);
      
      // დავამატოთ ინდექსი არასწორების სიაში, თუ უკვე არ არის
      if (!wrongIndices.includes(index)) {
        setWrongIndices(prev => [...prev, index]);
      }
    }
  }

  return (
    <div className="dictionary">
      <div className="topSpace">
        {
          bottomData.length > 0 ? (
            <div className="topDataDiv">
              <div className="chosenWordCard">
                {topData[chosenWordIndex].translation}
              </div>
              <div className="nextButton" onClick={clickNextHandler}></div>
            </div>
          ) : (
            <div className="next_game">
              <button onClick={() => setPartOfGame(2)}>შემდეგი ეტაპი</button>
            </div>
          )
        }
      </div>
      <div className="bottomSpace">
        {bottomData.map((card, index) => (
          <div 
            key={index} 
            className={`card ${wrongIndices.includes(index) ? 'hidden-text' : ''}`} 
            onClick={() => {
              clickCardHandler(index);
            }}
          >
            <div className="cardFront">
              {card.word}
            </div>
          </div>
        ))}
      </div>
      <div className={isFixedVisible ? "fixed-won-word" : "hidden"}>
        {wonWord[0].translation} - {wonWord[0].word}
      </div>
    </div>
  )
}
