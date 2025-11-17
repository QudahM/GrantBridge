import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Users, Lock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserNav } from "./ui/UserNav";
import { TermsSEO } from "./SEO";

export const TermsPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <TermsSEO />
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

      {/* Terms Content */}
      <section className="py-16 px-4 md:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 mb-4">
              <FileText size={18} className="text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Terms of Service</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-slate-300">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Introduction */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-indigo-600/20 rounded-lg">
                    <Shield size={24} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Welcome to GrantBridge</h2>
                    <p className="text-slate-300 leading-relaxed">
                      By accessing or using GrantBridge, you agree to be bound by these Terms of Service. Please read them carefully. If you don't agree with any part of these terms, you may not use our service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FileText size={24} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">1. Service Description</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p>
                        GrantBridge is a grant discovery and matching platform that helps students and researchers find funding opportunities. We provide:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>AI-powered grant matching based on your profile</li>
                        <li>Access to a curated database of scholarships, grants, and funding opportunities</li>
                        <li>Application assistance tools and resources</li>
                        <li>Deadline tracking and reminders</li>
                      </ul>
                      <p className="mt-4">
                        GrantBridge is a discovery platform. We do not administer grants, make funding decisions, or guarantee acceptance to any opportunity.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <Users size={24} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p><strong className="text-white">Account Creation:</strong> You may create an account to access personalized features. You must provide accurate information and keep your account secure.</p>
                      <p><strong className="text-white">Account Responsibility:</strong> You are responsible for all activity under your account. Notify us immediately of any unauthorized access.</p>
                      <p><strong className="text-white">Age Requirement:</strong> You must be at least 13 years old to use GrantBridge. Users under 18 should have parental consent.</p>
                      <p><strong className="text-white">Account Termination:</strong> You may delete your account at any time. We reserve the right to suspend or terminate accounts that violate these terms.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Lock size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">3. Privacy & Data Usage</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p><strong className="text-white">Data Collection:</strong> We collect information you provide during registration and profile creation to match you with relevant grants.</p>
                      <p><strong className="text-white">Data Security:</strong> Your data is encrypted and stored securely. We never sell your personal information to third parties.</p>
                      <p><strong className="text-white">Data Sharing:</strong> We only share data with grant providers when you explicitly choose to apply through our platform.</p>
                      <p><strong className="text-white">Your Rights:</strong> You can access, modify, or delete your data at any time through your account settings.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Cookies */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-600/20 rounded-lg">
                    <Lock size={24} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">4. Analytics & Cookies</h2>
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                      <div>
                        <p className="font-semibold text-white mb-2">Google Analytics</p>
                        <p>
                          We use Google Analytics to understand how visitors interact with our website. This helps us improve our service and user experience.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-white mb-2">Data Collected by Google Analytics:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Pages you visit and time spent on each page</li>
                          <li>How you arrived at our site (search engine, direct link, etc.)</li>
                          <li>Your approximate geographic location (city/country level)</li>
                          <li>Device type, browser, and operating system</li>
                          <li>User interactions (button clicks, form submissions, navigation)</li>
                          <li>Anonymized IP address (we enable IP anonymization)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-white mb-2">What We Don't Collect:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Your name, email, or other personally identifiable information through analytics</li>
                          <li>Sensitive personal data (financial information, health data, etc.)</li>
                          <li>Your exact IP address (anonymized for privacy)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-white mb-2">Cookies</p>
                        <p>
                          Google Analytics uses cookies to track your session and understand your behavior across visits. These cookies do not contain personal information and are used solely for analytics purposes.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-white mb-2">Your Privacy Choices:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>You can opt out of Google Analytics by installing the{" "}
                            <a 
                              href="https://tools.google.com/dlpage/gaoptout" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline"
                            >
                              Google Analytics Opt-out Browser Add-on
                            </a>
                          </li>
                          <li>You can disable cookies in your browser settings</li>
                          <li>You can use private/incognito browsing mode</li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-slate-700">
                        <p className="text-sm">
                          For more information about how Google collects and processes data, please review{" "}
                          <a 
                            href="https://policies.google.com/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            Google's Privacy Policy
                          </a>
                          {" "}and{" "}
                          <a 
                            href="https://support.google.com/analytics/answer/6004245" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            How Google uses data when you use our partners' sites or apps
                          </a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-600/20 rounded-lg">
                    <AlertCircle size={24} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p>You agree NOT to:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Provide false or misleading information</li>
                        <li>Use the service for any illegal purpose</li>
                        <li>Attempt to access other users' accounts</li>
                        <li>Scrape, copy, or redistribute our grant database</li>
                        <li>Use automated tools to access the service without permission</li>
                        <li>Interfere with the service's operation or security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-pink-600/20 rounded-lg">
                    <Shield size={24} className="text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p>All content on GrantBridge, including text, graphics, logos, and software, is owned by GrantBridge or its licensors and protected by copyright and trademark laws.</p>
                      <p>You may not reproduce, distribute, or create derivative works without our explicit permission.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <AlertCircle size={24} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-4">7. Disclaimers & Limitations</h2>
                    <div className="space-y-3 text-slate-300 leading-relaxed">
                      <p><strong className="text-white">No Guarantee:</strong> We do not guarantee that you will receive any grant or funding. Grant decisions are made by the grant providers, not GrantBridge.</p>
                      <p><strong className="text-white">Accuracy:</strong> While we strive for accuracy, we cannot guarantee that all grant information is current or complete. Always verify details with the grant provider.</p>
                      <p><strong className="text-white">Service Availability:</strong> We provide the service "as is" and may modify, suspend, or discontinue features at any time.</p>
                      <p><strong className="text-white">Limitation of Liability:</strong> GrantBridge is not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                <p className="text-slate-300 leading-relaxed">
                  We may update these Terms of Service from time to time. We'll notify you of significant changes via email or through the platform. Continued use of GrantBridge after changes constitutes acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-slate-800/90 border-slate-600/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
              
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-400/30">
                    <FileText size={32} className="text-indigo-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Questions About These Terms?</h2>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  If you have any questions about these Terms of Service, please contact our support team.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileText size={18} />
                  Contact Support
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

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
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200"
              >
                FAQ
              </Link>
              <Link
                to="/terms"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-200"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};
