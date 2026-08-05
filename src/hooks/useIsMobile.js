import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if viewport is mobile size
 * @param {number} breakpoint - Pixel width to consider as mobile (default: 768px)
 * @returns {boolean} true if viewport width is below breakpoint
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR compatibility)
    if (typeof window === 'undefined') return;

    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
