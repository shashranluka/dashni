import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Navbar.scss";

function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const navigate = useNavigate();

  function goToAddSentences() {
    navigate("/add-data");
    console.log("dwafass")
  }
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
      <div className={active || pathname !== "/" ? "navbar " : "navbar"}>
        <div className="logo">
          <Link className="link" to="/">
            {/* <span className="website-name">დაშნი</span> */}
            <img src="/img/logo.png" className="logo" alt="" />
          </Link>
          {/* <span className="dot">.</span> */}
        </div>
        <div className="links">
          {/* <span>Fiverr Business</span>
          <span>Explore</span>
          <span>English</span> */}
          {/* {!currentUser?.isSeller && <span>Become a Seller</span>} */}
          {currentUser ? (
            <div className="userpanel">
              <Link className="roomlink" to={currentUser.isSeller ? "/myroom" : "/myschool"}>
                <span className="mydoor">
                  {currentUser.isSeller ? "ჩემი ოთახი" : "ჩემი სკოლა"}
                </span>
              </Link>
              <div className="user" onClick={() => setOpen(!open)}>
                {/* <img src={currentUser.img || "/img/noavatar.jpg"} alt="" /> */}
                <div className="username">
                  <span>{currentUser?.username}</span>
                </div>
                {open && (
                  <div className="options">
                    {/* {currentUser.isSeller ? (
                      <>
                        <Link className="link" to="/myroom">
                          ჩემი ოთახი
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link className="link" to="/myschool">
                          ჩემი სკოლა
                        </Link>
                      </>
                    )} */}
                    <Link className="addWordsLink" to={"/addwordsdata"}>
                      სიტყვების დამატება
                    </Link>
                    <Link className="addTextLink" to={"/add-data"}>
                      ტექსტის დამატება
                    </Link>
                    <Link className="addVideoLink" to={"/addvideodata"}>
                      ვიდეოს დამატება
                    </Link>
                    <Link className="logoutlink" onClick={handleLogout}>
                      გამოსვლა
                    </Link>
                  </div>
                )}
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
      {/* {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu">
            <Link className="link menuLink" to="/">
              Graphics & Design
            </Link>
            <Link className="link menuLink" to="/">
              Video & Animation
            </Link>
            <Link className="link menuLink" to="/">
              Writing & Translation
            </Link>
            <Link className="link menuLink" to="/">
              AI Services
            </Link>
            <Link className="link menuLink" to="/">
              Digital Marketing
            </Link>
            <Link className="link menuLink" to="/">
              Music & Audio
            </Link>
            <Link className="link menuLink" to="/">
              Programming & Tech
            </Link>
            <Link className="link menuLink" to="/">
              Business
            </Link>
            <Link className="link menuLink" to="/">
              Lifestyle
            </Link>
          </div>
          <hr />
        </>
      )} */}
    </div>
  );
}

export default Navbar;
