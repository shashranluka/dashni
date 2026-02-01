import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
import './Navbar.scss';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await newRequest.post('auth/logout');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
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
          
          {currentUser ? (
            <div className="user-menu">
              <div className="user-info" onClick={() => setOpen(!open)}>
                <img 
                  src={currentUser.img || '/img/noavatar.jpg'} 
                  alt="user"
                  className="user-avatar"
                />
                <span>{currentUser.username}</span>
              </div>
              
              {open && (
                <div className="dropdown">
                  <Link to="/my-page" onClick={() => setOpen(false)}>
                    ჩემი გვერდი
                  </Link>
                  {currentUser.is_admin && (
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
              {/* <Link to="/login">შესვლა</Link>
              <Link to="/register" className="register-btn">
                შექმნა
              </Link> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
