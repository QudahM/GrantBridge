import { motion } from "framer-motion";
import { ArrowRight, User, Search, FileCheck, GraduationCap, BookOpen, Award } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";
import { EducationalBackground } from "../effects";

const steps = [
  {
    icon: GraduationCap,
    title: "Create profile",
    description: "Tell us about your academic background, research interests, and funding goals"
  },
  {
    icon: BookOpen,
    title: "Get matches",
    description: "We find scholarships, grants, and funding opportunities that perfectly fit your profile"
  },
  {
    icon: Award,
    title: "Apply with help",
    description: "Use our AI assistant to craft compelling applications and meet all requirements"
  }
];

export const Steps = () => {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      };

  return (
    <section className="relative py-16 px-4 md:px-8 bg-slate-800/30 overflow-hidden">
      <EducationalBackground />
      <motion.div
        {...(prefersReducedMotion ? {} : fadeInUp)}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
          How it works
        </h2>
        <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
          Get started in minutes and let us guide you through the entire process.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              {...(prefersReducedMotion ? {} : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1, duration: 0.5, ease: 'easeOut' }
              })}
              className="flex flex-col items-center relative"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white mb-4 shadow-lg border-2 border-indigo-400/30">
                <step.icon size={24} aria-hidden="true" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-2">
                {step.title}
              </h3>
              
              <p className="text-gray-300 text-center leading-relaxed">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <ArrowRight 
                  size={20} 
                  className="hidden md:block absolute -right-8 top-8 text-indigo-400" 
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};