import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage, ProtectedRoute } from "./components/auth";
import Home from "./components/home";
import OnboardingFlow from "./components/OnboardingFlow";
import GrantDashboard from "./components/GrantDashboard";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
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
              <ProtectedRoute>
                <GrantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/explore" element={<OnboardingFlow />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
