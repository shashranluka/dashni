import { useState, useEffect } from "react";
import "./GuessPicture.scss";

export default function GuessPicture(props) {
  const { sentencesData, points, setPoints, tries, setTries, setPartOfGame } = props;
  
  // მდგომარეობის ცვლადები
  const [availableImages, setAvailableImages] = useState([]);
  const [availableSentences, setAvailableSentences] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  // საწყისი მონაცემების მომზადება
  useEffect(() => {
    console.log("useEffect: sentencesData", sentencesData);
    if (sentencesData && sentencesData.length > 0) {
      // გამოვყოთ ობიექტები სურათებით
      const withImages = sentencesData.filter(item => item.picture && item.picture.trim() !== '');
      
      // გავარჩიოთ ყველა წინადადება
      const allSentences = sentencesData.map(item => ({
        id: item._id,
        sentence: item.sentence,
        picture: item.picture
      }));
      
      console.log("withImages:", withImages);
      console.log("allSentences:", allSentences);
      
      setAvailableImages(withImages);
      setAvailableSentences(allSentences);
      
      // თუ არის სურათიანი ობიექტი, პირველი გამოვაჩინოთ
      if (withImages.length > 0) {
        setCurrentImage(withImages[0]);
      } else {
        setGameCompleted(true);
      }
    }
  }, [sentencesData]);

  // currentImage ცვლილების მონიტორინგი
  useEffect(() => {
    if (currentImage) {
      console.log("currentImage განახლდა:", currentImage);
      console.log("currentImage.picture:", currentImage.picture, `game_photos/${currentImage.picture}`);
    }
  }, [currentImage]);

  // წინადადების არჩევის ფუნქცია
  const handleSentenceSelect = (sentence) => {
    setSelectedSentence(sentence);
    
    // შევამოწმოთ არის თუ არა სწორი შესაბამისობა
    if (currentImage && sentence.id === currentImage._id) {
      // სწორი პასუხი
      setPoints(prevPoints => prevPoints + 1);
      setTries(prevTries => prevTries + 1);
      
      // წავშალოთ წინადადება ხელმისაწვდომებიდან
      setAvailableSentences(prev => prev.filter(s => s.id !== sentence.id));
      
      // გადავიდეთ შემდეგ სურათზე
      setAvailableImages(prev => {
        const newImages = prev.filter(img => img._id !== currentImage._id);
        
        if (newImages.length > 0) {
          setCurrentImage(newImages[0]);
        } else {
          setCurrentImage(null);
          setGameCompleted(true);
        }
        
        return newImages;
      });
    } else {
      // არასწორი პასუხი
      setTries(prevTries => prevTries + 1);
    }
    
    // გავასუფთაოთ არჩევანი მცირე დაყოვნების შემდეგ
    setTimeout(() => {
      setSelectedSentence(null);
    }, 1000);
  };

  // შემდეგ ეტაპზე გადასვლა
  const handleNextStage = () => {
    setPartOfGame(prev => prev + 1);
  };

  return (
    <div className="guess-picture-container">
      <div className="image-section">
        {currentImage ? (
          <img 
            src={`game_photos/${currentImage.picture}.jpg`} 
            alt="გამოსაცნობი სურათი" 
            className="current-image"
          />
        ) : gameCompleted ? (
          <div className="game-completed">
            <h3>ყველა სურათი გამოცნობილია!</h3>
            <button onClick={handleNextStage} className="next-stage-button">
              შემდეგი ეტაპი
            </button>
          </div>
        ) : (
          <div className="loading">სურათები იტვირთება...</div>
        )}
      </div>
      
      <div className="sentences-section">
        <h3>აირჩიეთ შესაბამისი წინადადება:</h3>
        <div className="sentences-list">
          {availableSentences.map((sentence, index) => (
            <div
              key={index}
              className={`sentence-card ${selectedSentence?.id === sentence.id ? 'selected' : ''}`}
              onClick={() => handleSentenceSelect(sentence)}
            >
              {sentence.sentence}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
