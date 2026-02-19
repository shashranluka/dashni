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

/**
 * Debug ლოგის ფუნქცია - Console-ში აჩვენებს GA მოვლენებს
 * მუშაობს მხოლოდ თუ VITE_GA_DEBUG=true
 * 
 * @param {string} message - ლოგის შეტყობინება
 * @param {any} data - დამატებითი მონაცემები (არასავალდებულო)
 */
const debugLog = (message, data = null) => {
  if (GA_DEBUG) {
    console.log(`[GA Debug] ${message}`, data || '');
  }
};

/**
 * შემოწმება ჩართული თუ არა Analytics
 * 
 * ამოწმებს:
 * 1. VITE_GA_ENABLED=true არის თუ არა
 * 2. VITE_GA_MEASUREMENT_ID კონფიგურირებულია თუ არა
 * 3. Measurement ID რეალურია (არა placeholder)
 * 
 * @returns {boolean} - true თუ Analytics ჩართულია და კორექტულად კონფიგურირებულია
 */
export const isAnalyticsEnabled = () => {
  return GA_ENABLED && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

/**
 * შემოწმება მომხმარებელმა მისცა თუ არა თანხმობა (consent) Analytics-ზე
 * 
 * ამოწმებს localStorage-ში 'ga_consent' გასაღებს.
 * თუ 'granted' არის, ნიშნავს რომ მომხმარებელმა დააჭირა "თანახმა ვარ"
 * Cookie banner-ში და ნება დართო Full Mode tracking-ზე.
 * 
 * @returns {boolean} - true თუ მომხმარებელმა მისცა თანხმობა
 */
export const hasConsent = () => {
  const consent = localStorage.getItem(CONSENT_KEY);
  // console.log('Checking user consent for Analytics:', consent);
  return consent === 'granted';
};

/**
 * თანხმობის (consent) დაყენება ან უარყოფა
 * 
 * როცა მომხმარებელი Cookie banner-ში დააჭერს:
 * - "თანახმა ვარ" → setConsent(true) → Full Mode ჩაირთვება → გვერდი გადაიტვირთება
 * - "არ ვარ თანახმა" → setConsent(false) → Basic Mode-ში დარჩება
 * 
 * ინახავს localStorage-ში:
 * - 'ga_consent': 'granted' ან 'denied'
 * - 'ga_consent_date': თანხმობის თარიღი ISO ფორმატში
 * 
 * **მნიშვნელოვანი:** თანხმობის გაცემის შემდეგ გვერდი ავტომატურად გადაიტვირთება
 * რათა GA სწორად ჩაირთოს Full Mode-ში და დაიწყოს user tracking.
 * 
 * @param {boolean} granted - true თუ მომხმარებელი თანახმაა, false თუ არა
 */
export const setConsent = (granted) => {
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
  debugLog(`Consent ${granted ? 'granted' : 'denied'}`);
  
  if (granted) {
    // თანხმობის გაცემის შემდეგ გვერდის გადატვირთვა
    // რათა GA სწორად ჩაირთოს Full Mode-ში user tracking-ით
    debugLog('Reloading page to enable Full Mode tracking...');
    window.location.reload();
  }
};

/**
 * თანხმობის (consent) გაუქმება
 * 
 * იძახება როცა მომხმარებელი Navbar-ში 📊 Analytics modal-ში
 * დააჭერს "გამორთვა" ღილაკს.
 * 
 * მოქმედებები:
 * 1. წაშლის localStorage-დან 'ga_consent' და 'ga_consent_date'
 * 2. GA-ს უგზავნის consent 'denied' სტატუსს
 * 3. ჩერდება events tracking (მხოლოდ pageviews რჩება Basic Mode-ში)
 * 4. წაიშლება GA cookies ბრაუზერიდან
 */
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

/**
 * Google gtag.js სკრიპტის დინამიური ჩატვირთვა
 * 
 * ქმნის <script> ელემენტს და ამატებს <head>-ში.
 * სკრიპტი ჩაიტვირთება ასინქრონულად (async=true) რათა
 * არ დააბლოკოს გვერდის რენდერინგი.
 * 
 * Source: https://www.googletagmanager.com/gtag/js?id=G-FWMDJ8VCF5
 * 
 * @returns {Promise} - Promise რომელიც resolve-დება სკრიპტის ჩატვირთვის შემდეგ
 */
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

/**
 * Google Analytics-ის ინიციალიზაცია (მთავარი ფუნქცია)
 * 
 * **ორი რეჟიმი:**
 * 
 * 1. **Basic Mode** (fullMode=false):
 *    - არ იყენებს cookies-ს (client_storage: 'none')
 *    - მხოლოდ ანონიმური pageviews tracking
 *    - consent: 'denied'
 *    - იყენება როცა მომხმარებელმა ჯერ არ მისცა თანხმობა
 * 
 * 2. **Full Mode** (fullMode=true):
 *    - იყენებს cookies-ს (SameSite=None;Secure)
 *    - სრული tracking: pageviews + events + user identification
 *    - consent: 'granted'
 *    - იყენება მხოლოდ თანხმობის ("თანახმა ვარ" Cookie banner) შემდეგ
 * 
 * **გამოძახება:**
 * - App.jsx mount-ზე: initGA(false) - Basic Mode
 * - CookieConsent "თანახმა ვარ": initGA(true) - Full Mode
 * 
 * @param {boolean} fullMode - true = Full Mode (cookies), false = Basic Mode (cookieless)
 * @returns {Promise<boolean>} - true თუ წარმატებით ინიციალიზდა, false თუ არა
 */
export const initGA = async (fullMode = false) => {
  // console.log('Initializing Google Analytics with fullMode:', fullMode);
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

/**
 * გვერდის ნახვის (Pageview) თვალთვალი
 * 
 * ავტომატურად იძახება usePageTracking hook-ით ყოველი
 * React Router რაუტის შეცვლისას.
 * 
 * **მუშაობს როგორც Basic Mode-ში, ისე Full Mode-ში.**
 * 
 * **Retry Logic:**
 * თუ gtag.js ჯერ არ ჩაიტვირთა, ელოდება 50 მცდელობამდე
 * (50 × 100ms = 5 წამი მაქსიმუმ).
 * 
 * **გაგზავნილი მონაცემები:**
 * - page_path: '/sentences' (რაუტის გზა)
 * - page_title: 'Dashni - Sentences' (გვერდის სათაური)
 * - page_location: 'https://dashni.dosh.ge/sentences' (სრული URL)
 * 
 * @param {string} path - გვერდის path (მაგ: '/sentences', '/listen')
 * @param {string} title - გვერდის სათაური (არასავალდებულო, default: document.title)
 */
export const trackPageView = async (path, title = '') => {
  // console.log('Attempting to track page view for:', path, "with title:", title);
  if (!isAnalyticsEnabled()) {
    // console.log('Analytics is disabled or Measurement ID is invalid. Pageview not tracked.');
    debugLog('Pageview not tracked - Analytics disabled');
    return;
  }
  // console.log('Analytics is enabled. Checking for gtag.js...');

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

/**
 * Custom Event-ის თვალთვალი (საბაზისო ფუნქცია)
 * 
 * **მნიშვნელოვანი:** Events იგზავნება **მხოლოდ Full Mode-ში**
 * (როცა მომხმარებელმა მისცა თანხმობა).
 * 
 * ამოწმებს:
 * 1. hasConsent() - არის თუ არა user consent
 * 2. isAnalyticsEnabled() - ჩართული თუ არა Analytics
 * 3. window.gtag - ჩატვირთული თუ არა gtag.js
 * 
 * ყველა სპეციფიკური tracking ფუნქცია (trackLogin, trackGameStart და ა.შ.)
 * იყენებს ამ საბაზისო ფუნქციას.
 * 
 * @param {string} eventName - Event-ის სახელი (მაგ: 'login', 'game_start')
 * @param {Object} eventParams - Event-ის დამატებითი პარამეტრები (არასავალდებულო)
 */
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

/**
 * ავტორიზაციის (Login) Event-ის თვალთვალი
 * 
 * იძახება Login.jsx-ში წარმატებული ავტორიზაციის შემდეგ.
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'login'
 * - method: 'email' (მომავალში შეიძლება: 'google', 'facebook' და ა.შ.)
 * 
 * **გამოყენება:**
 * ```javascript
 * // Login.jsx
 * const handleLogin = async () => {
 *   const response = await loginAPI();
 *   if (response.success) {
 *     trackLogin('email'); // ← აქ
 *   }
 * };
 * ```
 * 
 * @param {string} method - ავტორიზაციის მეთოდი (default: 'email')
 */
export const trackLogin = (method = 'email') => {
  trackEvent('login', { method });
};

/**
 * რეგისტრაციის (Sign Up) Event-ის თვალთვალი
 * 
 * იძახება Register.jsx-ში წარმატებული რეგისტრაციის შემდეგ.
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'sign_up'
 * - method: 'email'
 * 
 * **გამოყენება:**
 * ```javascript
 * // Register.jsx
 * const handleRegister = async () => {
 *   const response = await registerAPI();
 *   if (response.success) {
 *     trackSignUp('email'); // ← აქ
 *   }
 * };
 * ```
 * 
 * @param {string} method - რეგისტრაციის მეთოდი (default: 'email')
 */
export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', { method });
};

/**
 * თამაშის დაწყების (Game Start) Event-ის თვალთვალი
 * 
 * იძახება MessyDictionary.jsx-ში კომპონენტის mount-ისას
 * (useEffect hook-ით).
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'game_start'
 * - game_mode: 'random' ან 'selected' (რანდომ სიტყვები თუ მომხმარებლის არჩეული)
 * - game_type: 'geo-to-dash' ან 'dash-to-geo' (თარგმანის მიმართულება)
 * 
 * **გამოყენება:**
 * ```javascript
 * // MessyDictionary.jsx
 * useEffect(() => {
 *   trackGameStart('random', 'geo-to-dash'); // ← აქ
 * }, []);
 * ```
 * 
 * @param {string} gameMode - თამაშის რეჟიმი ('random' | 'selected')
 * @param {string} gameType - თამაშის ტიპი/მიმართულება (არასავალდებულო)
 */
export const trackGameStart = (gameMode, gameType = '') => {
  trackEvent('game_start', {
    game_mode: gameMode,
    game_type: gameType
  });
};

/**
 * თამაშის დასრულების (Game Complete) Event-ის თვალთვალი
 * 
 * იძახება MessyDictionary.jsx-ში როცა gameFinished === true.
 * ავტომატურად ითვლის სიზუსტეს (accuracy) ქულებისა და მცდელობების საფუძველზე.
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'game_complete'
 * - score: 10 (სწორი პასუხების რაოდენობა)
 * - tries: 15 (სულ მცდელობების რაოდენობა)
 * - accuracy: 67 (პროცენტი: score/tries × 100)
 * - game_mode: 'random' ან 'selected'
 * 
 * **გამოყენება:**
 * ```javascript
 * // MessyDictionary.jsx
 * useEffect(() => {
 *   if (gameFinished) {
 *     trackGameComplete(points, tries, 'random'); // ← აქ
 *   }
 * }, [gameFinished, points, tries]);
 * ```
 * 
 * @param {number} score - სწორი პასუხების რაოდენობა
 * @param {number} tries - სულ მცდელობების რაოდენობა
 * @param {string} gameMode - თამაშის რეჟიმი (არასავალდებულო)
 */
export const trackGameComplete = (score, tries, gameMode = '') => {
  const accuracy = tries > 0 ? Math.round((score / tries) * 100) : 0;
  
  trackEvent('game_complete', {
    score,
    tries,
    accuracy,
    game_mode: gameMode
  });
};

/**
 * აუდიოს დაკვრის (Audio Play) Event-ის თვალთვალი
 * 
 * იძახება AudioPlayer.jsx-ში togglePlay() ფუნქციაში
 * როცა მომხმარებელი Play ღილაკზე დააჭერს.
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'audio_play'
 * - audio_src: '/audio/example.mp3' (აუდიო ფაილის path)
 * 
 * **გამოყენება:**
 * ```javascript
 * // AudioPlayer.jsx
 * const togglePlay = () => {
 *   if (!isPlaying) {
 *     audioRef.current.play();
 *     trackAudioPlay(audioSrc); // ← აქ
 *   }
 * };
 * ```
 * 
 * @param {string} audioSrc - აუდიო ფაილის source/path (არასავალდებულო)
 */
export const trackAudioPlay = (audioSrc = '') => {
  trackEvent('audio_play', {
    audio_src: audioSrc
  });
};

/**
 * აუდიოს გადახვევის (Audio Skip) Event-ის თვალთვალი
 * 
 * იძახება AudioPlayer.jsx-ში skipForward() და skipBackward()
 * ფუნქციებში როცა მომხმარებელი ხმას გადაახვევს.
 * 
 * **გაგზავნილი მონაცემები:**
 * - event: 'audio_skip'
 * - direction: 'forward' ან 'backward' (წინ ან უკან)
 * - skip_seconds: 5 (რამდენი წამით გადაიხვია)
 * 
 * **გამოყენება:**
 * ```javascript
 * // AudioPlayer.jsx
 * const skipForward = () => {
 *   audioRef.current.currentTime += 5;
 *   trackAudioSkip('forward', 5); // ← აქ
 * };
 * 
 * const skipBackward = () => {
 *   audioRef.current.currentTime -= 5;
 *   trackAudioSkip('backward', 5); // ← აქ
 * };
 * ```
 * 
 * @param {string} direction - გადახვევის მიმართულება ('forward' | 'backward')
 * @param {number} skipSeconds - გადახვევის ხანგრძლივობა წამებში (default: 5)
 */
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
