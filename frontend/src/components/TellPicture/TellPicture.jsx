import { useEffect, useMemo, useState } from "react";
import { getShuffled } from "../../getData";
import "./TellPicture.scss";

export default function TellPicture(props) {
  const { sentencesData, points, setPoints, tries, setTries, setPartOfGame } = props;
  
  // მდგომარეობის ცვლადები - იგივე რაც CreateSentences-ში
  const [clickedWord, setClickedWord] = useState(false);
  const [placeToFillId, setPlaceToFillId] = useState(0);
  const [itsOver, setItsOver] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);

  // მხოლოდ სურათიანი წინადადებები
  const filteredSentencesData = useMemo(() => {
    return sentencesData.filter(item => item.picture && item.picture.trim() !== '');
  }, [sentencesData]);

  // შემთხვევითად დავალაგოთ წინადადებები
  const shuffledSentencesData = useMemo(() => {
    return getShuffled(filteredSentencesData);
  }, [filteredSentencesData]);

  // მიმდინარე წინადადება
  const sentenceToFill = useMemo(() => {
    return shuffledSentencesData[currentSentence];
  }, [shuffledSentencesData, currentSentence]);

  // მიმდინარე წინადადების სიტყვები
  const wordsToFill = useMemo(() => {
    return sentenceToFill ? sentenceToFill.words : [];
  }, [sentenceToFill]);

  // ყველა სიტყვის მასივი არეული
  const shuffledDataForCS = useMemo(() => {
    const words = sentencesData
      .map((el) => el.words)
      .flat()
      .sort(() => 0.5 - Math.random());
    return words;
  }, [sentencesData]);

  // მოგებული წინადადებების მასივი
  const wonSentences = useMemo(() => [], []);

  // სიტყვაზე დაჭერის ჰენდლერი
  function clickHandler(word, index) {
    if (!wordsToFill || wordsToFill.length === 0) return;
    
    console.log("დაემთხვა?", word, wordsToFill[placeToFillId]);

    if (word === wordsToFill[placeToFillId].word) {
      console.log("დაემთხვა", word, wordsToFill[placeToFillId]);
      setTries(tries + 1);
      
      wordsToFill[placeToFillId].isDone = true;
      shuffledDataForCS.splice(index, 1);

      if (placeToFillId < wordsToFill.length - 1) {
        setPlaceToFillId(placeToFillId + 1);
      } else if (currentSentence < shuffledSentencesData.length - 1) {
        setPoints(points + wordsToFill.length);
        setCurrentSentence(currentSentence + 1);
        setPlaceToFillId(0);
      } else {
        console.log("ყველა წინადადება შეივსო");
        setPoints(points + wordsToFill.length);
        setItsOver(true);
      }
    } else {
      console.log("არაა სწორი", word, wordsToFill[placeToFillId]);
      setTries(tries + 1);
    }
  }

  // შემდეგ წინადადებაზე გადასვლის ჰენდლერი
  function clickNextHandler() {
    setCurrentSentence((prevIndex) => (prevIndex + 1) % shuffledSentencesData.length);
    setTries(tries + 1);
  }

  // შემოწმება არის თუ არა მონაცემები ხელმისაწვდომი
  if (!sentenceToFill || !wordsToFill) {
    return <div className="loading">მონაცემები იტვირთება...</div>;
  }

  return (
    <div className="tell_picture">
      <div className="sentences">
        {itsOver ? (
          <div className="next_game">
            <button onClick={() => setPartOfGame(6)}>შემდეგი ეტაპი</button>
          </div>
        ) : (
          <div className="picture_container">
            <div className="">
              {/* სურათი წინადადების ნაცვლად */}
              <div className="picture_to_describe">
                <img 
                  src={`game_photos/${sentenceToFill.picture}.jpg`} 
                  alt="სურათი აღსაწერად" 
                  className="current-image"
                />
              </div>
              <div className="wordsToFill">
                {wordsToFill.map((el, index) => (
                  <div className="" key={index}>
                    <div
                      className={
                        el.isDone
                          ? "word_returned"
                          : "word_for_sentence"
                      }
                    >
                      {el.isDone
                        ? el.word
                        : "დოშ"}
                    </div>
                    <div className=""></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="words_for_sentence">
        {shuffledDataForCS.map((el, index) => (
          <div
            className="card_to_choose"
            key={index}
            onClick={() => clickHandler(el.word, index)}
          >
            <div className="">{el.word}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
