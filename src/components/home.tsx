import { motion } from "framer-motion";
import { Hero } from "./marketing/Hero";
import { FeaturedGrants } from "./marketing/FeaturedGrants";
import { Steps } from "./marketing/Steps";
import { CtaBanner, SiteFooter } from "./marketing";
import { UserNav } from "./ui/UserNav";
import { FloatingElements } from "./effects";

const Home = () => {
  return (
    <div className="min-h-screen text-white bg-slate-900 relative overflow-hidden">
      {/* Floating Elements Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingElements />
      </div>

      {/* User Navigation - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed top-6 right-6 z-50"
      >
        <UserNav />
      </motion.div>

      <main className="relative z-10">
        {/* Hero Section with Search */}
        <Hero />

        {/* Featured Grants Section */}
        <FeaturedGrants />

        {/* How It Works Section */}
        <Steps />

        {/* Final CTA */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
};

export default Home;