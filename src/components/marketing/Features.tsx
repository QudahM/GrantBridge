import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, FileText, CalendarClock, LucideIcon } from "lucide-react";
import { useReducedMotion } from "./useReducedMotion";
import { EducationalBackground } from "../effects";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.5, ease: 'easeOut' }
      };

  return (
    <motion.div {...(prefersReducedMotion ? {} : fadeInUp)}>
      <Card className="h-full bg-slate-800/50 backdrop-blur-sm text-white border border-slate-700/50 shadow-lg hover:shadow-xl hover:bg-slate-800/70 transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-indigo-600/20 border border-indigo-500/30">
            <Icon size={28} className="text-indigo-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
          <p className="text-gray-300 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const Features = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      };

  return (
    <section className="relative py-16 px-4 md:px-8 overflow-hidden">
      <EducationalBackground />
      <motion.div
        {...(prefersReducedMotion ? {} : containerVariants)}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            Why choose GrantBridge?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We make finding and applying for grants simple, personalized, and stress-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            icon={Banknote}
            title="Personalized Matches"
            description="We'll only show you grants that fit your unique profile — promise."
            delay={0.1}
          />
          <FeatureCard
            icon={FileText}
            title="Application Assistant"
            description="Get AI-powered help with writing your applications and meeting requirements."
            delay={0.2}
          />
          <FeatureCard
            icon={CalendarClock}
            title="Never Miss a Deadline"
            description="Track important dates and get reminders for upcoming opportunities."
            delay={0.3}
          />
        </div>
      </motion.div>
    </section>
  );
};