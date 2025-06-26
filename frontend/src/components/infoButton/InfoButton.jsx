import React, { useState, useRef, useEffect } from "react";
import "./InfoButton.scss";

function InfoButton({ infoData }) {
  const [showInfo, setShowInfo] = useState(false);
  const modalRef = useRef(null);
  
  // აღწერის ტექსტი მხოლოდ ქართულად
  const description = infoData;

  // მოდალის გარეთ დაკლიკების დამჭერი
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    }

    // იღებს კლიკებს დოკუმენტზე
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // გაასუფთავებს ეფექტს
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  // სქროლის დაბლოკვა/განბლოკვა მოდალის ჩვენებისას
  useEffect(() => {
    if (showInfo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showInfo]);

  return (
    <>
      {/* ინფორმაციის ღილაკი */}
      <button className="info-button" onClick={() => setShowInfo(true)}>
        {description.buttonText}
      </button>

      {/* აღწერის მოდალი */}
      {showInfo && (
        <div className="info-modal-overlay">
          <div className="info-modal" ref={modalRef}>
            <div className="info-modal-header">
              <h2>{description.title}</h2>
              <button className="close-button" onClick={() => setShowInfo(false)}>
                {description.closeButton}
              </button>
            </div>

            <div className="info-modal-content">
              <p className="intro">{description.intro}</p>

              {/* მომხმარებლის ტიპები */}
              <div className="info-section">
                <h3>{description.userTypes.title}</h3>
                <p>{description.userTypes.content}</p>
                
                <div className="user-types-container">
                  {/* სტუმრის შესაძლებლობები */}
                  <div className="user-type-card guest">
                    <h4>{description.guestFeatures.title}</h4>
                    <ul>
                      {description.guestFeatures.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* რეგისტრირებული მომხმარებლის შესაძლებლობები */}
                  <div className="user-type-card registered">
                    <h4>{description.registeredFeatures.title}</h4>
                    <ul>
                      {description.registeredFeatures.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ძირითადი ფუნქციები */}
              <div className="info-section">
                <h3>{description.features.title}</h3>
                <ul className="features-list">
                  {description.features.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InfoButton;