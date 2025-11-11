import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserProfile, upsertUserProfile, UserProfileData } from "../lib/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
        console.log('Loading profile for user:', user.id);
        const profile = await fetchUserProfile(user.id);
        console.log('Fetched profile:', profile);
        
        if (profile) {
          // Merge with auth metadata, prioritizing database data
          const mergedProfile: UserProfileData = {
            firstName: profile.firstName || user.user_metadata?.first_name || "",
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
          console.log('Merged profile:', mergedProfile);
          setProfileData(mergedProfile);
          setEditedData(mergedProfile);
        } else {
          // No profile exists yet, create initial profile with auth metadata
          console.log('No profile found, creating initial profile');
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
            const createdProfile = await upsertUserProfile(user.id, initialProfile);
            console.log('Created initial profile:', createdProfile);
            setProfileData(createdProfile);
            setEditedData(createdProfile);
          } catch (createError) {
            console.error('Failed to create initial profile:', createError);
            // Fall back to local state
            setProfileData(initialProfile);
            setEditedData(initialProfile);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
        
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
      console.log('Saving profile data:', editedData);
      
      // Save to Supabase
      const savedProfile = await upsertUserProfile(user.id, editedData);
      console.log('Profile saved successfully:', savedProfile);
      
      // Update local state with saved data
      setProfileData(savedProfile);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    return (first + last).toUpperCase() || user?.email?.[0].toUpperCase() || "U";
  };

  const updateField = (field: keyof UserProfileData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-slate-300">Manage your account and preferences</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert className="mb-4 bg-green-500/10 border-green-500/20 text-green-400">
              <CheckCircle size={16} />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle size={16} />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-indigo-500/30">
                    <AvatarImage src="" alt={profileData.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold mb-1">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  
                  <p className="text-slate-400 mb-4 flex items-center gap-2">
                    <Mail size={14} />
                    {profileData.email}
                  </p>

                  {profileData.identifiers && profileData.identifiers.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {profileData.identifiers.slice(0, 3).map((id) => (
                        <Badge key={id} variant="secondary" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                          {id}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator className="my-4 bg-slate-700" />

                  {/* Quick Stats */}
                  <div className="w-full space-y-3">
                    {profileData.schoolStatus && (
                      <div className="flex items-center gap-3 text-sm">
                        <GraduationCap size={18} className="text-indigo-400" />
                        <span className="text-slate-300">{profileData.schoolStatus}</span>
                      </div>
                    )}
                    {profileData.country && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin size={18} className="text-indigo-400" />
                        <span className="text-slate-300">{profileData.country}</span>
                      </div>
                    )}
                    {profileData.fieldOfStudy && (
                      <div className="flex items-center gap-3 text-sm">
                        <BookOpen size={18} className="text-indigo-400" />
                        <span className="text-slate-300">{profileData.fieldOfStudy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={18} className="text-indigo-400" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Email Verified</span>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/30">
                    <CheckCircle size={12} className="mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Profile Complete</span>
                  <Badge variant="secondary" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                    85%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Member Since</span>
                  <span className="text-sm text-slate-300">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Detailed Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger value="personal" className="data-[state=active]:bg-indigo-600">
                  <User size={16} className="mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="education" className="data-[state=active]:bg-indigo-600">
                  <GraduationCap size={16} className="mr-2" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600">
                  <Shield size={16} className="mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription className="text-slate-400">
                          Your basic profile details
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-200 hover:bg-slate-700"
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
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Save size={16} className="mr-2" />
                            {loading ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.firstName}
                            onChange={(e) => updateField("firstName", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.firstName || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.lastName}
                            onChange={(e) => updateField("lastName", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.lastName || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Email</Label>
                        <p className="text-slate-300 py-2 flex items-center gap-2">
                          <Mail size={16} />
                          {profileData.email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Age</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.age}
                            onChange={(e) => updateField("age", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.age || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Country</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.country}
                            onChange={(e) => updateField("country", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.country || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Gender Identity</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.genderIdentity}
                            onChange={(e) => updateField("genderIdentity", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.genderIdentity || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Citizenship Status</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.citizenship}
                            onChange={(e) => updateField("citizenship", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.citizenship || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Ethnicity</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.ethnicity}
                            onChange={(e) => updateField("ethnicity", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.ethnicity || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Income Bracket</Label>
                        {isEditing ? (
                          <Input
                            value={editedData.incomeBracket}
                            onChange={(e) => updateField("incomeBracket", e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white"
                          />
                        ) : (
                          <p className="text-slate-300 py-2">{profileData.incomeBracket || "Not set"}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education">
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <CardTitle>Education Details</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your academic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <GraduationCap size={16} className="text-indigo-400" />
                          Education Status
                        </Label>
                        <p className="text-slate-300 py-2">{profileData.schoolStatus || "Not set"}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Award size={16} className="text-indigo-400" />
                          Degree Type
                        </Label>
                        <p className="text-slate-300 py-2">{profileData.degreeType || "Not set"}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar size={16} className="text-indigo-400" />
                          Year of Study
                        </Label>
                        <p className="text-slate-300 py-2">{profileData.yearOfStudy || "Not set"}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <BookOpen size={16} className="text-indigo-400" />
                          Field of Study
                        </Label>
                        <p className="text-slate-300 py-2">{profileData.fieldOfStudy || "Not set"}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>GPA</Label>
                        <p className="text-slate-300 py-2">{profileData.gpa || "Not set"}</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    <div>
                      <Label className="mb-3 block">Additional Identifiers</Label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.identifiers && profileData.identifiers.length > 0 ? (
                          profileData.identifiers.map((id) => (
                            <Badge key={id} variant="secondary" className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                              {id}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-slate-400 text-sm">No identifiers set</p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate("/onboarding")}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Update Education Information
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Security Settings */}
                  <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock size={18} className="text-indigo-400" />
                        Security
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Manage your password and security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Password</p>
                          <p className="text-sm text-slate-400">Last changed 30 days ago</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700">
                          Change Password
                        </Button>
                      </div>
                      <Separator className="bg-slate-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-slate-400">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-700">
                          Enable
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Settings */}
                  <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell size={18} className="text-indigo-400" />
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Manage how you receive updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-slate-400">Receive grant updates via email</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/30">
                          Enabled
                        </Badge>
                      </div>
                      <Separator className="bg-slate-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Grant Deadline Reminders</p>
                          <p className="text-sm text-slate-400">Get notified before deadlines</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/30">
                          Enabled
                        </Badge>
                      </div>
                      <Separator className="bg-slate-700" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Grant Matches</p>
                          <p className="text-sm text-slate-400">Notify when new grants match your profile</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/30">
                          Enabled
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="bg-red-900/10 border-red-500/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-red-400">Danger Zone</CardTitle>
                      <CardDescription className="text-slate-400">
                        Irreversible actions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-400">Delete Account</p>
                          <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};