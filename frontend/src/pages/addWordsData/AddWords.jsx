import React, { useReducer, useState, useRef, useEffect } from 'react';
import './AddWordsData.scss';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import newRequest from '../../utils/newRequest';
import { initialState, formReducer } from '../../reducers/wordReducer';
import KeyboardRare from "../../components/keyboard/KeyboardRare";
import { useLanguage } from '../../context/LanguageContext';

const AddWordsData = () => {
  // ✅ კონტექსტიდან ენების მონაცემების აღება
  const { language: selectedLanguage } = useLanguage();

  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [wordsData, setWordsData] = useState([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [expandedWordIndex, setExpandedWordIndex] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");

  const queryClient = useQueryClient();
  const wordInputRef = useRef(null);

  // const userId = getCurrentUser(); // ფუნქცია, რომელიც იღებს მიმდინარე მომხმარებლის ID-ს

  // ✅ არჩეული ენის ავტომატური მითითება ფორმაში
  useEffect(() => {
    if (selectedLanguage && selectedLanguage.code && !formData.language) {
      dispatch({ 
        type: 'UPDATE_FIELD', 
        field: 'language', 
        value: selectedLanguage.code 
      });
    }
  }, [selectedLanguage, formData.language]);

  useEffect(() => {
    if (inputName) {
      setInputValue(formData[inputName] || '');
    }
  }, [inputName]);

  const handleInputClick = (e) => {
    setInputName(e.target.name);
    setInputValue(e.target.value);
  };

  // useMutation ჰუკი
  const saveWordsMutation = useMutation({
    mutationFn: async (data) => {
      const wordsToAdd = data.map(word => ({
        ...word,
        // isPrivate: true,
      }));

      console.log('მონაცემები გასაგზავნად', wordsToAdd);
      const response = await newRequest.post('/words', {wordsToAdd});

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["myWords"]);
      console.log('მონაცემები წარმატებით გაიგზავნა:', data);
      
      // ✅ Backend-ის response-ის ანალიზი
      if (data.success) {
        let message = `წარმატებით შეინახა ${data.saved} სიტყვა`;
        
        if (data.skipped > 0) {
          message += `\n${data.skipped} სიტყვა გამოტოვდა (უკვე არსებობდა)`;
        }
        
        if (data.errors > 0) {
          message += `\n${data.errors} შეცდომა მოხდა`;
          console.error('შეცდომები:', data.data.errors);
        }
        
        alert(message);
      } else {
        alert('მონაცემების შენახვა ვერ მოხერხდა');
      }
      
      setWordsData([]);
    },
    onError: (error) => {
      console.error('შეცდომა:', error);
      alert(`მონაცემების გაგზავნა ვერ მოხერხდა: ${error.message}`);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleAddWord = (e) => {
    if (
      formData.word.trim() &&
      formData.translation.trim() &&
      formData.language.trim()
    ) {
      setWordsData([...wordsData, formData]);
      dispatch({ type: 'RESET_FORM' });

      // ✅ ფორმის reset-ის შემდეგ არჩეული ენის დაბრუნება
      if (selectedLanguage && selectedLanguage.code) {
        setTimeout(() => {
          dispatch({ 
            type: 'UPDATE_FIELD', 
            field: 'language', 
            value: selectedLanguage.code 
          });
        }, 50);
      }

      setTimeout(() => {
        if (wordInputRef.current) {
          wordInputRef.current.focus();
          setInputName("word");
          setInputValue("");
        }
      }, 100);
    } else {
      alert('გთხოვთ, შეავსოთ ყველა სავალდებულო ველი!');
    }
  };

  const handleDeleteWord = (index) => {
    setWordsData(wordsData.filter((_, i) => i !== index));
  };

  const toggleAdditionalFields = () => {
    setShowAdditionalFields(!showAdditionalFields);
  };

  const toggleWordDetails = (index) => {
    setExpandedWordIndex(expandedWordIndex === index ? null : index);
  };

  const saveWordsToDatabase = () => {
    console.log('wordsData', wordsData);
    saveWordsMutation.mutate(wordsData);
  };

  return (
    <div className="add-words-container">
      {/* ✅ არჩეული ენის ინფორმაცია */}
      {selectedLanguage && (
        <div className="selected-language-info">
          <p>🎯 არჩეული ენა: <strong>{selectedLanguage.name} ({selectedLanguage.code})</strong></p>
          <small>ახალი სიტყვები ავტომატურად დაემატება ამ ენისთვის</small>
        </div>
      )}

      {/* ლურჯი ყუთი */}
      <div className="form-container">
        {/* სავალდებულო ველები */}
        <div className="form-section">
          <div className="form-group">
            {/* <label htmlFor="language">ენა:</label> */}
            {/* <input
              type="text"
              id="language"
              name="language"
              value={selectedLanguage ? selectedLanguage.name : ''}
              disabled
              className="language-display"
              placeholder="აირჩიეთ ენა მთავარ გვერდზე"
            /> */}
          </div>
          
          <div className="form-group">
            <label htmlFor="word">სიტყვა:</label>
            <input
              type="text"
              id="word"
              name="word"
              ref={wordInputRef}
              value={formData.word}
              onChange={handleChange}
              placeholder="შეიყვანეთ სიტყვა"
              onClick={handleInputClick}
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
              onClick={handleInputClick}
              required
            />
          </div>
        </div>

        {/* დამატებითი ველები */}
        <div className="form-section additional-fields">
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
                  onClick={handleInputClick}
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
                  onClick={handleInputClick}
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
                  onClick={handleInputClick}
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="button" 
          className="add-button" 
          onClick={handleAddWord}
          disabled={!selectedLanguage}
          title={!selectedLanguage ? "აირჩიეთ ენა მთავარ გვერდზე" : "სიტყვის დამატება"}
        >
          +
        </button>
      </div>

      {/* დამატებული სიტყვების ჩვენება */}
      <div className="saved-words">
        <h3>დამატებული სიტყვები:</h3>
        {wordsData.length === 0 ? (
          <p>ჯერ არ არის დამატებული სიტყვები</p>
        ) : (
          <>
            <div className="words-summary">
              <p>📊 სულ: <strong>{wordsData.length}</strong> სიტყვა მზადაა შენახვისთვის</p>
              {selectedLanguage && (
                <p>🌐 ენა: <strong>{selectedLanguage.name}</strong></p>
              )}
            </div>
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
                    <p><strong>ენა:</strong> {selectedLanguage?.name || word.language}</p>
                    <p><strong>თარგმანი:</strong> {word.translation}</p>
                    {word.definition && <p><strong>განმარტება:</strong> {word.definition}</p>}
                    {word.baseForm && <p><strong>საწყისი ფორმა:</strong> {word.baseForm}</p>}
                    {word.usageExamples && <p><strong>გამოყენების მაგალითები:</strong> {word.usageExamples}</p>}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* მონაცემების შენახვის ღილაკი */}
      <button
        type="button"
        onClick={saveWordsToDatabase}
        disabled={saveWordsMutation.isLoading || wordsData.length === 0 || !selectedLanguage}
        className={wordsData.length === 0 || !selectedLanguage ? "disabled-button" : ""}
        title={!selectedLanguage ? "აირჩიეთ ენა მთავარ გვერდზე" : `მონაცემების შენახვა (${wordsData.length})`}
      >
        {saveWordsMutation.isLoading ? "მიმდინარეობს შენახვა..." : `მონაცემების შენახვა (${wordsData.length})`}
      </button>
      
      {saveWordsMutation.isError && (
        <div className="error-message">
          შეცდომა: მონაცემების შენახვა ვერ მოხერხდა
        </div>
      )}

      {/* შეცდომის შეტყობინება ენის არაზიდან */}
      {!selectedLanguage && (
        <div className="warning-message">
          ⚠️ გთხოვთ აირჩიოთ ენა მთავარ გვერდზე სიტყვების დამატებისთვის
        </div>
      )}
      
      <KeyboardRare
        inputName={inputName}
        inputValue={inputValue}
        textState={formData}
        dispatchText={dispatch}
      />
    </div>
  );
};

export default AddWordsData;