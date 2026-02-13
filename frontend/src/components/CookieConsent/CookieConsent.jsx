/**
 * CookieConsent Component
 * 
 * GDPR-compliant Cookie Consent Banner.
 * აჩვენებს ზემოთ banner-ს პირველ ვიზიტზე და ინახავს არჩევანს localStorage-ში.
 */

import { useState } from 'react';
import { setConsent } from '../../utils/analytics';
import './CookieConsent.scss';

/**
 * Cookie Consent Banner Component
 * 
 * GDPR-compliant cookie consent banner რომელიც:
 * - ჩნდება პირველ ვიზიტზე თუ consent არ არის მიცემული
 * - ინახავს მომხმარებლის არჩევანს localStorage-ში
 * - აძლევს საშუალებას მომხმარებელს დაეთანხმოს ან უარი თქვას Analytics tracking-ზე
 */
const CookieConsent = () => {
  // localStorage-დან ვამოწმებთ არის თუ არა უკვე consent მიცემული
  const [showBanner, setShowBanner] = useState(() => {
    const consentGiven = localStorage.getItem('ga_consent');
    console.log('[CookieConsent] Initial check - consentGiven:', consentGiven);
    return !consentGiven; // თუ null ან undefined-ია, ვაჩვენებთ banner-ს
  });

  // მომხმარებელი დაეთანხმა Analytics-ს
  const handleAccept = () => {
    console.log('[CookieConsent] User accepted Analytics');
    setConsent(true); // localStorage-ში ვწერთ 'granted' და ვრთავთ full tracking-ს
    setShowBanner(false);
  };

  // მომხმარებელი უარი თქვა Analytics-ზე
  const handleDecline = () => {
    console.log('[CookieConsent] User declined Analytics');
    setConsent(false); // localStorage-ში ვწერთ 'denied' და მხოლოდ basic tracking რჩება
    setShowBanner(false);
  };

  console.log('[CookieConsent] Rendering, showBanner:', showBanner);

  // თუ consent უკვე მიცემულია, არაფერი არ ვაჩვენებთ
  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent overlay რომ მთელ გვერდს დაფარავს */}
      <div className="cookie-consent-overlay" onClick={(e) => e.stopPropagation()}>
        {/* ძირითადი banner ზემოთ ცენტრში */}
        <div className="cookie-consent-banner">
          <div className="cookie-consent-content">
            <div className="cookie-consent-header">
              <span className="cookie-icon">🍪</span>
              <strong>ამ საიტზე გამოიყენება Cookies</strong>
            </div>
            <p className="cookie-consent-description">
              ჩვენ ვიყენებთ Google Analytics-ს რათა გავაუმჯობესოთ თქვენი გამოცდილება საიტზე. 
              Analytics აგროვებს ანონიმურ მონაცემებს თქვენი ვიზიტის შესახებ.
            </p>
            <p className="cookie-consent-note">
              ძირითადი pageview tracking ხდება cookies-ის გარეშე, მაგრამ დეტალური event tracking-ი 
              მოითხოვს თქვენს თანხმობას.
            </p>
          </div>
          <div className="cookie-consent-buttons">
            <button 
              onClick={handleAccept} 
              className="cookie-consent-button cookie-accept"
              aria-label="Analytics-ზე თანხმობა"
            >
              თანახმა ვარ
            </button>
            <button 
              onClick={handleDecline} 
              className="cookie-consent-button cookie-decline"
              aria-label="Analytics-ზე უარი"
            >
              უარი
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
