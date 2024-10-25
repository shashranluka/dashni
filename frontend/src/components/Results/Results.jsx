import "./Results.scss"
export default function Results(props) {
  const { sentences, point, tries, wordsFromLexicon, setReturnedData, storeCollectedWords } = props;
  console.log(props);
  const wordsIdsFromLexicon = wordsFromLexicon.map((wordData)=>wordData._id)
  console.log(wordsIdsFromLexicon);
  
  return (
    <div className="">
      <h1>
        შედეგი: {point}/{tries} = {Math.round((point / tries) * 100)}%
      </h1>
      <div className="result_sentences">
        {sentences.map((sentence, index) => (
          <div className="results_sentence">
            <div className="results_translation">{sentence.translation}</div>
            <div className="results_native">{sentence.sentence}</div>
          </div>
        ))}

      </div>
      <div className="">

      <div className="wordstosave">
        {wordsFromLexicon.map((wordData, index)=>(
          <div className="wordcard">{wordData.theWord}</div>
        ))}
      </div>
      <button onClick={()=>setReturnedData(wordsIdsFromLexicon)}>მოპოვებულის შენახვა</button>
        </div>

    </div>
  );
}
