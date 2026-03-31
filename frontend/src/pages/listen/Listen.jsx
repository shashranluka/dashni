import { useState, useEffect, useRef, useMemo } from 'react'
import newRequest from '../../utils/newRequest'
import AnkiGame from '../../components/AnkiLikeGame/AnkiLikeGame'
import MessyDictionary from '../../components/messyDictionary/MessyDictionary'
import GameWords from '../../components/GameWords/GameWords'
import WordSelector from '../../components/WordSelector/WordSelector'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'
import './Listen.scss'

function Listen() {
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedWords, setSelectedWords] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isComposeMode, setIsComposeMode] = useState(false)
  const [composeCards, setComposeCards] = useState([])
  const [composeBoardWords, setComposeBoardWords] = useState([])
  const [usedComposeCardIds, setUsedComposeCardIds] = useState([])
  const [direction, setDirection] = useState("translation-to-word")
  const [gameType, setGameType] = useState("cards")
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [manualSelectedWords, setManualSelectedWords] = useState([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectorSettings, setSelectorSettings] = useState({
    selectionMode: "sequential",
    wordCount: 0,
    direction: "translation-to-word",
    gameType: "cards",
  })

  const hasFetched = useRef(false)
  const audiofilePath = useRef("src/assets/audio_files/adas_mier_moyolili_zghapari.m4a")
  const clearSoundRef = useRef(null)

  useEffect(() => {
    const fetchAudioData = async () => {
      if (hasFetched.current) return
      hasFetched.current = true

      try {
        const response = await newRequest.get('/audio')
        setGameData(response.data)

        // თავიდან ავტომატურად აირჩიოს პირველი სეგმენტი
        const firstSegment = response?.data?.segments?.[0] ?? null
        setSelectedSegment(firstSegment)

        console.log('Fetched audio data:', response.data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchAudioData()
  }, [])

  useEffect(() => {
    clearSoundRef.current = new Audio('/sounds/clear.mp3')
    clearSoundRef.current.preload = 'auto'

    return () => {
      if (!clearSoundRef.current) return
      clearSoundRef.current.pause()
      clearSoundRef.current.currentTime = 0
    }
  }, [])

  useEffect(() => {
    if (isSoundEnabled || !clearSoundRef.current) return

    clearSoundRef.current.pause()
    clearSoundRef.current.currentTime = 0
  }, [isSoundEnabled])

  const getShuffledWords = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleStartGame = () => {
    let words = []

    if (selectorSettings.selectionMode === "sequential") {
      words = wordsForGame.slice(0, Math.min(selectorSettings.wordCount, wordsForGame.length))
    } else if (selectorSettings.selectionMode === "random") {
      const shuffled = [...wordsForGame].sort(() => Math.random() - 0.5)
      words = shuffled.slice(0, Math.min(selectorSettings.wordCount, wordsForGame.length))
    } else if (selectorSettings.selectionMode === "manual") {
      words = manualSelectedWords
    }

    if (!words.length) return

    setSelectedWords(words);
    setDirection(selectorSettings.direction);
    setGameType(selectorSettings.gameType);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setIsSettingsOpen(false);
    setGameStarted(true);
  };

  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setManualSelectedWords([]);
    setGameStarted(false); // Reset game when changing segment
  };

  const handleSettingsChange = (nextSettings) => {
    setSelectorSettings(nextSettings)
  }

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev) => {
      const nextIsOpen = !prev

      if (nextIsOpen) {
        setIsComposeMode(false)
        setGameStarted(false)
      }

      return nextIsOpen
    })
  }

  const handleManualWordToggle = (word) => {
    const wordId = word?.the_word || word?.word
    if (!wordId) return

    setManualSelectedWords((prev) => {
      const isSelected = prev.some((w) => (w.the_word || w.word) === wordId)
      if (isSelected) {
        return prev.filter((w) => (w.the_word || w.word) !== wordId)
      }
      return [...prev, word]
    })
  }

  const normalizeWord = (value = '') =>
    value
      .toString()
      .toLowerCase()
      .replace(/[.,!?;:"()\-_/\\[\]{}…]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const segmentWordCounts = useMemo(() => {
    if (!Array.isArray(gameData?.segments) || !Array.isArray(gameData?.words)) {
      return new Map();
    }

    return new Map(
      gameData.segments.map((segment) => {
        // 1) ამოვიღოთ სიტყვები ამ სეგმენტის ტექსტიდან
        const segmentWordSet = new Set(
          normalizeWord(segment.text)
            .split(' ')
            .filter(Boolean)
        );

        // 2) დავითვალოთ რამდენი უნიკალური სიტყვაა gameData.words-ში
        const matchedWords = gameData.words.filter((wordObj) => {
          const candidateWords = [
            wordObj?.the_word,
            wordObj?.word,
            wordObj?.lemma,
            wordObj?.base_word,
          ]
            .map(normalizeWord)
            .filter(Boolean);

          return candidateWords.some((w) => segmentWordSet.has(w));
        });

        return [segment.id, matchedWords.length];
      })
    );
  }, [gameData?.segments, gameData?.words]);

  const wordsForGame = useMemo(() => {
    if (!selectedSegment?.text || !Array.isArray(gameData?.words)) {
      return [];
    }

    const segmentWordSet = new Set(
      normalizeWord(selectedSegment.text)
        .split(' ')
        .filter(Boolean)
    );

    return gameData.words.filter((wordObj) => {
      const candidateWords = [
        wordObj?.the_word,
        wordObj?.word,
        wordObj?.lemma,
        wordObj?.base_word,
      ]
        .map(normalizeWord)
        .filter(Boolean);

      return candidateWords.some((w) => segmentWordSet.has(w));
    });
  }, [selectedSegment?.text, gameData?.words]);

  const wordsForCompose = useMemo(() => {
    if (!selectedSegment?.text) {
      return [];
    }

    return selectedSegment.text
      .split(/\s+/)
      .map((word) =>
        word
          .trim()
          .replace(/^[.,!?;:"()\-_/\\[\]{}…]+|[.,!?;:"()\-_/\\[\]{}…]+$/g, "")
      )
      .filter(Boolean);
  }, [selectedSegment?.text]);

  const handleComposeMode = () => {
    if (!wordsForCompose.length) return;
    const composeWordsWithIds = wordsForCompose.map((word, index) => ({
      id: `${index}-${word}`,
      text: word,
    }));

    setComposeCards(getShuffledWords(composeWordsWithIds));
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setSelectedWords(null);
    setIsSettingsOpen(false);
    setGameStarted(false);
    setIsComposeMode(true);
  };

  const handleComposeCardClick = (card) => {
    if (!card || usedComposeCardIds.includes(card.id)) return;

    setComposeBoardWords((prev) => [...prev, card.text]);
    setUsedComposeCardIds((prev) => [...prev, card.id]);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled((prev) => !prev)
  }

  const playClearSound = () => {
    if (!isSoundEnabled || !clearSoundRef.current) return;

    clearSoundRef.current.currentTime = 0;
    clearSoundRef.current.play().catch(() => { });
  };

  const handleComposeClearBoard = () => {
    if (!composeBoardWords.length) return;

    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    playClearSound();
  };

  useEffect(() => {
    setManualSelectedWords([])
  }, [wordsForGame])


  console.log('Selected segment:', selectedSegment);
  console.log('Words for game:', wordsForGame);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="listen-page">
      <h1>ადას მიერ მოყოლილი ზღაპარი</h1>
      {/* {gameData && gameData.audioData && gameData.audioData[0] && ( */}
      <div className="audio-section">
        <AudioPlayer
          src={audiofilePath.current}
          segments={gameData?.segments || []}
          startTime={selectedSegment?.time}
        />
      </div>
      {/* // )} */}
      {gameData && gameData.words && (
        <>
          <h2 className="segment-info-title">
            ეპიზოდი {selectedSegment?.id ?? '-'} - სიტყვების რაოდენობა: {wordsForGame.length}
          </h2>
          {!selectedSegment ? (
            <div style={{
              padding: '15px',
              margin: '20px 0',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '16px'
            }}>
              აირჩიე ეპიზოდი ზემოთ მოცემული ღილაკებიდან სათამაშოდ სიტყვების ასარჩევად
            </div>
          ) : null}

          <div className="listen-action-buttons">
            <button
              type="button"
              className="compose-text-btn"
              onClick={handleComposeMode}
              disabled={!wordsForCompose.length}
            >
              ტექსტი
            </button>

            <button
              type="button"
              className={`settings-toggle-btn${isSettingsOpen ? ' is-open' : ''}`}
              onClick={handleSettingsToggle}
              aria-expanded={isSettingsOpen}
              aria-controls="word-selector-settings"
            >
              პარამეტრები
            </button>

            <button
              type="button"
              className="start-game-btn"
              onClick={handleStartGame}
              disabled={
                wordsForGame.length === 0 ||
                (selectorSettings.selectionMode === 'manual' && manualSelectedWords.length === 0)
              }
            >
              თამაში
            </button>

            <button
              type="button"
              className={`sound-toggle-btn${isSoundEnabled ? '' : ' muted'}`}
              onClick={handleToggleSound}
              aria-label={isSoundEnabled ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
              title={isSoundEnabled ? 'ხმის გამორთვა' : 'ხმის ჩართვა'}
            >
              <span aria-hidden="true">{isSoundEnabled ? '🔊' : '🔇'}</span>
            </button>
          </div>

          {!isComposeMode && !gameStarted && (
            <WordSelector
              allWords={wordsForGame}
              onSettingsChange={handleSettingsChange}
              isOpen={isSettingsOpen}
              settingsTopContent={gameData?.segments ? (
                <label className="compact-field">
                  <span>ეპიზოდი:</span>
                  <select
                    value={selectedSegment?.id ?? ""}
                    onChange={(e) => {
                      const seg = gameData.segments.find((s) => String(s.id) === e.target.value);
                      if (seg) handleSegmentSelect(seg);
                    }}
                  >
                    {gameData.segments.map((segment) => {
                      const wordCount = segmentWordCounts.get(segment.id) ?? 0;
                      return (
                        <option key={segment.id} value={segment.id}>
                          ეპიზოდი {segment.id} ({wordCount}) სიტყვა
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
            />
          )}

          {!isComposeMode && !gameStarted && selectorSettings.selectionMode === 'manual' && (
            <div className="listen-word-cards">
              <p>აირჩიეთ სიტყვები ({manualSelectedWords.length} არჩეული):</p>
              <div className="cards-grid">
                {wordsForGame.map((word, index) => {
                  const wordId = word.the_word || word.word;
                  const isSelected = manualSelectedWords.some((w) => (w.the_word || w.word) === wordId);
                  const displayText = selectorSettings.direction === "translation-to-word"
                    ? word.translation
                    : word.the_word;

                  return (
                    <div
                      key={index}
                      className={`word-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleManualWordToggle(word)}
                    >
                      <div className="word">{displayText}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isComposeMode ? (
            <div className="game-section compose-section">
              <div className="compose-board">
                <div className="compose-board-header">
                  <div className="compose-board-label">ტექსტის დაფა</div>
                  <button
                    type="button"
                    className="compose-clear-btn"
                    onClick={handleComposeClearBoard}
                    disabled={!composeBoardWords.length}
                  >
                    გასუფთავება
                  </button>
                </div>
                <div className="compose-board-content">
                  {composeBoardWords.length > 0
                    ? composeBoardWords.join(' ')
                    : 'ტექსტის ასაწყობად დააწკაპუნე ქვემოთ მოცემულ ბარათებზე'}
                </div>
              </div>

              {composeCards.length > 0 ? (
                <div className="compose-cards-grid">
                  {composeCards.map((card) => (
                    <button
                      type="button"
                      key={card.id}
                      className={`compose-word-card ${usedComposeCardIds.includes(card.id) ? 'used' : ''}`}
                      onClick={() => handleComposeCardClick(card)}
                    >
                      {card.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="compose-empty">ამ ეპიზოდისთვის სიტყვები ვერ მოიძებნა.</div>
              )}
            </div>
          ) : gameStarted ? (
            <div className="game-section">
              <MessyDictionary
                words={selectedWords}
                direction={direction}
                gameType={gameType}
                isSoundEnabled={isSoundEnabled}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default Listen