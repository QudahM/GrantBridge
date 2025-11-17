import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'grantbridge_cookie_consent';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
    console.log('[Cookie Consent] User accepted cookies');
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
    console.log('[Cookie Consent] User declined cookies');
    
    // Optionally: Disable Google Analytics if user declines
    // This would require additional logic to prevent GA from loading
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
              
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-400/30">
                      <Cookie size={32} className="text-indigo-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <Shield size={20} className="text-indigo-400" />
                          We Value Your Privacy
                        </h3>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                          We use cookies and Google Analytics to improve your experience and understand how you use our site. 
                          Your data is anonymized and we never sell your information. 
                          By clicking "Accept", you consent to our use of cookies.
                        </p>
                      </div>
                      
                      {/* Close button for mobile */}
                      <button
                        onClick={handleDecline}
                        className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Learn more:</span>
                      <Link 
                        to="/terms" 
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Terms of Service
                      </Link>
                      <span>•</span>
                      <a 
                        href="https://policies.google.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 underline"
                      >
                        Google Privacy Policy
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      onClick={handleDecline}
                      variant="outline"
                      className="border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-300 hover:text-indigo-200 hover:border-indigo-400/50 transition-all"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={handleAccept}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    >
                      Accept Cookies
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to check if user has consented
export const hasUserConsented = (): boolean => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent === 'accepted';
};

// Helper function to check if user has made a choice
export const hasUserMadeChoice = (): boolean => {
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  return consent !== null;
};

// Helper function to reset consent (for testing or user preference changes)
export const resetConsent = (): void => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  console.log('[Cookie Consent] Consent reset');
};
