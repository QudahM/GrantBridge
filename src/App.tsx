import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import OnboardingFlow from "./components/OnboardingFlow";
import GrantDashboard from "./components/GrantDashboard";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/dashboard" element={<GrantDashboard />} />
      </Routes>
    </Suspense>
  );
}

export default App;
