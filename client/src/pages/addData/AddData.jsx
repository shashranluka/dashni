import React, { useMemo, useReducer, useState, useEffect, useRef } from "react";
import "./AddData.scss";
import {
  sentenceReducer,
  SENTENCE_INITIAL_STATE,
  wordsReducer,
  WORDS_INITIAL_STATE,
} from "../../reducers/sentenceReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
// import Keyboardnew from "../../components/keyboard/Keyboard_classes_dont works";
import KeyboardRare from "../../components/keyboard/KeyboardRare";
import Select from "react-select";

export default function AddData() {
  const [keyboardChosenLetter, setKeyboardChosenLetter] = useState(null);
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const [sentenceState, dispatchSentence] = useReducer(
    sentenceReducer,
    SENTENCE_INITIAL_STATE
  );
  const [wordsState, dispatchWords] = useReducer(
    wordsReducer,
    WORDS_INITIAL_STATE
  );
  const [wordsFromSentence, setWordsFromSentence] = useState([]);
  const [chosenToFill, setChosenToFill] = useState([]);
  console.log(sentenceState);
  const ref = useRef(null);

  const handleInputClick = (e) => {
    // ref.current.focus();
    setInputName(e.target.name)
    setInputValue(e.target.value)

    console.log("dwadwa",e.target)
  };
  console.log("d", inputName,inputValue)
  const keyboardEvent = () => { };
  const handleSentencePartChange = (e) => {
    // setInputText(e.target.value)
    console.log("handleChange", e.target);
    dispatchSentence({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  const handleWordsPartChange = (e) => {
    // console.log("handleChange", e.target);
    dispatchWords({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  const handleFeature = (e) => {
    e.preventDefault();
    dispatchSentence({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover = await upload(singleFile);

      const images = await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      );
      setUploading(false);
      dispatchSentence({ type: "ADD_IMAGES", payload: { cover, images } });
    } catch (err) {
      console.log(err);
    }
  };

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutationSentence = useMutation({
    mutationFn: (sentence) => {
      console.log("gig", sentence);
      return newRequest.post("/sentences", sentence);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });
  const mutationWords = useMutation({
    mutationFn: (words) => {
      console.log("words", words);
      return newRequest.post("/words", words);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
    },
  });
  // console.log(sentenceState, wordsState, "dawdwa", wordsFromSentence);
  //იძახებს mutationს და გადაჰყავს სხვა გვერდზე
  const handleSubmit = (e) => {
    e.preventDefault();
    mutationSentence.mutate(sentenceState);
    mutationWords.mutate(wordsState);
    // navigate("/mygigs");
    console.log(sentenceState.originalSentence.split(" "));
    // const wordsFromSentence = state.originalSentence.split(" ");
  };

  useEffect(() => {
    console.log("useEffect");
  }, []);

  return (
    <div className="add-data">
      <div className="container">
        <h1>მონაცემების დამატება</h1>
        <div className="sections">
          <div className="info">
            <div className="sentence-info">
              <label htmlFor="">წინადადება</label>
              <input
                // ref={ref}
                value={sentenceState.originalSentence}
                type="text"
                name="originalSentence"
                placeholder=""
                onChange={handleSentencePartChange}
                onClick={handleInputClick}
                //   (e) =>
              //   dispatchSentence({
              //     type: "CHANGE_INPUT",
              //     payload: { name: e.target.name, value: e.target.value },
              //   })
              // }
              />

              {/* <input type="text" id="fname" name="fname" value="John" /> */}
              <label htmlFor="">ქართულად თარგმნილი</label>
              <input
                type="text"
                name="translation"
                value={sentenceState.translation}
                placeholder=""
                onChange={handleSentencePartChange}
                onClick={handleInputClick}
              />
              <label htmlFor="">
                დამატებითი ინფორმაცია წინადადების შესახებ
              </label>
              <textarea
                name="desc"
                id=""
                placeholder="Brief descriptions to introduce your service to customers"
                cols="0"
                value={sentenceState.desc}
                // rows="16"
                onChange={handleSentencePartChange}
                onClick={handleInputClick}
                ></textarea>
              <div className="images">
                {/* <label htmlFor="">ატვირთეთ სურათი</label> */}
                {/* <input
                  type="text"
                  name="url's of images"
                  placeholder=""
                  multiple
                  onChange={
                    handleSentencePartChange
                    // console.log("onchange", e.target.files)
                    // setFiles(e.target.files);
                  }
                /> */}
                <button onClick={handleUpload}>
                  {uploading ? "იტვირთება" : "სურათის ატვირთვა"}
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setWordsFromSentence(sentenceState.originalSentence.split(" "));
              }}
            >
              სიტყვების გენერირება
            </button>
            <div className="words-info">
              <div className="sentence-by-words">
                {wordsFromSentence?.map((word, index) => (
                  <div className="card" onClick={() => setChosenToFill(index)}>
                    <div className="word-from-sentence">
                      {word}
                      {index}
                    </div>
                    <div className="details-of-words">
                      <label htmlFor=""></label>
                      <input
                        type="text"
                        name="word"
                        placeholder=""
                        onChange={handleWordsPartChange}
                      />
                      <label htmlFor=""></label>
                      <input
                        type="text"
                        name="translation"
                        placeholder=""
                        onChange={handleWordsPartChange}
                      />
                      <Select
                        options={[
                          { label: "არსებითი სახელი" },
                          // "ზედსართავი სახელი",
                          // "ნაცვალსახელი",
                        ]}
                      />
                      <label htmlFor=""></label>
                      <input
                        type="text"
                        name="translation"
                        placeholder=""
                        onChange={handleWordsPartChange}
                      />
                      <label htmlFor=""></label>
                      <input
                        type="text"
                        name="translation"
                        placeholder=""
                        onChange={handleWordsPartChange}
                      />
                      <label htmlFor=""></label>
                      <input
                        type="text"
                        name="translation"
                        placeholder=""
                        onChange={handleWordsPartChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit}>დამატება</button>
            </div>
          </div>
        </div>
      </div>
      <KeyboardRare inputName={inputName} inputValue={inputValue} setLetter={setKeyboardChosenLetter} sentenceState={sentenceState} dispatchSentence={dispatchSentence} />
    </div>
  );
}

// export default Add;

{
  /* <label htmlFor="">წინადადების ნაწილი</label>
  <select name="cat" id="cat" onChange={handleChange}>
    <option value="design">არსებითი სახელი</option>
    <option value="web">ზედსართავი სახელი</option>
    <option value="animation">რიცხვითი სახელი</option>
    <option value="music">ნაცვალსახელი</option>
    <option value="music">ზმნა</option>
    <option value="music">ზმნიზედა</option>
    <option value="music">თანდებული</option>
    <option value="music">კავშირი</option>
    <option value="music">ნაწილაკი</option>
    <option value="music">შორისდებული</option>
  </select> */
}
