import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";
// import { get } from "mongoose";
import getSelectedLanguage from "../../utils/getCurrentLanguage";
import { useLanguage } from "../../context/LanguageContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ენის კონტექსტის გამოყენება
  const { 
    language, 
    changeLanguage, 
    languagesList, 
    loadingList, 
    error 
  } = useLanguage();

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

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    if (selectedLang !== "") {
      changeLanguage(selectedLang);
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

        {/* ენის არჩევის გადაკეთებული ელემენტი */}
        <div className="language-selector">
          {loadingList ? (
            <span className="loading-languages">იტვირთება...</span>
          ) : error ? (
            <span className="error-languages">შეცდომა</span>
          ) : (
            <select 
              value={language || ""} 
              onChange={handleLanguageChange}
              className={`language-select ${!language ? 'placeholder-shown' : ''}`}
            >
              <option value="" disabled>
                აირჩიე ენა
              </option>
              {languagesList.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
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
