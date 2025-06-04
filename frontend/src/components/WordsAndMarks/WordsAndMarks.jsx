import { useEffect, useState } from "react";
import "./WordsAndMarks.scss";

export default function WordsAndMarks(props) {
  const { sentencesData, points, setPoints, tries, setTries, setPartOfGame } = props;

  // მომხმარებლის არჩეული ელემენტები - ინახავს მხოლოდ ინდექსებს
  const [clickedWord, setClickedWord] = useState(null);
  const [clickedMark, setClickedMark] = useState(null);

  // თამაშის მთავარი მონაცემები
  const [wordsWithMarks, setWordsWithMarks] = useState([]);
  const [marks, setMarks] = useState([]);

  // საწყისი მონაცემების მომზადება
  useEffect(() => {
    // სიტყვების მომზადება - უბრალოდ ვიყენებთ არსებულ თვისებებს
    const words = sentencesData
      .map((el) => el.words)
      .sort(() => 0.5 - Math.random())
      .flat();
    
    setWordsWithMarks(words);
    
    // სასვენი ნიშნების მომზადება - მხოლოდ რაც გვჭირდება
    const allMarks = [];
    words.forEach((word) => {
      if (word.mark) {
        allMarks.push({ mark: word.mark });
      }
    });
    
    setMarks(allMarks);
  }, [sentencesData]);

  // სიტყვაზე ან ნიშანზე დაჭერის დამუშავება
  const handleClick = (item, index, type) => {
    if (type === "word") {
      // სიტყვაზე დაჭერა - მხოლოდ ინდექსს ვინახავთ
      setClickedWord(index);
    } else if (type === "mark") {
      // სასვენ ნიშანზე დაჭერა
      setClickedMark(index);
      
      // თუ უკვე არჩეულია სიტყვა, შევამოწმოთ დამთხვევა
      if (clickedWord !== null) {
        const selectedWord = wordsWithMarks[clickedWord];
        const isCorrectMatch = selectedWord.mark === item.mark;
        
        if (isCorrectMatch) {
          // სწორი დამთხვევა
          const newWordsWithMarks = [...wordsWithMarks];
          
          // ვნიშნავთ, რომ ეს სიტყვა უკვე დამატჩებულია
          newWordsWithMarks[clickedWord] = {
            ...newWordsWithMarks[clickedWord],
            isMatched: true  // ნიშანი ნაპოვნია
          };
          
          setWordsWithMarks(newWordsWithMarks);
          
          // წავშალოთ გამოყენებული ნიშანი
          const newMarks = [...marks];
          newMarks.splice(index, 1);
          setMarks(newMarks);
          
          // განვაახლოთ ქულები და მცდელობები
          setPoints(points + 1);
          setTries(tries + 1);
          
          // გავასუფთაოთ არჩეული ელემენტები
          setClickedWord(null);
          setClickedMark(null);
        } else {
          // არასწორი დამთხვევა
          setTries(tries + 1);
          setClickedMark(null);  // მხოლოდ ნიშანს ვასუფთავებთ
        }
      }
    }
  };

  return (
    <div className="words_and_marks">
      {/* სიტყვების სექცია */}
      <div className="words_wout_marks">
        {wordsWithMarks.map((wordItem, wordIndex) => (
          <div className="word-container" key={`word-${wordIndex}`}>
            {/* სიტყვის ბარათი - გამარტივებული კლასის მინიჭება */}
            <div
              className={`word_card ${clickedWord === wordIndex ? 'clicked_card' : ''}`}
              onClick={() => handleClick(wordItem, wordIndex, "word")}
            >
              {wordItem.word}
            </div>
            
            {/* სასვენი ნიშანი - ჩანს მხოლოდ როცა დამატჩებულია */}
            {wordItem.isMatched && (
              <div className="mark_among_words">{wordItem.mark}</div>
            )}
          </div>
        ))}
      </div>
      
      {/* სასვენი ნიშნების სექცია */}
      <div className="marks">
        {marks.map((markItem, markIndex) => (
          <div
            key={`mark-${markIndex}`}
            className={`mark ${clickedMark === markIndex ? 'clicked_mark' : ''}`}
            onClick={() => handleClick(markItem, markIndex, "mark")}
          >
            {markItem.mark}
          </div>
        ))}
      </div>
      
      {/* ნავიგაციის სექცია - გამარტივებული პირობა */}
      {marks.length === 0 && (
        <div className="next_game">
          <div className="button-container">
            <button onClick={() => setPartOfGame(4)} className="next-button">
              შემდეგი ეტაპი
            </button>
            <button onClick={() => setPartOfGame(6)} className="results-button">
              შედეგები
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
