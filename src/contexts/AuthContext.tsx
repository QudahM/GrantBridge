import { AuthError, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { analytics } from "../lib/analytics";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  checkEmailExists: (email: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    metadata?: any,
    captchaToken?: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
    captchaToken?: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithProvider: (
    provider: "google" | "github"
  ) => Promise<{ error: AuthError | null }>;
  resetPassword: (
    email: string,
    captchaToken?: string
  ) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: any,
    captchaToken?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        captchaToken,
      },
    });

    if (!error) {
      analytics.signUp();
    }

    return { error };
  };

  const signIn = async (
    email: string,
    password: string,
    captchaToken?: string
  ) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    if (!error) {
      analytics.login();
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      analytics.logout();
    }

    return { error };
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    return { error };
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Query the auth.users table to check if email exists
      const { data, error } = await supabase.rpc("check_email_exists", {
        email_to_check: email,
      });

      if (error) {
        // If RPC doesn't exist, fall back to trying to sign in with wrong password
        // This is a workaround - Supabase will return different errors
        console.log("RPC not available, using fallback method");

        // Try a password reset - if email doesn't exist, Supabase returns success anyway
        // So we'll use a different approach: check user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("email")
          .eq("email", email)
          .single();

        return !!profileData && !profileError;
      }

      return !!data;
    } catch (err) {
      console.error("Error checking email:", err);
      // If we can't check, assume it exists to avoid blocking legitimate users
      return true;
    }
  };

  const resetPassword = async (email: string, captchaToken?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    checkEmailExists,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
