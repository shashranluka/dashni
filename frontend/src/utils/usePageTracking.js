/**
 * usePageTracking Hook
 * 
 * React Hook რომელიც ავტომატურად აკვირდება route ცვლილებებს და აგზავნის
 * pageview events Google Analytics-ში.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './analytics';

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    const title = document.title;

    trackPageView(path, title);

  }, [location]);

  return null;
};

export default usePageTracking;
