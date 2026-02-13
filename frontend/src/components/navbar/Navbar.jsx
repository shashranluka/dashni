import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
import { revokeConsent, hasConsent, setConsent } from '../../utils/analytics';
import './Navbar.scss';

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // Analytics consent status-ის შემოწმება
    setHasAnalyticsConsent(hasConsent());
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

  /**
   * Analytics-ის ჩართვის handler
   * აძლევს consent-ს და განაახლებს გვერდს
   */
  const handleEnableAnalytics = () => {
    setConsent(true); // ვაძლევთ თანხმობას
    setHasAnalyticsConsent(true);
    setShowAnalyticsModal(false);
    
    // გვერდის reload რომ full tracking ჩაირთოს
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  /**
   * Analytics-ის გამორთვის handler (opt-out)
   * წაშლის consent-ს და განაახლებს გვერდს
   */
  const handleRevokeAnalytics = () => {
    revokeConsent();
    setHasAnalyticsConsent(false);
    setShowAnalyticsModal(false);
    
    // გვერდის reload რომ ახალი settings ამოქმედდეს
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  /**
   * Analytics modal-ის გახსნა
   */
  const handleAnalyticsClick = () => {
    setShowAnalyticsModal(true);
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
          
          {/* Analytics Settings Button */}
          <button 
            className="analytics-btn" 
            onClick={handleAnalyticsClick}
            title="Analytics პარამეტრები"
          >
            📊
          </button>
          
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

      {/* Analytics Settings Modal */}
      {showAnalyticsModal && (
        <div className="analytics-modal-overlay" onClick={() => setShowAnalyticsModal(false)}>
          <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📊 Analytics პარამეტრები</h3>
            
            <div className="analytics-status">
              <p>
                <strong>სტატუსი:</strong>{' '}
                {hasAnalyticsConsent ? (
                  <span className="status-active">ჩართულია ✓</span>
                ) : (
                  <span className="status-inactive">გამორთული</span>
                )}
              </p>
            </div>

            <div className="analytics-info">
              <p>
                Google Analytics აგროვებს ანონიმურ მონაცემებს საიტის გაუმჯობესების მიზნით.
                თქვენ შეგიძლიათ ნებისმიერ დროს {hasAnalyticsConsent ? 'გააუქმოთ' : 'მისცეთ'} თანხმობა.
              </p>
              
              {hasAnalyticsConsent && (
                <div className="analytics-details">
                  <p><strong>რას ვაგროვებთ:</strong></p>
                  <ul>
                    <li>გვერდების ნახვები და navigation</li>
                    <li>თამაშის სტატისტიკა (დაწყება, დასრულება, ქულები)</li>
                    <li>აუდიო playback events</li>
                    <li>ავტორიზაციის events (login, sign up)</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="analytics-actions">
              {hasAnalyticsConsent ? (
                <button 
                  className="btn-revoke" 
                  onClick={handleRevokeAnalytics}
                >
                  Analytics-ის გამორთვა
                </button>
              ) : (
                <button 
                  className="btn-enable" 
                  onClick={handleEnableAnalytics}
                >
                  Analytics-ის ჩართვა
                </button>
              )}
              
              <button 
                className="btn-close" 
                onClick={() => setShowAnalyticsModal(false)}
              >
                დახურვა
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

