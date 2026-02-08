import { useState, useEffect, useRef } from 'react'
import newRequest from '../../utils/newRequest'
import AnkiGame from '../../components/AnkiLikeGame/AnkiLikeGame'
import MessyDictionary from '../../components/messyDictionary/MessyDictionary'
import GameWords from '../../components/GameWords/GameWords'
import WordSelector from '../../components/WordSelector/WordSelector'
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer'

function Listen() {
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedWords, setSelectedWords] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [direction, setDirection] = useState("translation-to-word")
  const hasFetched = useRef(false)

  useEffect(() => {
    const fetchAudioData = async () => {
      if (hasFetched.current) return
      hasFetched.current = true

      try {
        const response = await newRequest.get('/audio')
        setGameData(response.data)
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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="listen-page">
      <h1>ადას მიერ მოყოლილი ზღაპარი</h1>
      {gameData && gameData.audioData && gameData.audioData[0] && (
        <div className="audio-section">
          <AudioPlayer src={gameData.audioData[0].file_path} />
        </div>
      )}
      {gameData && gameData.words && (
        <>
          {!gameStarted ? (
            <WordSelector 
              allWords={gameData.words} 
              onStartGame={handleStartGame}
            />
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