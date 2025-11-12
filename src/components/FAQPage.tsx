import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FAQ } from "./FAQ";
import { UserNav } from "./ui/UserNav";

export const FAQPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      {/* User Navigation - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 right-6 z-50"
      >
        <UserNav />
      </motion.div>

      {/* Back to Home Link */}
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded px-3 py-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </motion.div>
      </div>

      {/* FAQ Component */}
      <FAQ />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-700/50 bg-slate-900/50 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} GrantBridge. All rights reserved.
            </div>

            <nav className="flex space-x-6" aria-label="Footer navigation">
              <Link
                to="/faq"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
              >
                FAQ
              </Link>
              <Link
                to="/terms"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};