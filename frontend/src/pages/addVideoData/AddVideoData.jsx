import React, { useReducer, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import newRequest from '../../utils/newRequest';
import { useLanguage } from "../../context/LanguageContext";
import {
  videoDataReducer,
  INITIAL_STATE,
} from "../../reducers/videoDataReducer";
import WordCardsGenerator from "../../components/WordCardsGenerator/WordCardsGenerator";
import "./AddVideoData.scss";

const AddVideoData = () => {
  // ✅ LanguageContext-ის გამოყენება
  const { language, isLanguageSelected } = useLanguage();

  const [state, dispatch] = useReducer(videoDataReducer, INITIAL_STATE);
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ✅ WordCards-იდან მიღებული მონაცემები
  const [generatedWordsData, setGeneratedWordsData] = useState(null);

  // ✅ ენების სიის ჩატვირთვა
  // const {
  //   data: languagesList = [],
  //   isLoading: loadingLanguages,
  //   error: languagesError
  // } = useQuery({
  //   queryKey: ['languages'],
  //   queryFn: async () => {
  //     const response = await newRequest.get('/languages');
  //     return response.data;
  //   },
  //   staleTime: 5 * 60 * 1000,
  // });


  // ✅ ვალიდაციის ფუნქცია
  const validateForm = () => {
    const newErrors = {};

    if (!state.title?.trim()) {
      newErrors.title = 'სათაური აუცილებელია';
    }

    if (!state.videoUrl?.trim()) {
      newErrors.videoUrl = 'ვიდეოს URL აუცილებელია';
    } else if (!isValidURL(state.videoUrl)) {
      newErrors.videoUrl = 'არასწორი URL ფორმატი';
    }

    if (!language?.code) {
      newErrors.language = 'ენის არჩევა აუცილებელია';
    }

    if (!state.subs?.trim()) {
      newErrors.subs = 'სუბტიტრები აუცილებელია';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ URL ვალიდაციის ფუნქცია
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });

    // ✅ Error-ის წაშლა ტაიპინგისას
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: undefined
      }));
    }
  };

  const handleFeature = (e) => {
    e.preventDefault();
    const featureValue = e.target[0].value.trim();

    if (featureValue) {
      dispatch({
        type: "ADD_FEATURE",
        payload: featureValue,
      });
      e.target[0].value = "";
    }
  };

  // ✅ გაუმჯობესებული submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ✅ ენის ინფორმაციის ჩართვა
    const videoData = {
      ...state,
      language: language.code,
      languageName: language.name
    };

    mutation.mutate(videoData);
  };

  // ✅ Mutation გაუმჯობესებული error handling-ით
  const mutation = useMutation({
    mutationFn: (videoData) => {
      return newRequest.post("/videodatas", videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["videodatas"]);
      // navigate("/videos");
    },
    onError: (error) => {
      console.error("ვიდეოს შენახვის შეცდომა:", error);
      setErrors({
        submit: error.response?.data?.message || "ვიდეოს შენახვა ვერ მოხერხდა"
      });
    },
  });

  // ✅ WordCardsGenerator-იდან callback
  const handleWordsGenerated = (wordsData) => {
    setGeneratedWordsData(wordsData);
    console.log('მიღებული მონაცემები WordCardsGenerator-იდან:', wordsData);
  };

  // ✅ Loading state-ის შემოწმება
  // if (loadingLanguages) {
  //   return <div className="loading">ენები იტვირთება...</div>;
  // }

  // // ✅ Error state-ის შემოწმება
  // if (languagesError) {
  //   return <div className="error">ენების ჩატვირთვა ვერ მოხერხდა</div>;
  // }

  return (
    <div className="add-video">
      <div className="container">
        <h1>ახალი ვიდეოს მონაცემების დამატება</h1>

        {/* ✅ ენის არჩევის გაფრთხილება */}
        {!isLanguageSelected && (
          <div className="language-warning">
            <p>⚠️ გთხოვთ ჯერ აირჩიოთ ენა Navbar-იდან</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sections">
          <div className="info">
            {/* ✅ სათაური */}
            <div className="field">
              <label htmlFor="title">სათაური *</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="ვიდეოს სათაური"
                onChange={handleChange}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* ✅ ვიდეოს URL */}
            <div className="field">
              <label htmlFor="videoUrl">ვიდეოს URL *</label>
              <input
                id="videoUrl"
                type="url"
                name="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={handleChange}
                className={errors.videoUrl ? 'error' : ''}
              />
              {errors.videoUrl && <span className="error-message">{errors.videoUrl}</span>}
            </div>

            {/* ✅ არჩეული ენის ჩვენება */}
            <div className="field">
              <label>არჩეული ენა *</label>
              {isLanguageSelected ? (
                <div className="selected-language">
                  <span className="language-display">
                    🌐 {language.name} ({language.code})
                  </span>
                  <small>ენის შესაცვლელად გამოიყენეთ Navbar</small>
                </div>
              ) : (
                <div className="no-language">
                  <span className="error-message">ენა არ არის არჩეული</span>
                </div>
              )}
            </div>

            {/* ✅ სუბტიტრები */}
            <div className="field">
              <label htmlFor="subs">სუბტიტრები *</label>
              <textarea
                id="subs"
                name="subs"
                placeholder="ვიდეოს სუბტიტრები..."
                cols="0"
                rows="16"
                onChange={handleChange}
                className={errors.subs ? 'error' : ''}
              />
              {errors.subs && <span className="error-message">{errors.subs}</span>}
            </div>

            {/* ✅ აღწერა */}
            <div className="field">
              <label htmlFor="shortDesc">აღწერა</label>
              <textarea
                id="shortDesc"
                name="shortDesc"
                onChange={handleChange}
                placeholder="ვიდეოს მოკლე აღწერა..."
                cols="30"
                rows="10"
              />
            </div>

            {/* ✅ თეგები */}
            <div className="field">
              <div className="tags">
                <label htmlFor="">თეგები</label>
                <form className="add" onSubmit={handleFeature}>
                  <input type="text" placeholder="თეგი (მაგ: გრამატიკა)" />
                  <button type="submit">თეგის დამატება</button>
                </form>
                <div className="addedFeatures">
                  {state?.features?.map((feature, index) => (
                    <div key={index} className="item">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: "REMOVE_FEATURE", payload: feature })
                        }
                        className="tag-item"
                      >
                        {feature}
                        <span className="remove">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ Submit Error */}
            {errors.submit && (
              <div className="submit-error">
                <span className="error-message">{errors.submit}</span>
              </div>
            )}

            {/* ✅ Submit ღილაკი */}
            <button
              type="submit"
              disabled={mutation.isLoading || !isLanguageSelected}
              className="submit-button"
            >
              {mutation.isLoading ? 'ინახება...' : 'შენახვა'}
            </button>

            {/* ✅ სიტყვების გენერირების კომპონენტი */}
            <WordCardsGenerator 
              subtitles={state.subs}
              onWordsGenerated={handleWordsGenerated}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoData;
