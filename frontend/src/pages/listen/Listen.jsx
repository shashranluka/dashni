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
  const [selectedSegment, setSelectedSegment] = useState(null);

  const hasFetched = useRef(false)
  const audiofilePath = useRef("src/assets/audio_files/adas_mier_moyolili_zghapari.m4a")

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

  const getShuffledWords = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleStartGame = (words, gameDirection, selectedGameType) => {
    setSelectedWords(words);
    setDirection(gameDirection);
    setGameType(selectedGameType);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setGameStarted(true);
  };

  const handleBackToSelection = () => {
    setGameStarted(false);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setSelectedWords(null);
  };

  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
    setGameStarted(false); // Reset game when changing segment
  };

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
    setGameStarted(false);
    setIsComposeMode(true);
  };

  const handleComposeCardClick = (card) => {
    if (!card || usedComposeCardIds.includes(card.id)) return;

    setComposeBoardWords((prev) => [...prev, card.text]);
    setUsedComposeCardIds((prev) => [...prev, card.id]);
  };

  const handleComposeBack = () => {
    setIsComposeMode(false);
    setComposeCards([]);
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
  };

  const handleComposeClearBoard = () => {
    setComposeBoardWords([]);
    setUsedComposeCardIds([]);
  };


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
      {gameData && gameData.segments && (
        <div className="segments-section">
          <h2>აირჩიეთ ეპიზოდი:</h2>
          <div className="segments">
            {gameData.segments.map((segment) => {
              const wordCount = segmentWordCounts.get(segment.id) ?? 0;

              return (
                <button
                  key={segment.id}
                  className={`segment-button ${selectedSegment?.id === segment.id ? 'selected' : ''}`}
                  onClick={() => handleSegmentSelect(segment)}
                >
                  <div className="segment-label">{segment.id}</div>
                  <div className="segment-word-count">({wordCount})</div>
                  {/* <div className="segment-tooltip">{segment.text}</div> */}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {gameData && gameData.words && (
        <>
          {isComposeMode ? (
            <div className="game-section compose-section">
              <button onClick={handleComposeBack} style={{ margin: '10px' }}>
                უკან დაბრუნება
              </button>

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
                    : 'დააჭირე ბარათებს და სიტყვები აქ გამოჩნდება'}
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
          ) : !gameStarted ? (
            <>
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
              ) : (
                <div className="segment-info">
                  <h2 className="segment-info-title">
                    ეპიზოდი {selectedSegment.id} - სიტყვების რაოდენობა: {wordsForGame.length}
                  </h2>
                  <button
                    type="button"
                    className="compose-text-btn"
                    onClick={handleComposeMode}
                    disabled={!wordsForCompose.length}
                  >
                    ტექსტის შედგენა
                  </button>
                  {/* <p className="segment-info-subtitle">
                    აირჩიეთ სიტყვები ამ ეპიზოდიდან თამაშისთვის
                  </p> */}
                </div>
              )}

              <WordSelector
                allWords={wordsForGame}
                onStartGame={handleStartGame}
                selectedSegmentId={selectedSegment?.id}
              />
            </>
          ) : (
            <div className="game-section">
              <button onClick={handleBackToSelection} style={{ margin: '10px' }}>
                უკან დაბრუნება
              </button>
              <MessyDictionary
                words={selectedWords}
                direction={direction}
                gameType={gameType}
              />
            </div>

          )}
        </>
      )}
    </div>
  )
}

export default Listen