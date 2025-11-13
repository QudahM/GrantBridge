import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "./useReducedMotion";
import { DollarSign, Calendar, Users, ArrowRight, Loader2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://grantbridge-server.onrender.com";

/**
 * CACHED GRANTS PIPELINE
 *
 * This component fetches featured grants from Supabase cache for instant rendering.
 * Backend stores 5 grants and randomly selects 3 each time for variety.
 * The cache is automatically updated every 3 days via cron job.
 *
 * Benefits:
 * - Instant page load (no Sonar API call)
 * - Variety (random selection from 5 grants)
 * - Reduced API costs
 * - Fresh content (auto-synced every 3 days)
 *
 * For personalized live search, see GrantDashboard which uses POST /api/grants
 */

// Sample profile for reference (used by dashboard live search)
const stemProfile = {
  age: 20,
  country: "United States",
  gender: "Student",
  citizenship: "Citizenship",
  education: "Undergraduate",
  degreeType: "Bachelor's",
  yearOfStudy: "3rd Year",
  fieldOfStudy: "Computer Science",
  gpa: "3.5",
  incomeBracket: "25k-50k",
  financialNeed: true,
  ethnicity: "Not specified",
  identifiers: ["STEM"],
};

export const FeaturedGrants = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [featuredGrants, setFeaturedGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured grants from Supabase cache for instant render
  useEffect(() => {
    const fetchFeaturedGrants = async () => {
      try {
        console.log("[FeaturedGrants] Fetching featured grants from cache...");
        const response = await fetch(`${BASE_URL}/api/featured-grants`);

        if (response.ok) {
          const data = await response.json();
          console.log("[FeaturedGrants] Received cached grants:", data.length);

          // Transform Supabase format to component format
          const transformedGrants = data.map((grant: any) => ({
            id: grant.id,
            title: grant.title,
            organization: grant.organization,
            amount: grant.amount,
            deadline: grant.deadline,
            link: grant.link,
            eligibility: grant.eligibility || [],
            requirements: grant.requirements || [],
            description: grant.description || "",
            tags: grant.tags || [],
          }));

          setFeaturedGrants(transformedGrants);
        } else {
          console.error("[FeaturedGrants] Failed to fetch featured grants");
        }
      } catch (error) {
        console.error(
          "[FeaturedGrants] Error fetching featured grants:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGrants();
  }, []);

  const containerVariants = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-900/50">
      <motion.div
        {...(prefersReducedMotion ? {} : containerVariants)}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.9 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { delay: 0.1, duration: 0.5 },
                })}
            className="inline-block mb-4"
          >
            <div className="px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
              Featured Opportunities
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trending Grant Opportunities
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Explore high-value grants with upcoming deadlines
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="ml-3 text-slate-300">
              Loading featured grants...
            </span>
          </div>
        ) : featuredGrants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">
              No featured grants available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGrants.map((grant, index) => (
              <motion.div
                key={grant.id || index}
                {...(prefersReducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        delay: 0.1 + index * 0.1,
                        duration: 0.5,
                        ease: "easeOut",
                      },
                    })}
              >
                <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 hover:border-indigo-500/30 transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                        {grant.tags?.[0] || "Grant"}
                      </Badge>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {grant.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {grant.organization}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-emerald-400" />
                        <span className="text-white font-semibold">
                          {grant.amount?.toString().startsWith("$")
                            ? grant.amount
                            : `$${grant.amount}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-indigo-400" />
                        <span className="text-slate-300">{grant.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-purple-400" />
                        <span className="text-slate-300 line-clamp-1">
                          {grant.eligibility?.[0] || "See requirements"}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => {
                        if (grant.link) {
                          window.open(
                            grant.link,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                      variant="outline"
                      className="w-full border border-slate-500/70 text-slate-100 
                                bg-slate-900/40 hover:bg-slate-800 hover:border-slate-400 
                                hover:text-white transition-all duration-200"
                    >
                      View Details
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All CTA */}
        {!loading && featuredGrants.length > 0 && (
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.5, duration: 0.5 },
                })}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate("/dashboard", { state: stemProfile })}
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base 
                        border border-white/15 text-slate-100 
                        bg-white/5 backdrop-blur-sm 
                        hover:bg-white/10 hover:border-white/20 
                        hover:text-white transition-all duration-200"
            >
              View All Grants
              <ArrowRight
                size={18}
                className="ml-2 text-slate-300 group-hover:text-white transition-colors"
              />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};