import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Find funding made for you
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Discover grants tailored to your unique profile and get personalized
          assistance with your applications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link to="/onboarding">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl bg-indigo-500 hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start your profile
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <FeatureCard
          icon="💸"
          title="Personalized Matches"
          description="We'll only show you grants that fit your unique profile — promise."
          delay={1.0}
        />
        <FeatureCard
          icon="📝"
          title="Application Assistant"
          description="Get AI-powered help with writing your applications and meeting requirements."
          delay={1.2}
        />
        <FeatureCard
          icon="⏱️"
          title="Never Miss a Deadline"
          description="Track important dates and get reminders for upcoming opportunities."
          delay={1.4}
        />
      </motion.div>

      <motion.div
        className="mt-16 text-center text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <p>
          No account needed to explore. Your profile helps us find the perfect
          matches.
        </p>
      </motion.div>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="h-full bg-slate-800 text-white border border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;
