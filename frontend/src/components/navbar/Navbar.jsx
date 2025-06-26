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
  const { language, changeLanguage } = useLanguage();

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

  // ენის ცვლილების დამჭერი ფუნქცია
  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="header">
      <div className="navbar">
        <div className="logo">
          <Link className="link" to="/">
            <img src="/img/logo.png" className="logo" alt="" />
          </Link>
        </div>

        {/* ენის არჩევის ელემენტი */}
        <div className="language-selector">
          <select
            id="language-select"
            name="language"
            value={language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            <option value="ka">🇬🇪 ქართული</option>
            <option value="en">🇬🇧 ინგლისური</option>
            <option value="de">🇩🇪 გერმანული</option>
            <option value="fr">🇫🇷 ფრანგული</option>
            <option value="ba">თუშური</option>
          </select>
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
