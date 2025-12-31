import { useEffect, useRef } from 'react';

export const UnicornLogo = ({ width = 300, height = 200, className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Unicorn Studio script
    const loadScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="unicornStudio"]')) {
        // Script already exists, just reinitialize
        if (window.UnicornStudio && window.UnicornStudio.init) {
          setTimeout(() => {
            try {
              window.UnicornStudio.init();
            } catch (e) {
              console.log('UnicornStudio init:', e);
            }
          }, 100);
        }
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.0/dist/unicornStudio.umd.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.UnicornStudio && window.UnicornStudio.init) {
            try {
              window.UnicornStudio.init();
            } catch (e) {
              console.log('UnicornStudio init:', e);
            }
          }
        }, 100);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  return (
    <div
      ref={containerRef}
      data-us-project="JHGx825Xj5Suq0UeyR1e"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className={className}
    />
  );
};
