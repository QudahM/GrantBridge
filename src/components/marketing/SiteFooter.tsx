import { Link } from "react-router-dom";

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 md:px-8 border-t border-slate-900 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © {currentYear} GrantBridge. All rights reserved.
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
  );
};
