import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ContactSEO } from "./SEO";
import { UserNav } from "./ui/UserNav";

type ContactType = "review" | "suggestion" | "bug" | "support";

export const ContactPage = () => {
  const { user } = useAuth();
  const [contactType, setContactType] = useState<ContactType>("review");
  const [rating, setRating] = useState(0);
  const [name, setName] = useState(user?.user_metadata?.first_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update name and email when user changes
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.first_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!name || !email || !message) {
      setError("Please fill in all required fields");
      return;
    }

    if (contactType === "review" && rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            contactType,
            subject,
            message,
            rating: contactType === "review" ? rating : undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);

        // Reset form
        setSubject("");
        setMessage("");
        setRating(0);

        // Scroll to success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending contact form:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeConfig = () => {
    switch (contactType) {
      case "review":
        return {
          title: "Share Your Review",
          description: "Tell us about your experience with GrantBridge",
          icon: <Star className="text-amber-400" size={24} />,
          color: "amber",
        };
      case "suggestion":
        return {
          title: "Suggest an Improvement",
          description: "Help us make GrantBridge better for everyone",
          icon: <Lightbulb className="text-yellow-400" size={24} />,
          color: "yellow",
        };
      case "bug":
        return {
          title: "Report a Bug",
          description: "Let us know about any issues you're experiencing",
          icon: <Bug className="text-red-400" size={24} />,
          color: "red",
        };
      case "support":
        return {
          title: "Get Support",
          description: "We're here to help with any questions",
          icon: <HelpCircle className="text-blue-400" size={24} />,
          color: "blue",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <>
      <ContactSEO />
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
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 rounded px-3 py-2"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </motion.div>
        </div>

        {/* Contact Content */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 mb-4">
                <MessageSquare size={18} className="text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">
                  Get in Touch
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                We'd love to hear from you! Share feedback, report issues, or
                get help.
              </p>
            </motion.div>

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Alert className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30 pt-5">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <AlertDescription className="font-semibold text-emerald-900 flex items-center">
                    Thank you! Your message has been sent successfully. We'll
                    get back to you soon.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-lg`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {config.title}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Contact Type Selection */}
                      <div className="space-y-3">
                        <Label className="text-slate-300 font-medium">
                          What would you like to do?
                        </Label>
                        <RadioGroup
                          value={contactType}
                          onValueChange={(value) =>
                            setContactType(value as ContactType)
                          }
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all">
                              <RadioGroupItem value="review" id="review" />
                              <Label
                                htmlFor="review"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Star size={16} className="text-amber-400" />
                                Review
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-yellow-500/50 transition-all">
                              <RadioGroupItem
                                value="suggestion"
                                id="suggestion"
                              />
                              <Label
                                htmlFor="suggestion"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Lightbulb
                                  size={16}
                                  className="text-yellow-400"
                                />
                                Suggestion
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-red-500/50 transition-all">
                              <RadioGroupItem value="bug" id="bug" />
                              <Label
                                htmlFor="bug"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Bug size={16} className="text-red-400" />
                                Bug Report
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all">
                              <RadioGroupItem value="support" id="support" />
                              <Label
                                htmlFor="support"
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <HelpCircle
                                  size={16}
                                  className="text-blue-400"
                                />
                                Support
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Rating (only for reviews) */}
                      {contactType === "review" && (
                        <div className="space-y-3">
                          <Label className="text-slate-300 font-medium">
                            Your Rating
                          </Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  size={32}
                                  className={
                                    star <= rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-600"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Name */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-slate-300 font-medium"
                        >
                          Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400"
                          placeholder="Your name"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-300 font-medium"
                        >
                          Email <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-slate-300 font-medium"
                        >
                          Subject
                        </Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400"
                          placeholder={
                            contactType === "bug"
                              ? "Brief description of the issue"
                              : contactType === "suggestion"
                              ? "What would you like to see improved?"
                              : "What's this about?"
                          }
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-slate-300 font-medium"
                        >
                          Message <span className="text-red-400">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="bg-slate-900/50 border-indigo-500/30 text-white focus:border-indigo-400 min-h-[150px]"
                          placeholder={
                            contactType === "review"
                              ? "Tell us about your experience with GrantBridge..."
                              : contactType === "suggestion"
                              ? "Share your ideas for improving GrantBridge..."
                              : contactType === "bug"
                              ? "Describe the bug, steps to reproduce, and what you expected to happen..."
                              : "How can we help you today?"
                          }
                          required
                        />
                      </div>

                      {/* Error Message */}
                      {error && (
                        <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                          <AlertTriangle size={16} />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} className="mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Column - Quick Contact Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-1 space-y-6"
              >
                {/* Contact Support */}
                <Card className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 border-blue-400/30 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <HelpCircle size={24} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        Support Team
                      </h3>
                    </div>
                    <p className="text-slate-200 text-sm mb-4">
                      Need help? Our support team is ready to assist you with
                      any questions or issues.
                    </p>
                    <a
                      href="mailto:support@grantbridge.online"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 w-full justify-center"
                    >
                      <Mail size={16} />
                      Contact Support
                    </a>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Response Time
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">
                          Support Inquiries
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          24-48 hours
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Bug Reports</span>
                        <span className="text-amber-400 font-semibold">
                          12-24 hours
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Hours */}
                <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Office Hours
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      <p>
                        <strong className="text-white">Monday - Friday:</strong>{" "}
                        9:00 AM - 6:00 PM EST
                      </p>
                      <p>
                        <strong className="text-white">Saturday:</strong> 10:00
                        AM - 4:00 PM EST
                      </p>
                      <p>
                        <strong className="text-white">Sunday:</strong> Closed
                      </p>
                      <p className="text-xs text-slate-400 mt-3">
                        * Email support available 24/7
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-700/50 bg-slate-900/50">
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
