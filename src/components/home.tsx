import { Hero, Features, Steps, CtaBanner, SiteFooter } from "./marketing";

const Home = () => {
  return (
    <div className="min-h-screen text-white">
      <main>
        <Hero />
        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 relative">
          {/* Subtle radial overlay for other sections */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_50%)] opacity-40 pointer-events-none" />
          <div className="relative z-10">
            <Features />
            <Steps />
            <CtaBanner />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Home;
