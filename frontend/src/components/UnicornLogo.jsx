import { useEffect, useRef } from 'react';

export const UnicornLogo = ({ width = 300, height = 200, className = '' }) => {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initializedRef.current) return;

    const loadUnicornStudio = () => {
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.0/dist/unicornStudio.umd.js';
        script.onload = () => {
          if (!window.UnicornStudio.isInitialized) {
            window.UnicornStudio.init();
            window.UnicornStudio.isInitialized = true;
          }
        };
        document.head.appendChild(script);
      } else if (!window.UnicornStudio.isInitialized && window.UnicornStudio.init) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
    };

    loadUnicornStudio();
    initializedRef.current = true;

    // Cleanup function
    return () => {
      // Optional: cleanup if needed
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-us-project="JHGx825Xj5Suq0UeyR1e"
      style={{ width: `${width}px`, height: `${height}px` }}
      className={className}
    />
  );
};
