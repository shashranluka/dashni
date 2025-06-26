import React, { useReducer, useState, useRef, useEffect } from "react";
import "./AddTextData.scss";
import {
  textReducer,
  TEXT_INITIAL_STATE,
} from "../../reducers/textReducer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import KeyboardRare from "../../components/keyboard/KeyboardRare";
import Select from "react-select";
import CreatableSelect from "react-select/creatable"; // შემოვიტანოთ CreatableSelect
import { useLanguage } from "../../context/LanguageContext";

export default function AddTextData() {
  const { language } = useLanguage();
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  
  // გადაკეთებული reducer ტექსტისთვის
  const [textState, dispatchText] = useReducer(
    textReducer,
    TEXT_INITIAL_STATE
  );
  
  const ref = useRef(null);
  
  const handleInputClick = (e) => {
    setInputName(e.target.name);
    setInputValue(e.target.value);
  };
  
  const handleTextChange = (e) => {
    dispatchText({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
    
    // ვალიდაციის შეცდომის გასუფთავება ველის შევსებისას
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => ({
        ...prev,
        [e.target.name]: null
      }));
    }
  };
  
  const handleThemeChange = (selectedOptions) => {
    setSelectedThemes(selectedOptions);
    dispatchText({
      type: "SET_THEMES",
      payload: selectedOptions.map(option => option.value)
    });
  };
  
  // ახალი თემის დამატების ფუნქცია
  const handleCreateTheme = (inputValue) => {
    // ახალი ღირებულების შექმნა
    const newValue = {
      value: inputValue.toLowerCase().replace(/\s+/g, '_'),
      label: inputValue
    };
    
    // დაემატოს არჩეულ თემებში
    setSelectedThemes(prev => [...prev, newValue]);
    
    // დაემატოს textState-ში
    dispatchText({
      type: "ADD_THEME",
      payload: newValue.value
    });
    
    return newValue;
  };
  
  const handleAddTag = (e) => {
    e.preventDefault();
    dispatchText({
      type: "ADD_TAG",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutationText = useMutation({
    mutationFn: (text) => {
      return newRequest.post("/texts", text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myTexts"]);
      navigate("/my-page");
    },
    onError: (error) => {
      console.error("ტექსტის შენახვის შეცდომა:", error);
    }
  });

  const validateForm = () => {
    const errors = {};
    
    if (!textState.title || textState.title.trim() === "") {
      errors.title = "სათაურის შევსება აუცილებელია";
    }
    
    if (!textState.text || textState.text.trim() === "") {
      errors.text = "ტექსტის შევსება აუცილებელია";
    }
    
    if (!textState.translation || textState.translation.trim() === "") {
      errors.translation = "თარგმანის შევსება აუცილებელია";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ფორმის ვალიდაცია
    if (!validateForm()) {
      return;
    }
    
    // localStorage-დან მოვიპოვოთ ენის ინფორმაცია
    const storedLanguage = localStorage.getItem("language") || language;
    
    // დავამატოთ ენა ტექსტის ობიექტში
    const textToSubmit = {
      ...textState,
      language: storedLanguage, // localStorage-დან აღებული ენა
      themes: selectedThemes.map(theme => theme.value),
      createdAt: new Date(),
      isPublic: true
    };
    
    mutationText.mutate(textToSubmit);
  };

  // თემების ოფციები Select კომპონენტისთვის
  const themeOptions = [
    { value: 'literature', label: 'ლიტერატურა' },
    { value: 'science', label: 'მეცნიერება' },
    { value: 'history', label: 'ისტორია' },
    { value: 'culture', label: 'კულტურა' },
    { value: 'technology', label: 'ტექნოლოგია' },
    { value: 'daily_life', label: 'ყოველდღიური ცხოვრება' },
    { value: 'travel', label: 'მოგზაურობა' },
    { value: 'food', label: 'საკვები' },
    { value: 'nature', label: 'ბუნება' },
    { value: 'sports', label: 'სპორტი' },
  ];

  // მომხმარებლის ენის შეცვლისას, localStorage-ში შენახვა
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <div className="add-text-data">
      <div className="container">
        <h1>ტექსტის დამატება</h1>
        <div className="sections">
          <div className="info">
            <div className="text-info">
              <label htmlFor="title">
                სათაური <span className="required">*</span>
              </label>
              <input
                value={textState.title}
                type="text"
                name="title"
                placeholder="შეიყვანეთ ტექსტის სათაური"
                onChange={handleTextChange}
                onClick={handleInputClick}
                className={validationErrors.title ? "error-input" : ""}
                required
              />
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
              
              <label htmlFor="text">
                ტექსტი <span className="required">*</span>
              </label>
              <textarea
                name="text"
                value={textState.text}
                placeholder="შეიყვანეთ ტექსტი"
                rows="10"
                onChange={handleTextChange}
                onClick={handleInputClick}
                className={validationErrors.text ? "error-input" : ""}
                required
              ></textarea>
              {validationErrors.text && (
                <div className="error-message">{validationErrors.text}</div>
              )}
              
              <label htmlFor="translation">
                თარგმანი (ქართულად) <span className="required">*</span>
              </label>
              <textarea
                name="translation"
                value={textState.translation}
                placeholder="შეიყვანეთ ტექსტის თარგმანი"
                rows="10"
                onChange={handleTextChange}
                onClick={handleInputClick}
                className={validationErrors.translation ? "error-input" : ""}
                required
              ></textarea>
              {validationErrors.translation && (
                <div className="error-message">{validationErrors.translation}</div>
              )}
              
              <label>თემები</label>
              <div className="theme-select-container">
                <CreatableSelect
                  isMulti
                  name="themes"
                  options={themeOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="აირჩიეთ ან დაამატეთ ახალი თემა"
                  onChange={handleThemeChange}
                  value={selectedThemes}
                  formatCreateLabel={(inputValue) => `დაამატე "${inputValue}"`}
                  onCreateOption={handleCreateTheme}
                />
                <div className="theme-help-text">
                  დაამატეთ ახალი თემა ტექსტის ჩაწერით და Enter-ის დაჭერით
                </div>
              </div>
              
              <label>სირთულის დონე</label>
              <Select
                name="difficulty"
                options={[
                  { value: 'beginner', label: 'დამწყები' },
                  { value: 'intermediate', label: 'საშუალო' },
                  { value: 'advanced', label: 'მოწინავე' }
                ]}
                className="basic-select"
                classNamePrefix="select"
                placeholder="აირჩიეთ სირთულის დონე"
                onChange={(option) => dispatchText({
                  type: "CHANGE_INPUT",
                  payload: { name: "difficulty", value: option.value }
                })}
              />
              
              <div className="tags-section">
                <label>ტეგები</label>
                <form onSubmit={handleAddTag} className="add-tag-form">
                  <input type="text" placeholder="დაამატეთ ტეგი" />
                  <button type="submit">+</button>
                </form>
                <div className="tags">
                  {textState.tags?.map((tag, index) => (
                    <div className="tag" key={index}>
                      <span>{tag}</span>
                      <button 
                        onClick={() => 
                          dispatchText({ 
                            type: "REMOVE_TAG", 
                            payload: tag 
                          })
                        }
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="selected-language-info">
                <p>
                  <strong>არჩეული ენა:</strong> {
                    language === "ka" ? "🇬🇪 ქართული" :
                    language === "en" ? "🇬🇧 ინგლისური" :
                    language === "de" ? "🇩🇪 გერმანული" :
                    language === "fr" ? "🇫🇷 ფრანგული" :
                    language === "ba" ? "თუშური" : language
                  }
                </p>
                <p className="language-note">
                  (ენის შესაცვლელად გამოიყენეთ ენის ჩამოსაშლელი მენიუ ზედა პანელში)
                </p>
              </div>
              
              <div className="submission">
                <button 
                  onClick={handleSubmit} 
                  className="submit-button"
                  disabled={mutationText.isLoading}
                >
                  {mutationText.isLoading ? "ინახება..." : "ტექსტის დამატება"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <KeyboardRare
        inputName={inputName}
        inputValue={inputValue}
        textState={textState}
        dispatchText={dispatchText}
      />
    </div>
  );
}
