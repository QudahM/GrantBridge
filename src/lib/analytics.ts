import ReactGA from 'react-ga4';

// Check if user has consented to cookies
const hasConsent = (): boolean => {
  const consent = localStorage.getItem('grantbridge_cookie_consent');
  return consent === 'accepted';
};

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId) {
    console.warn('[Analytics] Google Analytics Measurement ID not found. Analytics disabled.');
    return;
  }

  // Only initialize if user has consented
  if (!hasConsent()) {
    console.log('[Analytics] User has not consented to cookies. Analytics disabled.');
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        anonymizeIp: true, // Privacy: anonymize IP addresses
      },
    });
    console.log('[Analytics] Google Analytics initialized');
  } catch (error) {
    console.error('[Analytics] Failed to initialize Google Analytics:', error);
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (!hasConsent()) return;
  
  try {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path,
      title: title || document.title,
    });
    console.log('[Analytics] Page view tracked:', path);
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!hasConsent()) return;
  
  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
    console.log('[Analytics] Event tracked:', { category, action, label, value });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
};

// Predefined event trackers for common actions
export const analytics = {
  // User actions
  signUp: () => trackEvent('User', 'Sign Up', 'New User Registration'),
  login: () => trackEvent('User', 'Login', 'User Login'),
  logout: () => trackEvent('User', 'Logout', 'User Logout'),
  
  // Grant interactions
  viewGrant: (grantTitle: string) => trackEvent('Grant', 'View', grantTitle),
  saveGrant: (grantTitle: string) => trackEvent('Grant', 'Save', grantTitle),
  unsaveGrant: (grantTitle: string) => trackEvent('Grant', 'Unsave', grantTitle),
  searchGrants: (query: string) => trackEvent('Grant', 'Search', query),
  
  // Application Assistant
  openAssistant: (grantTitle: string) => trackEvent('Assistant', 'Open', grantTitle),
  generateDraft: (grantTitle: string) => trackEvent('Assistant', 'Generate Draft', grantTitle),
  askQuestion: (question: string) => trackEvent('Assistant', 'Ask Question', question),
  
  // Profile
  completeProfile: () => trackEvent('Profile', 'Complete', 'Profile Completed'),
  updateProfile: () => trackEvent('Profile', 'Update', 'Profile Updated'),
  
  // Navigation
  visitFAQ: () => trackEvent('Navigation', 'Visit', 'FAQ Page'),
  visitContact: () => trackEvent('Navigation', 'Visit', 'Contact Page'),
  visitTerms: () => trackEvent('Navigation', 'Visit', 'Terms Page'),
  
  // Engagement
  applyFilters: (filterType: string) => trackEvent('Engagement', 'Apply Filters', filterType),
  sortGrants: (sortType: string) => trackEvent('Engagement', 'Sort Grants', sortType),
};
