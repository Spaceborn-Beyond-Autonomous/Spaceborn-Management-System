// Window size hook - responsive design helper
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      setIsSidebarCollapsed(width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBreakpoint = (breakpoint) => {
    const breakpoints = {
      'sm': windowSize.width >= 640,
      'md': windowSize.width >= 768,
      'lg': windowSize.width >= 1024,
      'xl': windowSize.width >= 1280,
      '2xl': windowSize.width >= 1536
    };
    return breakpoints[breakpoint] || false;
  };

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSidebarCollapsed,
    isBreakpoint,
    // Convenience getters
    isSmallScreen: windowSize.width < 640,
    isMediumScreen: windowSize.width >= 640 && windowSize.width < 1024,
    isLargeScreen: windowSize.width >= 1024
  };
};

export const useResponsive = () => {
  const { isMobile, isTablet, isDesktop } = useWindowSize();
  
  const getResponsiveValue = (values) => {
    if (isMobile && values.mobile !== undefined) return values.mobile;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    return values.desktop;
  };
  
  return { isMobile, isTablet, isDesktop, getResponsiveValue };
};

export default useWindowSize;