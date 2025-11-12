import { motion } from "framer-motion";
import { UserPlus, Sparkles, Send, ArrowRight } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Profile",
    description:
      "Tell us about your education, background, and funding needs in just 5 minutes",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Get Matched",
    description:
      "Our AI analyzes thousands of grants and shows you the best opportunities",
  },
  {
    icon: Send,
    number: "03",
    title: "Apply with Confidence",
    description:
      "Use our AI assistant to craft compelling applications that stand out",
  },
];

export const Steps = () => {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  return (
    <section className="py-20 px-4 md:px-8 bg-slate-900/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_50%)] opacity-40 pointer-events-none" />

      <motion.div
        {...(prefersReducedMotion ? {} : fadeInUp)}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
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
            <div className="px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
              How It Works
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Three Simple Steps to Funding
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            From profile creation to application submission, we guide you every
            step of the way
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    transition: {
                      delay: 0.2 + index * 0.1,
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  })}
              className="relative"
            >
              {/* Step Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 h-full">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-slate-900">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 mb-6 mx-auto">
                  <step.icon size={32} className="text-indigo-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 text-center">
                  {step.title}
                </h3>

                <p className="text-slate-300 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (Desktop) - Centered vertically */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-7 z-10 -translate-y-1/2 items-center justify-center">
                  <ArrowRight size={24} className="text-indigo-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
