import React, { useReducer, useState } from 'react';
import './AddWordsData.scss'; // სტილის ფაილი
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios'; // დავამატოთ axios-ის იმპორტი
import newRequest from '../../utils/newRequest';
import { initialState, formReducer } from '../../reducers/wordReducer';
import KeyboardRare from "../../components/keyboard/KeyboardRare";

const AddWordsData = () => {
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [wordsData, setWordsData] = useState([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false); // ნარინჯისფერი ყუთის მართვა
  const [expandedWordIndex, setExpandedWordIndex] = useState(null); // აქტიური სიტყვა


  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  // ახლად დამატებული state ცვლადები ენების მართვისთვის
  const [languages, setLanguages] = useState([
    { code: "ba", name: "თუშური" },
    { code: "en", name: "ინგლისური" },
    { code: "de", name: "გერმანული" },
    { code: "es", name: "ესპანური" },
    { code: "fr", name: "ფრანგული" },
    { code: "sx", name: "სხვა" },
    { code: "custom", name: "საკუთარი ენის დამატება..." } // ახალი ენის დამატების ოფცია
  ]);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false); // გვიჩვენებს ენის დამატების ფორმას
  const [newLanguage, setNewLanguage] = useState({ code: "", name: "" }); // ახალი ენის მონაცემები

  const queryClient = useQueryClient();
  const handleInputClick = (e) => {
    setInputName(e.target.name);
    setInputValue(e.target.value);
  };
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

    // თუ ენის არჩევანი შეიცვალა და აირჩია "საკუთარი ენის დამატება" ოფცია
    if (name === 'language' && value === 'custom') {
      // გამოვაჩინოთ ენის დამატების ფორმა
      setIsAddingLanguage(true);
    } else {
      // სხვა შემთხვევაში ჩვეულებრივად განაახლე ფორმის მონაცემები
      dispatch({ type: 'UPDATE_FIELD', field: name, value });
    }
  };

  // ახალი ფუნქცია ენის დამატების ფორმის ველების მართვისთვის
  const handleNewLanguageChange = (e) => {
    const { name, value } = e.target;
    setNewLanguage({
      ...newLanguage,
      [name]: value // განაახლე შესაბამისი ველი (code ან name)
    });
  };

  // ახალი ფუნქცია ენის დამატებისთვის
  const handleAddLanguage = () => {
    // შემოწმება - არცერთი ველი არ უნდა იყოს ცარიელი
    if (!newLanguage.code.trim() || !newLanguage.name.trim()) {
      alert("გთხოვთ შეავსოთ ენის კოდი და სახელი");
      return;
    }

    // შემოწმება - ენის კოდი უნიკალური უნდა იყოს
    if (languages.some(lang => lang.code === newLanguage.code && lang.code !== 'custom')) {
      alert("ასეთი ენის კოდი უკვე არსებობს");
      return;
    }

    // დავამატოთ ახალი ენა ჩამონათვალში (custom ოფციის წინ)
    const updatedLanguages = [
      ...languages.filter(lang => lang.code !== 'custom'), // მოვაშოროთ custom ოფცია დროებით
      { code: newLanguage.code, name: newLanguage.name }, // დავამატოთ ახალი ენა
      { code: "custom", name: "საკუთარი ენის დამატება..." } // დავაბრუნოთ custom ოფცია ბოლოში
    ];

    // განვაახლოთ ენების სია
    setLanguages(updatedLanguages);

    // მივუთითოთ ახლად დამატებული ენა ფორმაში
    dispatch({ type: 'UPDATE_FIELD', field: 'language', value: newLanguage.code });

    // დავხუროთ ენის დამატების ფორმა
    setIsAddingLanguage(false);

    // გავასუფთავოთ ახალი ენის ფორმა
    setNewLanguage({ code: "", name: "" });

    console.log(`ახალი ენა დაემატა: ${newLanguage.name} (${newLanguage.code})`);
  };

  // ფუნქცია ენის დამატების გაუქმებისთვის
  const handleCancelAddLanguage = () => {
    setIsAddingLanguage(false);
    setNewLanguage({ code: "", name: "" });
    dispatch({ type: 'UPDATE_FIELD', field: 'language', value: '' });
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

  // ფუნქცია მითითებული ენის კოდის მიხედვით სახელის მოსაძებნად
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code; // თუ ვერ ვიპოვეთ, ვაბრუნებთ კოდს
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

            {/* ენის არჩევის ველი */}
            {!isAddingLanguage ? (
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
                {/* დინამიურად ვაგენერირებთ ენების ჩამონათვალს */}
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            ) : (
              /* ენის დამატების ფორმა */
              <div className="add-language-form">
                <div className="language-inputs">
                  <input
                    type="text"
                    name="code"
                    value={newLanguage.code}
                    onChange={handleNewLanguageChange}
                    placeholder="ენის კოდი (მაგ: jp)"
                    maxLength={5}
                    onClick={handleInputClick}
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    value={newLanguage.name}
                    onChange={handleNewLanguageChange}
                    placeholder="ენის სახელი (მაგ: იაპონური)"
                    onClick={handleInputClick}
                    required
                  />
                </div>
                <div className="language-buttons">
                  <button type="button" onClick={handleAddLanguage}>
                    დამატება
                  </button>
                  <button type="button" onClick={handleCancelAddLanguage}>
                    გაუქმება
                  </button>
                </div>
              </div>
            )}
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
                {/* ვაჩვენოთ ენის სახელი და არა კოდი */}
                <p><strong>ენა:</strong> {getLanguageName(word.language)}</p>
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
        disabled={saveWordsMutation.isLoading || wordsData.length === 0}
        className={wordsData.length === 0 ? "disabled-button" : ""}
      >
        {saveWordsMutation.isLoading ? "მიმდინარეობს შენახვა..." : "მონაცემების შენახვა"}
      </button>
      {saveWordsMutation.isError && (
        <div className="error-message">
          შეცდომა: მონაცემების შენახვა ვერ მოხერხდა
        </div>
      )}
      <KeyboardRare
        inputName={inputName}
        inputValue={inputValue}
        // setLetter={setKeyboardChosenLetter}
        textState={formData}
        dispatchText={dispatch}
      />
    </div>
  );
};

export default AddWordsData;