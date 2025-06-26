import React, { createContext, useState, useEffect, useContext } from "react";

// შექმენით კონტექსტი
const LanguageContext = createContext();

// კონტექსტის გამოყენების ჰუკი (გაამარტივებს კონტექსტის მოხმარებას)
export const useLanguage = () => useContext(LanguageContext);

// კონტექსტის პროვაიდერი
export default function LanguageProvider({ children }) {
  // ენის სტეიტი, თავდაპირველად localStorage-დან
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage || "ba"; // ნაგულისხმევი - ქართული
  });

  // ენის შეცვლის ფუნქცია
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("selectedLanguage", newLanguage);
  };

  // ენის ცვლილების შენახვა localStorage-ში
  useEffect(() => {
    localStorage.setItem("selectedLanguage", language);
  }, [language]);

  // კონტექსტის მნიშვნელობა, რომელიც ხელმისაწვდომი იქნება კომპონენტებისთვის
  const value = {
    language,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};