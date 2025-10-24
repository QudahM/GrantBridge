import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useReducedMotion } from "./useReducedMotion";

export const CtaBanner = () => {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  return (
    <section className="py-16 px-4 md:px-8">
      <motion.div
        {...(prefersReducedMotion ? {} : fadeInUp)}
        className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 md:p-12 border border-indigo-500/30"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
          Ready to unlock your educational funding?
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of students and researchers who've found their perfect grants. Your academic journey deserves the right funding support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/login">
            <Button
              size="lg"
              className="px-8 py-5 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-label="Start your academic funding journey"
            >
              Start your funding journey
            </Button>
          </Link>

        </div>
      </motion.div>
    </section>
  );
};