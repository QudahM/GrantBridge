import { motion } from "framer-motion";
import { useReducedMotion } from "../marketing/useReducedMotion";

export const AuroraBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  // Enhanced Aurora animation variants
  const auroraVariants = prefersReducedMotion
    ? { opacity: 0.4 }
    : {
        initial: { opacity: 0.2, scale: 0.8, rotate: 0 },
        animate: {
          opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
          scale: [0.8, 1.2, 0.9, 1.3, 0.8],
          rotate: [0, 8, -5, 12, 0],
        },
        transition: {
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const auroraVariants2 = prefersReducedMotion
    ? { opacity: 0.3 }
    : {
        initial: { opacity: 0.1, scale: 1.2, rotate: 45 },
        animate: {
          opacity: [0.1, 0.4, 0.2, 0.5, 0.1],
          scale: [1.2, 0.8, 1.1, 0.7, 1.2],
          rotate: [45, 55, 38, 62, 45],
        },
        transition: {
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        },
      };

  const auroraVariants3 = prefersReducedMotion
    ? { opacity: 0.2 }
    : {
        initial: { opacity: 0.05, scale: 1.5, rotate: -30 },
        animate: {
          opacity: [0.05, 0.25, 0.15, 0.35, 0.05],
          scale: [1.5, 1.0, 1.3, 0.9, 1.5],
          rotate: [-30, -20, -35, -15, -30],
        },
        transition: {
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8,
        },
      };

  const floatingParticleVariants = prefersReducedMotion
    ? { opacity: 0.15 }
    : {
        initial: { y: 0, opacity: 0.1 },
        animate: {
          y: [-30, -60, -30],
          opacity: [0.1, 0.4, 0.1],
        },
        transition: {
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const educationalParticleVariants = prefersReducedMotion
    ? { opacity: 0.1, scale: 1 }
    : {
        initial: { y: 0, opacity: 0.05, scale: 0.8, rotate: 0 },
        animate: {
          y: [-40, -80, -40],
          opacity: [0.05, 0.2, 0.05],
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 360, 0],
        },
        transition: {
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const connectionLineVariants = prefersReducedMotion
    ? { opacity: 0.1 }
    : {
        initial: { pathLength: 0, opacity: 0 },
        animate: {
          pathLength: [0, 1, 0],
          opacity: [0, 0.3, 0],
        },
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced base gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800" />

      {/* Additional deep space layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20" />

      {/* Aurora layer 1 - Main light source (Education theme - warm knowledge glow) */}
      <motion.div
        {...(prefersReducedMotion ? {} : auroraVariants)}
        className="absolute -top-1/2 -left-1/2 w-full h-full"
        style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 50%, 
            rgba(99, 102, 241, 0.18) 0%, 
            rgba(139, 92, 246, 0.12) 25%, 
            rgba(59, 130, 246, 0.08) 50%, 
            rgba(34, 197, 94, 0.04) 70%,
            transparent 85%)`,
        }}
      />

      {/* Aurora layer 2 - Secondary light source (Grant theme - opportunity glow) */}
      <motion.div
        {...(prefersReducedMotion ? {} : auroraVariants2)}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        style={{
          background: `radial-gradient(ellipse 700px 900px at 50% 50%, 
            rgba(139, 92, 246, 0.15) 0%, 
            rgba(99, 102, 241, 0.10) 25%, 
            rgba(168, 85, 247, 0.06) 50%, 
            rgba(236, 72, 153, 0.03) 70%,
            transparent 85%)`,
        }}
      />

      {/* Aurora layer 3 - Tertiary light source (Success theme - achievement glow) */}
      <motion.div
        {...(prefersReducedMotion ? {} : auroraVariants3)}
        className="absolute top-1/4 left-1/4 w-3/4 h-3/4"
        style={{
          background: `radial-gradient(ellipse 500px 600px at 50% 50%, 
            rgba(34, 197, 94, 0.12) 0%, 
            rgba(59, 130, 246, 0.08) 30%, 
            rgba(99, 102, 241, 0.04) 60%, 
            transparent 80%)`,
        }}
      />

      {/* Enhanced moving gradient ribbons - Knowledge streams */}
      <motion.div
        {...(prefersReducedMotion
          ? {}
          : {
              initial: { x: "-100%", opacity: 0.08 },
              animate: { x: "100%", opacity: [0.08, 0.25, 0.08] },
              transition: { duration: 25, repeat: Infinity, ease: "linear" },
            })}
        className="absolute top-1/5 left-0 w-full h-0.5"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(99, 102, 241, 0.4) 30%,
            rgba(34, 197, 94, 0.3) 50%, 
            rgba(99, 102, 241, 0.4) 70%,
            transparent 100%)`,
        }}
      />

      <motion.div
        {...(prefersReducedMotion
          ? {}
          : {
              initial: { x: "100%", opacity: 0.06 },
              animate: { x: "-100%", opacity: [0.06, 0.2, 0.06] },
              transition: {
                duration: 35,
                repeat: Infinity,
                ease: "linear",
                delay: 12,
              },
            })}
        className="absolute top-4/5 left-0 w-full h-0.5"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(139, 92, 246, 0.35) 30%,
            rgba(236, 72, 153, 0.25) 50%,
            rgba(139, 92, 246, 0.35) 70%,
            transparent 100%)`,
        }}
      />

      {/* Diagonal opportunity streams */}
      <motion.div
        {...(prefersReducedMotion
          ? {}
          : {
              initial: { x: "-50%", y: "-50%", opacity: 0.04 },
              animate: { x: "150%", y: "150%", opacity: [0.04, 0.15, 0.04] },
              transition: {
                duration: 45,
                repeat: Infinity,
                ease: "linear",
                delay: 5,
              },
            })}
        className="absolute top-0 left-0 w-full h-px rotate-12"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(34, 197, 94, 0.3) 50%, 
            transparent 100%)`,
        }}
      />

      {/* Enhanced floating particles - Knowledge dots */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            {...(prefersReducedMotion
              ? {}
              : {
                  ...floatingParticleVariants,
                  transition: {
                    ...floatingParticleVariants.transition,
                    delay: i * 1.5,
                  },
                })}
            className="absolute w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-25"
            style={{
              left: `${15 + ((i * 7) % 70)}%`,
              top: `${25 + (i % 4) * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Educational themed particles - Book/graduation symbols */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`edu-particle-${i}`}
            {...(prefersReducedMotion
              ? {}
              : {
                  ...educationalParticleVariants,
                  transition: {
                    ...educationalParticleVariants.transition,
                    delay: i * 3,
                  },
                })}
            className="absolute opacity-10"
            style={{
              left: `${10 + ((i * 12) % 80)}%`,
              top: `${20 + (i % 5) * 12}%`,
            }}
          >
            {/* Simple geometric shapes representing education/grants */}
            <div className="w-2 h-2 border border-emerald-400 rotate-45 bg-emerald-400/20" />
          </motion.div>
        ))}
      </div>

      {/* Connection lines - representing networking and opportunities */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient
            id="connectionGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.3)" />
            <stop offset="50%" stopColor="rgba(34, 197, 94, 0.2)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
          </linearGradient>
        </defs>

        {[...Array(4)].map((_, i) => (
          <motion.path
            key={`connection-${i}`}
            {...(prefersReducedMotion
              ? {}
              : {
                  ...connectionLineVariants,
                  transition: {
                    ...connectionLineVariants.transition,
                    delay: i * 2,
                  },
                })}
            d={`M ${20 + i * 25} ${30 + i * 15} Q ${50 + i * 20} ${
              60 + i * 10
            } ${80 + i * 15} ${40 + i * 20}`}
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="2,4"
          />
        ))}
      </svg>

      {/* Enhanced noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Paper texture overlay - subtle education theme */}
      <div
        className="absolute inset-0 opacity-[0.008] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='37' cy='23' r='1'/%3E%3Ccircle cx='23' cy='37' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Enhanced vignette effect */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent 0%, 
            transparent 35%, 
            rgba(15, 23, 42, 0.08) 65%, 
            rgba(15, 23, 42, 0.25) 90%,
            rgba(15, 23, 42, 0.4) 100%)`,
        }}
      />

      {/* Subtle grid overlay - representing structure and organization */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />
    </div>
  );
};
