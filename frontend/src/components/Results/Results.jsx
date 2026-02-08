import "./Results.scss"

export default function Results(props) {
  const { sentences, point, tries, wordsFromLexicon, setReturnedData, setGameWon } = props;
  console.log(props);
  const wordsIdsFromLexicon = wordsFromLexicon.map((wordData) => wordData._id)
  console.log(wordsIdsFromLexicon);

  // შევამოწმოთ არსებობს თუ არა sentences და არის თუ არა მასივი რომელსაც აქვს ელემენტები
  const hasSentences = sentences && Array.isArray(sentences) && sentences.length > 0;
  setGameWon(true)
  return (
    <div className="results-container">
      <h1>
        შედეგი: {point}/{tries} = {Math.round((point / tries) * 100)}%
      </h1>
      
      {/* წინადადებების ბლოკი მხოლოდ მაშინ გამოჩნდეს თუ sentences არსებობს */}
      {hasSentences && (
        <div className="result_sentences">
          {sentences.map((sentence, index) => (
            <div key={index} className="results_sentence">
              <div className="results_translation">{sentence.translation}</div>
              <div className="results_native">{sentence.sentence}</div>
            </div>
          ))}
        </div>
      )}

      <div className="saved-words-section">
        <div className="wordstosave">
          {wordsFromLexicon.map((wordData, index) => (
            <div key={index} className="wordcard">{wordData.word}</div>
          ))}
        </div>
        {/* <button 
          onClick={() => {
            console.log("შედეგებიდან პასუხი")
            setGameWon(true);
          }}
          className="save-button"
        >
          მოპოვებულის შენახვა
        </button> */}
      </div>
    </div>
  );
}
