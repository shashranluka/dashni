import About from "../about/About";
import about from "../../about.json";
import "./GamePanel.scss"; // შევცვალეთ მოდულური იმპორტი ჩვეულებრივი scss-ით

export default function GamePanel(props) {
  const { points, setPoints, tries, setTries, partOfGame, setPartOfGame, numberOfParts } = props;  
  // დინამიურად გავაკეთოთ თამაშის ღილაკების რენდერი numberOfParts-ის მიხედვით
  const renderGameButtons = () => {
    const buttons = [];
    
    // პირველი ღილაკი - Settings
    buttons.push(
      <button
        key="settings"
        className={partOfGame === 0 ? "gameButton openedGame" : "gameButton closedGame"}
        onClick={() => {
          setPartOfGame(0);
        }}
      >
        S
      </button>
    );
    // თამაშის ეტაპების ღილაკები nuberOfParts-ის მიხედვით
    for (let i = 1; i < numberOfParts; i++) {
      let label;
      // რომაული რიცხვები ეტაპებისთვის
      switch (i) {
        case 1: label = "I"; break;
        case 2: label = "II"; break;
        case 3: label = "III"; break;
        case 4: label = "IV"; break;
        case 5: label = "V"; break;
        default: label = i.toString();
      }
      
      buttons.push(
        <button
          key={i}
          className={partOfGame === i ? "openedGame" : "closedGame"}
          onClick={() => {
            setPartOfGame(i);
            setPoints(0);
            setTries(0);
          }}
        >
          {label}
        </button>
      );
    };

    return buttons;
  };

  return (
    <div className="topicDiv">
      <About partOfGame={partOfGame} desc={about.partsOfGame[partOfGame]} />
      <div className="result">
        <div className="points">
          {points}
          <div className="qula">ქულა</div>
        </div>
        /
        <div className="tries">
          {tries}
          <div className="cda">ცდა</div>
        </div>
      </div>
      <div className="gamePartButtons">
        {renderGameButtons()}
      </div>
    </div>
  );
}
