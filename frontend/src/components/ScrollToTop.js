import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position when the route changes (React Router does not do this by default).
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}
