import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";
import { useLanguage } from "../../context/LanguageContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ გამარტივებული ენის კონტექსტი (temp-save version)
  const { 
    language,           // { id, code, name } ან null
    changeLanguage, 
    resetLanguage, 
    isLanguageSelected 
  } = useLanguage();

  // ✅ ენების სიის ჩატვირთვა React Query-ით (temp-save version)
  const { 
    data: languagesList = [], 
    isLoading: loadingLanguages, 
    error: languagesError 
  } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await newRequest.get('/languages/basic');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 წუთი
    cacheTime: 10 * 60 * 1000, // 10 წუთი
    retry: 2,
  });
  console.log("Languages List:", languagesList);

  // კლიკების დამჭერი useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      localStorage.setItem("currentUser", null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ ენის შეცვლის გაუმჯობესებული ფუნქცია (temp-save version)
  const handleLanguageChange = (e) => {
    const selectedCode = e.target.value;
    
    if (!selectedCode) {
      resetLanguage(); // ენის გასუფთავება
      return;
    }

    // არჩეული ენის მოძებნა სიაში
    const selectedLang = languagesList.find(lang => lang.code === selectedCode);
    if (selectedLang) {
      changeLanguage({
        _id: selectedLang._id,
        code: selectedLang.code,
        name: selectedLang.name
      });
    }
  };

  return (
    <div className="header">
      <div className="navbar">
        <div className="logo">
          <Link className="link" to="/">
            <img src="/img/logo.png" className="logo" alt="" />
          </Link>
        </div>

        {/* ✅ გაუმჯობესებული ენის არჩევის ელემენტი (temp-save version) */}
        <div className="language-selector">
          {loadingLanguages ? (
            <span className="loading-languages">ენები იტვირთება...</span>
          ) : languagesError ? (
            <div className="error-languages">
              <span>ენების ჩატვირთვა ვერ მოხერხდა</span>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-button"
              >
                ხელახლა
              </button>
            </div>
          ) : (
            <div className="language-select-container">
              <select 
                value={language?.code || ""} 
                onChange={handleLanguageChange}
                className={`language-select ${!isLanguageSelected ? 'placeholder-shown' : ''}`}
              >
                <option value="" disabled>აირჩიეთ ენა</option>
                {languagesList.map(lang => (
                  <option key={lang.id} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              
              {/* ✅ არჩეული ენის ჩვენება (commented out but available) */}
              {/* {isLanguageSelected && (
                <div className="selected-language-display">
                  <span className="selected-language-name">
                    {language.name}
                  </span>
                  <button 
                    onClick={resetLanguage}
                    className="clear-language-button"
                    title="ენის გასუფთავება"
                  >
                    ✕
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>

        <div className="links">
          {currentUser ? (
            <div className="userpanel">
              <div className="user-dropdown-container" ref={dropdownRef}>
                <div className="user" onClick={() => setOpen(!open)}>
                  <div className="username">
                    <span>{currentUser?.username}</span>
                  </div>
                  {open && (
                    <div className="options">
                      {/* ახალი ოფცია მხოლოდ ადმინისტრატორებისთვის */}
                      {currentUser.isAdmin && (
                        <Link className="adminLink" to="/admin">
                          ადმინისტრატორის პანელი
                        </Link>
                      )}
                      <Link className="mypagelink" to={"/my-page"}>
                        ჩემი გვერდი
                      </Link>
                      <Link className="addLink" to={"/addwordsdata"}>
                        სიტყვების დამატება
                      </Link>
                      <Link className="addLink" to={"/add-textdata"}>
                        ტექსტის დამატება
                      </Link>
                      <Link className="addLink" to={"/addvideodata"}>
                        ვიდეოს დამატება
                      </Link>
                      <Link className="logoutlink" onClick={handleLogout}>
                        გამოსვლა
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link className="link" to="/register">
                <button>შექმნა</button>
              </Link>
              <Link className="link sign-in" to="/login">
                შესვლა
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
