import React, { createContext, useState, useContext } from "react";

// შექმენით კონტექსტი
const LanguageContext = createContext();

// კონტექსტის გამოყენების ჰუკი
export const useLanguage = () => useContext(LanguageContext);

// კონტექსტის პროვაიდერი
export default function LanguageProvider({ children }) {
  // ✅ temp-save ვერსია - მხოლოდ არჩეული ენის ბაზისური ინფორმაცია
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const savedLanguageJson = localStorage.getItem("selectedLanguage");
    if (savedLanguageJson) {
      try {
        return JSON.parse(savedLanguageJson);
      } catch (error) {
        console.error("Error parsing saved language:", error);
        localStorage.removeItem("selectedLanguage");
      }
    }
    return null; // null ნიშნავს რომ არაა არჩეული
  });

  // ✅ ენის reset ფუნქცია
  const resetLanguage = () => {
    setSelectedLanguage(null);
    localStorage.removeItem("selectedLanguage");
  };

  // ✅ ენის შეცვლის ფუნქცია
  const changeLanguage = (languageData) => {
    if (!languageData) {
      resetLanguage(); // DRY პრინციპი
      return;
    }
    
    console.log("Changing language to:", languageData);

    // ვალიდაცია
    if (!languageData._id || !languageData.code || !languageData.name) {
      console.error("Invalid language data:", languageData);
      return;
    }

    const languageInfo = {
      id: languageData._id,
      code: languageData.code,
      name: languageData.name
    };

    setSelectedLanguage(languageInfo);
    localStorage.setItem("selectedLanguage", JSON.stringify(languageInfo));
  };

  console.log("Selected Language:", selectedLanguage);

  // ✅ მარტივი და ნათელი value
  const value = {
    language: selectedLanguage,        // { id, code, name } ან null
    changeLanguage,
    resetLanguage,
    isLanguageSelected: !!selectedLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}