import React, { useState, useEffect, useRef } from "react";
import "./Sentences.scss";
import newRequest from "../../utils/newRequest";
import GameSentences from "../../components/gameSentences/GameSentences";
import getCurrentUser from "../../utils/getCurrentUser";
import { splitTextToWords } from "../../utils/tools";
import { useLanguage } from "../../context/LanguageContext";

function Sentences() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [gameData, setGameData] = useState({});
  const [gameWon, setGameWon] = useState(false);
  const [error, setError] = useState(null);
  const currentUser = getCurrentUser();
  const [statistics, setStatistics] = useState(null);
  const [amount, setAmount] = useState(5);
  const [withPictures, setWithPictures] = useState(2);
  const [source, setSource] = useState("all");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [showThemesSelector, setShowThemesSelector] = useState(false);
  const amountRef = useRef(null);
  const withPicturesRef = useRef(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showGameParams, setShowGameParams] = useState(true);

  const languages = [
    { id: "ba", name: "თუშური" },
    { id: "en", name: "ინგლისური" },
    { id: "de", name: "გერმანული" },
    { id: "es", name: "ესპანური" },
    { id: "fr", name: "ფრანგული" },
    { id: "sx", name: "სხვა" },
  ];

  useEffect(() => {
    if (language) {
      fetchLanguageStatistics(language);
    }
  }, [language]);

  const fetchLanguageStatistics = async (langId) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await newRequest.get("/sentences", {
        params: {
          language: langId,
          whatData: "languageDataInfo",
          userId: currentUser?._id,
        },
      });

      if (response.data && response.data.totalCount > 0) {
        setStatistics(response.data);

        setAmount(Math.min(5, response.data.totalCount));
        setWithPictures(Math.min(2, response.data.withPicturesCount));
      } else {
        const langName =
          languages.find((l) => l.id === langId)?.name || langId;
        setError(`არჩეულ ენაზე (${langName}) წინადადებები არ მოიძებნა.`);
      }
    } catch (err) {
      console.error("Error checking language availability:", err);
      setError("შეცდომა ენის შემოწმებისას. გთხოვთ, სცადოთ მოგვიანებით.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRangeChange = (e) => {
    const { id, value } = e.target;
    const numValue = parseInt(value, 10);

    if (id === "amount") {
      setAmount(numValue);

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

  const handleSourceChange = (e) => {
    setSource(e.target.value);
  };

  const toggleThemesSelector = () => {
    setShowThemesSelector((prev) => !prev);
  };

  const handleThemeToggle = (theme) => {
    setSelectedThemes((prev) => {
      if (prev.includes(theme)) {
        return prev.filter((t) => t !== theme);
      } else {
        return [...prev, theme];
      }
    });
  };

  const fetchSentences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        language: language,
        amount: amount,
        withPictures: withPictures,
        source: source,
        whatData: "sentencesForGame",
        userId: currentUser?._id,
      };

      if (source !== "all") {
        params.source = source;
      }
      params.themes = selectedThemes.length > 0 ? selectedThemes.join("|") : "";

      const response = await newRequest.get("/sentences", {
        params,
      });
      console.log("Fetched sentences:", response.data);
      const textFromSentences = response.data.resultSentences
        .map((sentence) => sentence.sentence)
        .join(" ");
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

  const toggleStatistics = () => {
    setShowStatistics((prev) => !prev);
  };

  const toggleGameParams = () => {
    setShowGameParams((prev) => !prev);
  };

  const handleToggleGame = () => {
    if (!isStarted) {
      fetchSentences();
    } else {
      setIsStarted(false);
    }
  };

  useEffect(() => {
    if (gameWon) {
      console.log("Game won!");
    }
  }, [gameWon]);

  const getLanguageName = (code) => {
    return languages.find((l) => l.id === code)?.name || code;
  };

  return (
    <div className="sentencesPage">
      <div className="statsParamsContainer">
        <div className="sentencesHeader">
          <h1 className="pageTitle">წინადადებები</h1>
        </div>

        <h2 className="languageHeader">{getLanguageName(language)}</h2>

        {error && <div className="errorMessage">{error}</div>}

        {isLoading && !statistics && (
          <div className="loadingIndicator">
            <div className="spinner"></div>
            <p>მონაცემების ჩატვირთვა...</p>
          </div>
        )}

        {statistics && (
          <>
            <section className="collapsibleSection">
              <button
                className="sectionToggleBtn"
                onClick={toggleGameParams}
                aria-expanded={showGameParams}
              >
                <span className="toggleIcon">
                  {showGameParams ? "▼" : "►"}
                </span>
                <h3 className="sectionTitle">თამაშის პარამეტრები</h3>
              </button>

              {showGameParams && (
                <div className="sectionContent">
                  <form className="paramsForm" onSubmit={(e) => e.preventDefault()}>
                    <div className="formGroup">
                      <div className="labelWithInput">
                        <label htmlFor="amount">წინადადებების რაოდენობა:</label>
                        <input
                          type="number"
                          id="amount-text"
                          min="1"
                          max={statistics?.totalCount || 10}
                          value={amount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (
                              !isNaN(value) &&
                              value >= 1 &&
                              value <= (statistics?.totalCount || 10)
                            ) {
                              setAmount(value);
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
                        <label htmlFor="withPictures">სურათიანი წინადადებები:</label>
                        <input
                          type="number"
                          id="withPictures-text"
                          min="0"
                          max={Math.min(amount, statistics?.withPicturesCount || 5)}
                          value={withPictures}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (
                              !isNaN(value) &&
                              value >= 0 &&
                              value <= Math.min(amount, statistics?.withPicturesCount || 5)
                            ) {
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
                      <label>საიდან ამოარჩიოს წინადადებები:</label>
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
              ) : isStarted ? (
                "თამაშის დასრულება"
              ) : (
                "თამაშის დაწყება"
              )}
            </button>
          </>
        )}

        {isStarted && (
          <GameSentences gameData={gameData} setGameWon={setGameWon} />
        )}
      </div>
    </div>
  );
}

export default Sentences;