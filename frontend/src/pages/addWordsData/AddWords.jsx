import React, { useReducer, useState, useRef, useEffect } from 'react';
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
  const [isTranslating, setIsTranslating] = useState(false); // თარგმნის პროცესის მდგომარეობა

  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  // ახლად დამატებული state ცვლადები ენების მართვისთვის
  // const 
  const [languages, setLanguages] = useState([
    { code: "ba", name: "თუშური" },
    { code: "ma", name: "მეგრული" },
    { code: "lu", name: "სვანური" },
    { code: "en", name: "ინგლისური" },
    { code: "ru", name: "რუსული" },
    { code: "de", name: "გერმანული" },
    { code: "es", name: "ესპანური" },
    { code: "fr", name: "ფრანგული" },
    { code: "sx", name: "სხვა" },
    { code: "custom", name: "საკუთარი ენის დამატება..." } // ახალი ენის დამატების ოფცია
  ]);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false); // გვიჩვენებს ენის დამატების ფორმას
  const [newLanguage, setNewLanguage] = useState({ code: "", name: "" }); // ახალი ენის მონაცემები

  const queryClient = useQueryClient();
  const wordInputRef = useRef(null);
  
  // inputName და inputValue-ს განახლება როცა formData იცვლება
  useEffect(() => {
    if (inputName) {
      setInputValue(formData[inputName] || '');
    }
  }, [formData, inputName]);

  const handleInputClick = (e) => {
    setInputName(e.target.name);
    setInputValue(e.target.value);
  };

  // თარგმნის ფუნქცია
  const translateWord = async (word, sourceLang) => {
  try {
    const response = await axios.post('https://translation.googleapis.com/language/translate/v2', null, {
      params: {
        q: word,
        source: sourceLang,
        target: 'ka',
        key: 'YOUR_API_KEY_HERE' // აქ ჩასვით თქვენი API გასაღები
      }
    });
    
    // შემდეგ API-სგან მიღებული მონაცემებით შეავსეთ ობიექტი
    const translationData = {
      translation: response.data.data.translations[0].translatedText,
      // სხვა ინფორმაციისთვის შეიძლება სხვა API-ების გამოყენება დაგჭირდეთ
      definition: "", // მაგ. Dictionary API-დან
      baseForm: "", // მაგ. Lemmatizer API-დან
      usageExamples: "" // მაგ. Examples API-დან
    };
    
    return translationData;
  } catch (error) {
    console.error('თარგმნის შეცდომა:', error);
    throw error;
  }
};

  // ავტომატური თარგმნის ფუნქცია
  const handleAutoTranslate = async () => {
    // შევამოწმოთ, არის თუ არა სიტყვა და ენა არჩეული
    if (!formData.word.trim()) {
      alert('გთხოვთ, შეიყვანოთ სიტყვა თარგმნისთვის');
      return;
    }
    
    if (!formData.language || formData.language === 'custom') {
      alert('გთხოვთ, აირჩიოთ ენა');
      return;
    }
    
    try {
      setIsTranslating(true);
      
      // გამოვიძახოთ თარგმნის ფუნქცია
      const translationData = await translateWord(formData.word, formData.language);
      
      // განვაახლოთ ფორმის მონაცემები მიღებული შედეგებით
      dispatch({ 
        type: 'UPDATE_MULTIPLE_FIELDS', 
        fields: {
          translation: translationData.translation,
          definition: translationData.definition,
          baseForm: translationData.baseForm,
          usageExamples: translationData.usageExamples
        }
      });
      
      // თუ დამატებითი ველები არ არის გამოჩენილი, გამოვაჩინოთ
      if (!showAdditionalFields) {
        setShowAdditionalFields(true);
      }
      
    } catch (error) {
      alert(`თარგმნის შეცდომა: ${error.message}`);
    } finally {
      setIsTranslating(false);
    }
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
      dispatch({ type: 'RESET_FORM' }); // ფორმის გასუფთავება

      // ფოკუსი გადავიტანოთ სიტყვის ველში
      setTimeout(() => {
        if (wordInputRef.current) {
          wordInputRef.current.focus();
          setInputName("word"); // ვაცნობოთ keyboard-ს რომელი ველია ფოკუსში
          setInputValue("");
        }
      }, 10);
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
                  აირჩიეთ ენა
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
            <div className="input-with-button">
              <input
                type="text"
                id="word"
                name="word"
                ref={wordInputRef} // დავამატოთ რეფერენსი
                value={formData.word}
                onChange={handleChange}
                placeholder="შეიყვანეთ სიტყვა"
                onClick={handleInputClick}
                required
              />
              <button 
                type="button" 
                className="translate-button"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !formData.word.trim() || !formData.language}
              >
                {isTranslating ? "..." : "ავტომატური თარგმნა"}
              </button>
            </div>
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
        {wordsData.length === 0 ? (
          <p>ჯერ არ არის დამატებული სიტყვები</p>
        ) : (
          wordsData.map((word, index) => (
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
                  {word.definition && <p><strong>განმარტება:</strong> {word.definition}</p>}
                  {word.partOfSpeech && <p><strong>მეტყველების ნაწილი:</strong> {word.partOfSpeech}</p>}
                  {word.baseForm && <p><strong>საწყისი ფორმა:</strong> {word.baseForm}</p>}
                  {word.usageExamples && <p><strong>გამოყენების მაგალითები:</strong> {word.usageExamples}</p>}
                </div>
              )}
            </div>
          ))
        )}
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