export const TEXT_INITIAL_STATE = {
  title: "",
  text: "",
  translation: "",
  tags: [],
  themes: [],
  difficulty: "",
  isPublic: false,
};

export const textReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    case "ADD_TAG":
      if (!state.tags.includes(action.payload)) {
        return {
          ...state,
          tags: [...state.tags, action.payload],
        };
      }
      return state;
    case "REMOVE_TAG":
      return {
        ...state,
        tags: state.tags.filter((tag) => tag !== action.payload),
      };
    case "SET_THEMES":
      return {
        ...state,
        themes: action.payload,
      };
    case "ADD_THEME":
      if (!state.themes.includes(action.payload)) {
        return {
          ...state,
          themes: [...state.themes, action.payload],
        };
      }
      return state;
    default:
      return state;
  }
};

export const WORDS_INITIAL_STATE = {
  userId: JSON.parse(localStorage.getItem("currentUser"))?._id,
  words: [],
};

export const wordsReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_INPUT":
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
  }
};
