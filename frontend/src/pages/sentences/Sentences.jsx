import React, { useState, useEffect, useRef } from "react";
import "./Sentences.scss"; // შევცვალეთ მოდულის იმპორტი
import newRequest from "../../utils/newRequest";
import GameSentences from "../../components/gameSentences/GameSentences";
import getCurrentUser from "../../utils/getCurrentUser";
import { use } from "react";
import { splitTextToWords } from "../../utils/tools";

function Sentences() {
  // ძირითადი სთეითები
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [gameData, setGameData] = useState({});
  const [gameWon, setGameWon] = useState(false);

  const [error, setError] = useState(null);
  const currentUser = getCurrentUser();

  // სტატისტიკის სთეითი
  const [statistics, setStatistics] = useState(null);

  // თამაშის პარამეტრების სთეითები
  const [amount, setAmount] = useState(5);
  const [withPictures, setWithPictures] = useState(2);
  const [source, setSource] = useState("all");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [showThemesSelector, setShowThemesSelector] = useState(false);

  // რეფერენსები რენჯ ინფუთების მნიშვნელობებისთვის
  const amountRef = useRef(null);
  const withPicturesRef = useRef(null);

  // ხელმისაწვდომი ენების მასივი
  const languages = [
    { id: "ba", name: "თუშური" },
    { id: "en", name: "ინგლისური" },
    { id: "de", name: "გერმანული" },
    { id: "es", name: "ესპანური" },
    { id: "fr", name: "ფრანგული" },
    { id: "sx", name: "სხვა" },
    // შეგიძლიათ დაამატოთ სხვა ენები საჭიროებისამებრ
  ];

  console.log(gameWon, "gameWon");
  // ენის არჩევის დამუშავება
  const handleLanguageSelect = async (langId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedLanguage(langId);

      // წინადადებების სტატისტიკის მოთხოვნა
      const response = await newRequest.get("/sentences", {
        params: { language: langId, whatData: "languageDataInfo", userId: currentUser?._id },
      });

      if (response.data && response.data.totalCount > 0) {
        setStatistics(response.data);
        setIsLanguageSelected(true);

        // საწყისი მნიშვნელობების დაყენება
        setAmount(Math.min(5, response.data.totalCount));
        setWithPictures(Math.min(2, response.data.withPicturesCount));
      } else {
        setError(`არჩეულ ენაზე (${languages.find(l => l.id === langId)?.name}) წინადადებები არ მოიძებნა.`);
      }
    } catch (err) {
      console.error("Error checking language availability:", err);
      setError("შეცდომა ენის შემოწმებისას. გთხოვთ, სცადოთ მოგვიანებით.");
    } finally {
      setIsLoading(false);
    }
  };

  // რეინჯ ინპუტების მნიშვნელობების განახლება
  const handleRangeChange = (e) => {
    const { id, value } = e.target;
    const numValue = parseInt(value, 10);

    if (id === "amount") {
      setAmount(numValue);

      // თუ სურათიანი წინადადებების რაოდენობა მეტია ჯამურზე, შევამციროთ
      if (withPictures > numValue) {
        setWithPictures(numValue);
        if (withPicturesRef.current) {
          withPicturesRef.current.value = numValue;
        }
      }
    } else if (id === "withPictures") {
      setWithPictures(numValue);
    }
  };

  // წყაროს არჩევა
  const handleSourceChange = (e) => {
    setSource(e.target.value);
  };

  // თემების ჩვენება/დამალვა
  const toggleThemesSelector = () => {
    setShowThemesSelector(prev => !prev);
  };

  // თემის არჩევა/გაუქმება
  const handleThemeToggle = (theme) => {
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        return prev.filter(t => t !== theme);
      } else {
        return [...prev, theme];
      }
    });
  };

  // წინადადებების გამოხმობა
  const fetchSentences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API-ს პარამეტრების მომზადება
      const params = {
        language: selectedLanguage,
        amount: amount,
        withPictures: withPictures,
        source: source,
        whatData: "sentencesForGame",
        userId: currentUser?._id,
        // themes: selectedThemes,
      };

      // წყარო
      if (source !== "all") {
        params.source = source;
      }
      // არჩეული თემები
      params.themes = selectedThemes.length > 0 ? selectedThemes.join('|') : '';
      // if (selectedThemes.length > 0) {
      //   params.themes = selectedThemes.join(",");
      // }
      // API-ს გამოძახება
      const response = await newRequest.get("/sentences", {
        params
      });
      console.log("Fetched sentences:", response.data);
      const textFromSentences = response.data.resultSentences.map(sentence => sentence.sentence).join(" ");
      console.log("Text from sentences:", textFromSentences);
      const wordsFromSentences = splitTextToWords(textFromSentences);
      console.log("Words from sentences:", wordsFromSentences);

      setGameData({
        wordsFromLexicon: response.data.translatedWords || [],
        chosenSentences: response.data.resultSentences || [],
        wordsFromSentences: wordsFromSentences || [],
      });
      setIsStarted(true);
    } catch (err) {
      console.error("Error fetching sentences:", err);
      setError("წინადადებების გამოხმობისას დაფიქსირდა შეცდომა. გთხოვთ, სცადოთ მოგვიანებით.");
    } finally {
      setIsLoading(false);
    }
  };

  // დამატებითი სთეითები სექციების გასაშლელად/დასამალად
  const [showStatistics, setShowStatistics] = useState(false);
  const [showGameParams, setShowGameParams] = useState(false);

  // სტატისტიკის სექციის ჩვენება/დამალვა
  const toggleStatistics = () => {
    setShowStatistics(prev => !prev);
  };

  // პარამეტრების სექციის ჩვენება/დამალვა
  const toggleGameParams = () => {
    setShowGameParams(prev => !prev);
  };

  const handleToggleGame = () => {
    if (!isStarted) {
      // თუ თამაში არ დაწყებულა, დაიწყოს
      fetchSentences();
    } else {
      setIsStarted(false);
    }
  };
  useEffect(() => {
    if(gameWon) {
      console.log("Game won!"); // ან სხვა ლოგიკა, რაც გსურთ თამაშის მოგებისას
      // Handle game won state
    }
  }, [gameWon]);

  return (
    <div className="sentencesPage">
      {!isLanguageSelected ? (
        <div className="languageSelectionContainer">
          <h1 className="pageTitle">წინადადებები</h1>

          <h2 className="sectionTitle">აირჩიეთ ენა</h2>

          {error && <div className="errorMessage">{error}</div>}

          <div className="languageSelectionForm">
            {/* <label htmlFor="language-select" className="selectLabel">ენა:</label> */}
            <div className="selectContainer">
              <select
                id="language-select"
                className="languageSelect"
                value={selectedLanguage}
                onChange={(e) => handleLanguageSelect(e.target.value)}
                disabled={isLoading}
              >
                <option value="" disabled>-- აირჩიეთ ენა --</option>
                {languages.map((language) => (
                  <option
                    key={language.id}
                    value={language.id}
                  >
                    {language.name}
                  </option>
                ))}
              </select>
              <div className="selectArrow">▼</div>
            </div>

            {selectedLanguage && !isLoading && !isLanguageSelected && (
              <button
                className="selectConfirmBtn"
                onClick={() => handleLanguageSelect(selectedLanguage)}
              >
                არჩევა
              </button>
            )}
          </div>

          {isLoading && (
            <div className="loadingIndicator">
              <div className="spinner"></div>
              <p>ენის შემოწმება...</p>
            </div>
          )}

          {/* <p className="helpText">
            აირჩიეთ ენა თამაშის დასაწყებად. თამაშის დროს გეჩვენებათ არჩეულ ენაზე წინადადებები.
          </p> */}
        </div>
      ) : (
        <div className="statsParamsContainer">
          <div className="sentencesHeader">
            <button
              className="backButton"
              onClick={() => setIsLanguageSelected(false)}
              aria-label="ენის არჩევანზე დაბრუნება"
            >
              <span className="backIcon">←</span>
            </button>
            <h1 className="pageTitle">წინადადებები</h1>
          </div>

          <h2 className="languageHeader">
            {languages.find(l => l.id === selectedLanguage)?.name}
          </h2>

          {error && <div className="errorMessage">{error}</div>}

          <section className="collapsibleSection">
            <button
              className="sectionToggleBtn"
              onClick={toggleGameParams}
              aria-expanded={showGameParams}
            >
              <span className="toggleIcon">{showGameParams ? '▼' : '►'}</span>
              <h3 className="sectionTitle">თამაშის პარამეტრები</h3>
            </button>

            {showGameParams && (
              <div className="sectionContent">
                <form className="paramsForm" onSubmit={(e) => e.preventDefault()}>
                  <div className="formGroup">
                    <div className="labelWithInput">
                      <label htmlFor="amount">
                        წინადადებების რაოდენობა:
                      </label>
                      <input
                        type="number"
                        id="amount-text"
                        min="1"
                        max={statistics?.totalCount || 10}
                        value={amount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 1 && value <= (statistics?.totalCount || 10)) {
                            setAmount(value);
                            // თუ სურათიანი წინადადებების რაოდენობა მეტია ჯამურზე, შევამციროთ
                            if (withPictures > value) {
                              setWithPictures(value);
                            }
                          }
                        }}
                        className="inlineNumberInput"
                      />
                    </div>
                    <div className="inputContainer">
                      <input
                        type="range"
                        id="amount"
                        min="1"
                        max={statistics?.totalCount || 10}
                        value={amount}
                        onChange={handleRangeChange}
                        className="rangeInput"
                        ref={amountRef}
                      />
                    </div>
                  </div>

                  <div className="formGroup">
                    <div className="labelWithInput">
                      <label htmlFor="withPictures">
                        სურათიანი წინადადებები:
                      </label>
                      <input
                        type="number"
                        id="withPictures-text"
                        min="0"
                        max={Math.min(amount, statistics?.withPicturesCount || 5)}
                        value={withPictures}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= Math.min(amount, statistics?.withPicturesCount || 5)) {
                            setWithPictures(value);
                          }
                        }}
                        className="inlineNumberInput"
                      />
                    </div>
                    <div className="inputContainer">
                      <input
                        type="range"
                        id="withPictures"
                        min="0"
                        max={Math.min(amount, statistics?.withPicturesCount || 5)}
                        value={withPictures}
                        onChange={handleRangeChange}
                        className="rangeInput"
                        ref={withPicturesRef}
                      />
                    </div>
                  </div>

                  <div className="formGroup">
                    <label>
                      საიდან ამოარჩიოს წინადადებები:
                    </label>
                    <div className="radioOptions">
                      <label className="radioOption">
                        <input
                          type="radio"
                          name="source"
                          value="all"
                          checked={source === "all"}
                          onChange={handleSourceChange}
                        />
                        <span className="radioLabel">ყველა</span>
                        {statistics && (
                          <span className="statBadge">{statistics.totalCount}</span>
                        )}
                      </label>

                      <label className="radioOption">
                        <input
                          type="radio"
                          name="source"
                          value="public"
                          checked={source === "public"}
                          onChange={handleSourceChange}
                          disabled={!statistics || statistics.publicCount === 0}
                        />
                        <span className="radioLabel">საჯარო</span>
                        {statistics && (
                          <span className="statBadge">{statistics.publicCount}</span>
                        )}
                      </label>

                      <label className="radioOption">
                        <input
                          type="radio"
                          name="source"
                          value="user"
                          checked={source === "user"}
                          onChange={handleSourceChange}
                          disabled={!statistics || statistics.userCount === 0}
                        />
                        <span className="radioLabel">ჩემი დამატებული</span>
                        {statistics && statistics.userCount > 0 && (
                          <span className="statBadge">{statistics.userCount}</span>
                        )}
                      </label>
                    </div>
                  </div>

                  {statistics && statistics.themeStats && Object.keys(statistics.themeStats).length > 0 && (
                    <div className="formGroup themesGroup">
                      <div className="themesHeader">
                        <button
                          type="button"
                          className="themesToggleBtn"
                          onClick={toggleThemesSelector}
                        >
                          {showThemesSelector ? "დამალე თემები" : "აირჩიე თემები"}
                          {selectedThemes.length > 0 && (
                            <span className="selectedCount">
                              (არჩეულია: {selectedThemes.length})
                            </span>
                          )}
                        </button>
                        {/* <span className="themesCount">
                          (სულ: {Object.keys(statistics.themeStats).length} თემა)
                        </span> */}
                      </div>

                      {showThemesSelector && (
                        <div className="themesCheckboxes">
                          {Object.entries(statistics.themeStats)
                            .sort(([, countA], [, countB]) => countB - countA)
                            .map(([theme, count]) => (
                              <label key={theme} className="themeCheckbox">
                                <input
                                  type="checkbox"
                                  name="themes"
                                  value={theme}
                                  checked={selectedThemes.includes(theme)}
                                  onChange={() => handleThemeToggle(theme)}
                                />
                                <span className="checkboxLabel">{theme}</span>
                                <span className="themeCount">{count}</span>
                                <div className="themeBar">
                                  <div
                                    className="themeProgress"
                                    style={{ width: `${(count / statistics.totalCount) * 100}%` }}
                                  ></div>
                                </div>
                              </label>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            )}
          </section>

          <button
            type="button"
            className="startGameBtn"
            onClick={handleToggleGame}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loadingText">
                <span className="spinnerSmall"></span>
                მოთხოვნა...
              </span>
            ) : (
              "თამაშის დაწყება"
            )}
          </button>
          {isStarted && (
            <GameSentences gameData={gameData} setGameWon={setGameWon} />
          )}
        </div>
      )}
    </div>
  );
}

export default Sentences;