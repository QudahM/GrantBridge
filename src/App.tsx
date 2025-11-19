import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  ForgotPasswordPage,
  LoginPage,
  ProtectedRoute,
  ResetPasswordPage,
} from "./components/auth";
import { ContactPage } from "./components/ContactPage";
import { CookieConsent } from "./components/CookieConsent";
import { ErrorBoundary } from "./components/error-boundaries";
import { FAQPage } from "./components/FAQPage";
import GrantDashboard from "./components/GrantDashboard";
import Home from "./components/home";
import OnboardingFlow from "./components/OnboardingFlow";
import { TermsPage } from "./components/TermsPage";
import { UserProfileWithErrorBoundary as UserProfile } from "./components/UserProfile";
import { AuthProvider } from "./contexts/AuthContext";
import { trackPageView } from "./lib/analytics";

function App() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireAuth={false}>
                  <OnboardingFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAuth={false}>
                  <GrantDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/explore" element={<OnboardingFlow />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>

          <CookieConsent />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
