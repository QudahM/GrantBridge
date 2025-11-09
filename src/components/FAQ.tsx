import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles, Shield, Zap, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
  category: "getting-started" | "features" | "privacy" | "grants" | "account";
  icon?: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What is GrantBridge and how does it work?",
    answer: "GrantBridge is your personal grant-finding assistant. We use AI to match you with scholarships, grants, and funding opportunities that fit your unique profile. Simply tell us about yourself through our quick onboarding, and we'll show you grants you actually qualify for - no more wasting time on opportunities that aren't right for you.",
    category: "getting-started",
    icon: <Sparkles size={20} className="text-indigo-400" />,
  },
  {
    question: "Do I need to create an account to browse grants?",
    answer: "Nope! You can explore grants without creating an account by clicking 'Browse grants.' However, creating a free account lets you save your favorite grants, track deadlines, get personalized recommendations, and access our AI application assistant. Think of it as unlocking the full GrantBridge experience.",
    category: "getting-started",
    icon: <Zap size={20} className="text-emerald-400" />,
  },
  {
    question: "Is GrantBridge really free?",
    answer: "Yes, 100% free! We believe finding funding for your education shouldn't cost you money. There are no hidden fees, no premium tiers, and no credit card required. Ever. We're here to help you access opportunities, not create financial barriers.",
    category: "getting-started",
    icon: <Heart size={20} className="text-pink-400" />,
  },
  {
    question: "How accurate are your grant matches?",
    answer: "Our AI analyzes your profile against thousands of grant eligibility criteria to show you opportunities with the highest match percentage. We prioritize quality over quantity - you'll see fewer grants, but they'll actually be relevant to you. Most users find their match accuracy improves as they complete more of their profile.",
    category: "features",
    icon: <Sparkles size={20} className="text-purple-400" />,
  },
  {
    question: "What makes GrantBridge different from other grant search sites?",
    answer: "Three things: 1) We use AI to personalize your matches, not just keyword searches. 2) Our application assistant helps you write compelling applications. 3) We focus on user experience - no cluttered interfaces or overwhelming lists. Just clean, simple, and effective grant discovery.",
    category: "features",
  },
  {
    question: "Can the AI really help me write my grant applications?",
    answer: "Absolutely! Our AI assistant analyzes the grant requirements and helps you craft responses that highlight your strengths and experiences. It's like having a writing coach available 24/7. You stay in control of your story - we just help you tell it better.",
    category: "features",
    icon: <Sparkles size={20} className="text-indigo-400" />,
  },
  {
    question: "What information do you collect, and is it safe?",
    answer: "We only collect what's necessary to match you with grants: basic demographics, education details, and financial information. Your data is encrypted, never sold to third parties, and you can delete your account anytime. We're GDPR compliant and take your privacy seriously - because trust matters.",
    category: "privacy",
    icon: <Shield size={20} className="text-blue-400" />,
  },
  {
    question: "How do I know these grants are legitimate?",
    answer: "Every grant in our database is verified and comes from reputable sources - universities, foundations, government programs, and established organizations. We regularly update our database and remove expired or suspicious opportunities. If something seems off, you can report it, and we'll investigate immediately.",
    category: "grants",
    icon: <Shield size={20} className="text-emerald-400" />,
  },
  {
    question: "How often are new grants added?",
    answer: "We update our grant database daily! New opportunities are added as soon as they're announced, and we'll notify you when grants matching your profile become available. You can also set up deadline reminders so you never miss an opportunity.",
    category: "grants",
  },
  {
    question: "What types of grants can I find on GrantBridge?",
    answer: "We cover it all: scholarships, research grants, study abroad funding, need-based aid, merit awards, diversity grants, field-specific funding, and more. Whether you're in high school, undergrad, grad school, or pursuing research, we've got opportunities for you.",
    category: "grants",
  },
  {
    question: "I'm an international student. Can I use GrantBridge?",
    answer: "Yes! We include grants for international students, permanent residents, and citizens. During onboarding, tell us your citizenship status, and we'll show you opportunities you're eligible for. Many grants specifically welcome international applicants.",
    category: "grants",
  },
  {
    question: "Can I edit my profile after creating it?",
    answer: "Of course! Your profile isn't set in stone. As your situation changes - new GPA, different field of study, updated financial status - just update your profile. Your grant matches will automatically refresh to reflect your current situation.",
    category: "account",
  },
  {
    question: "How do deadline reminders work?",
    answer: "Once you save a grant, we'll automatically track its deadline and send you email reminders at strategic intervals (30 days, 2 weeks, 3 days before). You can customize reminder preferences in your settings. Never miss a deadline again!",
    category: "features",
  },
  {
    question: "What if I don't see many grant matches?",
    answer: "A few things to try: 1) Complete more of your profile - the more we know, the better we can match. 2) Broaden your criteria slightly. 3) Check back regularly - new grants are added daily. 4) Consider grants with lower match percentages - sometimes they're worth exploring. Quality matches take time!",
    category: "grants",
  },
  {
    question: "Can I apply to grants directly through GrantBridge?",
    answer: "Not yet, but we're working on it! Currently, we provide all the information and tools you need to apply, including direct links to application portals and our AI writing assistant. We make the process as smooth as possible - you just need to submit through the grant provider's platform.",
    category: "features",
  },
  {
    question: "Do you offer grants for graduate students and researchers?",
    answer: "Absolutely! We have extensive databases for master's students, PhD candidates, postdocs, and researchers. Whether you need dissertation funding, conference travel grants, or research project support, we've got you covered.",
    category: "grants",
  },
  {
    question: "How long does the onboarding process take?",
    answer: "About 5-7 minutes. We know your time is valuable, so we've streamlined it to just the essentials. You can always skip questions and come back later, but the more complete your profile, the better your matches will be.",
    category: "getting-started",
  },
  {
    question: "What happens to my data if I delete my account?",
    answer: "It's gone. Permanently. We delete all your personal information from our servers within 30 days of your request. No backups, no archives, no 'just in case' copies. Your data, your choice.",
    category: "privacy",
    icon: <Shield size={20} className="text-red-400" />,
  },
];

const categories = [
  { id: "all", label: "All Questions", icon: <HelpCircle size={16} /> },
  { id: "getting-started", label: "Getting Started", icon: <Zap size={16} /> },
  { id: "features", label: "Features", icon: <Sparkles size={16} /> },
  { id: "grants", label: "About Grants", icon: <Heart size={16} /> },
  { id: "privacy", label: "Privacy & Security", icon: <Shield size={16} /> },
  { id: "account", label: "Account", icon: <HelpCircle size={16} /> },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredFAQs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-slate-900/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_50%)] opacity-40 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <HelpCircle size={18} className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Frequently Asked Questions</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Got questions? We've got answers.
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about finding grants, using GrantBridge, and funding your education.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFAQs.map((faq, index) => (
            <Card
              key={index}
              className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-slate-800/50 transition-colors duration-200"
              >
                <div className="flex items-start gap-3 flex-1">
                  {faq.icon && (
                    <div className="mt-1 flex-shrink-0">
                      {faq.icon}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={20} className="text-slate-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <CardContent className="px-6 pb-6 pt-0">
                      <div className={`pl-${faq.icon ? "8" : "0"}`}>
                        <p className="text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white mb-2">
                Still have questions?
              </h3>
              <p className="text-slate-300 mb-4">
                We're here to help! Reach out to our support team anytime.
              </p>
              <a
                href="mailto:support@grantbridge.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <HelpCircle size={18} />
                Contact Support
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};