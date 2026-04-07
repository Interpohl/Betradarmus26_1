// Custom Analytics Hooks for BETRADARMUS
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { ANALYTICS_EVENTS, SECTION_IDS } from './analytics';

// Hook for tracking scroll depth
export const useScrollDepth = () => {
  const posthog = usePostHog();
  const location = useLocation();
  const maxScrollRef = useRef(0);
  const lastScrollRef = useRef(0);
  const sectionsViewedRef = useRef(new Set());

  useEffect(() => {
    if (!posthog) return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate scroll depth percentage
      const scrollDepthPercent = Math.round(
        ((windowHeight + scrollTop) / documentHeight) * 100
      );
      
      // Track maximum scroll depth
      if (scrollDepthPercent > maxScrollRef.current) {
        maxScrollRef.current = scrollDepthPercent;
      }
      
      lastScrollRef.current = scrollDepthPercent;

      // Track sections viewed
      Object.values(SECTION_IDS).forEach(sectionId => {
        const section = document.querySelector(`[data-testid="${sectionId}"]`);
        if (section && !sectionsViewedRef.current.has(sectionId)) {
          const rect = section.getBoundingClientRect();
          // Check if section is at least 50% visible
          if (rect.top < windowHeight * 0.5 && rect.bottom > windowHeight * 0.5) {
            sectionsViewedRef.current.add(sectionId);
            posthog.capture(ANALYTICS_EVENTS.SECTION_VIEWED, {
              section_id: sectionId,
              scroll_depth_percent: scrollDepthPercent,
              page_url: location.pathname
            });
          }
        }
      });
    };

    const handleBeforeUnload = () => {
      if (maxScrollRef.current > 0) {
        posthog.capture(ANALYTICS_EVENTS.SCROLL_DEPTH_TRACKED, {
          max_scroll_percent: maxScrollRef.current,
          last_scroll_percent: lastScrollRef.current,
          page_url: location.pathname,
          sections_viewed: Array.from(sectionsViewedRef.current),
          total_sections_viewed: sectionsViewedRef.current.size
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Reset on page change
    maxScrollRef.current = 0;
    lastScrollRef.current = 0;
    sectionsViewedRef.current = new Set();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, posthog]);
};

// Hook for tracking time on page
export const useTimeOnPage = () => {
  const posthog = usePostHog();
  const location = useLocation();
  const pageStartTimeRef = useRef(null);
  const pageUrlRef = useRef(location.pathname);

  useEffect(() => {
    if (!posthog) return;

    // Reset timing when page changes
    pageStartTimeRef.current = Date.now();
    pageUrlRef.current = location.pathname;
  }, [location.pathname, posthog]);

  useEffect(() => {
    if (!posthog) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && pageStartTimeRef.current) {
        const timeOnPageSeconds = (Date.now() - pageStartTimeRef.current) / 1000;
        
        posthog.capture(ANALYTICS_EVENTS.TIME_ON_PAGE_TRACKED, {
          page_url: pageUrlRef.current,
          time_on_page_seconds: Math.round(timeOnPageSeconds),
          time_on_page_minutes: Math.round(timeOnPageSeconds / 60 * 10) / 10
        });
      }
    };

    const handleBeforeUnload = () => {
      if (pageStartTimeRef.current) {
        const timeOnPageSeconds = (Date.now() - pageStartTimeRef.current) / 1000;
        
        posthog.capture(ANALYTICS_EVENTS.TIME_ON_PAGE_TRACKED, {
          page_url: pageUrlRef.current,
          time_on_page_seconds: Math.round(timeOnPageSeconds),
          time_on_page_minutes: Math.round(timeOnPageSeconds / 60 * 10) / 10
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [posthog]);
};

// Hook for CTA click tracking
export const useCTATracking = () => {
  const posthog = usePostHog();

  const trackCTAClick = useCallback((ctaName, properties = {}) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.CTA_CLICKED, {
      cta_name: ctaName,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      ...properties
    });
  }, [posthog]);

  const trackButtonClick = useCallback((buttonName, properties = {}) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.BUTTON_CLICKED, {
      button_name: buttonName,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      ...properties
    });
  }, [posthog]);

  const trackTelegramClick = useCallback((linkType, linkUrl) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.TELEGRAM_LINK_CLICKED, {
      link_type: linkType, // 'bot', 'free_group', 'pro_channel'
      link_url: linkUrl,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname
    });
  }, [posthog]);

  return { trackCTAClick, trackButtonClick, trackTelegramClick };
};

// Hook for FAQ tracking
export const useFAQTracking = () => {
  const posthog = usePostHog();

  const trackFAQOpen = useCallback((questionIndex, questionText) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.FAQ_QUESTION_OPENED, {
      question_index: questionIndex,
      question_text: questionText,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  const trackFAQClose = useCallback((questionIndex, questionText) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.FAQ_QUESTION_CLOSED, {
      question_index: questionIndex,
      question_text: questionText,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  return { trackFAQOpen, trackFAQClose };
};

// Hook for Auth tracking
export const useAuthTracking = () => {
  const posthog = usePostHog();

  const trackAuthModalOpened = useCallback((source, plan = null) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.AUTH_MODAL_OPENED, {
      source, // 'hero_cta', 'pricing_card', 'final_cta', etc.
      plan,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  const trackRegistrationStarted = useCallback((plan) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.REGISTRATION_STARTED, {
      plan,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  const trackRegistrationCompleted = useCallback((userId, plan) => {
    if (!posthog) return;
    
    // Identify the user
    posthog.identify(userId, {
      plan,
      registered_at: new Date().toISOString()
    });
    
    posthog.capture(ANALYTICS_EVENTS.REGISTRATION_COMPLETED, {
      plan,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  const trackLoginCompleted = useCallback((userId, plan) => {
    if (!posthog) return;
    
    posthog.identify(userId, {
      plan,
      last_login: new Date().toISOString()
    });
    
    posthog.capture(ANALYTICS_EVENTS.LOGIN_COMPLETED, {
      plan,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  return { 
    trackAuthModalOpened, 
    trackRegistrationStarted, 
    trackRegistrationCompleted,
    trackLoginCompleted 
  };
};

// Hook for Pricing tracking
export const usePricingTracking = () => {
  const posthog = usePostHog();

  const trackPricingViewed = useCallback((plan) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.PRICING_PLAN_VIEWED, {
      plan,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  const trackPricingSelected = useCallback((plan, price) => {
    if (!posthog) return;
    
    posthog.capture(ANALYTICS_EVENTS.PRICING_PLAN_SELECTED, {
      plan,
      price,
      timestamp: new Date().toISOString()
    });
  }, [posthog]);

  return { trackPricingViewed, trackPricingSelected };
};

// Combined analytics hook for components
export const useAnalytics = () => {
  const posthog = usePostHog();
  const { trackCTAClick, trackButtonClick, trackTelegramClick } = useCTATracking();
  const { trackFAQOpen, trackFAQClose } = useFAQTracking();
  const { trackAuthModalOpened, trackRegistrationStarted, trackRegistrationCompleted, trackLoginCompleted } = useAuthTracking();
  const { trackPricingViewed, trackPricingSelected } = usePricingTracking();

  return {
    posthog,
    trackCTAClick,
    trackButtonClick,
    trackTelegramClick,
    trackFAQOpen,
    trackFAQClose,
    trackAuthModalOpened,
    trackRegistrationStarted,
    trackRegistrationCompleted,
    trackLoginCompleted,
    trackPricingViewed,
    trackPricingSelected
  };
};
