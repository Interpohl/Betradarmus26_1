// Analytics Tracker Component for Landing Page
// Tracks scroll depth, time on page, and section visibility
import { useEffect } from 'react';
import { useScrollDepth, useTimeOnPage } from '../utils/analyticsHooks';

export const AnalyticsTracker = () => {
  // Initialize scroll depth tracking
  useScrollDepth();
  
  // Initialize time on page tracking
  useTimeOnPage();

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
