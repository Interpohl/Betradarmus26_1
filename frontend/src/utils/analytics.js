// PostHog Analytics Configuration and Utilities
import posthog from 'posthog-js';

// Event Names - Consistent naming convention [object]_[verb]
export const ANALYTICS_EVENTS = {
  // Page Views
  PAGE_VIEWED: 'page_viewed',
  
  // CTA Interactions
  CTA_CLICKED: 'cta_clicked',
  BUTTON_CLICKED: 'button_clicked',
  
  // Auth Events
  AUTH_MODAL_OPENED: 'auth_modal_opened',
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  LOGIN_COMPLETED: 'login_completed',
  
  // Telegram Events
  TELEGRAM_LINK_CLICKED: 'telegram_link_clicked',
  
  // FAQ Events
  FAQ_QUESTION_OPENED: 'faq_question_opened',
  FAQ_QUESTION_CLOSED: 'faq_question_closed',
  
  // Scroll Events
  SCROLL_DEPTH_TRACKED: 'scroll_depth_tracked',
  SECTION_VIEWED: 'section_viewed',
  
  // Time Events
  TIME_ON_PAGE_TRACKED: 'time_on_page_tracked',
  
  // Pricing Events
  PRICING_PLAN_VIEWED: 'pricing_plan_viewed',
  PRICING_PLAN_SELECTED: 'pricing_plan_selected',
  
  // Conversion Events
  CONVERSION_COMPLETED: 'conversion_completed',
  
  // A/B Test Events
  EXPERIMENT_VIEWED: 'experiment_viewed',
  VARIANT_DISPLAYED: 'variant_displayed'
};

// Section IDs for tracking
export const SECTION_IDS = {
  HERO: 'hero-section',
  VALUE_FRAMING: 'value-framing-section',
  WHY_DIFFERENT: 'why-different-section',
  FOUR_PILLARS: 'four-pillars-section',
  SIGNAL_COMPARISON: 'signal-comparison-table-section',
  SIGNAL_TIMELINE: 'signal-timeline-section',
  TELEGRAM_BOT: 'telegram-bot-section',
  TARGET_AUDIENCE: 'target-audience-section',
  HOW_IT_WORKS: 'how-it-works-section',
  LIVE_DEMO: 'live-demo-section',
  STATISTICS: 'statistics-section',
  TESTIMONIALS: 'testimonials-section',
  COMPARISON: 'comparison-section',
  AI_MODEL: 'ai-model-section',
  FREE_TRIAL: 'free-trial-section',
  PARTNERS: 'partners-section',
  PROBLEM: 'problem-section',
  SOLUTION: 'solution-section',
  TECHNOLOGY: 'technology-section',
  AUDIENCE: 'audience-section',
  PRICING: 'pricing-section',
  FAQ: 'faq-section',
  EARLY_ACCESS: 'early-access-section',
  CONVERSION: 'conversion-section',
  TRUST: 'trust-section',
  FINAL_CTA: 'final-cta-section',
  DISCLAIMER: 'disclaimer-section'
};

// Feature Flag Keys
export const FEATURE_FLAGS = {
  // Section Variants
  TRUST_SECTION_VARIANT: 'trust_section_variant',
  FINAL_CTA_VARIANT: 'final_cta_variant',
  VALUE_FRAMING_VARIANT: 'value_framing_variant',
  
  // Section Order Tests
  SECTION_ORDER_TEST: 'section_order_test',
  
  // Button Variants
  CTA_BUTTON_TEXT: 'cta_button_text',
  
  // Pricing Variants
  PRICING_DISPLAY_VARIANT: 'pricing_display_variant'
};

// Initialize PostHog with configuration
export const initializePostHog = (apiKey, host) => {
  if (!apiKey) {
    console.warn('PostHog API key not provided, analytics disabled');
    return;
  }

  posthog.init(apiKey, {
    api_host: host || 'https://eu.i.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      recordCursorPosition: true,
      recordCanvas: false
    },
    // Privacy settings
    mask_all_text: false,
    mask_all_element_attributes: false
  });
};

// Utility function to capture events
export const captureEvent = (eventName, properties = {}) => {
  try {
    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      ...properties
    });
  } catch (error) {
    console.error('PostHog capture error:', error);
  }
};

// Identify user
export const identifyUser = (userId, properties = {}) => {
  try {
    posthog.identify(userId, {
      ...properties,
      identified_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('PostHog identify error:', error);
  }
};

// Reset user (on logout)
export const resetUser = () => {
  try {
    posthog.reset();
  } catch (error) {
    console.error('PostHog reset error:', error);
  }
};

// Get feature flag value
export const getFeatureFlag = (flagKey) => {
  try {
    return posthog.getFeatureFlag(flagKey);
  } catch (error) {
    console.error('PostHog feature flag error:', error);
    return null;
  }
};

// Check if feature flag is enabled
export const isFeatureFlagEnabled = (flagKey) => {
  try {
    return posthog.isFeatureEnabled(flagKey);
  } catch (error) {
    console.error('PostHog feature flag error:', error);
    return false;
  }
};

// Get feature flag payload
export const getFeatureFlagPayload = (flagKey) => {
  try {
    return posthog.getFeatureFlagPayload(flagKey);
  } catch (error) {
    console.error('PostHog feature flag payload error:', error);
    return null;
  }
};

export default posthog;
