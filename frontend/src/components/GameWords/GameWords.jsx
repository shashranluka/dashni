import { useMemo, useRef, useState } from "react";
import "../Components.css";
import GamePanel from "../gamePanel/GamePanel";
import Dictionary from "../Dictionary/Dictionary";


import Settings from "../GameSettings/GameSettings";
import Results from "../Results/Results";
import About from "../about/About";
import about from "../../about.json";

function GameWords(props) {
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

  const wordsFromLexicon = props.gameData.words;

  return (
    <div className="chapter">
      <GamePanel
        points={points}
        setPoints={setPoints}
        tries={tries}
        setTries={setTries}
        partOfGame={partOfGame}
        setPartOfGame={setPartOfGame}
        numberOfParts={2}
      />
      <About partOfGame={partOfGame} desc={about.partsOfGame[partOfGame]} />
      <div>
        {partOfGame === 0 ? (
          <div>
            <Settings
              newGame={newGame}
              setNewGame={setNewGame}
              dictionarySettings={dictionarySettings}
              setDictionarySettings={setDictionarySettings}
              setPoints={setPoints}
              setTries={setTries}
              setGameType={setGameType}
              setPartOfGame={setPartOfGame}
            />
          </div>
        ) : partOfGame === 1 ? (
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
        ) : null}
      </div>
    </div>
  );
}

export default GameWords;
