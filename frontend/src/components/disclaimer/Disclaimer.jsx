import React from 'react';
import './Disclaimer.scss';

const Disclaimer = () => {
  return (
    <div className="disclaimer-container">
      <div className="disclaimer-content">
        <i className="fas fa-info-circle disclaimer-icon"></i>
        <p className="disclaimer-text">
          საიტი მუშაობს სატესტო რეჟიმში. თუ რაიმე შეცდომას აღმოაჩენთ, გთხოვთ მოგვწერეთ {" "}
          <a 
            href="https://www.facebook.com/profile.php?id=61576632996642" 
            target="_blank" 
            rel="noopener noreferrer"
            className="disclaimer-link"
          >
            Facebook
          </a>
            {" "}გვერდზე.
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;