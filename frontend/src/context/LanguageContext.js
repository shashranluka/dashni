import React, { createContext, useState, useEffect } from "react";

// ენის კონტექსტის შექმნა
export const LanguageContext = createContext();

// ენის პროვაიდერი კომპონენტი
export const LanguageProvider = ({ children }) => {
  // ნაგულისხმევი ენა - ქართული ("ka")
  const [language, setLanguage] = useState(() => {
    // შევამოწმოთ თუ localStorage-ში უკვე შენახულია ენის პარამეტრი
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage || "ka"; // თუ არ არის - ქართული
  });

  // ენის ცვლილებისას შევინახოთ localStorage-ში
  useEffect(() => {
    localStorage.setItem("selectedLanguage", language);
    // აქ შეგვიძლია დოკუმენტის lang ატრიბუტიც შევცვალოთ
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};