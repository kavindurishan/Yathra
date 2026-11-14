import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component:
 * Automatically resets window and document scroll position to top (0, 0)
 * whenever the route or query parameters change.
 * Prevents pages (such as BusList search results, booking details, checkout,
 * or pages opened via the footer) from unexpectedly starting scrolled down at the footer.
 */
export default function ScrollToTop() {
  const { pathname, search, key } = useLocation();

  useEffect(() => {
    // Disable native browser scroll restoration so it doesn't snap to old scroll coordinates
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => {
      // Primary window scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });

      // Standard document root scroll resets
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // Reset any inner scrollable containers (e.g. admin panels, modals)
      const scrollableContainers = document.querySelectorAll(
        '.overflow-y-auto, .overflow-auto, [data-scroll-container]'
      );
      scrollableContainers.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Immediate execution
    scrollToTop();

    // Re-verify on animation frame and next tick to handle post-render layout shifts
    const frameId = requestAnimationFrame(scrollToTop);
    const timeoutId = setTimeout(scrollToTop, 60);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [pathname, search, key]);

  return null;
}
