// React-ის საჭირო მოდულების იმპორტი
import React, { useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";

// CSS სტილების იმპორტი
import "./Words.scss";
// React Query ბიბლიოთეკიდან useQuery hook-ის იმპორტი API მოთხოვნებისთვის
import { useQuery } from "@tanstack/react-query";
// API მოთხოვნების გასაგზავნი ფუნქციის იმპორტი
import newRequest from "../../utils/newRequest";
import GameWords from "../../components/GameWords/GameWords";
import getCurrentUser from "../../utils/getCurrentUser";
// დავამატოთ ენის კონტექსტის იმპორტი
import { useLanguage } from "../../context/LanguageContext";
import { wordsInfo } from "../../data/infoData";
import InfoButton from "../../components/infoButton/InfoButton";

// Words კომპონენტის განსაზღვრა - სიტყვების თამაშისთვის
function Words() {
  // console.log("Words კომპონენტი დაიტვირთა", wordsInfo);
  // მიმდინარე მომხმარებლის მიღება localStorage-დან
  const currentUser = getCurrentUser();
  
  // ენის კონტექსტიდან წამოღება
  const { language } = useLanguage();

  // თამაშის მდგომარეობის ცვლადები:
  // გამოხმობილი სიტყვების და მეტადატა შენახვა
  const [gameData, setGameData] = useState({});
  const [gameWon, setGameWon] = useState(false);
  // დავამატოთ ეს state ფუნქციის თავში
  const [saveLoading, setSaveLoading] = useState(false);
  // თამაშის მდგომარეობის ცვლადი (დაწყებულია თუ არა)
  const [isStarted, setIsStarted] = useState(false);
  // ფლაგი იმის აღსანიშნავად, თუ მონაცემები მზადაა გამოსატანად
  const [gameDataCollected, setGameDataCollected] = useState(false);
  // ჩატვირთვის პროცესის მდგომარეობის ცვლადი
  const [isLoading, setIsLoading] = useState(false);
  // სიტყვების რაოდენობის ცვლადი
  const [amount, setAmount] = useState(22);
  // სიტყვების ტიპის არჩევისთვის ცვლადები
  const [selectedTypes, setSelectedTypes] = useState({
    mine: currentUser ? false : false, // თავდაპირველად არჩეული არ არის
    public: true // საჯარო ყოველთვის არჩეულია
  });

  // დავამატოთ ვალიდაციის შეცდომების ცვლადები
  const [validationErrors, setValidationErrors] = useState({
    types: false
  });

  // DOM ელემენტებზე წვდომისთვის რეფერენსები:
  // სიტყვების რაოდენობის ველზე წვდომისთვის რეფერენსი
  const amountRef = useRef();
  
  // წავშალოთ ენის რეფერენსი, რადგან ახლა კონტექსტიდან მოვა
  // const languageRef = useRef();

  // დავამატოთ ტექსტის შესადგენი სტეიტები
  const [text, setText] = useState("");
  // საჭიროა დაემატოს თარგმანის state
  const [translation, setTranslation] = useState("");
  // კომპონენტის თავში დავამატოთ ახალი state
  const [additionalInfo, setAdditionalInfo] = useState("");

  // დავამატოთ თარგმანის ვალიდაციის ცვლადი
  const [textValidationErrors, setTextValidationErrors] = useState({
    text: false,
    translation: false
  });

  // ასინქრონული ფუნქცია სიტყვების API-დან გამოსახმობად
  const fetchWords = async () => {
    // საწყისი მდგომარეობისთვის გავასუფთაოთ ვალიდაციის შეცდომები
    setValidationErrors({ types: false });

    // ვალიდაცია - ერთი ტიპი მაინც უნდა იყოს არჩეული
    if (!selectedTypes.mine && !selectedTypes.public) {
      setValidationErrors(prev => ({ ...prev, types: true }));
      return;
    }

    // ჩატვირთვის მდგომარეობის ჩართვა
    setIsLoading(true);

    try {
      // განვსაზღვროთ privacy პარამეტრი
      let privacy;
      if (selectedTypes.mine && selectedTypes.public) {
        privacy = "all";
      } else if (selectedTypes.mine) {
        privacy = "mine";
      } else {
        privacy = "public";
      }
      // console.log("აირჩიეთ სიტყვების ტიპი:", privacy);
      // API მოთხოვნის გაგზავნა შემთხვევითი სიტყვების მისაღებად
      const response = await newRequest.get(`/words`, {
        params: {
          userId: currentUser ? currentUser._id : null, // მომხმარებლის ID
          amount,
          language, // კონტექსტიდან წამოღებული ენა
          type: "random",
          privacy,
        },
      });
      // console.log("API პასუხი:", response.data);
      // მიღებული მონაცემების დამახსოვრება სთეითში
      setGameData({
        words: response.data,     // სიტყვების მასივი API-დან
        language: language,       // არჩეული ენა კონტექსტიდან
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

  // სიტყვაზე დაჭერის ფუნქცია - გამარტივებული
  const handleWordSelect = (word) => {
    // დავამატოთ სიტყვა წინადადებას დაშორებით
    setText(prev => prev.length > 0 ? `${prev} ${word.word}` : word.word);
  };

  // წინადადების გასუფთავების ფუნქცია - გამარტივებული
  const handleClearSentence = () => {
    setText("");
  };

  // წინადადების გაზიარების ფუნქცია - გამარტივებული
  const handleShareSentence = () => {
    if (text.length === 0) return;

    if (navigator.share) {
      navigator.share({
        title: 'ჩემი შედგენილი წინადადება',
        text: text,
      })
        .catch(error => console.log('გაზიარების შეცდომა:', error));
    } else {
      // საკოპირებლად ბუფერში
      navigator.clipboard.writeText(text)
        .then(() => alert('წინადადება დაკოპირებულია'))
        .catch(err => console.log('კოპირების შეცდომა:', err));
    }
  };

  // სასვენი ნიშნის დამატების ფუნქცია
  const handlePunctuationSelect = (mark) => {
    // დავამატოთ სასვენი ნიშანი წინადადებას
    setText(prev => prev + mark);
  };

  // თარგმანის შენახვის ფუნქცია
  const handleTranslationChange = (e) => {
    setTranslation(e.target.value);
  };

  // დამატებითი ინფორმაციის შენახვის ფუნქცია
  const handleAdditionalInfoChange = (e) => {
    setAdditionalInfo(e.target.value);
  };

  // თამაშის გადატვირთვისას წინადადების გასუფთავება
  const handleToggleGame = () => {
    setGameWon(false);
    setText(""); // წინადადების გასუფთავება

    if (!isStarted) {
      // თუ თამაში არ დაწყებულა, დაიწყოს
      fetchWords();
    } else {
      // თუ თამაში აქტიურია, დასრულდეს
      setGameDataCollected(false);
      setIsStarted(false);
      // გავასუფთაოთ ვალიდაციის შეცდომები
      setValidationErrors({ types: false });
    }
  };


  // დავამატოთ შენახვის ფუნქცია
  const handleSaveSentence = async () => {
    // console.log("შენახვის ფუნქცია დაიძრა");
    // გავასუფთაოთ წინა ვალიდაციის შეცდომები
    setTextValidationErrors({ text: false, translation: false });
    
    // შევამოწმოთ ორივე ველი
    let isValid = true;
    
    if (!text || text.trim() === "") {
      setTextValidationErrors(prev => ({ ...prev, text: true }));
      isValid = false;
    }
    
    if (!translation || translation.trim() === "") {
      setTextValidationErrors(prev => ({ ...prev, translation: true }));
      isValid = false;
    }
    
    // თუ ველები არ არის შევსებული, გამოვიდეთ ფუნქციიდან
    if (!isValid) return;

    try {
      // ჩავტვირთოთ ინდიკატორი
      setSaveLoading(true);

      // მონაცემების მომზადება ბაზაში შესანახად
      const textData = {
        text: text,
        translation: translation,
        additionalInfo: additionalInfo,
        language: gameData.language,
        words: gameData.words.map(word => word._id)
      };

      // API მოთხოვნის გაგზავნა ტექსტის შესანახად
      const response = await newRequest.post('/texts', textData);

      // წარმატებული შენახვის შეტყობინება
      alert('ტექსტი წარმატებით შეინახულია!');

      // გავასუფთაოთ ველები წარმატებული შენახვის შემდეგ
      setText("");
      setTranslation("");
      setAdditionalInfo("");
      setTextValidationErrors({ text: false, translation: false });
    } catch (error) {
      console.error("ტექსტის შენახვისას მოხდა შეცდომა:", error);
      alert(`შენახვა ვერ მოხერხდა: ${error.response?.data?.message || error.message}`);
    } finally {
      // გავთიშოთ ჩატვირთვის ინდიკატორი
      setSaveLoading(false);
    }
  };
  // console.log(gameWon, "gameWon",textValidationErrors);

  // JSX - კომპონენტის ვიზუალური ნაწილი
  return (
    <div className="words-game-container">
      <InfoButton infoData={wordsInfo} />
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
            <p>თამაშის დასაწყებად, აირჩიეთ სიტყვების რაოდენობა და ტიპი, შემდეგ დააჭირეთ "თამაშის დაწყება" ღილაკს.</p>
          </div>
        )}
      </h3>
      {/* კონტროლების სექცია - სიტყვების რაოდენობა და თამაშის დაწყება */}
      <div className={`game-controls ${isStarted ? "minimized" : ""}`}>
        {/* ენის ჩამოსაშლელი მენიუს ნაცვლად გამოვაჩინოთ მიმდინარე ენა */}
        <div className="control-group">
          <label>
            <i className="fas fa-language"></i> არჩეული ენა:
          </label>
          <div className="selected-language-display">
            {language === "ka" ? "🇬🇪 ქართული" :
             language === "en" ? "🇬🇧 ინგლისური" :
             language === "de" ? "🇩🇪 გერმანული" :
             language === "fr" ? "🇫🇷 ფრანგული" :
             language === "ba" ? "თუშური" : "სხვა"}
          </div>
          <p className="language-note">ენის შესაცვლელად გამოიყენეთ ენის ჩამოსაშლელი მენიუ ზედა პანელში</p>
        </div>

        {/* სიტყვების რაოდენობის არჩევის ინფუთი სლაიდერით და ხელით შესაყვანი ველით */}
        <div className="control-group">
          <label htmlFor="amount">
            <i className="fas fa-sort-numeric-up">რაოდენობა: </i>
            <input
              type="number"
              className="amount-number-input"
              value={amount}
              min="5"
              max="50"
              disabled={isStarted}
              onChange={(e) => {
                // ვალიდაცია: მინიმუმ 5, მაქსიმუმ 50
                let newValue = parseInt(e.target.value);
                if (isNaN(newValue)) newValue = 10;
                if (newValue < 5) newValue = 5;
                if (newValue > 50) newValue = 50;
                setAmount(newValue);
              }}
            />
          </label>
          <div className="amount-input-container">
            <div className="slider-container">
              <input
                ref={amountRef}
                type="range"
                id="amount"
                min="5"
                max="50"
                step="1"
                value={amount}
                className="range-slider"
                disabled={isStarted}
                onChange={(e) => setAmount(parseInt(e.target.value))}
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
        </div>

        {/* სიტყვების ტიპის არჩევა (მხოლოდ ავტორიზებული მომხმარებლისთვის) */}
        {currentUser && (
          <div className="control-group">
            <label>
              <i className="fas fa-filter"></i> სიტყვების ტიპი:
            </label>
            <div className={`type-selection-cards ${validationErrors.types ? 'validation-error' : ''}`}>
              <div
                className={`type-card ${selectedTypes.mine ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTypes(prev => ({
                    ...prev,
                    mine: !prev.mine
                  }));
                  // შეცდომის გასუფთავება არჩევისას
                  if (validationErrors.types) {
                    setValidationErrors(prev => ({ ...prev, types: false }));
                  }
                }}
              >
                <div className="type-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.mine}
                    onChange={() => { }}
                    disabled={isStarted}
                  />
                </div>
                <div className="type-content">
                  <i className="fas fa-user"></i>
                  <span>ჩემი</span>
                </div>
              </div>

              <div
                className={`type-card ${selectedTypes.public ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTypes(prev => ({
                    ...prev,
                    public: !prev.public
                  }));
                  // შეცდომის გასუფთავება არჩევისას
                  if (validationErrors.types) {
                    setValidationErrors(prev => ({ ...prev, types: false }));
                  }
                }}
              >
                <div className="type-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.public}
                    onChange={() => { }}
                    disabled={isStarted}
                  />
                </div>
                <div className="type-content">
                  <i className="fas fa-globe"></i>
                  <span>საჯარო</span>
                </div>
              </div>
            </div>
            {validationErrors.types && (
              <div className="error-message">გთხოვთ, აირჩიეთ სიტყვების ტიპი</div>
            )}
          </div>
        )}

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
          <GameWords gameData={gameData} setGameWon={setGameWon} />
          <div className="">
            {gameWon && (
              <div className="game-won-message">
                <p>მოპოვებული სიტყვები: {gameData.words?.length || 0}</p>

                {gameData.words?.length > 0 && (
                  <div className="text-builder">
                    <h3>შეადგინეთ წინადადება მოპოვებული სიტყვებით</h3>

                    <div className="text-container">
                      <div className="text-label">
                        <span>თქვენი წინადადება:</span>
                        <div className="text-actions">
                          <button
                            className="clear-btn"
                            onClick={handleClearSentence}
                            disabled={text.length === 0}
                          >
                            <i className="fas fa-trash"></i> გასუფთავება
                          </button>
                          {/* <button
                            className="share-btn"
                            onClick={handleShareSentence}
                            disabled={text.length === 0}
                          >
                            <i className="fas fa-share-alt"></i> გაზიარება
                          </button> */}
                        </div>
                      </div>

                      {/* შერჩეული სიტყვების ბარათების ნაცვლად პირდაპირ ვაჩვენებთ ტექსტს */}
                      {text.length > 0 ? (
                        <div className={`text-text ${textValidationErrors.text ? 'validation-error' : ''}`}>
                          <p>{text}</p>
                        </div>
                      ) : (
                        <div className={`empty-text ${textValidationErrors.text ? 'validation-error' : ''}`}>
                          <i className="fas fa-arrow-up"></i>
                          წინადადების შესადგენად დააჭირეთ სიტყვებს ქვემოთ
                        </div>
                      )}
                      
                      {/* ვაჩვენოთ შეცდომის შეტყობინება საჭიროებისას */}
                      {/* {textValidationErrors.text && (
                        <div className="error-message">წინადადება აუცილებელია</div>
                      )} */}
                    </div>
                    {/* სიტყვების ბარათები */}
                    <div className="word-cards-container">
                      {gameData.words.map((word, index) => (
                        <div
                          key={index}
                          className="word-card"
                          onClick={() => handleWordSelect(word)}
                        >
                          <span className="word">{word.word}</span>
                          {/* <span className="translation">{word.translation}</span> */}
                        </div>
                      ))}
                    </div>

                    {/* წინადადების კონტეინერი */}

                    {/* სასვენი ნიშნების კონტეინერი - გადმოვიტანეთ text-builder-ის შიგნით */}
                    <div className="punctuation-container">
                      {/* <div className="punctuation-title">სასვენი ნიშნები:</div> */}
                      <div className="punctuation-marks">
                        {['.', ',', '!', '?', ':', ';'].map((mark, index) => (
                          <button
                            key={index}
                            className="punctuation-mark"
                            onClick={() => handlePunctuationSelect(mark)}
                          >
                            {mark}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* თარგმანის ველი - გადმოვიტანეთ text-builder-ის შიგნით */}
                    <div className="translation-container">
                      <div className="translation-title">
                        <span>თარგმანი:</span>
                        {translation.length > 0 && (
                          <button
                            className="copy-translation-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(translation)
                                .then(() => alert('თარგმანი დაკოპირებულია'))
                                .catch(err => console.log('კოპირების შეცდომა:', err));
                            }}
                          >
                            <i className="fas fa-copy"></i> კოპირება
                          </button>
                        )}
                      </div>
                      <textarea
                        className={`translation-input ${textValidationErrors.translation ? 'validation-error' : ''}`}
                        placeholder="შეიყვანეთ თქვენი წინადადების თარგმანი..."
                        value={translation}
                        onChange={handleTranslationChange}
                        rows={3}
                      />
                      
                      {/* ვაჩვენოთ შეცდომის შეტყობინება საჭიროებისას */}
                      {/* {textValidationErrors.translation && (
                        <div className="error-message">თარგმანი აუცილებელია</div>
                      )} */}
                    </div>

                    {/* დამატებითი ინფორმაციის ველი */}
                    <div className="additional-info-container">
                      <div className="additional-info-title">
                        <span>დამატებითი ინფორმაცია:</span>
                      </div>
                      <textarea
                        className="additional-info-input"
                        placeholder="შეიყვანეთ დამატებითი ინფორმაცია, შენიშვნები ან კომენტარები..."
                        value={additionalInfo}
                        onChange={handleAdditionalInfoChange}
                        rows={3}
                      />
                    </div>

                    {/* შენახვის კონტეინერს ვაჩვენებთ მხოლოდ ავტორიზებული მომხმარებლისთვის */}
                    {currentUser ? (
                      <div className="save-container">
                        <button
                          className="save-text-btn"
                          onClick={handleSaveSentence}
                        >
                          {saveLoading ? (
                            <><span className="spinner-small"></span> ინახება...</>
                          ) : (
                            <><i className="fas fa-save"></i> შენახვა ბაზაში</>
                          )}
                        </button>
                        <p className="save-hint">
                          შეინახეთ წინადადება და თარგმანი თქვენს ანგარიშში მომავალში გამოსაყენებლად
                        </p>
                      </div>
                    ) : (
                      <div className="login-prompt">
                        <p>
                          <i className="fas fa-info-circle"></i> წინადადების შესანახად საჭიროა 
                          <Link to="/login" className="login-link"> ავტორიზაცია</Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* წავშალოთ ეს კოდი - ახლა ეს ელემენტები მხოლოდ თამაშის მოგების შემდეგ გამოჩნდება */}
      {/* სასვენი ნიშნების კონტეინერი */}
      {/* <div className="punctuation-container">
        ...
      </div> */}

      {/* თარგმანის ველი */}
      {/* <div className="translation-container">
        ...
      </div> */}
    </div>
  );
}

// კომპონენტის ექსპორტი, რომ შესაძლებელი იყოს მისი სხვა ფაილებში გამოყენება
export default Words;
