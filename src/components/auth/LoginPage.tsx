import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Turnstile from "react-turnstile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../../contexts/AuthContext";
import { useReducedMotion } from "../marketing/useReducedMotion";
import { AuroraBackground } from "../effects";
import { fetchUserProfile } from "../../lib/profile";
import { isProfileCompleteEnough, toLegacyProfile } from "../../lib/profileMap";
import { LoginSEO } from "../SEO";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Chrome,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Shield,
} from "lucide-react";

// Enhanced validation helpers
const validateEmail = (email: string): string | null => {
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  // Check for disposable/temporary email domains
  const disposableDomains = [
    "tempmail.org",
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "temp-mail.org",
    "throwaway.email",
    "maildrop.cc",
    "yopmail.com",
    "sharklasers.com",
    "guerrillamailblock.com",
    "pokemail.net",
    "spam4.me",
    "tempail.com",
    "tempemail.com",
    "tempinbox.com",
    "mailnesia.com",
    "trashmail.com",
    "dispostable.com",
    "fakeinbox.com",
    "mohmal.com",
  ];

  // Check for suspicious domains (common temporary email patterns)
  const suspiciousDomains = [".ru", ".tk", ".ml", ".ga", ".cf"];

  const domain = email.split("@")[1]?.toLowerCase();

  if (disposableDomains.includes(domain)) {
    return "Please use a permanent email address. Temporary email services are not allowed.";
  }

  if (suspiciousDomains.some((suspicious) => domain?.endsWith(suspicious))) {
    return "Please use a reliable email provider to ensure you receive important notifications.";
  }

  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const missing = [];
  if (!hasUppercase) missing.push("uppercase letter");
  if (!hasLowercase) missing.push("lowercase letter");
  if (!hasNumber) missing.push("number");
  if (!hasSymbol) missing.push("symbol");

  if (missing.length > 0) {
    return `Password must include at least one ${missing.join(", ")}`;
  }

  return null;
};

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0); // For forcing re-render

  const { signIn, signUp, signInWithProvider, user } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Get Turnstile site key from environment
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Check profile and route accordingly
      checkProfileAndRoute(user.id);
    }
  }, [user, navigate]);

  // Reset Turnstile widget by changing key
  const resetTurnstile = () => {
    setCaptchaToken(null);
    setTurnstileKey((prev) => prev + 1);
  };

  // Clear form state when switching between sign up and sign in
  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    resetTurnstile();
  };

  // Handle Turnstile success
  const handleCaptchaSuccess = (token: string) => {
    setCaptchaToken(token);
    setError(""); // Clear any previous captcha errors
  };

  // Handle Turnstile error
  const handleCaptchaError = () => {
    setCaptchaToken(null);
    setError("Security verification failed. Please try again.");
  };

  // Handle Turnstile expiry
  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    setError("Security verification expired. Please complete it again.");
  };

  // Check profile completeness and route user accordingly
  const checkProfileAndRoute = async (userId: string) => {
    try {
      console.log('[Login] Checking profile for user:', userId);
      
      // Fetch user profile from Supabase
      const profile = await fetchUserProfile(userId);
      
      if (!profile) {
        console.log('[Login] No profile found → /onboarding');
        navigate("/onboarding");
        return;
      }

      // Check if profile has enough information
      if (isProfileCompleteEnough(profile)) {
        console.log('[Login] Profile complete → /dashboard with data');
        // Convert to legacy format and navigate to dashboard
        const legacyProfile = toLegacyProfile(profile);
        navigate("/dashboard", { state: legacyProfile });
      } else {
        console.log('[Login] Profile incomplete → /onboarding');
        navigate("/onboarding");
      }
    } catch (error) {
      console.error('[Login] Error checking profile:', error);
      // On error, default to onboarding
      navigate("/onboarding");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Check if Turnstile is configured and token is present
      if (turnstileSiteKey && !captchaToken) {
        setError("Please complete the security verification");
        return;
      }

      // Enhanced email validation
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      if (isSignUp) {
        // Enhanced password validation
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        const { error } = await signUp(
          email,
          password,
          {
            first_name: firstName,
            last_name: lastName,
          },
          captchaToken || undefined
        );

        if (error) {
          setError(error.message);
          // Reset Turnstile on error
          resetTurnstile();
        } else {
          // Show success message for email verification
          setSuccess(
            "Account created successfully! Please check your email to verify your account before signing in."
          );
          // Reset Turnstile after successful signup
          resetTurnstile();
        }
      } else {
        const { error } = await signIn(
          email,
          password,
          captchaToken || undefined
        );
        if (error) {
          setError(error.message);
          // Reset Turnstile on error
          resetTurnstile();
        }
        // Note: User routing is handled by the useEffect hook when user state updates
      }
    } catch (err) {
      setError("An unexpected error occurred");
      // Reset Turnstile on unexpected error
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: "google" | "github") => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  return (
    <>
      <LoginSEO />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <AuroraBackground />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div {...(prefersReducedMotion ? {} : fadeInUp)}>
          {/* Back to home link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                <GraduationCap size={32} className="text-white" />
              </div>

              <CardTitle className="text-2xl font-bold text-white">
                {isSignUp ? "Start Your Funding Journey" : "Welcome Back"}
              </CardTitle>

              <p className="text-slate-300 text-sm">
                {isSignUp
                  ? "Create your account to discover personalized grant opportunities"
                  : "Sign in to continue your grant search"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Success!</p>
                    <p className="text-xs text-green-300 mt-1">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-200">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isSignUp}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-200">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required={isSignUp}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="your.email@university.edu"
                    />
                  </div>
                  {isSignUp && email && (
                    <p className="text-xs text-slate-400">
                      Please use a permanent email address. You'll receive
                      important account notifications here.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={
                        isSignUp
                          ? "Create a strong password"
                          : "Enter your password"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {isSignUp && password && (
                    <div className="text-xs space-y-1">
                      <p className="text-slate-400">Password requirements:</p>
                      <div className="grid grid-cols-2 gap-1">
                        <div
                          className={`flex items-center gap-1 ${
                            password.length >= 8
                              ? "text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              password.length >= 8
                                ? "bg-green-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span>8+ characters</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[A-Z]/.test(password)
                              ? "text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[A-Z]/.test(password)
                                ? "bg-green-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span>Uppercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[a-z]/.test(password)
                              ? "text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[a-z]/.test(password)
                                ? "bg-green-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span>Lowercase</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /\d/.test(password)
                              ? "text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /\d/.test(password)
                                ? "bg-green-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span>Number</span>
                        </div>
                        <div
                          className={`flex items-center gap-1 col-span-2 ${
                            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                              password
                            )
                              ? "text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                password
                              )
                                ? "bg-green-400"
                                : "bg-slate-500"
                            }`}
                          />
                          <span>Symbol (!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isSignUp}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                )}

                {/* Cloudflare Turnstile CAPTCHA */}
                {turnstileSiteKey && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Shield size={16} />
                      <span>Security Verification</span>
                    </div>
                    <div className="flex justify-center">
                      <Turnstile
                        key={turnstileKey}
                        sitekey={turnstileSiteKey}
                        onVerify={handleCaptchaSuccess}
                        onError={handleCaptchaError}
                        onExpire={handleCaptchaExpire}
                        theme="dark"
                        size="normal"
                        className="turnstile-widget"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || (turnstileSiteKey && !captchaToken)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Please wait..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <Separator className="bg-slate-600" />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 text-slate-400 text-sm">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleProviderSignIn("google")}
                  disabled={loading}
                  className="
                            relative
                            flex items-center
                            border border-slate-700
                            text-slate-300
                            bg-gradient-to-r from-slate-900 to-slate-800
                            shadow-lg shadow-black/30
                            hover:shadow-black/50
                            hover:-translate-y-0.5
                            hover:text-white
                            hover:from-slate-800 hover:to-black
                            active:translate-y-0
                            active:shadow-md
                            transition-all duration-300 ease-out
                            rounded-xl
                          "
                >
                  <Chrome size={18} className="mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleProviderSignIn("github")}
                  disabled={loading}
                  className="
                            relative
                            flex items-center
                            border border-slate-700
                            text-slate-300
                            bg-gradient-to-r from-slate-900 to-slate-800
                            shadow-lg shadow-black/30
                            hover:shadow-black/50
                            hover:-translate-y-0.5
                            hover:text-white
                            hover:from-slate-800 hover:to-black
                            active:translate-y-0
                            active:shadow-md
                            transition-all duration-300 ease-out
                            rounded-xl
                          "
                >
                  <Github size={18} className="mr-2" />
                  GitHub
                </Button>
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-slate-300 hover:text-blue-600 transition-colors duration-200 text-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
                
                {!isSignUp && (
                  <div>
                    <Link
                      to="/forgot-password"
                      className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 text-sm focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
};
