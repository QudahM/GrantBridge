import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useReducedMotion } from "./useReducedMotion";
import { AuroraBackground } from "../effects";

export const Hero = () => {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  const fadeIn = prefersReducedMotion
    ? { opacity: 1 }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-4 md:px-8 text-center overflow-hidden">
      {/* Enhanced Aurora Background */}
      <AuroraBackground />

      <header className="sr-only">
        <h1>GrantBridge - Find funding made for you</h1>
      </header>

      {/* Content with enhanced backdrop */}
      <motion.div
        {...(prefersReducedMotion ? {} : fadeInUp)}
        className="relative z-10 max-w-4xl w-full space-y-8"
      >
        <motion.h1
          {...(prefersReducedMotion
            ? {}
            : {
                ...fadeIn,
                transition: { delay: 0.1, duration: 0.5, ease: "easeOut" },
              })}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg"
          style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.5)" }}
        >
          Find funding made for you
        </motion.h1>

        <motion.p
          {...(prefersReducedMotion
            ? {}
            : {
                ...fadeIn,
                transition: { delay: 0.2, duration: 0.5, ease: "easeOut" },
              })}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
          style={{ textShadow: "0 1px 10px rgba(0, 0, 0, 0.3)" }}
        >
          Discover grants tailored to your unique profile and get personalized
          assistance with your applications.
        </motion.p>

        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                ...fadeInUp,
                transition: { delay: 0.3, duration: 0.5, ease: "easeOut" },
              })}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <Link to="/login">
            <Button
              size="lg"
              className="px-6 py-5 text-lg bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              data-testid="cta-start-profile"
              aria-label="Start creating your profile to find matching grants"
            >
              Start your profile
            </Button>
          </Link>

          <Link to="/explore">
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-5 text-lg bg-white/5 text-white border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0 transition-all duration-200 backdrop-blur-md shadow-sm hover:shadow-md"
              data-testid="cta-browse-grants"
              aria-label="Browse available grants without creating a profile"
            >
              Browse grants
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};
