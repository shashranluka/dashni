import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { isEditorUser, isAdminUser, isPrivateContributorUser } from "../../utils/roles";
import "./Navbar.scss";

function Navbar() {
  const { user: currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    // context-ი თავად განაახლებს ინტერფეისს, ამიტომ გვერდის გადატვირთვა
    // (window.location.reload) აღარ არის საჭირო.
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Dashni Logo" className="logo-img" />
          <span></span>
        </Link>

        <div className="nav-links">
          {/* <Link to="/words">სიტყვები</Link>
          <Link to="/sentences">წინადადებები</Link> */}
          {/* <Link to="/poligon">პოლიგონი</Link> */}


          {currentUser ? (
            <div className="user-menu">
              <div className="user-info" onClick={() => setOpen(!open)}>
                {/* <img
                  src={currentUser.img || ""}
                  alt="user"
                  className="user-avatar"
                /> */}
                <span>{currentUser.username}</span>
              </div>

              {open && (
                <div className="dropdown">
                  <Link to="/my-page" onClick={() => setOpen(false)}>
                    ჩემი გვერდი
                  </Link>
                  {isPrivateContributorUser(currentUser) && (
                    <>
                      <Link to="/add-words" onClick={() => setOpen(false)}>
                        სიტყვების დამატება
                      </Link>
                      <Link to="/my-words" onClick={() => setOpen(false)}>
                        ჩემი სიტყვები
                      </Link>
                    </>
                  )}
                  {isEditorUser(currentUser) && (
                    <>
                      <Link to="/editor-page" onClick={() => setOpen(false)}>
                        ტექსტების რედაქტირება
                      </Link>
                      <Link to="/add-lexicons" onClick={() => setOpen(false)}>
                        ლექსიკონების დამატება
                      </Link>
                      <Link to="/lexicon-search" onClick={() => setOpen(false)}>
                        ლექსიკონებში ძიება
                      </Link>
                    </>
                  )}
                  {isAdminUser(currentUser) && (
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      ადმინ პანელი
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    გასვლა
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">შესვლა</Link>
              <Link to="/register" className="register-btn">
                შექმნა
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
