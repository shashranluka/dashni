import React, { createContext, useState, useEffect, useContext } from "react";
import newRequest from "../utils/newRequest";

// შექმენით კონტექსტი
const LanguageContext = createContext();

// კონტექსტის გამოყენების ჰუკი (გაამარტივებს კონტექსტის მოხმარებას)
export const useLanguage = () => useContext(LanguageContext);

// კონტექსტის პროვაიდერი
export default function LanguageProvider({ children }) {
  // ენის სტეიტი, თავდაპირველად localStorage-დან, მაგრამ ნაგულისხმევი მნიშვნელობის გარეშე
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage || null; // null ნიშნავს რომ არაა არჩეული
  });

  // ენების ბაზისური ინფორმაცია (კოდი + დასახელება)
  const [languagesList, setLanguagesList] = useState([]);
  // ენების დეტალური ინფორმაცია (სრული მონაცემები თითოეული ენისთვის)
  const [languagesDetails, setLanguagesDetails] = useState({});
  
  // ჩატვირთვის მდგომარეობები
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // ბაზისური ენების სიის ჩატვირთვა (მხოლოდ კოდები და დასახელებები)
  useEffect(() => {
    const fetchLanguagesList = async () => {
      try {
        setLoadingList(true);
        const response = await newRequest.get("/languages/basic");
        console.log("Fetched languages list:", response.data);
        setLanguagesList(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching languages list:", err);
        setError("ენების სიის ჩატვირთვა ვერ მოხერხდა");
      } finally {
        setLoadingList(false);
      }
    };

    fetchLanguagesList();
  }, []);

  // კონკრეტული ენის დეტალების ჩატვირთვის ფუნქცია
  const fetchLanguageDetails = async (langCode) => {
    // თუ უკვე გვაქვს ამ ენის დეტალები, აღარ ჩავტვირთოთ
    if (languagesDetails[langCode]) return;

    try {
      setLoadingDetails(true);
      const response = await newRequest.get(`/languages/${langCode}/details`);
      
      // დავამატოთ ახალი ენის დეტალები არსებულ ობიექტში
      setLanguagesDetails(prevDetails => ({
        ...prevDetails,
        [langCode]: response.data
      }));
      
      // შევინახოთ ენის დეტალები localStorage-ში კეშირებისთვის
      const cachedDetails = JSON.parse(localStorage.getItem("languageDetails") || "{}");
      cachedDetails[langCode] = response.data;
      localStorage.setItem("languageDetails", JSON.stringify(cachedDetails));
      
      setError(null);
    } catch (err) {
      console.error(`Error fetching details for language ${langCode}:`, err);
      setError(`ენის დეტალების ჩატვირთვა ვერ მოხერხდა: ${langCode}`);
    } finally {
      setLoadingDetails(false);
    }
  };

  // როცა ენა იცვლება, ჩავტვირთოთ ახალი ენის დეტალები თუ საჭიროა
  useEffect(() => {
    if (language && !languagesDetails[language]) {
      fetchLanguageDetails(language);
    }
  }, [language, languagesDetails]);

  // აპლიკაციის ჩატვირთვისას, მოვიძიოთ კეშირებული ენის დეტალები
  useEffect(() => {
    const cachedDetailsJson = localStorage.getItem("languageDetails");
    if (cachedDetailsJson) {
      try {
        const cachedDetails = JSON.parse(cachedDetailsJson);
        setLanguagesDetails(cachedDetails);
      } catch (err) {
        console.error("Error parsing cached language details:", err);
        // კეშის წაშლა თუ არავალიდურია
        localStorage.removeItem("languageDetails");
      }
    }
  }, []);

  // ენის შეცვლის ფუნქცია
  const changeLanguage = (newLanguage) => {
    if (!newLanguage) return; // თუ ცარიელია, არაფერი გავაკეთოთ
    
    setLanguage(newLanguage);
    localStorage.setItem("selectedLanguage", newLanguage);
    
    // თუ ახალი ენის დეტალები არ გვაქვს, ჩავტვირთოთ
    if (!languagesDetails[newLanguage]) {
      fetchLanguageDetails(newLanguage);
    }
  };

  // მიმდინარე ენის დეტალების მიღება
  const getCurrentLanguageDetails = () => {
    return languagesDetails[language] || null;
  };

  // კონტექსტის მნიშვნელობა
  const value = {
    language,
    changeLanguage,
    languagesList,
    languageDetails: getCurrentLanguageDetails(),
    loadingList,
    loadingDetails,
    error,
    // დამატებითი დამხმარე ფუნქცია
    getLanguageName: (code) => {
      const lang = languagesList.find(l => l.code === code);
      return lang ? lang.name : code;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};