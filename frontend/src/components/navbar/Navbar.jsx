import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Dashni
        </Link>
        
        <div className="nav-links">
          <Link to="/words">სიტყვები</Link>
          <Link to="/sentences">წინადადებები</Link>
          <Link to="/login">შესვლა</Link>
          <Link to="/register" className="register-btn">
            რეგისტრაცია
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
