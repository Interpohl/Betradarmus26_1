// PostHog Provider Wrapper for BETRADARMUS
import React, { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from '@posthog/react';
import { useLocation } from 'react-router-dom';

// Environment variables
const POSTHOG_API_KEY = process.env.REACT_APP_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || 'https://eu.i.posthog.com';

// Initialize PostHog
if (POSTHOG_API_KEY) {
  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll capture manually for SPA
    capture_pageleave: true,
    autocapture: {
      dom_event_allowlist: ['click', 'submit'],
      element_allowlist: ['button', 'a', 'input', 'select', 'textarea'],
      css_selector_allowlist: ['[data-testid]', '[data-ph-capture]']
    },
    session_recording: {
      recordCursorPosition: true,
      recordCanvas: false,
      maskAllInputs: false,
      maskInputOptions: {
        password: true
      }
    },
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
        console.log('PostHog initialized in debug mode');
      }
    }
  });
} else {
  console.warn('PostHog API key not found. Analytics disabled.');
}

// Page view tracker component
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (POSTHOG_API_KEY) {
      // Capture page view on route change
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: location.pathname,
        $host: window.location.host
      });
    }
  }, [location]);

  return null;
};

// Main Provider Component
export const PostHogProvider = ({ children }) => {
  if (!POSTHOG_API_KEY) {
    // Return children without provider if no API key
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      {children}
    </PHProvider>
  );
};

export { posthog };
export default PostHogProvider;
