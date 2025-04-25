import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
  X,
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

interface GrantDashboardProps {
  userProfile?: {
    age: number;
    country: string;
    education: string;
    gender: string;
    interests: string[];
    identifiers: string[];
  };
  grants?: Grant[];
}

const GrantDashboard = ({
  userProfile = {
    age: 21,
    country: "Canada",
    education: "Computer Science",
    gender: "Woman",
    interests: ["Technology", "Education", "Research"],
    identifiers: ["Black", "First Generation"],
  },
  grants = [
    {
      id: "1",
      title: "Tech Innovation Scholarship",
      organization: "Future Tech Foundation",
      amount: 5000,
      deadline: "2023-12-15",
      eligibility: [
        "Computer Science students",
        "Women in STEM",
        "Undergraduates",
      ],
      requirements: ["Essay", "Transcript", "Recommendation Letter"],
      description:
        "Supporting women in technology with scholarships for innovative projects.",
      tags: ["Technology", "Innovation", "Women in STEM"],
      difficulty: "Medium",
    },
    {
      id: "2",
      title: "Diversity in STEM Grant",
      organization: "Inclusive Education Initiative",
      amount: 3500,
      deadline: "2023-11-30",
      eligibility: [
        "BIPOC students",
        "STEM fields",
        "Undergraduate or Graduate",
      ],
      requirements: ["Personal Statement", "Proof of Enrollment"],
      description:
        "Promoting diversity in STEM fields through financial support for underrepresented groups.",
      tags: ["Diversity", "STEM", "Equity"],
      difficulty: "Easy",
    },
    {
      id: "3",
      title: "Research Excellence Fellowship",
      organization: "National Science Foundation",
      amount: 7500,
      deadline: "2024-01-15",
      eligibility: [
        "Graduate students",
        "Research focus",
        "Academic excellence",
      ],
      requirements: [
        "Research Proposal",
        "Academic CV",
        "Two Recommendation Letters",
        "Transcript",
      ],
      description:
        "Supporting outstanding research initiatives by graduate students across STEM disciplines.",
      tags: ["Research", "Academic", "Fellowship"],
      difficulty: "Hard",
    },
    {
      id: "4",
      title: "First Generation Scholarship",
      organization: "Educational Opportunity Fund",
      amount: 4000,
      deadline: "2023-12-01",
      eligibility: [
        "First Generation College Students",
        "Undergraduate",
        "Financial Need",
      ],
      requirements: [
        "Personal Statement",
        "Financial Information",
        "Proof of First Gen Status",
      ],
      description:
        "Supporting first-generation college students in achieving their academic goals.",
      tags: ["First Generation", "Opportunity", "Undergraduate"],
      difficulty: "Medium",
    },
    {
      id: "5",
      title: "Digital Innovation Award",
      organization: "Tech Forward Alliance",
      amount: 6000,
      deadline: "2023-11-15",
      eligibility: [
        "Computer Science",
        "Information Technology",
        "Software Engineering",
      ],
      requirements: ["Project Portfolio", "Essay", "Video Submission"],
      description:
        "Recognizing innovative digital projects and solutions from emerging tech talent.",
      tags: ["Technology", "Innovation", "Digital"],
      difficulty: "Medium",
    },
    {
      id: "6",
      title: "Community Leadership Grant",
      organization: "Community Foundation",
      amount: 2500,
      deadline: "2023-12-30",
      eligibility: [
        "Community Involvement",
        "Leadership Experience",
        "Any Field of Study",
      ],
      requirements: [
        "Leadership Essay",
        "Community Service Record",
        "Reference Letter",
      ],
      description:
        "Supporting students who demonstrate exceptional leadership in their communities.",
      tags: ["Leadership", "Community", "Service"],
      difficulty: "Easy",
    },
  ],
}: GrantDashboardProps) => {
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [savedGrants, setSavedGrants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Calculate days until deadline
  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Toggle save grant
  const toggleSaveGrant = (grantId: string) => {
    if (savedGrants.includes(grantId)) {
      setSavedGrants(savedGrants.filter((id) => id !== grantId));
    } else {
      setSavedGrants([...savedGrants, grantId]);
    }
  };

  // Handle opening the application assistant
  const handleOpenAssistant = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowAssistant(true);
  };

  // Filter and sort grants
  const filteredGrants = grants
    .filter((grant) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          grant.title.toLowerCase().includes(query) ||
          grant.organization.toLowerCase().includes(query) ||
          grant.description.toLowerCase().includes(query) ||
          grant.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Filter by tab
      if (activeTab === "saved") {
        return savedGrants.includes(grant.id);
      }

      // Filter by difficulty
      if (filter !== "all") {
        return grant.difficulty.toLowerCase() === filter.toLowerCase();
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === "deadline") {
        return getDaysUntil(a.deadline) - getDaysUntil(b.deadline);
      } else if (sortBy === "amount") {
        return b.amount - a.amount;
      } else if (sortBy === "difficulty") {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return 0;
    });

  // Format user profile summary
  const userSummary = `Showing ${filteredGrants.length} grants matched for a ${userProfile.age}-year-old ${userProfile.identifiers.join(" ")} ${userProfile.gender} studying ${userProfile.education} in ${userProfile.country}.`;

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
            <h1 className="text-3xl font-bold text-foreground">
              Your Grant Dashboard
            </h1>
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

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-auto">
            <Tabs
              defaultValue="all"
              className="w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Grants</TabsTrigger>
                <TabsTrigger value="saved" className="relative">
                  Saved Grants
                  {savedGrants.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {savedGrants.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="m-0">
                {filteredGrants.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                          grant={grant}
                          daysUntil={getDaysUntil(grant.deadline)}
                          isSaved={savedGrants.includes(grant.id)}
                          onSave={() => toggleSaveGrant(grant.id)}
                          onApply={() => handleOpenAssistant(grant)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No grants match your current filters.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setFilter("all");
                        setSearchQuery("");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="m-0">
                {savedGrants.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                          grant={grant}
                          daysUntil={getDaysUntil(grant.deadline)}
                          isSaved={true}
                          onSave={() => toggleSaveGrant(grant.id)}
                          onApply={() => handleOpenAssistant(grant)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">
                      You haven't saved any grants yet.
                    </p>
                    <p className="text-muted-foreground">
                      Browse grants and click the bookmark icon to save them for
                      later.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2 ml-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
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

        {showAssistant && selectedGrant && (
          <ApplicationAssistant
            grant={selectedGrant}
            userProfile={userProfile}
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
          />
        )}
      </motion.div>
    </div>
  );
};

export default GrantDashboard;
