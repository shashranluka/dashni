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
  const [direction, setDirection] = useState("translation-to-word")
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

  const handleStartGame = (words, gameDirection) => {
    setSelectedWords(words);
    setDirection(gameDirection);
    setGameStarted(true);
  };

  const handleBackToSelection = () => {
    setGameStarted(false);
    setSelectedWords(null);
  };

  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
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
    if (!Array.isArray(gameData?.segments)) return new Map();

    const countWords = (text = '') =>
      text
        .toLowerCase()
        .replace(/[.,!?;:"()-]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

    return new Map(
      gameData.segments.map((segment) => [segment.id, countWords(segment.text)])
    );
  }, [gameData?.segments]);

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
          <h2>სეგმენტები:</h2>
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
          {!gameStarted ? (
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
                  აირჩიე სეგმენტი ზემოთ მოცემული ღილაკებიდან სათამაშოდ სიტყვების ასარჩევად
                </div>
              ) : (
                <div className="segment-info">
                  <h2 className="segment-info-title">
                    სეგმენტი {selectedSegment.id} - სიტყვების რაოდენობა: {wordsForGame.length}
                  </h2>
                  <p className="segment-info-subtitle">
                    აირჩიეთ სიტყვები ამ სეგმენტიდან თამაშისთვის ან შეცვალეთ სეგმენტი ზემოთ მოცემული ღილაკებიდან
                  </p>
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
              <MessyDictionary words={selectedWords} direction={direction} />
            </div>

          )}
        </>
      )}
    </div>
  )
}

export default Listen