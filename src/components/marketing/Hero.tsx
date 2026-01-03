import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ArrowRight,
  DollarSign,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSmartCta } from "../../hooks/useSmartCta";
import { useReducedMotion } from "./useReducedMotion";

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { handleCtaClick } = useSmartCta();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/explore");
  };

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  const quickFilters = [
    "Undergraduate",
    "Graduate",
    "Research",
    "International",
    "STEM",
    "Arts & Humanities",
  ];

  const stats = [
    {
      icon: <DollarSign size={20} />,
      value: "$100k+",
      label: "In Grants Found",
    },
    { icon: <Users size={20} />, value: "1K+", label: "Students Assisted" },
    { icon: <TrendingUp size={20} />, value: "80%", label: "Match Accuracy" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center px-4 md:px-8 py-16 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            {...(prefersReducedMotion ? {} : fadeInUp)}
            className="space-y-6 text-left"
          >
            {/* Badge */}
            <motion.div
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { delay: 0.1, duration: 0.5 },
                  })}
            >
              <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 px-4 py-1.5 text-sm font-medium">
                <Sparkles size={14} className="mr-2" />
                AI-Powered Grant Matching
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.2, duration: 0.5 },
                  })}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Find Grants That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Match Your Profile
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.3, duration: 0.5 },
                  })}
              className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl"
            >
              Search thousands of scholarships, research grants, and funding
              opportunities. Get personalized matches and AI-powered application
              assistance.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.4, duration: 0.5 },
                  })}
              className="relative"
            >
              <div className="relative flex items-center">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search by field, degree, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-32 py-6 text-base bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 rounded-xl backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                >
                  Search
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.form>

            {/* Quick Filters */}
            <motion.div
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 0.5, duration: 0.5 },
                  })}
              className="flex flex-wrap gap-2"
            >
              <span className="text-sm text-slate-400 mr-2">Popular:</span>
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => navigate("/explore")}
                  className="px-3 py-1 text-sm bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-full transition-all duration-200"
                >
                  {filter}
                </button>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.6, duration: 0.5 },
                  })}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-8 py-6 text-base border border-slate-500 text-slate-100
                          bg-slate-900/40 hover:bg-slate-800 hover:text-white hover:border-slate-400
                          transition-all duration-200"
              >
                Create Free Profile
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-8 py-6 text-base border border-slate-500 text-slate-100
                          bg-slate-900/40 hover:bg-slate-800 hover:text-white hover:border-slate-400
                          transition-all duration-200"
              >
                View All Grants
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats & Trust Indicators */}
          <motion.div
            {...(prefersReducedMotion
              ? {}
              : {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.4, duration: 0.6 },
                })}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  {...(prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        transition: { delay: 0.5 + index * 0.1, duration: 0.5 },
                      })}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"
                >
                  <div className="flex justify-center mb-2 text-indigo-400">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Featured Grant Preview */}
            <motion.div
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: 0.8, duration: 0.5 },
                  })}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 mb-2">
                    Featured Opportunity
                  </Badge>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    National Science Foundation Grant
                  </h3>
                  <p className="text-sm text-slate-400">
                    Research funding for STEM graduate students
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div>
                  <div className="text-2xl font-bold text-white">$50,000</div>
                  <div className="text-xs text-slate-400">Award Amount</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-indigo-400">
                    December 15, 2025
                  </div>
                  <div className="text-xs text-slate-400">Deadline</div>
                </div>
              </div>

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
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    transition: { delay: 1, duration: 0.5 },
                  })}
              className="text-center text-sm text-slate-400"
            >
              <p>Trusted by students at 50+ universities worldwide</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
