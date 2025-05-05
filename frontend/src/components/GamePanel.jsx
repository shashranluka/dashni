export default function GamePanel(props) {
  const { point, setPoint, tries, setTries, partOfGame, setPartOfGame, numberOfParts } = props;  
  // დინამიურად გავაკეთოთ თამაშის ღილაკების რენდერი numberOfParts-ის მიხედვით
  const renderGameButtons = () => {
    const buttons = [];
    
    // პირველი ღილაკი - Settings
    buttons.push(
      <button
        key="settings"
        className={partOfGame === 0 ? "opened_game" : ""}
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
          className={partOfGame === i ? "opened_game" : "closed_game"}
          onClick={() => {
            setPartOfGame(i);
            setPoint(0);
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
    <div className="topic-div">
      <div className="result">
        <div className="point">
          {point}
          <div className="qula">ქულა</div>
        </div>
        /
        <div className="tries">
          {tries}
          <div className="cda">ცდა</div>
        </div>
      </div>
      <div className="game_part_buttons">
        {renderGameButtons()}
      </div>
    </div>
  );
}
