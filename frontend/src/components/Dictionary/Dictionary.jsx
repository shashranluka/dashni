import { useState, useRef, useMemo, useEffect } from "react";
import "./Dictionary.scss";
// import LeftCard from "./LeftCard";
// import RightCard from "./RightCard";
import React from "react";
import { getShuffled } from "../../getData";

export default function Dictionary(props) {
  // props-ების დესტრუქტურიზაცია
  const {
    setPartOfGame, // stage
    firstPartState, //
    secondPartState,
    thirdPartState,
    cardsData,
  } = props;

  const shuffledDataForTop = useMemo(() => getShuffled(cardsData), []);
  const shuffledDataForBottom = useMemo(() => getShuffled(cardsData), []);


  return (
    <div className="dictionary">
      <div className="topSpace">
        topSpace
      </div>
      <div className="bottomSpace">
        {shuffledDataForBottom.map((card, index) => (
          <div key={index} className="card">
            <div className="cardFront">
              {card.word}
            </div>
          </div>
        ))}
      </div>
    </div>)
}
