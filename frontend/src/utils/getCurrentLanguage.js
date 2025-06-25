const getSelectedLanguage = () => {

    console.log("Fetching selected language from localStorage",localStorage.getItem("selectedLanguage"));

  return  localStorage.getItem("selectedLanguage");

};

export default getSelectedLanguage;