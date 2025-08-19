import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./Video.scss";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import Game from "../../components/Game";
import TheWord from "../../components/theWord/TheWord";
import WordsTranslator from "../../components/wordsTranslator/WordsTranslator"; // ✅ ახალი import
import { useLanguage } from "../../context/LanguageContext";
import { use } from "react";
import GameWords from "../../components/GameWords/GameWords";

export default function Video() {
  // ✅ ოპტიმიზებული State
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(300);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gameData, setGameData] = useState();
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [click, setClick] = useState(0);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameError, setGameError] = useState(null);

  // ✅ Language Context
  // const { language} = useLanguage();
  console.log("gameData:", gameData);
  // ✅ Collapse/Expand States
  const [isTextCardsCollapsed, setIsTextCardsCollapsed] = useState(true);
  const [isGridCardsCollapsed, setIsGridCardsCollapsed] = useState(true);

  // ✅ კონსტანტები
  const MAX_SELECTED_WORDS = 99;
  
  const inputRef = useRef();
  const { id } = useParams();

  // ✅ ვიდეოს მონაცემების ჩატვირთვა
  const { isLoading, error, data } = useQuery({
    queryKey: ["video", id],
    refetchOnWindowFocus: false,
    queryFn: () =>
      newRequest.get(`/videodatas/single/${id}`).then((res) => res.data),
  });
  console.log("Video data:", data);

  const userId = data?.userId;

  // ✅ მომხმარებლის მონაცემების ჩატვირთვა
  const {
    isLoading: isLoadingUser,
    error: errorUser,
    data: dataUser,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  // ✅ დროის კონვერტაცია
  const timeToSeconds = useCallback((time) => {
    const arr = time.split(":");
    let seconds = 0;
    for (let i = 0; i < arr.length; i++) {
      const power = arr.length - i - 1;
      seconds += Number(arr[i]) * 60 ** power;
    }
    return seconds;
  }, []);

  // ✅ დროის ინტერვალის განახლება
  const handleSubmit = useCallback(() => {
    const timeInterval = inputRef.current?.value;
    if (!timeInterval) return;

    try {
      const [startStr, endStr] = timeInterval.split("-");
      const newStartTime = timeToSeconds(startStr);
      const newEndTime = timeToSeconds(endStr);
      
      if (newStartTime >= newEndTime) {
        alert("დასაწყისი დრო უნდა იყოს დასასრულზე ნაკლები");
        return;
      }

      setStartTime(newStartTime);
      setEndTime(newEndTime);
      setSelectedWords(new Set()); // არჩეული სიტყვების გასუფთავება
      setGameError(null);
      
      console.log(`⏱️ დრო განახლდა: ${startStr} - ${endStr}`);
    } catch (error) {
      alert("არასწორი დროის ფორმატი");
    }
  }, [timeToSeconds]);

  // console.log("Video component rendered", data.subs);
  // ✅ სუბტიტრების ტექსტის მომზადება
  const subtitleLines = useMemo(() => {
    if (!data?.subs || isLoading || !isLoaded) return [];

    try {
      const lines = data.subs;
      const choicedLines = lines.filter(
        (line) => startTime <= line.time && line.time < endTime
      );

      return choicedLines.map((line, index) => ({
        id: `sub-${line.time}-${index}`,
        time: line.time,
        text: line.line,
        words: line.line
          .toLowerCase()
          .replace(/[^\w\s']/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .filter(word => word.length > 1)
      }));
    } catch (error) {
      console.error("სუბტიტრების მომზადების შეცდომა:", error);
      return [];
    }
  }, [data?.subs, startTime, endTime, isLoading, isLoaded]);

  // ✅ უნიკალური სიტყვების გენერირება (Grid ბარათებისთვის)
  const wordsToChoose = useMemo(() => {
    if (!data?.subs || isLoading || !isLoaded) return [];

    try {
      const lines = data.subs;
      const choicedLines = lines.filter(
        (line) => startTime <= line.time && line.time < endTime
      );

      const wordsTemp = choicedLines
        .map((line) =>
          line.line
            .toLowerCase()
            .replace(/[^\w\s']/g, " ") // პუნქტუაციის მოშორება
            .replace(/\s+/g, " ")
            .trim()
            .split(" ")
        )
        .flat()
        .filter(word => word.length > 1) // მინიმუმ 2 სიმბოლო
        .filter((value, index, self) => self.indexOf(value) === index); // უნიკალური

      return wordsTemp.sort().map((word) => ({ theWord: word }));
    } catch (error) {
      console.error("სიტყვების გენერირების შეცდომა:", error);
      return [];
    }
  }, [data?.subs, startTime, endTime, isLoading, isLoaded]);

  // ✅ სიტყვის არჩევა ლიმიტით (Grid ბარათებისთვის)
  const clickHandler = useCallback((index) => {
    const word = wordsToChoose[index];
    if (!word) return;

    const wordText = word.theWord;
    const isCurrentlySelected = selectedWords.has(wordText);

    // ✅ თუ ამ ეტაპზე select-ი უნდა მოხდეს
    if (!isCurrentlySelected) {
      // ✅ ლიმიტის შემოწმება
      if (selectedWords.size >= MAX_SELECTED_WORDS) {
        alert(`მაქსიმუმ ${MAX_SELECTED_WORDS} სიტყვის არჩევა შეიძლება ერთ ჯერზე`);
        return;
      }

      // ✅ სიტყვის დამატება
      setSelectedWords(prev => new Set([...prev, wordText]));
      word.selected = true;
      
      console.log(`✅ Grid სიტყვა დაემატა: "${wordText}" (${selectedWords.size + 1}/${MAX_SELECTED_WORDS})`);
    } else {
      // ✅ სიტყვის მოშორება
      setSelectedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordText);
        return newSet;
      });
      word.selected = false;
      
      console.log(`❌ Grid სიტყვა მოიშორა: "${wordText}" (${selectedWords.size - 1}/${MAX_SELECTED_WORDS})`);
    }

    setClick(prev => prev + 1);
  }, [wordsToChoose, selectedWords]);

  // ✅ სუბტიტრების ტექსტიდან სიტყვის არჩევა
  const handleSubtitleWordClick = useCallback((wordText) => {
    const isCurrentlySelected = selectedWords.has(wordText);

    if (!isCurrentlySelected) {
      // ✅ ლიმიტის შემოწმება
      if (selectedWords.size >= MAX_SELECTED_WORDS) {
        alert(`მაქსიმუმ ${MAX_SELECTED_WORDS} სიტყვის არჩევა შეიძლება ერთ ჯერზე`);
        return;
      }

      // ✅ სიტყვის დამატება
      setSelectedWords(prev => new Set([...prev, wordText]));
      
      // ✅ Grid ბარათშიც განახლება
      const wordInGrid = wordsToChoose.find(w => w.theWord === wordText);
      if (wordInGrid) {
        wordInGrid.selected = true;
      }
      
      console.log(`✅ სუბტიტრიდან დაემატა: "${wordText}"`);
    } else {
      // ✅ სიტყვის მოშორება
      setSelectedWords(prev => {
        const newSet = new Set(prev);
        newSet.delete(wordText);
        return newSet;
      });
      
      // ✅ Grid ბარათშიც განახლება
      const wordInGrid = wordsToChoose.find(w => w.theWord === wordText);
      if (wordInGrid) {
        wordInGrid.selected = false;
      }
      
      console.log(`❌ სუბტიტრიდან მოიშორა: "${wordText}"`);
    }

    setClick(prev => prev + 1);
  }, [selectedWords, wordsToChoose]);

  // ✅ ყველა სიტყვის გასუფთავება
  const clearAllSelections = useCallback(() => {
    setSelectedWords(new Set());
    wordsToChoose.forEach(word => {
      word.selected = false;
    });
    setClick(prev => prev + 1);
    console.log("🗑️ ყველა არჩევანი გასუფთავდა");
  }, [wordsToChoose]);

  // ✅ სწრაფი არჩევა (პირველი N სიტყვა)
  const quickSelect = useCallback((count) => {
    const availableWords = wordsToChoose.slice(0, Math.min(count, MAX_SELECTED_WORDS));
    const newSelectedWords = new Set(availableWords.map(word => word.theWord));
    
    // ✅ ყველა სიტყვის reset
    wordsToChoose.forEach(word => {
      word.selected = newSelectedWords.has(word.theWord);
    });
    
    setSelectedWords(newSelectedWords);
    setClick(prev => prev + 1);
    
    console.log(`⚡ სწრაფი არჩევა: ${newSelectedWords.size} სიტყვა`);
  }, [wordsToChoose]);

  // ✅ ტექსტური ბარათების Toggle
  const toggleTextCards = useCallback(() => {
    setIsTextCardsCollapsed(prev => !prev);
    console.log(`📝 სუბტიტრები: ${!isTextCardsCollapsed ? 'ჩაკეცვა' : 'გაშლა'}`);
  }, [isTextCardsCollapsed]);

  // ✅ Grid ბარათების Toggle
  const toggleGridCards = useCallback(() => {
    setIsGridCardsCollapsed(prev => !prev);
    console.log(`🎯 Grid ბარათები: ${!isGridCardsCollapsed ? 'ჩაკეცვა' : 'გაშლა'}`);
  }, [isGridCardsCollapsed]);

  // ✅ თამაშის დაწყება
  const startGame = useCallback(async () => {
    if (selectedWords.size === 0) {
      alert("გთხოვთ აირჩიოთ სიტყვები");
      return;
    }

    setIsLoadingGame(true);
    setGameError(null);

    try {
      const wordsToTranslate = Array.from(selectedWords);
      const language = data?.language || "en";
      
      console.log(`🎮 თამაშის დაწყება: ${wordsToTranslate.length} სიტყვა`);

      // ✅ GET Method ლიმიტის გამო - შეზღუდული რაოდენობით
      const response = await newRequest.get(`/words/translate`, {
        params: {
          wordsToTranslate,
          language,
          test: "test",
          need: "translateWords",
        },
      });

      console.log("✅ თამაშის მონაცემები მიღებულია:", response.data);
      setGameData({words:response.data});
      setIsStarted(true);

    } catch (error) {
      console.error("❌ თამაშის დაწყების შეცდომა:", error);
      setGameError(error.response?.data?.message || "თამაშის მონაცემების მიღება ვერ მოხერხდა");
    } finally {
      setIsLoadingGame(false);
    }
  }, [selectedWords, data?.language]);

  // ✅ თამაშის გაჩერება
  const stopGame = useCallback(() => {
    setIsStarted(false);
    setGameData(undefined);
    setGameError(null);
    console.log("⏹️ თამაში გაჩერდა");
  }, []);

  // ✅ Initial load
  useEffect(() => {
    if (!isLoading && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoading, isLoaded]);

  // ✅ Loading State
  if (isLoading && !isLoaded) {
    return (
      <div className="video loading">
        <div className="loading-spinner">🔄 ვიდეო იტვირთება...</div>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="video error">
        <div className="error-message">
          ❌ ვიდეოს ჩატვირთვა ვერ მოხერხდა: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="video">
      <div className="video-container">
        {/* ✅ ვიდეოს Header */}
        <div className="video-header">
          <h1>{data.title}</h1>
          {dataUser && (
            <div className="video-author">
              <span>👤 მომხმარებელი: {dataUser.username}</span>
            </div>
          )}
        </div>

        <div className="sets">
          <div className="langar">
            {/* ✅ კონტროლის Panel */}
            <div className="choose-panel">
              {/* ✅ დროის არჩევა */}
              <div className="time-choose">
                <input
                  defaultValue="00:00:00-00:05:00"
                  className="input-interval"
                  ref={inputRef}
                  placeholder="00:00:00-00:05:00"
                />
                <input
                  type="submit"
                  className="input-interval submit-btn"
                  value="📅 დროის განახლება"
                  onClick={handleSubmit}
                />
              </div>

              {/* ✅ სტატისტიკა და ლიმიტის ინფორმაცია */}
              <div className="words-stats">
                <div className="stat-group">
                  <span className="stat-number">{wordsToChoose.length}</span>
                  <span className="stat-label">უნიკალური სიტყვა</span>
                </div>
                <div className="stat-group">
                  <span className="stat-number">{subtitleLines.length}</span>
                  <span className="stat-label">სუბტიტრი</span>
                </div>
                <div className="stat-group">
                  <span className={`stat-number ${selectedWords.size >= MAX_SELECTED_WORDS ? 'limit-reached' : ''}`}>
                    {selectedWords.size}
                  </span>
                  <span className="stat-label">არჩეული</span>
                </div>
                <div className="stat-group">
                  <span className="stat-number">{MAX_SELECTED_WORDS}</span>
                  <span className="stat-label">მაქსიმუმ</span>
                </div>
              </div>

              {/* ✅ ლიმიტის გაფრთხილება */}
              {selectedWords.size >= MAX_SELECTED_WORDS && (
                <div className="limit-warning">
                  ⚠️ მიღწეულია მაქსიმალური ლიმიტი ({MAX_SELECTED_WORDS} სიტყვა)
                </div>
              )}

              {/* ✅ სწრაფი კონტროლი */}
              <div className="quick-controls">
                <button
                  type="button"
                  onClick={() => quickSelect(10)}
                  className="quick-btn"
                  disabled={wordsToChoose.length === 0}
                >
                  ⚡ პირველი 10
                </button>
                <button
                  type="button"
                  onClick={() => quickSelect(25)}
                  className="quick-btn"
                  disabled={wordsToChoose.length === 0}
                >
                  ⚡ პირველი 25
                </button>
                <button
                  type="button"
                  onClick={() => quickSelect(50)}
                  className="quick-btn"
                  disabled={wordsToChoose.length === 0}
                >
                  ⚡ პირველი 50
                </button>
                <button
                  type="button"
                  onClick={clearAllSelections}
                  className="clear-btn"
                  disabled={selectedWords.size === 0}
                >
                  🗑️ გასუფთავება
                </button>
              </div>
            </div>

            {/* ✅ სუბტიტრების ტექსტი - Collapsible */}
            <div className={`text-cards-section ${isTextCardsCollapsed ? 'collapsed' : ''}`}>
              <div className="section-header" onClick={toggleTextCards}>
                <h3 className="section-title">📝 სუბტიტრების ტექსტი</h3>
                <button 
                  type="button" 
                  className="collapse-toggle"
                  title={isTextCardsCollapsed ? "გაშლა" : "ჩაკეცვა"}
                >
                  {isTextCardsCollapsed ? '▶️' : '🔽'}
                </button>
              </div>
              
              <div className={`text-cards-content ${isTextCardsCollapsed ? 'hidden' : 'visible'}`}>
                <div className="subtitle-lines">
                  {subtitleLines.length > 0 ? (
                    subtitleLines.map((subtitle) => (
                      <div key={subtitle.id} className="subtitle-line">
                        <div className="subtitle-time">
                          {/* {Math.floor(subtitle.time / 60)}:{(subtitle.time % 60).toString().padStart(2, '0')} */}
                        </div>
                        <div className="subtitle-text">
                          {subtitle.text.split(/(\s+)/).map((part, index) => {
                            // თუ ეს არის space, უბრალოდ დავაბრუნოთ
                            if (/^\s+$/.test(part)) {
                              return <span key={index}>{part}</span>;
                            }
                            
                            // სიტყვის გასუფთავება
                            const cleanWord = part
                              .toLowerCase()
                              .replace(/[^\w']/g, "");
                            
                            // თუ სიტყვა ძალიან მოკლეა ან ცარიელია
                            if (cleanWord.length <= 1) {
                              return <span key={index}>{part}</span>;
                            }
                            
                            const isSelected = selectedWords.has(cleanWord);
                            const isDisabled = selectedWords.size >= MAX_SELECTED_WORDS && !isSelected;
                            
                            return (
                              <span
                                key={index}
                                className={`subtitle-word ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => handleSubtitleWordClick(cleanWord)}
                                title={
                                  isDisabled 
                                    ? `მაქსიმალური ლიმიტი (${MAX_SELECTED_WORDS}) მიღწეულია`
                                    : isSelected 
                                    ? "მოშორება" 
                                    : "არჩევა"
                                }
                              >
                                {part}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-subtitles">
                      😔 არჩეულ დროის ინტერვალში სუბტიტრები ვერ მოიძებნა
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Grid სიტყვების არჩევა - Collapsible */}
            <div className={`grid-words-section ${isGridCardsCollapsed ? 'collapsed' : ''}`}>
              <div className="section-header" onClick={toggleGridCards}>
                <h3 className="section-title">🎯 უნიკალური სიტყვები (Grid)</h3>
                <button 
                  type="button" 
                  className="collapse-toggle"
                  title={isGridCardsCollapsed ? "გაშლა" : "ჩაკეცვა"}
                >
                  {isGridCardsCollapsed ? '▶️' : '🔽'}
                </button>
              </div>

              <div className={`grid-cards-content ${isGridCardsCollapsed ? 'hidden' : 'visible'}`}>
                <div className="words">
                  {wordsToChoose.map((word, index) => (
                    <div
                      key={`grid-card-${word.theWord}-${index}`}
                      className={`word ${selectedWords.has(word.theWord) ? "selected" : ""} ${
                        selectedWords.size >= MAX_SELECTED_WORDS && !selectedWords.has(word.theWord) 
                          ? "disabled" 
                          : ""
                      }`}
                      onClick={() => clickHandler(index)}
                      title={
                        selectedWords.size >= MAX_SELECTED_WORDS && !selectedWords.has(word.theWord)
                          ? `მაქსიმალური ლიმიტი (${MAX_SELECTED_WORDS}) მიღწეულია`
                          : selectedWords.has(word.theWord)
                          ? "მოშორება"
                          : "არჩევა"
                      }
                    >
                      <div className="word-text">{word.theWord}</div>
                      {selectedWords.has(word.theWord) && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  ))}

                  {/* ✅ Empty State Grid-ისთვის */}
                  {wordsToChoose.length === 0 && (
                    <div className="no-words">
                      <p>😔 არჩეულ დროის ინტერვალში სიტყვები ვერ მოიძებნა</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ ახალი - სიტყვების ბაზაში შემოწმება */}
            <WordsTranslator 
              selectedWords={selectedWords}
              language={data?.language || 'en'}
              userId={userId}
            />

            {/* ✅ თამაშის კონტროლი */}
            <div className="start-button">
              {!isStarted ? (
                <button
                  onClick={startGame}
                  disabled={selectedWords.size === 0 || isLoadingGame}
                  className="game-control-btn start"
                >
                  {isLoadingGame ? (
                    <>🔄 თამაში იწყება...</>
                  ) : (
                    <>🎮 თამაშის დაწყება ({selectedWords.size} სიტყვა)</>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopGame}
                  className="game-control-btn stop"
                >
                  ⏹️ თამაშის გაჩერება
                </button>
              )}

              {gameError && (
                <div className="game-error">
                  <span className="error-message">❌ {gameError}</span>
                </div>
              )}
            </div>
          </div>

          {/* ✅ თამაში */}
          {isStarted && gameData && (
            <div className="game-section">
              <GameWords gameData={gameData} />
            </div>
          )}
        </div>

        {/* ✅ ვიდეო Player */}
        <div className="video-player">
          <iframe
            width="800"
            height="450"
            src={data.videoUrl}
            title={data.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}