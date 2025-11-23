import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Mail,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuroraBackground } from "../effects";

// Declare Turnstile on window
declare global {
  interface Window {
    turnstile?: any;
  }
}

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { resetPassword, checkEmailExists } = useAuth();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Load Turnstile script
  useEffect(() => {
    if (!turnstileSiteKey) return;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token: string) => {
            setCaptchaToken(token);
          },
          "error-callback": () => {
            setCaptchaToken(null);
            setError("Security verification failed. Please try again.");
          },
          "expired-callback": () => {
            setCaptchaToken(null);
            setError(
              "Security verification expired. Please complete it again."
            );
          },
        });
      }
    };

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      document.body.removeChild(script);
    };
  }, [turnstileSiteKey]);

  const resetTurnstile = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setCaptchaToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Check if Turnstile is configured and token is present
    if (turnstileSiteKey && !captchaToken) {
      setError("Please complete the security verification");
      return;
    }

    setLoading(true);

    try {
      // First, check if the email exists in the system
      const emailExists = await checkEmailExists(email);

      if (!emailExists) {
        setError(
          "No account found with this email address. Please check your email or sign up for a new account."
        );
        resetTurnstile();
        setLoading(false);
        return;
      }

      // If email exists, proceed with password reset
      const { error } = await resetPassword(email, captchaToken || undefined);

      if (error) {
        setError(error.message);
        resetTurnstile();
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
              <CardTitle className="text-2xl font-bold">
                Reset Password
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset email sent! Check your inbox for
                    instructions.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {turnstileSiteKey && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Shield size={16} />
                        <span>Security Verification</span>
                      </div>
                      <div className="flex justify-center">
                        <div ref={turnstileRef}></div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || (turnstileSiteKey && !captchaToken)}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
