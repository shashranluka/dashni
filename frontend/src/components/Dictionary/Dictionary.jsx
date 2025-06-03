import { useState, useRef, useMemo, useEffect } from "react";
import "./Dictionary.scss";
// import LeftCard from "./LeftCard";
// import RightCard from "./RightCard";
import React from "react";
import { getShuffled } from "../../getData";
import { use } from "react";

export default function Dictionary(props) {
  // props-ების დესტრუქტურიზაცია
  const {
    setPartOfGame, // stage
    firstPartState, //
    secondPartState,
    thirdPartState,
    cardsData,
    points,
    setPoints,
    tries,
    setTries,
  } = props;
  const [chosenWordIndex, setChosenWordIndex] = useState(0);
  // const [wonWord, setWonWord] = useState();
  const [wonWord, setWonWord] = useState([{ word: "", translation: "" }]);

  const [isFixedVisible, setIsFixedVisible] = useState(false);

  const topData = useMemo(() => getShuffled(cardsData), []);
  const bottomData = useMemo(() => getShuffled(cardsData), []);
  const wonWords = useMemo(() => [], []);

  useEffect(() => {
    console.log("Dictionary component mounted or updated");
    // You can add any side effects here if needed
  }, [points])
  function clickNextHandler() {
    console.log("Next button clicked");
    setChosenWordIndex((prevIndex) => (prevIndex + 1) % topData.length);
    setTries(tries + 1);
    // Here you can add any additional logic you want to execute when the next button is clicked
  }
  function clickCardHandler(index) {
    console.log("Card clicked:", index);
    if (topData[chosenWordIndex].word === bottomData[index].word) {
      console.log("Correct card clicked:", bottomData[index].word);
      setPoints(points + 1);
      setTries(tries + 1);
      wonWords.push(topData.splice(chosenWordIndex, 1)[0]);
      setWonWord(bottomData.splice(index, 1));
      setIsFixedVisible(true);
      setTimeout(() => {
        setIsFixedVisible(false);
      }, 3000);
      // setChosenWordIndex((prevIndex) => (prevIndex + 1) % topData.length);
    } else {
      setTries(tries + 1);
      // Here you can add any additional logic you want to execute when a card is clicked
    }
  }
  console.log("Top Data:", topData);
  console.log("Bottom Data:", bottomData);
  return (
    <div className="dictionary">
      <div className="topSpace">
        {/* topSpace */}
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
          <div key={index} className="card" onClick={() => {
            clickCardHandler(index);
            // console.log("Card clicked:", card.word);
            // setPoints(points + 1);
          }}>
            <div className="cardFront">
              {card.word}
            </div>
          </div>
        ))}
        <div className={isFixedVisible ? "fixed-won-word" : "hidden"}>
          {wonWord[0].translation} - {wonWord[0].word}
        </div>
      </div>
    </div>
  )
}
