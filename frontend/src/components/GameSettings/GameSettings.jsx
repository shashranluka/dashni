import { useState } from "react";
import "./GameSettings.scss"; // შევცვალეთ მოდულის იმპორტი

const gameDifficulties = [
  {
    isFirstVisible: "first_visible",
    isSecondVisible: "second_visible",
    isThirdVisible: "right_visible",
  },
  {
    isFirstVisible: "first_visible",
    isSecondVisible: "second_waiting",
    isThirdVisible: "third_visible",
  },
  {
    isFirstVisible: "first_visible",
    isSecondVisible: "second_visible",
    isThirdVisible: "third_waiting",
  },
  {
    isFirstVisible: "first_waiting",
    isSecondVisible: "second_waiting",
    isThirdVisible: "third_visible",
  },
  {
    isFirstVisible: "first_visible",
    isSecondVisible: "second_invisible",
    isThirdVisible: "third_visible",
  },
  {
    isFirstVisible: "first_waiting",
    isSecondVisible: "second_invisible",
    isThirdVisible: "third_visible",
  },
  {
    isFirstVisible: "first_visible",
    isSecondVisible: "second_invisible",
    isThirdVisible: "third_waiting",
  },
];

export default function Settings(props) {
  const {
    newGame,
    setNewGame,
    setPoints,
    setTries,
    setPartOfGame,
    setDictionarySettings,
    setGameType,
  } = props;
  
  const [chosenDifficulty, setChosenDifficulty] = useState(1);
  const [firstPartState, setFirstPartState] = useState(
    gameDifficulties[0].isFirstVisible
  );
  const [secondPartState, setSecondPartState] = useState(
    gameDifficulties[0].isSecondVisible
  );
  const [thirdPartState, setThirdPartState] = useState(
    gameDifficulties[0].isThirdVisible
  );
  const [sentencesFirstState, setSentencesFirstState] =
    useState(firstPartState);
  const [sentencesSecondState, setSentencesSecondState] =
    useState(secondPartState);
  const [sentencesThirdState, setSentencesThirdState] =
    useState(thirdPartState);

  return (
    <div className="settings">
      <h3 className="dTitle">აირჩიე სირთულე</h3>
      <div className="flexCenter selectDifficulty">
        {gameDifficulties.map((gameDifficulty, index) => (
          <div
            key={index}
            className={chosenDifficulty === index + 1 ? "dItem cItem" : "dItem"}
            onClick={() => {
              setChosenDifficulty(index + 1);
              setFirstPartState(gameDifficulty.isFirstVisible);
              setSecondPartState(gameDifficulty.isSecondVisible);
              setThirdPartState(gameDifficulty.isThirdVisible);
              setSentencesFirstState(gameDifficulty.isFirstVisible);
              setSentencesSecondState(gameDifficulty.isSecondVisible);
              setSentencesThirdState(gameDifficulty.isThirdVisible);
            }}
          >
            {index < 4 ? "მარტივი" : "რთული"}
          </div>
        ))}
      </div>
      <div className="examples">
        <div>
          <div className="leftCard">
            <div className={firstPartState}>სიტყვა</div>
            <div className={secondPartState}>დოშ</div>
          </div>
        </div>
        <div>
          <div className="rightCard">
            <div className={thirdPartState}>დოშ</div>
          </div>
        </div>
      </div>
      <button
        className="startButton"
        onClick={() => {
          setPoints(0);
          setTries(0);
          setPartOfGame(1);
          setNewGame(newGame + 1);
          setDictionarySettings({
            firstPartState: firstPartState,
            secondPartState: secondPartState,
            thirdPartState: thirdPartState,
          });
        }}
      >
        დაწყება
      </button>
    </div>
  );
}
