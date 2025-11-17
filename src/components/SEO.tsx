import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export const SEO = ({
  title = 'GrantBridge - Discover Scholarships & Grants with AI',
  description = 'Smart scholarship and grant discovery platform. Find relevant opportunities, understand eligibility, track applications, and get AI-powered assistance for your grant applications.',
  keywords = 'scholarships, grants, financial aid, student funding, scholarship search, grant finder, AI scholarship assistant',
  image = 'https://grantbridge.online/Grantbridge_logo.png',
  url = 'https://grantbridge.online',
  type = 'website',
  noindex = false,
}: SEOProps) => {
  const fullTitle = title.includes('GrantBridge') ? title : `${title} | GrantBridge`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

// Pre-configured SEO for common pages
export const HomeSEO = () => (
  <SEO
    title="GrantBridge - Discover Scholarships & Grants with AI"
    description="Smart scholarship and grant discovery platform. Find relevant opportunities, understand eligibility, track applications, and get AI-powered assistance for your grant applications."
    url="https://grantbridge.online/"
  />
);

export const DashboardSEO = () => (
  <SEO
    title="Dashboard"
    description="View your personalized grant matches, track applications, and manage your scholarship opportunities."
    url="https://grantbridge.online/dashboard"
    noindex={true}
  />
);

export const LoginSEO = () => (
  <SEO
    title="Login"
    description="Sign in to GrantBridge to access your personalized grant dashboard and application assistant."
    url="https://grantbridge.online/login"
  />
);

export const OnboardingSEO = () => (
  <SEO
    title="Get Started"
    description="Create your profile to discover scholarships and grants tailored to your background, education, and goals."
    url="https://grantbridge.online/onboarding"
  />
);

export const ExploreSEO = () => (
  <SEO
    title="Explore Grants"
    description="Browse and discover scholarships and grants that match your profile. Get AI-powered recommendations."
    url="https://grantbridge.online/explore"
  />
);

export const ProfileSEO = () => (
  <SEO
    title="Your Profile"
    description="Manage your profile information to get better grant matches and personalized recommendations."
    url="https://grantbridge.online/profile"
    noindex={true}
  />
);

export const FAQSEO = () => (
  <SEO
    title="FAQ - Frequently Asked Questions"
    description="Find answers to common questions about GrantBridge, scholarships, grants, and how to use our platform."
    url="https://grantbridge.online/faq"
  />
);

export const TermsSEO = () => (
  <SEO
    title="Terms of Service"
    description="Read GrantBridge's terms of service and user agreement."
    url="https://grantbridge.online/terms"
  />
);

export const ContactSEO = () => (
  <SEO
    title="Contact Us"
    description="Get in touch with the GrantBridge team. We're here to help with any questions or feedback."
    url="https://grantbridge.online/contact"
  />
);
