/**
 * Google Analytics 4 (GA4) Integration Utility
 * 
 * ეს ფაილი მართავს Google Analytics-ის ინტეგრაციას საიტზე.
 * იყენებს hybrid approach-ს: Basic Mode (cookieless pageviews) და 
 * Full Mode (cookies + events მხოლოდ user consent-ის შემდეგ).
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GA_ENABLED = import.meta.env.VITE_GA_ENABLED === 'true';
const GA_DEBUG = import.meta.env.VITE_GA_DEBUG === 'true';

const CONSENT_KEY = 'ga_consent';
const CONSENT_DATE_KEY = 'ga_consent_date';

const debugLog = (message, data = null) => {
  if (GA_DEBUG) {
    console.log(`[GA Debug] ${message}`, data || '');
  }
};

export const isAnalyticsEnabled = () => {
  return GA_ENABLED && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

export const hasConsent = () => {
  const consent = localStorage.getItem(CONSENT_KEY);
  return consent === 'granted';
};

export const setConsent = (granted) => {
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
  debugLog(`Consent ${granted ? 'granted' : 'denied'}`);
  
  if (granted) {
    initGA(true);
  }
};

export const revokeConsent = () => {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_DATE_KEY);
  debugLog('Consent revoked');
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied'
    });
  }
};

const loadGtagScript = () => {
  return new Promise((resolve, reject) => {
    if (window.gtag) {
      debugLog('gtag.js already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => {
      debugLog('gtag.js script loaded successfully');
      resolve();
    };
    script.onerror = () => {
      debugLog('Failed to load gtag.js script');
      reject(new Error('Failed to load GA script'));
    };
    
    document.head.appendChild(script);
  });
};

export const initGA = async (fullMode = false) => {
  if (!isAnalyticsEnabled()) {
    debugLog('Analytics disabled or invalid Measurement ID');
    return false;
  }

  try {
    debugLog('Starting GA initialization...', { fullMode });
    
    await loadGtagScript();

    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
    }

    if (fullMode && hasConsent()) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure',
        'send_page_view': false
      });
      
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      
      debugLog('GA initialized in Full Mode', { measurementId: GA_MEASUREMENT_ID });
    } else {
      window.gtag('config', GA_MEASUREMENT_ID, {
        'anonymize_ip': true,
        'client_storage': 'none',
        'send_page_view': false
      });
      
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied'
      });
      
      debugLog('GA initialized in Basic Mode (cookieless)', { measurementId: GA_MEASUREMENT_ID });
    }
    
    return true;
  } catch (error) {
    debugLog('Error initializing GA', error);
    return false;
  }
};

export const trackPageView = async (path, title = '') => {
  if (!isAnalyticsEnabled()) {
    debugLog('Pageview not tracked - Analytics disabled');
    return;
  }

  if (!window.gtag) {
    debugLog('Waiting for gtag.js to load...');
    let attempts = 0;
    while (!window.gtag && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.gtag) {
      debugLog('Pageview not tracked - gtag.js failed to load');
      return;
    }
  }

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    });
    
    debugLog('Pageview tracked', { path, title });
  } catch (error) {
    debugLog('Error tracking pageview', error);
  }
};

export const trackEvent = (eventName, eventParams = {}) => {
  if (!hasConsent()) {
    debugLog(`Event "${eventName}" not tracked - no consent`);
    return;
  }

  if (!isAnalyticsEnabled() || !window.gtag) {
    debugLog(`Event "${eventName}" not tracked - Analytics disabled`);
    return;
  }

  try {
    window.gtag('event', eventName, eventParams);
    debugLog(`Event tracked: ${eventName}`, eventParams);
  } catch (error) {
    debugLog(`Error tracking event: ${eventName}`, error);
  }
};

export const trackLogin = (method = 'email') => {
  trackEvent('login', { method });
};

export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', { method });
};

export const trackGameStart = (gameMode, gameType = '') => {
  trackEvent('game_start', {
    game_mode: gameMode,
    game_type: gameType
  });
};

export const trackGameComplete = (score, tries, gameMode = '') => {
  const accuracy = tries > 0 ? Math.round((score / tries) * 100) : 0;
  
  trackEvent('game_complete', {
    score,
    tries,
    accuracy,
    game_mode: gameMode
  });
};

export const trackAudioPlay = (audioSrc = '') => {
  trackEvent('audio_play', {
    audio_src: audioSrc
  });
};

export const trackAudioSkip = (direction, skipSeconds = 5) => {
  trackEvent('audio_skip', {
    direction,
    skip_seconds: skipSeconds
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackLogin,
  trackSignUp,
  trackGameStart,
  trackGameComplete,
  trackAudioPlay,
  trackAudioSkip,
  isAnalyticsEnabled,
  hasConsent,
  setConsent,
  revokeConsent
};
