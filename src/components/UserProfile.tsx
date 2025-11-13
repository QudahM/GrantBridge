import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchUserProfile,
  upsertUserProfile,
  UserProfileData,
} from "../lib/profile";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  LogOut,
  Edit2,
  Save,
  X,
  GraduationCap,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Heart,
  ArrowLeft,
  Home,
} from "lucide-react";

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
    age: "",
    country: "",
    genderIdentity: "",
    citizenship: "",
    schoolStatus: "",
    degreeType: "",
    yearOfStudy: "",
    fieldOfStudy: "",
    gpa: "",
    incomeBracket: "",
    ethnicity: "",
    identifiers: [],
  });

  const [editedData, setEditedData] = useState<UserProfileData>(profileData);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load user profile from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      setInitialLoading(true);
      try {
        console.log("Loading profile for user:", user.id);
        const profile = await fetchUserProfile(user.id);
        console.log("Fetched profile:", profile);

        if (profile) {
          // Merge with auth metadata, prioritizing database data
          const mergedProfile: UserProfileData = {
            firstName:
              profile.firstName || user.user_metadata?.first_name || "",
            lastName: profile.lastName || user.user_metadata?.last_name || "",
            email: user.email || profile.email || "",
            age: profile.age || "",
            country: profile.country || "",
            genderIdentity: profile.genderIdentity || "",
            citizenship: profile.citizenship || "",
            schoolStatus: profile.schoolStatus || "",
            degreeType: profile.degreeType || "",
            yearOfStudy: profile.yearOfStudy || "",
            fieldOfStudy: profile.fieldOfStudy || "",
            gpa: profile.gpa || "",
            incomeBracket: profile.incomeBracket || "",
            ethnicity: profile.ethnicity || "",
            identifiers: profile.identifiers || [],
            financialNeed: profile.financialNeed || false,
          };
          console.log("Merged profile:", mergedProfile);
          setProfileData(mergedProfile);
          setEditedData(mergedProfile);
        } else {
          // No profile exists yet, create initial profile with auth metadata
          console.log("No profile found, creating initial profile");
          const initialProfile: UserProfileData = {
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            email: user.email || "",
            age: "",
            country: "",
            genderIdentity: "",
            citizenship: "",
            schoolStatus: "",
            degreeType: "",
            yearOfStudy: "",
            fieldOfStudy: "",
            gpa: "",
            incomeBracket: "",
            ethnicity: "",
            identifiers: [],
            financialNeed: false,
          };

          // Auto-create profile in database
          try {
            const createdProfile = await upsertUserProfile(
              user.id,
              initialProfile
            );
            console.log("Created initial profile:", createdProfile);
            setProfileData(createdProfile);
            setEditedData(createdProfile);
          } catch (createError) {
            console.error("Failed to create initial profile:", createError);
            // Fall back to local state
            setProfileData(initialProfile);
            setEditedData(initialProfile);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");

        // Fallback to auth metadata
        const fallbackProfile: UserProfileData = {
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          email: user.email || "",
          age: "",
          country: "",
          genderIdentity: "",
          citizenship: "",
          schoolStatus: "",
          degreeType: "",
          yearOfStudy: "",
          fieldOfStudy: "",
          gpa: "",
          incomeBracket: "",
          ethnicity: "",
          identifiers: [],
          financialNeed: false,
        };
        setProfileData(fallbackProfile);
        setEditedData(fallbackProfile);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
    setError("");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Saving profile data:", editedData);

      // Save to Supabase
      const savedProfile = await upsertUserProfile(user.id, editedData);
      console.log("Profile saved successfully:", savedProfile);

      // Update local state with saved data
      setProfileData(savedProfile);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(
        `Failed to update profile: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = () => {
    const first = profileData.firstName?.[0] || "";
    const last = profileData.lastName?.[0] || "";
    return (
      (first + last).toUpperCase() || user?.email?.[0].toUpperCase() || "U"
    );
  };

  const updateField = (field: keyof UserProfileData, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate profile completeness percentage
  const calculateProfileCompleteness = (): number => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.age,
      profileData.country,
      profileData.genderIdentity,
      profileData.citizenship,
      profileData.schoolStatus,
      profileData.degreeType,
      profileData.yearOfStudy,
      profileData.fieldOfStudy,
      profileData.gpa,
      profileData.incomeBracket,
      profileData.ethnicity,
      profileData.identifiers && profileData.identifiers.length > 0,
    ];

    const filledFields = fields.filter((field) => {
      if (typeof field === "string") {
        return field && field.trim() !== "";
      }
      return field;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  // State for password change dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      // Use Supabase auth to update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        throw error;
      }

      setPasswordSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError("");

    // Validation - user must type "DELETE" to confirm
    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setDeleteLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Step 1: Delete user profile from database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        // Continue even if profile deletion fails
      }

      // Step 2: Delete user from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (authError) {
        // If admin delete fails, try regular signOut
        console.error("Admin delete failed, signing out:", authError);
        await signOut();
        navigate("/");
        return;
      }

      // Step 3: Sign out and redirect
      await signOut();
      navigate("/", {
        state: {
          message: "Your account has been successfully deleted",
        },
      });
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setDeleteError(
        err.message || "Failed to delete account. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Find Grants navigation
  const handleFindGrants = () => {
    // Convert profile to legacy format for dashboard
    const legacyProfile = {
      age: profileData.age ? parseInt(profileData.age, 10) : 0,
      country: profileData.country || "",
      gender: profileData.genderIdentity || "",
      citizenship: profileData.citizenship || "",
      education: profileData.schoolStatus || "",
      degreeType: profileData.degreeType || "",
      yearOfStudy: profileData.yearOfStudy || "",
      fieldOfStudy: profileData.fieldOfStudy || "",
      gpa: profileData.gpa || "",
      incomeBracket: profileData.incomeBracket || "",
      financialNeed: profileData.financialNeed || false,
      ethnicity: profileData.ethnicity || "",
      identifiers: profileData.identifiers || [],
    };

    navigate("/dashboard", { state: legacyProfile });
  };

  if (!user) {
    return null;
  }

  // Show loading state while fetching profile
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950 text-white relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            rotate: [180, 0, 180],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 rounded-full blur-3xl"
        />

        {/* Additional accent orbs */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            x: [0, -100, 0],
            y: [0, 50, 0],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"
        />

        {/* Sparkle effects */}
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          className="absolute top-20 right-1/3 w-2 h-2 bg-cyan-300 rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 1,
          }}
          className="absolute bottom-40 left-1/4 w-2 h-2 bg-blue-300 rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1.5,
            delay: 0.5,
          }}
          className="absolute top-1/2 right-20 w-2 h-2 bg-teal-300 rounded-full"
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  My Profile
                </h1>
              </motion.div>
              <p className="text-slate-300 flex items-center gap-2">
                <Target size={16} className="text-cyan-400" />
                Your journey to educational funding success
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="border-2 border-cyan-500/50 text-cyan-200 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 w-full"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Home
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-2 border-rose-500/50 text-rose-200 hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 hover:text-white hover:border-rose-400 transition-all duration-300 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 w-full"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert className="mb-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10">
                <CheckCircle size={16} className="text-emerald-400" />
                <AlertDescription className="font-medium">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert className="mb-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30 text-red-300 shadow-lg shadow-red-500/10">
                <AlertCircle size={16} className="text-red-400" />
                <AlertDescription className="font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </motion.div>

        {/* Hero Section with Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-0 shadow-2xl relative overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 opacity-20 blur-xl" />
            <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-lg" />

            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                  {/* Clean Avatar with subtle glow */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Subtle glow effect */}
                    <motion.div
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full blur-xl"
                    />

                    {/* Avatar container with clean border */}
                    <div className="relative">
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-1 shadow-2xl">
                        <Avatar className="w-full h-full">
                          <AvatarImage
                            src=""
                            alt={profileData.firstName}
                            className="rounded-full object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white text-4xl font-bold">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Status indicator */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-lg"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Profile Info Section */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                    {profileData.firstName} {profileData.lastName}
                  </h2>

                  <p className="text-slate-400 mb-4 flex items-center justify-center md:justify-start gap-2 text-sm">
                    <Mail size={14} className="text-cyan-400" />
                    {profileData.email}
                  </p>

                  {profileData.identifiers &&
                    profileData.identifiers.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                        {profileData.identifiers.map((id, index) => (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 text-blue-200 border-blue-400/30 hover:from-blue-600/40 hover:to-cyan-600/40 transition-all duration-300">
                              <Award size={12} className="mr-1" />
                              {id}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {profileData.schoolStatus && (
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                            <GraduationCap size={18} className="text-white" />
                          </div>
                          <p className="text-xs text-slate-400">Education</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                          {profileData.schoolStatus}
                        </p>
                      </motion.div>
                    )}
                    {profileData.country && (
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg shadow-lg">
                            <MapPin size={18} className="text-white" />
                          </div>
                          <p className="text-xs text-slate-400">Location</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                          {profileData.country}
                        </p>
                      </motion.div>
                    )}
                    {profileData.fieldOfStudy && (
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg shadow-lg">
                            <BookOpen size={18} className="text-white" />
                          </div>
                          <p className="text-xs text-slate-400">Field</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                          {profileData.fieldOfStudy}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Stats Cards on the Right */}
                <div className="flex-shrink-0 space-y-4 w-full md:w-auto">
                  {/* Account Status */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 min-w-[200px]"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-300">
                        Account Status
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Email</span>
                        <Badge className="bg-emerald-600/30 text-emerald-200 border-emerald-400/30 text-xs">
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Profile</span>
                        <span className="text-indigo-300 font-semibold">
                          {calculateProfileCompleteness()}%
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Member Since */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 min-w-[200px]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-400" />
                      <span className="text-sm font-semibold text-blue-300">
                        Member Since
                      </span>
                    </div>
                    <p className="text-slate-200 font-semibold">
                      {new Date(
                        user.created_at || Date.now()
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Funding Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-amber-900/60 via-orange-900/50 to-yellow-900/60 backdrop-blur-xl border-2 border-amber-400/40 shadow-2xl shadow-amber-500/30 relative overflow-hidden">
                {/* Animated shine effect */}
                <motion.div
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />

                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                      className="p-2 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 rounded-lg shadow-lg"
                    >
                      <DollarSign size={16} className="text-white" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 bg-clip-text text-transparent font-bold">
                      Funding Journey
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                    <span className="text-sm text-amber-100 font-medium">
                      Grants Applied
                    </span>
                    <span className="text-2xl font-bold text-amber-300">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-400/20">
                    <span className="text-sm text-orange-100 font-medium">
                      Potential Funding
                    </span>
                    <span className="text-2xl font-bold text-orange-300">
                      $0
                    </span>
                  </div>
                  <Button
                    onClick={handleFindGrants}
                    className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold border-2 border-amber-400/30"
                  >
                    <Heart size={16} className="mr-2" />
                    Find Grants
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content Area - Detailed Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-blue-500/20 p-1 shadow-lg">
                <TabsTrigger
                  value="personal"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <User size={16} className="mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <GraduationCap size={16} className="mr-2" />
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Shield size={16} className="mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                              <User size={18} className="text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                              Personal Information
                            </span>
                          </CardTitle>
                          <CardDescription className="text-slate-400 mt-2">
                            Your basic profile details and identity
                          </CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button
                            onClick={handleEdit}
                            variant="outline"
                            size="sm"
                            className="border-2 border-cyan-500/50 text-cyan-200 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                          >
                            <Edit2 size={16} className="mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCancel}
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-200 hover:bg-slate-700"
                            >
                              <X size={16} className="mr-2" />
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSave}
                              disabled={loading}
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                            >
                              <Save size={16} className="mr-2" />
                              {loading ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            First Name
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.firstName}
                              onChange={(e) =>
                                updateField("firstName", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.firstName || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Last Name
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.lastName}
                              onChange={(e) =>
                                updateField("lastName", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.lastName || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-300 font-medium">
                            Email
                          </Label>
                          <div className="flex items-center gap-2 py-2 px-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/30">
                            <Mail size={16} className="text-indigo-400" />
                            <p className="text-slate-200">
                              {profileData.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Age
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.age}
                              onChange={(e) =>
                                updateField("age", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.age || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Country
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.country}
                              onChange={(e) =>
                                updateField("country", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.country || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Gender Identity
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.genderIdentity}
                              onChange={(e) =>
                                updateField("genderIdentity", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.genderIdentity || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Citizenship Status
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.citizenship}
                              onChange={(e) =>
                                updateField("citizenship", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.citizenship || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Ethnicity
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.ethnicity}
                              onChange={(e) =>
                                updateField("ethnicity", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.ethnicity || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300 font-medium">
                            Income Bracket
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editedData.incomeBracket}
                              onChange={(e) =>
                                updateField("incomeBracket", e.target.value)
                              }
                              className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                          ) : (
                            <p className="text-slate-200 py-2 px-3 bg-slate-900/30 rounded-lg border border-slate-700/50">
                              {profileData.incomeBracket || (
                                <span className="text-slate-500">Not set</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <GraduationCap size={18} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                          Education Details
                        </span>
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        Your academic journey and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                        >
                          <Label className="flex items-center gap-2 text-slate-300 font-medium">
                            <GraduationCap
                              size={16}
                              className="text-indigo-400"
                            />
                            Education Status
                          </Label>
                          <p className="text-slate-100 font-semibold text-lg">
                            {profileData.schoolStatus || (
                              <span className="text-slate-500">Not set</span>
                            )}
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                        >
                          <Label className="flex items-center gap-2 text-slate-300 font-medium">
                            <Award size={16} className="text-purple-400" />
                            Degree Type
                          </Label>
                          <p className="text-slate-100 font-semibold text-lg">
                            {profileData.degreeType || (
                              <span className="text-slate-500">Not set</span>
                            )}
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20"
                        >
                          <Label className="flex items-center gap-2 text-slate-300 font-medium">
                            <Calendar size={16} className="text-pink-400" />
                            Year of Study
                          </Label>
                          <p className="text-slate-100 font-semibold text-lg">
                            {profileData.yearOfStudy || (
                              <span className="text-slate-500">Not set</span>
                            )}
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20"
                        >
                          <Label className="flex items-center gap-2 text-slate-300 font-medium">
                            <BookOpen size={16} className="text-indigo-400" />
                            Field of Study
                          </Label>
                          <p className="text-slate-100 font-semibold text-lg">
                            {profileData.fieldOfStudy || (
                              <span className="text-slate-500">Not set</span>
                            )}
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                        >
                          <Label className="flex items-center gap-2 text-slate-300 font-medium">
                            <TrendingUp size={16} className="text-amber-400" />
                            GPA
                          </Label>
                          <p className="text-slate-100 font-semibold text-lg">
                            {profileData.gpa || (
                              <span className="text-slate-500">Not set</span>
                            )}
                          </p>
                        </motion.div>
                      </div>

                      <Separator className="bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                      <div>
                        <Label className="mb-4 text-slate-300 font-medium flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-400" />
                          Additional Identifiers
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {profileData.identifiers &&
                          profileData.identifiers.length > 0 ? (
                            profileData.identifiers.map((id, index) => (
                              <motion.div
                                key={id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Badge className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border-purple-400/30 hover:from-purple-600/40 hover:to-pink-600/40 transition-all duration-300 px-3 py-1">
                                  <Heart size={12} className="mr-1" />
                                  {id}
                                </Badge>
                              </motion.div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm italic">
                              No identifiers set yet
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate("/onboarding")}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Edit2 size={16} className="mr-2" />
                        Update Education Information
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Security Settings */}
                  <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-pink-500/20 shadow-2xl shadow-pink-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                          <Lock size={18} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">
                          Security
                        </span>
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        Manage your password and security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            Password
                          </p>
                          <p className="text-sm text-slate-400">
                            Last changed 30 days ago
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPasswordDialog(true)}
                          className="border-2 border-amber-500/50 text-amber-200 hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-600 hover:text-white hover:border-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                        >
                          Change Password
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>

                  {/* Notification Settings
                  <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                          <Bell size={18} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">
                          Notifications
                        </span>
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        Manage how you receive updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            Email Notifications
                          </p>
                          <p className="text-sm text-slate-400">
                            Receive grant updates via email
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 text-emerald-200 border-emerald-400/30">
                          <CheckCircle size={12} className="mr-1" />
                          Enabled
                        </Badge>
                      </motion.div>
                      <Separator className="bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            Grant Deadline Reminders
                          </p>
                          <p className="text-sm text-slate-400">
                            Get notified before deadlines
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-600/30 to-teal-600/30 text-green-200 border-green-400/30">
                          <CheckCircle size={12} className="mr-1" />
                          Enabled
                        </Badge>
                      </motion.div>
                      <Separator className="bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            New Grant Matches
                          </p>
                          <p className="text-sm text-slate-400">
                            Notify when new grants match your profile
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-teal-600/30 to-cyan-600/30 text-teal-200 border-teal-400/30">
                          <CheckCircle size={12} className="mr-1" />
                          Enabled
                        </Badge>
                      </motion.div>
                    </CardContent>
                  </Card> */}

                  {/* Danger Zone */}
                  <Card className="bg-gradient-to-br from-red-950/80 via-rose-950/70 to-red-900/80 backdrop-blur-xl border-2 border-red-500/50 shadow-2xl shadow-red-500/30 relative overflow-hidden">
                    {/* Warning stripes pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 10px,
                          rgba(239, 68, 68, 0.3) 10px,
                          rgba(239, 68, 68, 0.3) 20px
                        )`,
                        }}
                      />
                    </div>

                    {/* Pulsing alert effect */}
                    <motion.div
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500/10"
                    />

                    <CardHeader className="relative z-10">
                      <CardTitle className="text-red-300 flex items-center gap-2 font-bold">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <AlertCircle size={20} className="text-red-400" />
                        </motion.div>
                        Danger Zone
                      </CardTitle>
                      <CardDescription className="text-red-200/70">
                        ⚠️ Irreversible actions - proceed with extreme caution
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-red-500/20 border-2 border-red-500/40 backdrop-blur-sm"
                      >
                        <div>
                          <p className="font-bold text-red-200">
                            Delete Account
                          </p>
                          <p className="text-sm text-red-300/80">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                          className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:via-rose-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl border-2 border-red-400/30 font-semibold"
                        >
                          Delete Account
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Lock size={18} className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                Change Password
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && (
              <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                <AlertCircle size={16} />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="bg-green-500/10 border-green-500/30 text-green-300">
                <CheckCircle size={16} />
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-300">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="bg-slate-900/50 border-amber-500/30 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="bg-slate-900/50 border-amber-500/30 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="bg-slate-900/50 border-amber-500/30 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPasswordError("");
                setPasswordSuccess("");
              }}
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-red-950 to-rose-950 border-red-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <AlertCircle size={24} className="text-red-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-red-200 to-rose-200 bg-clip-text text-transparent">
                Delete Account
              </span>
            </DialogTitle>
            <DialogDescription className="text-red-200/80">
              ⚠️ This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {deleteError && (
              <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                <AlertCircle size={16} />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 p-4 rounded-lg bg-red-500/10 border-2 border-red-500/30">
              <p className="text-sm text-red-200 font-semibold">
                What will be deleted:
              </p>
              <ul className="text-sm text-red-300/90 space-y-1 list-disc list-inside">
                <li>Your profile and personal information</li>
                <li>Your saved grants and applications</li>
                <li>Your account preferences and settings</li>
                <li>All associated data</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-red-200">
                Type <span className="font-bold text-red-100">DELETE</span> to
                confirm
              </Label>
              <Input
                id="delete-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="bg-red-950/50 border-red-500/50 text-white focus:border-red-400 focus:ring-2 focus:ring-red-500/30 placeholder:text-red-400/50"
                placeholder="Type DELETE to confirm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
                setDeleteError("");
              }}
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirmation !== "DELETE"}
              className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:via-rose-700 hover:to-red-800 text-white shadow-xl border-2 border-red-400/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="mr-2" />
                  Delete My Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
