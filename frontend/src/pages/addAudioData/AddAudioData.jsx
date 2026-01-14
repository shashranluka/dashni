import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import newRequest from '../../utils/newRequest';
import KeyboardRare from "../../components/keyboard/KeyboardRare";
import "./AddAudioData.scss";

const initialState = {
  title: "",
  description: "",
  subtitles: "",
};

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "CHANGE_INPUT":
      // KeyboardRare-ისთვის
      return { ...state, [action.payload.name]: action.payload.value };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
}

const AddAudioData = () => {
  const [formData, dispatch] = React.useReducer(formReducer, initialState);
  const [audioFile, setAudioFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ვალიდაცია
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "სათაური აუცილებელია";
    if (!audioFile) newErrors.audioFile = "აუდიო ფაილი აუცილებელია";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ატვირთვის ფუნქცია
  const mutation = useMutation({
    mutationFn: async (formDataToSend) => {
      setUploading(true);
      const response = await newRequest.post("/audiodatas", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploading(false);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["audiodatas"]);
      navigate("/audios");
    },
    onError: (error) => {
      setUploading(false);
      setErrors({
        submit: error.response?.data?.message || "აუდიოს შენახვა ვერ მოხერხდა"
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FIELD", field: name, value });
    setInputName(name);
    setInputValue(value);
  };

  const handleInputClick = (e) => {
    setInputName(e.target.name);
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("audio", audioFile);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("subtitles", formData.subtitles);

    mutation.mutate(formDataToSend);
  };

  return (
    <div className="add-audio">
      <div className="container">
        <h1>ახალი აუდიო ჩანაწერის დამატება</h1>
        <form onSubmit={handleSubmit} className="sections">
          <div className="field">
            <label htmlFor="title">სათაური *</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="აუდიოს სათაური"
              value={formData.title}
              onChange={handleChange}
              onClick={handleInputClick}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="field">
            <label htmlFor="audioFile">აუდიო ფაილი *</label>
            <input
              id="audioFile"
              type="file"
              name="audioFile"
              accept="audio/*"
              onChange={e => setAudioFile(e.target.files[0])}
              className={errors.audioFile ? 'error' : ''}
            />
            {errors.audioFile && <span className="error-message">{errors.audioFile}</span>}
          </div>
          <div className="field">
            <label htmlFor="description">აღწერა</label>
            <textarea
              id="description"
              name="description"
              placeholder="აუდიოს მოკლე აღწერა..."
              value={formData.description}
              onChange={handleChange}
              onClick={handleInputClick}
              rows="6"
            />
          </div>
          {/* ✅ სუბტიტრების განყოფილება */}
          <div className="field">
            <label htmlFor="subtitles">სუბტიტრები</label>
            <textarea
              id="subtitles"
              name="subtitles"
              placeholder="სუბტიტრები (მაგ: ტექსტი, დროის კოდი...)"
              value={formData.subtitles}
              onChange={handleChange}
              onClick={handleInputClick}
              rows="6"
            />
          </div>
          {errors.submit && (
            <div className="submit-error">
              <span className="error-message">{errors.submit}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={mutation.isLoading || uploading}
            className="submit-button"
          >
            {mutation.isLoading || uploading ? 'ინახება...' : 'შენახვა'}
          </button>
        </form>
      </div>
      {/* ✅ KeyboardRare კომპონენტი AddWords-ის მსგავსად */}
      <KeyboardRare
        inputName={inputName}
        inputValue={inputValue}
        textState={formData}
        dispatchText={dispatch}
      />
    </div>
  );
};

export default AddAudioData;