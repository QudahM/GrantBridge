import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Clock,
  BookmarkCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import GrantCard from "./GrantCard";
import ApplicationAssistant from "./ApplicationAssistant";
import { useLocation } from "react-router-dom";

interface Grant {
  id: string;
  title: string;
  organization: string;
  amount: number;
  deadline: string;
  eligibility: string[];
  requirements: string[];
  description: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

interface UserProfile {
  age: number;
  country: string;
  education: string;
  gender: string;
  interests: string[];
  identifiers: string[];
}

const GrantDashboard = () => {
  const location = useLocation();
  const userProfile = location.state as UserProfile;

  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [sortBy, setSortBy] = useState("deadline");
  const [savedGrants, setSavedGrants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/grants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userProfile),
        });

        const data = await response.json();

        if (Array.isArray(data)) {
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
  }, [userProfile]);

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
      if (sortBy === "deadline") return getDaysUntil(a.deadline) - getDaysUntil(b.deadline);
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "difficulty") {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0;
    });

  const userSummary = `Showing ${filteredGrants.length} grants matched for a ${userProfile.age}-year-old ${userProfile.identifiers.join(
    " "
  )} ${userProfile.gender} studying ${userProfile.education} in ${userProfile.country}.`;

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
            amount={`$${grant.amount.toLocaleString()}`}
            deadline={grant.deadline}
            daysRemaining={getDaysUntil(grant.deadline)}
            eligibilityHighlights={grant.eligibility}
            requirements={grant.requirements.map((r) => ({
              type: r.toLowerCase().includes("essay") ? "essay" : "other",
              label: r,
            }))}
            matchPercentage={92}
            onHelpMeApply={() => handleOpenAssistant(grant)}
          />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className="bg-background min-h-screen p-6 md:p-8">
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search grants..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
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
                  {filteredGrants.length > 0 ? renderGrantCards() : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">
                        No grants match your current filters.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery("");
                        }}
                      >
                        Clear filters
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

            <div className="flex flex-col gap-2 lg:ml-6 w-full lg:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <div className="flex items-center">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {showAssistant && selectedGrant && (
          <ApplicationAssistant
            grantTitle={selectedGrant.title}
            grantDeadline={selectedGrant.deadline}
            grantAmount={`$${selectedGrant.amount.toLocaleString()}`}
            grantRequirements={selectedGrant.requirements}
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
          />
        )}
      </motion.div>
    </div>
  );
};

export default GrantDashboard;
