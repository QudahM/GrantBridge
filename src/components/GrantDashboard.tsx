import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import GrantCard from "@/components/GrantCard";
import ApplicationAssistant from "@/components/ApplicationAssistant";
import { useLocation, useNavigate } from "react-router-dom";
import { Grant, UserProfile } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import { UserNav } from "@/components/ui/UserNav";
import { useAuth } from "../contexts/AuthContext";
import { fetchUserProfile } from "../lib/profile";
import { toLegacyProfile } from "../lib/profileMap";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const calculateMatchPercentage = (userProfile: UserProfile, grant: Grant) => {
  let baseScore = 50;

  const userAnswers = [
    userProfile.age?.toString() || "",
    ...(userProfile.identifiers || []),
    userProfile.gender || "",
    userProfile.citizenship || "",
    userProfile.education || "",
    userProfile.degreeType || "",
    userProfile.fieldOfStudy || "",
    userProfile.yearOfStudy?.toString() || "",
    userProfile.gpa?.toString() || "",
    userProfile.country || "",
    userProfile.ethnicity || "",
  ].map((answer) => answer.toLowerCase().trim());

  const grantText = [
    ...(grant.eligibility || []),
    ...(grant.requirements || []),
  ]
    .join(" ")
    .toLowerCase();

  if (!grantText) return baseScore;

  const matched = userAnswers.filter((ans) => grantText.includes(ans)).length;
  const matchRatio = matched / userAnswers.length;

  const finalScore = Math.min(100, Math.round(baseScore + matchRatio * 50));
  return finalScore;
};

const GrantDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(location.state as UserProfile);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [sortBy, setSortBy] = useState("deadline");
  const [savedGrants, setSavedGrants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(!location.state);

  // Load user profile if not provided via location.state
  useEffect(() => {
    const loadProfile = async () => {
      console.log('[Dashboard] Checking profile availability');
      
      // If profile already provided via location.state, skip fetch
      if (location.state) {
        console.log('[Dashboard] Using profile from location.state');
        setProfileLoading(false);
        return;
      }

      // Check if user is logged in
      if (!user) {
        console.log('[Dashboard] No user logged in → redirect to /login');
        navigate('/login');
        return;
      }

      // Fetch profile from Supabase
      try {
        console.log('[Dashboard] Fetching profile from Supabase for user:', user.id);
        setProfileLoading(true);
        const profile = await fetchUserProfile(user.id);
        
        if (!profile) {
          console.log('[Dashboard] No profile found → redirect to /onboarding');
          navigate('/onboarding');
          return;
        }

        console.log('[Dashboard] Profile loaded, converting to legacy format');
        const legacyProfile = toLegacyProfile(profile);
        setUserProfile(legacyProfile);
        setProfileLoading(false);
      } catch (error) {
        console.error('[Dashboard] Error fetching profile:', error);
        console.log('[Dashboard] Fallback → redirect to /onboarding');
        navigate('/onboarding');
      }
    };

    loadProfile();
  }, [user, location.state, navigate]);

  // Fetch grants once profile is available
  useEffect(() => {
    if (!userProfile || profileLoading) {
      return;
    }

    const fetchGrants = async () => {
      console.log('[Dashboard] Fetching grants with profile:', userProfile);
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/grants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userProfile),
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          console.log('[Dashboard] Grants loaded:', data.length);
          setGrants(data);
        } else {
          console.error("Invalid grants data:", data);
          setGrants([]);
        }
      } catch (error) {
        console.error("Failed to fetch grants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, [userProfile, profileLoading]);

  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const toggleSaveGrant = (grantId: string) => {
    setSavedGrants((prev) =>
      prev.includes(grantId) ? prev.filter((id) => id !== grantId) : [...prev, grantId]
    );
  };

  const handleOpenAssistant = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowAssistant(true);
  };

  const handleNewGrants = () => {
    navigate("/");
  };

  const filteredGrants = grants
    .filter((grant) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          grant.title.toLowerCase().includes(query) ||
          grant.organization.toLowerCase().includes(query) ||
          grant.description.toLowerCase().includes(query) ||
          grant.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }
      if (activeTab === "saved") return savedGrants.includes(grant.id);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const aDays = getDaysUntil(a.deadline);
        const bDays = getDaysUntil(b.deadline);
    
        // 1. If both are NaN, treat them equal
        if (isNaN(aDays) && isNaN(bDays)) return 0;
    
        // 2. If one is NaN, prioritize NaN over expired grants but after upcoming ones
        if (isNaN(aDays)) {
          return bDays < 0 ? -1 : 1; // If b is expired, a(NaN) comes first; if b is upcoming, b comes first
        }
        if (isNaN(bDays)) {
          return aDays < 0 ? 1 : -1; // If a is expired, b(NaN) comes first; if a is upcoming, a comes first
        }
    
        // 3. Now both are numbers (not NaN)
        // If one is expired (<0) and one is upcoming (>0)
        if (aDays < 0 && bDays >= 0) return 1;
        if (bDays < 0 && aDays >= 0) return -1;

        if (aDays < 0 && bDays < 0) return bDays - aDays; // Both are expired, sort by days remaining (ascending)
    
        // 4. Otherwise normal ascending sort
        return aDays - bDays;
      }
    
      const parseAmount = (amountStr: string): number => {
        if (!amountStr) return 0;
        const match = amountStr.replace(/,/g, "").match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
        return 0;
      };

      if (sortBy === "amount") {
        const amountA = parseAmount(a.amount);
        const amountB = parseAmount(b.amount);
        return amountB - amountA; // Higher amount first
      }
    
      if (sortBy === "match") {
        return calculateMatchPercentage(userProfile, b) - calculateMatchPercentage(userProfile, a);
      }
    
      return 0;
    });
    
  const userSummary = `Showing ${filteredGrants.length} grants matched for a ${userProfile.age}-year-old ${userProfile.identifiers.join(", ")} ${userProfile.gender} with ${userProfile.citizenship} status, studying ${userProfile.education} (${userProfile.degreeType?.trim() || "Degree"}) in ${userProfile.fieldOfStudy} (${userProfile.yearOfStudy || "Year not specified"}) at a ${userProfile.gpa ? `GPA of ${userProfile.gpa}` : "GPA not specified"} in ${userProfile.country}. Ethnicity: ${userProfile.ethnicity || "Not specified"}.`;

  const renderGrantCards = () => (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {filteredGrants.map((grant) => (
        <motion.div
          key={grant.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GrantCard
            id={grant.id}
            title={grant.title}
            organization={grant.organization}
            amount={`${grant.amount}`}
            deadline={grant.deadline}
            daysRemaining={getDaysUntil(grant.deadline)}
            eligibilityHighlights={grant.eligibility}
            requirements={grant.requirements.map((r) => ({
              type: r.toLowerCase().includes("essay") ? "essay" : "other",
              label: r,
            }))}
            matchPercentage={calculateMatchPercentage(userProfile, grant)}
            onHelpMeApply={() => handleOpenAssistant(grant)}
            link={grant.link}
          />
        </motion.div>
      ))}
    </motion.div>
  );

  // Show loading view while fetching profile
  if (profileLoading || !userProfile) {
    return (
      <div className="bg-background dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Grant Dashboard</h1>
            <p className="text-muted-foreground mt-2">{userSummary}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search grants..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("deadline")}
                  className={sortBy === "deadline" ? "bg-primary text-primary-foreground" : ""}>
                  Sort by Deadline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("amount")}
                  className={sortBy === "amount" ? "bg-primary text-primary-foreground" : ""}>
                  Sort by Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("match")}
                  className={sortBy === "match" ? "bg-primary text-primary-foreground" : ""}>
                  Sort by Relevance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden md:block w-px h-8 bg-border" />
            <DarkModeToggle />
            <UserNav />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Loading grants...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-1">
              <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                  <TabsTrigger value="all">All Grants</TabsTrigger>
                  <TabsTrigger value="saved">
                    Saved Grants
                    {savedGrants.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {savedGrants.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  {filteredGrants.length > 0 ? (
                    <>
                      {renderGrantCards()}
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          onClick={handleNewGrants}
                        >
                          Find New Grants
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">
                        No grants match your current filters.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear filters
                      </Button>
                      <Button
                        variant="outline"
                        className="mt-4 ml-2"
                        onClick={handleNewGrants}
                      >
                        Find New Grants
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved">
                  {savedGrants.length > 0 ? renderGrantCards() : (
                    <div className="text-center py-12">
                      <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg">
                        You haven't saved any grants yet.
                      </p>
                      <p className="text-muted-foreground">
                        Browse grants and click the bookmark icon to save them for later.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {showAssistant && selectedGrant && (
          <ApplicationAssistant
            grantTitle={selectedGrant.title}
            grantDeadline={selectedGrant.deadline}
            grantAmount={`${selectedGrant.amount}`}
            grantRequirements={
              selectedGrant.requirements
                ?.flatMap((req) =>
                  req.split(/[;,]/).map((r) => r.trim()).filter(Boolean)
                ) ?? []
            }            
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
            onSaveGrant={() => toggleSaveGrant(selectedGrant.id)}
            isSaved={savedGrants.includes(selectedGrant.id)}
            grantLink={selectedGrant.link}
          />
        )}
      </motion.div>
    </div>
  );
};

export default GrantDashboard;
