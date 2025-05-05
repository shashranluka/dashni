import React, { useReducer, useState } from 'react';
import './AddWordsData.scss'; // სტილის ფაილი
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // დავამატოთ axios-ის იმპორტი
import newRequest from '../../utils/newRequest';
import { initialState, formReducer } from '../../reducers/wordReducer';

const AddWordsData = () => {
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [wordsData, setWordsData] = useState([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false); // ნარინჯისფერი ყუთის მართვა
  const [expandedWordIndex, setExpandedWordIndex] = useState(null); // აქტიური სიტყვა

  const queryClient = useQueryClient();
  // useMutation ჰუკის განახლება axios-ით
  const saveWordsMutation = useMutation({
    mutationFn: async (data) => {
      // მივამატოთ privacy ფიქსირებულად მთლიან მასივს
      const wordsWithPrivacy = data.map(word => ({
        ...word,
        isPrivate: true, // ან false, თუ გსურთ
      }));
      
      console.log('მონაცემები გასაგზავნად', wordsWithPrivacy);
      const response = await newRequest.post('/words', wordsWithPrivacy);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["myWords"]); 
      console.log('მონაცემები წარმატებით გაიგზავნა:', data);
      alert('მონაცემები წარმატებით შეინახა!');
      // წარმატების შემდეგ გავასუფთავოთ wordsData მასივი
      setWordsData([]);
    },
    onError: (error) => {
      console.error('შეცდომა:', error);
      alert(`მონაცემების გაგზავნა ვერ მოხერხდა: ${error.message}`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleAddWord = (e) => {
    if (
      formData.word.trim() &&
      formData.translation.trim() &&
      formData.language.trim()
    ) {
      setWordsData([...wordsData, formData]); // ახალი სიტყვების დამატება
      dispatch({ type: 'RESET_FORM' }); // ფორმის გასუფთავება (ენის ველის გამოკლებით)
    } else {
      alert('გთხოვთ, შეავსოთ ყველა სავალდებულო ველი!');
    }
  };

  const handleDeleteWord = (index) => {
    setWordsData(wordsData.filter((_, i) => i !== index)); // ამოიღე ობიექტი ინდექსის მიხედვით
  };

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(!showAdditionalFields); // ნარინჯისფერი ყუთის ჩვენება/დამალვა
  };

  const toggleWordDetails = (index) => {
    setExpandedWordIndex(expandedWordIndex === index ? null : index); // დეტალების ჩვენება/დამალვა
  };

  // saveWordsToDatabase ფუნქციის განახლება useMutation-ით
  const saveWordsToDatabase = () => {
    console.log('wordsData', wordsData);
    saveWordsMutation.mutate(wordsData);
  };

  return (
    <div className="add-words-container">
      {/* ლურჯი ყუთი */}
      <div className="form-container">
        {/* სავალდებულო ველები */}
        <div className="form-section">
          {/* <h4>სავალდებულო ველები</h4> */}
          <div className="form-group">
            <label htmlFor="language">ენა:</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                აირჩიე ენა
              </option>
              {/* <option value="ka">ქართული</option> */}
              <option value="ba">თუშური</option>
              <option value="en">ინგლისური</option>
              <option value="de">გერმანული</option>
              <option value="es">ესპანური</option>
              <option value="fr">ფრანგული</option>
              <option value="sx">სხვა</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="word">სიტყვა:</label>
            <input
              type="text"
              id="word"
              name="word"
              value={formData.word}
              onChange={handleChange}
              placeholder="შეიყვანეთ სიტყვა"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="translation">თარგმანი:</label>
            <input
              type="text"
              id="translation"
              name="translation"
              value={formData.translation}
              onChange={handleChange}
              placeholder="შეიყვანეთ თარგმანი"
              required
            />
          </div>
        </div>

        {/* დამატებითი ველები */}
        <div className="form-section additional-fields">
          {/* <h4>დამატებითი ინფორმაცია</h4> */}
          <button
            type="button"
            className="toggle-button"
            onClick={toggleAdditionalFields}
          >
            დამატებითი ინფორმაცია
          </button>
          {showAdditionalFields && (
            <div className="orange-box">
              <div className="form-group">
                <label htmlFor="definition">განმარტება:</label>
                <input
                  type="text"
                  id="definition"
                  name="definition"
                  value={formData.definition}
                  onChange={handleChange}
                  placeholder="შეიყვანეთ განმარტება"
                />
              </div>
              <div className="form-group">
                <label htmlFor="baseForm">საწყისი ფორმა:</label>
                <input
                  type="text"
                  id="baseForm"
                  name="baseForm"
                  value={formData.baseForm}
                  onChange={handleChange}
                  placeholder="შეიყვანეთ საწყისი ფორმა"
                />
              </div>
              <div className="form-group">
                <label htmlFor="usageExamples">გამოყენების მაგალითები:</label>
                <textarea
                  id="usageExamples"
                  name="usageExamples"
                  value={formData.usageExamples}
                  onChange={handleChange}
                  placeholder="შეიყვანეთ მაგალითები"
                />
              </div>
            </div>
          )}
        </div>

        <button type="button" className="add-button" onClick={handleAddWord}>
          +
        </button>
      </div>


      {/* დამატებული სიტყვების ჩვენება */}
      <div className="saved-words">
        <h3>დამატებული სიტყვები:</h3>
        {wordsData.map((word, index) => (
          <div key={index} className="saved-word">
            <div className="word-header">
              <p onClick={() => toggleWordDetails(index)} className="word-title">
                {word.word}
              </p>
              <button
                className="delete-button"
                onClick={() => handleDeleteWord(index)}
              >
                წაშლა
              </button>
            </div>
            {expandedWordIndex === index && (
              <div className="word-details">
                <p><strong>ენა:</strong> {word.language}</p>
                <p><strong>თარგმანი:</strong> {word.translation}</p>
                <p><strong>განმარტება:</strong> {word.definition}</p>
                {word.partOfSpeech && <p><strong>მეტყველების ნაწილი:</strong> {word.partOfSpeech}</p>}
                {word.baseForm && <p><strong>საწყისი ფორმა:</strong> {word.baseForm}</p>}
                {word.usageExamples && <p><strong>გამოყენების მაგალითები:</strong> {word.usageExamples}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* მონაცემების შენახვის ღილაკი */}
      <button 
        type="button" 
        onClick={saveWordsToDatabase} 
        disabled={saveWordsMutation.isLoading}
      >
        {saveWordsMutation.isLoading ? "მიმდინარეობს შენახვა..." : "მონაცემების შენახვა"}
      </button>
      {saveWordsMutation.isError && (
        <div className="error-message">
          შეცდომა: მონაცემების შენახვა ვერ მოხერხდა
        </div>
      )}
    </div>
  );
};

export default AddWordsData;