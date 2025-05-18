import React, { useEffect, useState, useRef } from "react"; // დაამატეთ useRef
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [open, setOpen] = useState(false);
  // შევქმნათ რეფერენსი მომხმარებლის პროფილის მენიუსთვის
  const dropdownRef = useRef(null);

  const { pathname } = useLocation();

  // დავამატოთ კლიკების დამჭერი useEffect
  useEffect(() => {
    // ფუნქცია, რომელიც შეამოწმებს კლიკებს
    const handleClickOutside = (event) => {
      // შევამოწმოთ თუ dropdownRef არსებობს და კლიკი არ მოხდა მასში
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); // დავხუროთ მენიუ
      }
    };

    // დავამატოთ მოვლენის მსმენელი document-ზე
    document.addEventListener("mousedown", handleClickOutside);

    // გავასუფთავოთ event listener-ი კომპონენტის unmount-ზე
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]); // დამოკიდებულია მხოლოდ dropdownRef-ზე

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

  return (
    <div className="header">
      <div className="navbar">
        <div className="logo">
          <Link className="link" to="/">
            <img src="/img/logo.png" className="logo" alt="" />
          </Link>
        </div>
        <div className="links">
          {currentUser ? (
            <div className="userpanel">
              {/* გამოვიყენოთ ref დროფდაუნისთვის - მნიშვნელოვანია ref იყოს მთლიანად მენიუს კონტეინერზე */}
              <div className="user-dropdown-container" ref={dropdownRef}>
                <div className="user" onClick={() => setOpen(!open)}>
                  <div className="username">
                    <span>{currentUser?.username}</span>
                  </div>
                  {open && (
                    <div className="options">
                      <Link className="addWordsLink" to={"/addwordsdata"}>
                        სიტყვების დამატება
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
