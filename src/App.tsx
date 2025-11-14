import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage, ProtectedRoute, ForgotPasswordPage, ResetPasswordPage } from "./components/auth";
import Home from "./components/home";
import OnboardingFlow from "./components/OnboardingFlow";
import GrantDashboard from "./components/GrantDashboard";
import { UserProfile } from "./components/UserProfile";
import { FAQPage } from "./components/FAQPage";
import { TermsPage } from "./components/TermsPage";
import { ContactPage } from "./components/ContactPage";

function App() {
  return (
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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
