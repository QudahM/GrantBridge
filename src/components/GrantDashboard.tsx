import ApplicationAssistant from "@/components/ApplicationAssistant";
import GrantCard from "@/components/GrantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserNav } from "@/components/ui/UserNav";
import { Grant, UserProfile } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookmarkCheck,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { analytics } from "../lib/analytics";
import { fetchUserProfile } from "../lib/profile";
import { toLegacyProfile } from "../lib/profileMap";
import { fetchSavedGrants, saveGrant, unsaveGrant } from "../lib/savedGrants";
import { fetchSavedGrantsData } from "../lib/savedGrantsData";
import { AdvancedFilters, FilterOptions } from "./AdvancedFilters";
import { DashboardSEO } from "./SEO";

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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    location.state as UserProfile
  );
  const [grants, setGrants] = useState<Grant[]>([]);
  const [savedGrantsData, setSavedGrantsData] = useState<Grant[]>([]); // Full grant data for saved grants
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [sortBy, setSortBy] = useState("deadline");
  const [savedGrants, setSavedGrants] = useState<string[]>([]); // Just IDs
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(!location.state);
  const [savedGrantsLoading, setSavedGrantsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    amountMin: 0,
    amountMax: 100000,
    deadlineRange: "all",
    eligibilityCriteria: [],
    difficulty: [],
  });

  // Load user profile if not provided via location.state
  useEffect(() => {
    const loadProfile = async () => {
      console.log("[Dashboard] Checking profile availability");

      // If profile already provided via location.state, skip fetch
      if (location.state) {
        console.log("[Dashboard] Using profile from location.state");
        setProfileLoading(false);
        return;
      }

      // Check if user is logged in
      if (!user) {
        console.log("[Dashboard] No user logged in → redirect to /login");
        navigate("/login");
        return;
      }

      // Fetch profile from Supabase
      try {
        console.log(
          "[Dashboard] Fetching profile from Supabase for user:",
          user.id
        );
        setProfileLoading(true);
        const profile = await fetchUserProfile(user.id);

        if (!profile) {
          console.log("[Dashboard] No profile found → redirect to /onboarding");
          navigate("/onboarding");
          return;
        }

        console.log("[Dashboard] Profile loaded, converting to legacy format");
        const legacyProfile = toLegacyProfile(profile);
        setUserProfile(legacyProfile);
        setProfileLoading(false);
      } catch (error) {
        console.error("[Dashboard] Error fetching profile:", error);
        console.log("[Dashboard] Fallback → redirect to /onboarding");
        navigate("/onboarding");
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
      try {
        setLoading(true);

        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${BASE_URL}/api/grants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userProfile),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("[Dashboard] Response status:", response.status);

        if (!response.ok) {
          console.error("[Dashboard] API error:", response.statusText);
          const errorText = await response.text();
          console.error("[Dashboard] Error details:", errorText);
          setGrants([]);
          return;
        }

        const data = await response.json();
        console.log("[Dashboard] Response data type:", typeof data);
        console.log("[Dashboard] Response is array:", Array.isArray(data));
        console.log("[Dashboard] Response data:", data);
        console.log("[Dashboard] Response data length:", data?.length);

        if (Array.isArray(data)) {
          console.log("[Dashboard] Grants loaded:", data.length);

          if (data.length === 0) {
            console.warn("[Dashboard] Backend returned 0 grants!");
            console.warn("  Possible reasons:");
            console.warn(
              "  1. Backend database is empty (no grants added yet)"
            );
            console.warn("  2. No grants match your profile criteria");
            console.warn("  3. Backend matching algorithm is too strict");
            console.warn(
              "  Profile sent to backend:",
              JSON.stringify(userProfile, null, 2)
            );
          } else {
            console.log(
              "[Dashboard] Successfully loaded grants:",
              data.slice(0, 2)
            );
          }

          setGrants(data);
        } else {
          console.error("[Dashboard] Invalid grants data format:", data);
          console.error("[Dashboard] Expected array, got:", typeof data);
          setGrants([]);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.error("[Dashboard] Request timed out after 30 seconds");
          console.error("[Dashboard] Backend might be down or not responding");
        } else {
          console.error("[Dashboard] Failed to fetch grants:", error);
        }
        setGrants([]);
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

  // Load saved grants when user is available
  useEffect(() => {
    const loadSavedGrants = async () => {
      if (!user) {
        setSavedGrantsLoading(false);
        return;
      }

      try {
        console.log("[Dashboard] Loading saved grants for user:", user.id);
        setSavedGrantsLoading(true);

        // Load saved grant IDs
        const savedIds = await fetchSavedGrants(user.id);
        console.log("[Dashboard] Loaded saved grant IDs:", savedIds);
        console.log("[Dashboard] Number of saved IDs:", savedIds.length);
        setSavedGrants(savedIds);

        // Load full grant data for saved grants
        const savedData = await fetchSavedGrantsData(user.id);
        console.log("[Dashboard] Loaded saved grants data:", savedData);
        console.log(
          "[Dashboard] Number of saved grants with data:",
          savedData.length
        );

        if (savedIds.length > 0 && savedData.length === 0) {
          console.error(
            "[Dashboard] MISMATCH: Have saved IDs but no grant data!"
          );
          console.error("[Dashboard] This likely means:");
          console.error(
            "[Dashboard] 1. The grant_data column does not exist in saved_grants table"
          );
          console.error(
            "[Dashboard] 2. OR grants were saved before grant_data column was added"
          );
          console.error(
            "[Dashboard] 3. OR grants are not in grants_cache table"
          );
          console.error(
            "[Dashboard] Solution: Run the SQL migration and re-save your grants"
          );
        }

        setSavedGrantsData(savedData);
      } catch (error) {
        console.error("[Dashboard] Error loading saved grants:", error);
      } finally {
        setSavedGrantsLoading(false);
      }
    };

    loadSavedGrants();
  }, [user]);

  const toggleSaveGrant = async (grantId: string) => {
    if (!user) {
      console.warn("[Dashboard] Cannot save grant: user not logged in");
      return;
    }

    const isSaved = savedGrants.includes(grantId);

    // Find the grant data to add/remove from savedGrantsData
    const grantData = [...grants, ...savedGrantsData].find(
      (g) => g.id === grantId
    );

    // Optimistic update for IDs
    setSavedGrants((prev) =>
      isSaved ? prev.filter((id) => id !== grantId) : [...prev, grantId]
    );

    // Optimistic update for full data
    if (isSaved) {
      setSavedGrantsData((prev) => prev.filter((g) => g.id !== grantId));
    } else if (grantData) {
      setSavedGrantsData((prev) => [...prev, grantData]);
    }

    try {
      if (isSaved) {
        console.log("[Dashboard] Removing saved grant:", grantId);
        const success = await unsaveGrant(user.id, grantId);
        if (!success) {
          // Revert on failure
          setSavedGrants((prev) => [...prev, grantId]);
          if (grantData) {
            setSavedGrantsData((prev) => [...prev, grantData]);
          }
          console.error("[Dashboard] Failed to remove saved grant");
        } else {
          // Track unsave event
          analytics.unsaveGrant(grantData?.title || grantId);
        }
      } else {
        console.log("[Dashboard] Saving grant:", grantId);
        const success = await saveGrant(user.id, grantId, grantData);
        if (!success) {
          // Revert on failure
          setSavedGrants((prev) => prev.filter((id) => id !== grantId));
          setSavedGrantsData((prev) => prev.filter((g) => g.id !== grantId));
          console.error("[Dashboard] Failed to save grant");
        } else {
          analytics.saveGrant(grantData?.title || grantId);
        }
      }
    } catch (error) {
      console.error("[Dashboard] Error toggling saved grant:", error);
      // Revert on error
      setSavedGrants((prev) =>
        isSaved ? [...prev, grantId] : prev.filter((id) => id !== grantId)
      );
      if (isSaved && grantData) {
        setSavedGrantsData((prev) => [...prev, grantData]);
      } else {
        setSavedGrantsData((prev) => prev.filter((g) => g.id !== grantId));
      }
    }
  };

  const handleOpenAssistant = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowAssistant(true);
    analytics.openAssistant(grant.title);
  };

  const handleNewGrants = () => {
    navigate("/onboarding");
  };

  // Extract unique eligibility criteria from all grants (including saved)
  const availableEligibility = Array.from(
    new Set(
      [...grants, ...savedGrantsData].flatMap((grant) => grant.eligibility)
    )
  ).sort();

  // Parse amount from grant string
  const parseGrantAmount = (amountStr: string): number => {
    if (!amountStr) return 0;
    const match = amountStr.replace(/,/g, "").match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Check if deadline is within range
  const isWithinDeadlineRange = (deadline: string, range: string): boolean => {
    if (range === "all") return true;

    const daysUntil = getDaysUntil(deadline);
    if (isNaN(daysUntil) || daysUntil < 0) return false;

    switch (range) {
      case "week":
        return daysUntil <= 7;
      case "month":
        return daysUntil <= 30;
      case "3months":
        return daysUntil <= 90;
      case "6months":
        return daysUntil <= 180;
      default:
        return true;
    }
  };

  // Use different grant sources based on active tab
  const sourceGrants = activeTab === "saved" ? savedGrantsData : grants;

  // Debug logging
  /*console.log("[Dashboard] Active tab:", activeTab);
  console.log("[Dashboard] Source grants count:", sourceGrants.length);
  console.log("[Dashboard] Filters:", filters);*/

  const filteredGrants = sourceGrants
    .filter((grant) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          grant.title?.toLowerCase().includes(query) ||
          grant.organization?.toLowerCase().includes(query) ||
          grant.description?.toLowerCase().includes(query) ||
          (grant.tags &&
            grant.tags.some((tag) => tag.toLowerCase().includes(query)));
        if (!matchesSearch) return false;
      }

      // Amount range filter
      const grantAmount = parseGrantAmount(grant.amount);
      if (grantAmount < filters.amountMin || grantAmount > filters.amountMax) {
        return false;
      }

      // Deadline range filter
      if (!isWithinDeadlineRange(grant.deadline, filters.deadlineRange)) {
        return false;
      }

      // Difficulty filter
      if (
        filters.difficulty.length > 0 &&
        grant.difficulty &&
        !filters.difficulty.includes(grant.difficulty)
      ) {
        return false;
      }

      // Eligibility criteria filter
      if (filters.eligibilityCriteria.length > 0 && grant.eligibility) {
        const hasMatchingEligibility = filters.eligibilityCriteria.some(
          (criterion) =>
            grant.eligibility.some((e) =>
              e.toLowerCase().includes(criterion.toLowerCase())
            )
        );
        if (!hasMatchingEligibility) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "relevance") {
        // Relevance = match percentage + deadline urgency + amount
        const matchA = calculateMatchPercentage(userProfile, a);
        const matchB = calculateMatchPercentage(userProfile, b);

        const daysA = getDaysUntil(a.deadline);
        const daysB = getDaysUntil(b.deadline);
        const urgencyA =
          isNaN(daysA) || daysA < 0 ? 0 : Math.max(0, 100 - daysA);
        const urgencyB =
          isNaN(daysB) || daysB < 0 ? 0 : Math.max(0, 100 - daysB);

        const amountA = parseGrantAmount(a.amount);
        const amountB = parseGrantAmount(b.amount);
        const amountScoreA = Math.min(100, amountA / 1000);
        const amountScoreB = Math.min(100, amountB / 1000);

        const relevanceA = matchA * 0.5 + urgencyA * 0.3 + amountScoreA * 0.2;
        const relevanceB = matchB * 0.5 + urgencyB * 0.3 + amountScoreB * 0.2;

        return relevanceB - relevanceA;
      }

      if (sortBy === "deadline") {
        const aDays = getDaysUntil(a.deadline);
        const bDays = getDaysUntil(b.deadline);

        if (isNaN(aDays) && isNaN(bDays)) return 0;
        if (isNaN(aDays)) return bDays < 0 ? -1 : 1;
        if (isNaN(bDays)) return aDays < 0 ? 1 : -1;
        if (aDays < 0 && bDays >= 0) return 1;
        if (bDays < 0 && aDays >= 0) return -1;
        if (aDays < 0 && bDays < 0) return bDays - aDays;
        return aDays - bDays;
      }

      if (sortBy === "amount") {
        const amountA = parseGrantAmount(a.amount);
        const amountB = parseGrantAmount(b.amount);
        return amountB - amountA;
      }

      if (sortBy === "match") {
        return (
          calculateMatchPercentage(userProfile, b) -
          calculateMatchPercentage(userProfile, a)
        );
      }

      return 0;
    });

  const userSummary = userProfile
    ? `Showing ${filteredGrants.length} grants matched for a ${
        userProfile.age || 0
      }-year-old ${(userProfile.identifiers || []).join(", ")} ${
        userProfile.gender || ""
      } with ${userProfile.citizenship || ""} status, studying ${
        userProfile.education || ""
      } (${userProfile.degreeType?.trim() || "Degree"}) in ${
        userProfile.fieldOfStudy || ""
      } (${userProfile.yearOfStudy || "Year not specified"}) at a ${
        userProfile.gpa ? `GPA of ${userProfile.gpa}` : "GPA not specified"
      } in ${userProfile.country || ""}. Ethnicity: ${
        userProfile.ethnicity || "Not specified"
      }.`
    : "Loading profile...";

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
    <>
      <DashboardSEO />
      <div className="bg-background dark:bg-background-dark min-h-screen p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Back to Home Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* Header Section */}
          <div className="mb-8 space-y-6">
            {/* Title and Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Your Grant Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">{userSummary}</p>
              </div>
              <div className="flex items-center gap-3">
                <DarkModeToggle />
                <UserNav />
              </div>
            </div>

            {/* Search Bar - Full Width */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search grants by title, organization, description, or tags..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters and Sort Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left Side - Sort Controls */}
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => setSortBy("relevance")}
                      className={
                        sortBy === "relevance"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Sort by Relevance
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("deadline")}
                      className={
                        sortBy === "deadline"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Sort by Deadline
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("amount")}
                      className={
                        sortBy === "amount"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Sort by Amount
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("match")}
                      className={
                        sortBy === "match"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Sort by Match %
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Active Sort Indicator */}
                {sortBy !== "deadline" && (
                  <Badge variant="secondary" className="capitalize">
                    Sorted by: {sortBy === "match" ? "Match %" : sortBy}
                  </Badge>
                )}
              </div>

              {/* Right Side - Advanced Filters */}
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableEligibility={availableEligibility}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Loading grants...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <Tabs
                  defaultValue="all"
                  onValueChange={setActiveTab}
                  value={activeTab}
                  className="w-full"
                >
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
                    {grants.length === 0 ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">
                          Loading grants from backend...
                        </p>
                      </div>
                    ) : filteredGrants.length > 0 ? (
                      <>
                        {renderGrantCards()}
                        <div className="flex justify-center mt-8">
                          <Button variant="outline" onClick={handleNewGrants}>
                            Find New Grants
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          No grants match your current filters.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Total grants available: {grants.length}
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchQuery("");
                            setFilters({
                              amountMin: 0,
                              amountMax: 100000,
                              deadlineRange: "all",
                              eligibilityCriteria: [],
                              difficulty: [],
                            });
                          }}
                        >
                          Clear All Filters
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
                    {savedGrantsLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">
                          Loading saved grants...
                        </p>
                      </div>
                    ) : savedGrantsData.length > 0 ? (
                      filteredGrants.length > 0 ? (
                        renderGrantCards()
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground text-lg">
                            No saved grants match your current filters.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Total saved grants: {savedGrantsData.length}
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              setSearchQuery("");
                              setFilters({
                                amountMin: 0,
                                amountMax: 100000,
                                deadlineRange: "all",
                                eligibilityCriteria: [],
                                difficulty: [],
                              });
                            }}
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      )
                    ) : savedGrants.length > 0 ? (
                      <div className="text-center py-12">
                        <BookmarkCheck className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                        <p className="text-muted-foreground text-lg font-semibold">
                          Saved Grants Need Migration
                        </p>
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                          You have {savedGrants.length} saved grant(s), but they
                          need to be updated to the new format.
                        </p>
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg max-w-lg mx-auto text-left">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>To fix this:</strong>
                          </p>
                          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>
                              Run the SQL migration in Supabase (see
                              SUPABASE_SAVED_GRANTS_UPDATE.md)
                            </li>
                            <li>Go to "All Grants" tab</li>
                            <li>Find and re-save your grants</li>
                          </ol>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-6"
                          onClick={() => setActiveTab("all")}
                        >
                          Go to All Grants
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-lg">
                          You haven't saved any grants yet.
                        </p>
                        <p className="text-muted-foreground">
                          Browse grants and click the bookmark icon to save them
                          for later.
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
                selectedGrant.requirements?.flatMap((req) =>
                  req
                    .split(/[;,]/)
                    .map((r) => r.trim())
                    .filter(Boolean)
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
    </>
  );
};

// Wrap with error boundary for production safety
import { InlineErrorBoundary } from "./error-boundaries";

const GrantDashboardWithErrorBoundary = () => (
  <InlineErrorBoundary componentName="Grant Dashboard">
    <GrantDashboard />
  </InlineErrorBoundary>
);

export default GrantDashboardWithErrorBoundary;
