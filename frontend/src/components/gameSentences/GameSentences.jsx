import { useMemo, useRef, useState } from "react";
// import "../Components.css";
import "./GameSentences.scss";
import GamePanel from "../gamePanel/GamePanel";
import Dictionary from "../Dictionary/Dictionary";
import CreateSentences from "../CreateSentences/CreateSentences";
import WordsAndMarks from "../WordsAndMarks/WordsAndMarks";
import GuessPicture from "../GuessPicture/GuessPicture";
import TellPicture from "../TellPicture/TellPicture";
import { splitTextToWords } from "../../utils/tools";
// import PartOfSpeech from "../components/PartsOfSpeech";


import Settings from "../GameSettings/GameSettings";
import Results from "../Results/Results";

function Game(props) {
  const { wordsFromLexicon, chosenSentences } = props.gameData;
  // console.log(props, "props.gameData", wordsFromLexicon, chosenSentences);

  const [points, setPoints] = useState(0);
  const [tries, setTries] = useState(0);
  const [partOfGame, setPartOfGame] = useState(1);
  const [newGame, setNewGame] = useState(0);
  const [isVisibleBack, setIsVisibleBack] = useState(false);
  const [isVisibleFront, setIsVisibleFront] = useState(false);
  const [isBackVisible, setIsBackVisible] = useState(isVisibleFront);
  const [dictionarySettings, setDictionarySettings] = useState({
    firstPartState: "first_visible",
    secondPartState: "second_visible",
    thirdPartState: "third_visible",
  });
  const [gameType, setGameType] = useState("TRANSLATION");
  const textFromSentences = chosenSentences.map(sentence => sentence.sentence).join(" ");
  const wordsFromSentences = splitTextToWords(textFromSentences);
  // console.log("Text from sentences:", textFromSentences, "Words from sentences:", wordsFromSentences);

  // შემთხვევითად ამოირჩევა წინადადებები ყოველი თავიდან და დაიშლება ობიექტებად, რომლებიც wordsForCards მასივში მიმდევრობით ჩალაგდება
  // console.log(props);
  const iSentence = useRef();
  const marksAmount = useRef(0);
  // const wordsFromLexicon = props.gameData.wordsFromLexicon;
  const storeCollectedWords = props.storeCollectedWords;
  // const chosenSentences = props.gameData.chosenSentences;
  // const wordsFromSentences = props.gameData.wordsFromSentences;
  const setReturnedData = props.setReturnedData;
  // console.log(props,typeof(storeCollectedWords),storeCollectedWords)
  // console.log(chosenSentences, "chosenSentences");
  const sentencesData = useMemo(() => {
    const sentencesData = chosenSentences.map((el) => {
      const marks = [",", ".", ":", ";", "!", "?"];
      // const usedMarks = [];
      // console.log(el.sentence, "el.sentence");
      const words = el.sentence
        .replace('"', "")
        .replace('"', "")
        .replace("„", "")
        .replace("“", "")
        .replace("(", "")
        .replace(")", "")
        .split(" ")
        .map((word) => {
          const wordObj = {};
          if (marks.includes(word[word.length - 1])) {
            wordObj.word = word.substr(0, word.length - 1);
            wordObj.mark = word[word.length - 1];
            // usedMarks.push(word[word.length - 1]);
          } else {
            wordObj.word = word;
          }
          wordObj.isDone = false;

          return wordObj;
        });
      return { ...el, words: words, isDone: false };
    });
    return sentencesData;
  }, []);
  // console.log(sentencesData)
  // const wordsFromSentences = useMemo(()=>);

  return (
    <div className="gameSentences chapter">
      <GamePanel
        points={points}
        setPoints={setPoints}
        tries={tries}
        setTries={setTries}
        partOfGame={partOfGame}
        setPartOfGame={setPartOfGame}
        numberOfParts={6}
      />
      
      <div>
        {
        // partOfGame === 0 ? (
        //   <div>
        //     <Settings
        //       newGame={newGame}
        //       setNewGame={setNewGame}
        //       dictionarySettings={dictionarySettings}
        //       setDictionarySettings={setDictionarySettings}
        //       setPoints={setPoints}
        //       setTries={setTries}
        //       setGameType={setGameType}
        //       setPartOfGame={setPartOfGame}
        //     />
        //   </div>
        // ) : 
        partOfGame === 1 ? (
          <div className="">
            <Dictionary
              points={points}
              setPoints={setPoints}
              tries={tries}
              setTries={setTries}
              firstPartState={dictionarySettings.firstPartState}
              secondPartState={dictionarySettings.secondPartState}
              thirdPartState={dictionarySettings.thirdPartState}
              cardsData={wordsFromLexicon}
              setPartOfGame={setPartOfGame}
              isVisibleFront={isVisibleFront}
              isVisibleBack={isVisibleBack}
              gameType={gameType}
            />
          </div>
        ) : partOfGame === 2 ? (
          <div className="">
            <CreateSentences
              points={points}
              setPoints={setPoints}
              tries={tries}
              setTries={setTries}
              wordsFromSentences={wordsFromSentences}
              isBackVisible={isBackVisible}
              sentencesData={sentencesData}
              setPartOfGame={setPartOfGame}
            />
          </div>
        ) : partOfGame === 3 ? (
          <div className="">
            <WordsAndMarks
              points={points}
              setPoints={setPoints}
              tries={tries}
              setTries={setTries}
              sentencesData={sentencesData}
              cardsData={wordsFromSentences}
              marksAmount={marksAmount.current}
              setPartOfGame={setPartOfGame}
            />
          </div>
          ) : partOfGame === 4 ? (
            <div className="">
              <GuessPicture
                sentencesData={sentencesData}
                points={points}
                setPoints={setPoints}
                tries={tries}
                setTries={setTries}
                setPartOfGame={setPartOfGame}
              />
            </div>
          ) : partOfGame === 5 ? (
            <div className="">
              <TellPicture
                points={points}
                setPoints={setPoints}
                tries={tries}
                setTries={setTries}
                wordsForCards={wordsFromSentences}
                isBackVisible={isBackVisible}
                sentencesData={sentencesData}
                setPartOfGame={setPartOfGame}
              />
            </div>
        ) : partOfGame === 6 ? (
          <div className="">
            <Results points={points} tries={tries} sentences={sentencesData} wordsFromLexicon={wordsFromLexicon} setReturnedData={setReturnedData} storeCollectedWords={storeCollectedWords} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Game;
