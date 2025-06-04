import { useEffect, useMemo, useRef, useState } from "react";
import { getShuffled } from "../../getData";
import "./CreateSentences.scss";

export default function CreateSentences(props) {
  const { points, setPoints, tries, setTries, setPartOfGame, sentencesData } =
    props;
  // console.log("sentencesData", sentencesData);
  const [clickedWord, setClickedWord] = useState(false);
  const [placeToFillId, setPlaceToFillId] = useState(0);
  const [itsOver, setItsOver] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);


  const shuffledSentencesData = useMemo(() => {
    return getShuffled(sentencesData);
  }, []);
  console.log("shuffledSentencesData", shuffledSentencesData, "currentSentence", currentSentence);
  // const [sentenceToFill, setSentenceToFill] = useState(shuffledSentencesData[currentSentence]);
  const sentenceToFill = useMemo(() => {
    return shuffledSentencesData[currentSentence];
  }, [currentSentence]);
  console.log(sentenceToFill,currentSentence)
  const wordsToFill = useMemo(() => {
    return shuffledSentencesData[currentSentence].words
  }, [currentSentence]);
  // console.log("wordsToFill", wordsToFill);
  console.log(wordsToFill)
  const shuffledDataForCS = useMemo(() => {
    const words = sentencesData
      .map((el) => el.words)
      .flat()
      .sort(() => 0.5 - Math.random());
    return words;
  }, []);
  const wonSentences = useMemo(() => [], []);
  // console.log("shuffledSentencesData", shuffledSentencesData, "shuffledDataForCS", shuffledDataForCS);
  function clickHandler(word, index) {
    console.log("დაემთხვა?", word, wordsToFill[placeToFillId]);

    if (word === wordsToFill[placeToFillId].word) {
      console.log("დაემთხვა", word, wordsToFill[placeToFillId]);
      setTries(tries + 1);
      console.log("wordsToFill", wordsToFill);
      wordsToFill[placeToFillId].isDone = true;
      shuffledDataForCS.splice(index, 1);
      setPlaceToFillId(placeToFillId + 1);

      if (placeToFillId < wordsToFill.length - 1) {
        setPlaceToFillId(placeToFillId + 1);
      } else if (currentSentence < shuffledSentencesData.length - 1) {
        setPoints(points + wordsToFill.length);
        setCurrentSentence(currentSentence + 1);
        setPlaceToFillId(0);
      } else {
        console.log("ყველა წინადადება შეივსო");
        setPoints(points + wordsToFill.length);
        setItsOver(true);
      }
    } else {
      console.log("არაა სწორი", word, wordsToFill[placeToFillId]);
      setTries(tries + 1);
    }
  }
  function clickNextHandler() {
    setCurrentSentence((prevIndex) => (prevIndex + 1) % shuffledSentencesData.length);
    setTries(tries + 1);
  }

  return (
    <div className="words_and_sentences">
      <div className="sentences">

        {itsOver ? (
          <div className="next_game">
            <button onClick={() => setPartOfGame(3)}>შემდეგი ეტაპი</button>
          </div>
        ) : (
          <div className="toTranslate">
            <div className="">
              <div className="transalatedSentence">
                {sentenceToFill.translation}
              </div>
              <div className="wordsToFill">
                {wordsToFill.map((el, index) => (
                  <div className="">
                    <div
                      className={
                        el.isDone
                          ? "word_returned"
                          : "word_for_sentence"
                      }
                    >
                      {el.isDone
                        ? el.word
                        : "დოშ"}
                    </div>
                    <div className=""></div>
                  </div>
                ))}
              </div>
            </div>
            {/* <div className="nextButton" onClick={clickNextHandler}></div> */}
          </div>
        )}
      </div>
      <div className="words_for_sentence">
        {shuffledDataForCS.map((el, index) => (
          <div
            className="card_to_choose"
            onClick={() => clickHandler(el.word, index)}
          >
            <div className="">{el.word}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
