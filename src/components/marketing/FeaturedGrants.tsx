import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "./useReducedMotion";
import { DollarSign, Calendar, Users, ArrowRight, TrendingUp } from "lucide-react";

const featuredGrants = [
  {
    title: "Fulbright Research Grant",
    organization: "U.S. Department of State",
    amount: "$30,000",
    deadline: "October 15, 2025",
    category: "Research",
    eligibility: "Graduate Students",
  },
  {
    title: "NSF Graduate Research Fellowship",
    organization: "National Science Foundation",
    amount: "$50,000",
    deadline: "October 20, 2025",
    category: "STEM",
    eligibility: "Graduate Students",
  },
  {
    title: "Gates Cambridge Scholarship",
    organization: "Bill & Melinda Gates Foundation",
    amount: "Full Tuition",
    deadline: "December 5, 2024",
    category: "International",
    eligibility: "Graduate Students",
  },
];

export const FeaturedGrants = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const containerVariants = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
      };

  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-slate-900 to-slate-900/50">
      <motion.div
        {...(prefersReducedMotion ? {} : containerVariants)}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.div
            {...(prefersReducedMotion ? {} : {
              initial: { opacity: 0, scale: 0.9 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.1, duration: 0.5 }
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGrants.map((grant, index) => (
            <motion.div
              key={index}
              {...(prefersReducedMotion ? {} : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: 0.1 + index * 0.1, duration: 0.5, ease: "easeOut" }
              })}
            >
              <Card className="h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 hover:border-indigo-500/30 transition-all duration-300 group">
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                      {grant.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                      {grant.title}
                    </h3>
                    <p className="text-sm text-slate-400">{grant.organization}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-emerald-400" />
                      <span className="text-white font-semibold">{grant.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-indigo-400" />
                      <span className="text-slate-300">{grant.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-purple-400" />
                      <span className="text-slate-300">{grant.eligibility}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={() => navigate("/explore")}
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

        {/* View All CTA */}
        <motion.div
          {...(prefersReducedMotion ? {} : {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.5, duration: 0.5 }
          })}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigate("/explore")}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-base 
                      border border-white/15 text-slate-100 
                      bg-white/5 backdrop-blur-sm 
                      hover:bg-white/10 hover:border-white/20 
                      hover:text-white transition-all duration-200"
          >
            View All Grants
            <ArrowRight size={18} className="ml-2 text-slate-300 group-hover:text-white transition-colors" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};