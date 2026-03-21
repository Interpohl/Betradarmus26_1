import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for lazy loading components when they enter the viewport
 * @param {Object} options - IntersectionObserver options
 * @returns {[ref, isVisible]} - Ref to attach to element and visibility state
 */
export const useLazyLoad = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
};

/**
 * Wrapper component for lazy loading sections
 */
export const LazySection = ({ children, fallback = null, className = '' }) => {
  const [ref, isVisible] = useLazyLoad();

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default useLazyLoad;
