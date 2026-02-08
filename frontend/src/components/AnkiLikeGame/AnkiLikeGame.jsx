import { useState, useEffect } from 'react'
import './AnkiLikeGame.scss'

function AnkiLikeGame({ words }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isRandom, setIsRandom] = useState(false)
  const [displayWords, setDisplayWords] = useState([])

  useEffect(() => {
    if (words && words.length > 0) {
      setDisplayWords([...words])
    }
  }, [words])

  if (!words || words.length === 0) {
    return <div className="anki-like-game">No words available</div>
  }

  const currentWord = displayWords[currentIndex] || words[0]

  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const handleToggleRandom = () => {
    const newIsRandom = !isRandom
    setIsRandom(newIsRandom)
    
    if (newIsRandom) {
      setDisplayWords(shuffleArray(words))
    } else {
      setDisplayWords([...words])
    }
    
    setCurrentIndex(0)
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setScore(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const correct = userAnswer.trim().toLowerCase() === currentWord.translation.toLowerCase()
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < displayWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setShowResult(false)
      setIsCorrect(false)
    }
  }

  const handleRestart = () => {
    if (isRandom) {
      setDisplayWords(shuffleArray(words))
    }
    setCurrentIndex(0)
    setUserAnswer('')
    setScore(0)
    setShowResult(false)
    setIsCorrect(false)
  }

  const isGameFinished = currentIndex === displayWords.length - 1 && showResult

  return (
    <div className="anki-like-game">
      <div className="game-header">
        <h2>სიტყვების გამოცნობა</h2>
        <div className="mode-toggle">
          <div className="toggle-container">
            <span className={`toggle-label ${!isRandom ? 'active' : ''}`}>📋 მიმდევრობით</span>
            <div className="toggle-switch" onClick={handleToggleRandom}>
              <div className={`toggle-slider ${isRandom ? 'random' : 'sequential'}`}></div>
            </div>
            <span className={`toggle-label ${isRandom ? 'active' : ''}`}>🔀 შემთხვევითი</span>
          </div>
        </div>
        <div className="score">
          ქულა: {score} / {displayWords.length || words.length}
        </div>
        <div className="progress">
          სიტყვა {currentIndex + 1} / {displayWords.length || words.length}
        </div>
      </div>

      <div className="game-content">
        <div className="word-display">
          <h3>თარგმნე სიტყვა:</h3>
          <p className="word">{currentWord.translation}</p>
          {/* {currentWord.file_path && (
            <audio controls src={currentWord.file_path} className="word-audio">
              Your browser does not support the audio element.
            </audio>
          )} */}
        </div>

        {!showResult ? (
          <form onSubmit={handleSubmit} className="answer-form">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="შეიყვანე უცხო სიტყვა..."
              autoFocus
              className="answer-input"
            />
            <button type="submit" className="submit-btn">
              შემოწმება
            </button>
          </form>
        ) : (
          <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
            <p className="result-message">
              {isCorrect ? '✓ სწორია!' : '✗ არასწორია'}
            </p>
            {!isCorrect && (
              <p className="correct-answer">
                სწორი პასუხი: <strong>{currentWord.translation}</strong>
              </p>
            )}
            
            {isGameFinished ? (
              <div className="game-finished">
                <h3>თამაში დასრულდა!</h3>
                <p>საბოლოო ქულა: {score} / {displayWords.length || words.length}</p>
                <button onClick={handleRestart} className="restart-btn">
                  თავიდან დაწყება
                </button>
              </div>
            ) : (
              <button onClick={handleNext} className="next-btn">
                შემდეგი სიტყვა
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnkiLikeGame
