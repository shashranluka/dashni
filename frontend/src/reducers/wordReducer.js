export const initialState = {
    word: '',
    translation: '',
    definition: '',
    language: '',
    additionalInfo: '',
    partOfSpeech: '',
    baseForm: '',
    baseFormTranslation: '',
    usageExamples: '',
  };
  
export  const formReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_FIELD':
        return {
          ...state,
          [action.field]: action.value,
        };
      case 'RESET_FORM':
        return {
          ...initialState,
          language: state.language, // ენის ველი არ იწმინდება
        };
      default:
        return state;
    }
  };
  
