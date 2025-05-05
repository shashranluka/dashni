// React-ის საჭირო მოდულების იმპორტი: useState კომპონენტის მდგომარეობისთვის, useEffect ეფექტებისთვის, useRef DOM ელემენტებზე წვდომისთვის
import React, { useEffect, useRef, useState } from "react";
// CSS სტილების იმპორტი
import "./Words.scss";
// GameWords კომპონენტის იმპორტი (ამჟამად გამორთულია)
// import GameWords from "../../components/gameWords/GameWords";
// React Query ბიბლიოთეკიდან useQuery hook-ის იმპორტი API მოთხოვნებისთვის
import { useQuery } from "@tanstack/react-query";
// API მოთხოვნების გასაგზავნი ფუნქციის იმპორტი
import newRequest from "../../utils/newRequest";
import GameWords from "../../components/gameWords/GameWords";

// Words კომპონენტის განსაზღვრა - სიტყვების თამაშისთვის
function Words() {
  // თამაშის მდგომარეობის ცვლადები:
  // გამოხმობილი სიტყვების და მეტადატა შენახვა
  const [gameData, setGameData] = useState({});
  // თამაშის მდგომარეობის ცვლადი (დაწყებულია თუ არა)
  const [isStarted, setIsStarted] = useState(false);
  // ფლაგი იმის აღსანიშნავად, თუ მონაცემები მზადაა გამოსატანად
  const [gameDataCollected, setGameDataCollected] = useState(false);
  // ჩატვირთვის პროცესის მდგომარეობის ცვლადი
  const [isLoading, setIsLoading] = useState(false);
  // სიტყვების რაოდენობის ცვლადი
  const [amount, setAmount] = useState(10);

  // DOM ელემენტებზე წვდომისთვის რეფერენსები:
  // სიტყვების რაოდენობის ველზე წვდომისთვის რეფერენსი
  const amountRef = useRef();
  // ენის არჩევის ველზე წვდომისთვის რეფერენსი
  const languageRef = useRef();

  // ასინქრონული ფუნქცია სიტყვების API-დან გამოსახმობად
  const fetchWords = async () => {
    // ვამოწმებთ, არსებობს თუ არა რეფერენსები
    if (!amountRef.current || !languageRef.current) return;

    // ველებიდან მნიშვნელობების ამოღება
    const amount = amountRef.current.value;
    const language = languageRef.current.value;

    // ვალიდაცია - ამოწმებს, რომ შეყვანილია აუცილებელი მონაცემები
    if (!amount || !language) {
      alert("გთხოვთ, მიუთითოთ სიტყვების რაოდენობა და ენა");
      return;
    }

    // ჩატვირთვის მდგომარეობის ჩართვა
    setIsLoading(true);

    try {
      // API მოთხოვნის გაგზავნა შემთხვევითი სიტყვების მისაღებად
      const response = await newRequest.get(`/words`, {
        params: {
          amount,  // რამდენი სიტყვა გვინდა
          language, // რა ენაზე გვინდა სიტყვები
          type: "random", // შემთხვევითი სიტყვები
          privacy: "public", // საჯარო სიტყვები
        },
      });
      console.log("API პასუხი:", response.data);
      // მიღებული მონაცემების დამახსოვრება სთეითში
      setGameData({
        words: response.data,     // სიტყვების მასივი API-დან
        language: language,       // არჩეული ენა
        amount: amount           // არჩეული რაოდენობა
      });

      // მონაცემების მიღების და თამაშის მზადყოფნის ფლაგების განახლება
      setGameDataCollected(true);
      setIsStarted(true);
    } catch (error) {
      // შეცდომის დამუშავება API მოთხოვნისას
      console.error("სიტყვების ჩატვირთვისას მოხდა შეცდომა:", error);
      alert("სიტყვების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      // ჩატვირთვის მდგომარეობის გამორთვა (წარმატებით ან წარუმატებლად დასრულებისას)
      setIsLoading(false);
    }
  };

  // თამაშის დაწყება/დასრულების ფუნქციის ლოგიკა
  const handleToggleGame = () => {
    if (!isStarted) {
      // თუ თამაში არ დაწყებულა, დაიწყოს
      fetchWords();
    } else {
      // თუ თამაში აქტიურია, დასრულდეს
      setGameDataCollected(false);
      setIsStarted(false);
    }
  };

  // JSX - კომპონენტის ვიზუალური ნაწილი
  return (
    <div className="words-game-container">
      <h2>სიტყვების თამაში</h2>
      {/* თამაშის მდგომარეობის ინდიკატორი */}
      <div className="game-status-bar">
        <div className={`status-step ${!isStarted ? "active" : ""}`}>
          <span className="step-number">1</span>
          <span className="step-label">პარამეტრების არჩევა</span>
        </div>
        <div className="status-divider"></div>
        <div className={`status-step ${isStarted && !gameDataCollected ? "active" : ""}`}>
          <span className="step-number">2</span>
          <span className="step-label">ჩატვირთვა</span>
        </div>
        <div className="status-divider"></div>
        <div className={`status-step ${gameDataCollected ? "active" : ""}`}>
          <span className="step-number">3</span>
          <span className="step-label">თამაში</span>
        </div>
      </div>
      {/* ინსტრუქციები, რომლებიც ჩანს თამაშის დაწყებამდე */}
      <h3>
        {!isLoading && !gameDataCollected && (
          <div className="game-instructions">
            <p>თამაშის დასაწყებად, აირჩიეთ ენა და სიტყვების რაოდენობა, შემდეგ დააჭირეთ "თამაშის დაწყება" ღილაკს.</p>
          </div>
        )}
      </h3>
      {/* კონტროლების სექცია - ენის არჩევა, სიტყვების რაოდენობა და თამაშის დაწყება */}
      <div className={`game-controls ${isStarted ? "minimized" : ""}`}>
        {/* ენის არჩევის ჩამოსაშლელი მენიუ გაუმჯობესებული იკონით */}
        <div className="control-group">
          <label htmlFor="language">
            <i className="fas fa-language"></i> ენა:
          </label>
          <select
            id="language"
            ref={languageRef}
            defaultValue=""
            className="styled-select"
            disabled={isStarted}
          >
            <option value="" disabled>აირჩიეთ ენა</option>
            <option value="ka"> თუშური</option>
            {/* <option value="ka"> ქართული</option> */}
            <option value="ka"> ქართული</option>
            <option value="en"> ინგლისური</option>
            <option value="de"> გერმანული</option>
            <option value="fr"> ფრანგული</option>
          </select>
        </div>

        {/* სიტყვების რაოდენობის არჩევის ინფუთი სლაიდერით */}
        <div className="control-group">
          <label htmlFor="amount">
            <i className="fas fa-sort-numeric-up"></i> რაოდენობა: <span className="amount-display">{amountRef.current?.value || 10}</span>
          </label>
          <div className="slider-container">
            <input
              ref={amountRef}
              type="range"
              id="amount"
              min="5"
              max="50"
              step="5"
              defaultValue="10"
              className="range-slider"
              disabled={isStarted}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="slider-markers">
              <span>5</span>
              <span>15</span>
              <span>25</span>
              <span>35</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* თამაშის დაწყების/დასრულების ღილაკი ანიმაციით */}
        <button
          className={`game-button ${isLoading ? "loading" : ""}`}
          onClick={handleToggleGame}
          disabled={isLoading}
        >
          {isLoading ? (
            <><span className="spinner"></span> იტვირთება...</>
          ) : isStarted ? (
            <><i className="fas fa-stop"></i> თამაშის დასრულება</>
          ) : (
            <><i className="fas fa-play"></i> თამაშის დაწყება</>
          )}
        </button>
      </div>

      {/* ჩატვირთვის ანიმაციის გაუმჯობესება */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <div className="loading-words">
              {['წ', 'ი', 'გ', 'ნ', 'ე', 'ბ', 'ი'].map((letter, index) => (
                <span 
                  key={index} 
                  className="bouncing-letter"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {letter}
                </span>
              ))}
            </div>
            <p className="loading-message">სიტყვები იტვირთება...</p>
          </div>
        </div>
      )}

      {/* თამაშის დასრულების შემდეგ შედეგები */}
      {gameDataCollected && (
        <div className="game-container">
          <div className="game-header">
            <div className="selected-language">
              <span className="label">არჩეული ენა:</span>
              <span className="value">{gameData.language === "ka" ? "🇬🇪 ქართული" : 
                                       gameData.language === "en" ? "🇬🇧 ინგლისური" :
                                       gameData.language === "de" ? "🇩🇪 გერმანული" :
                                       gameData.language === "fr" ? "🇫🇷 ფრანგული" : ""}</span>
            </div>
            <div className="word-counter">
              <span className="label">სიტყვები:</span>
              <span className="value">{gameData.words?.length || 0}</span>
            </div>
          </div>
          <GameWords gameData={gameData} />
        </div>
      )}
    </div>
  );
}

// კომპონენტის ექსპორტი, რომ შესაძლებელი იყოს მისი სხვა ფაილებში გამოყენება
export default Words;
