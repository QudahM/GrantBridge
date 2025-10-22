import { motion } from "framer-motion";
import { useReducedMotion } from "../marketing/useReducedMotion";

export const EducationalBackground = () => {
  const prefersReducedMotion = useReducedMotion();

  const floatingIconVariants = prefersReducedMotion
    ? { opacity: 0.05, y: 0, rotate: 0 }
    : {
        initial: { opacity: 0.02, y: 0, rotate: 0 },
        animate: {
          opacity: [0.02, 0.08, 0.02],
          y: [-20, -40, -20],
          rotate: [0, 5, 0],
        },
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }
      };

  const grantSymbolVariants = prefersReducedMotion
    ? { opacity: 0.03, scale: 1 }
    : {
        initial: { opacity: 0.01, scale: 0.8 },
        animate: {
          opacity: [0.01, 0.06, 0.01],
          scale: [0.8, 1.2, 0.8],
        },
        transition: {
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }
      };

  const connectionVariants = prefersReducedMotion
    ? { opacity: 0.02 }
    : {
        initial: { pathLength: 0, opacity: 0 },
        animate: {
          pathLength: [0, 1, 0],
          opacity: [0, 0.05, 0],
        },
        transition: {
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }
      };

  // Educational symbols as simple geometric shapes
  const educationalSymbols = [
    { type: 'book', x: 15, y: 20 },
    { type: 'graduation', x: 75, y: 30 },
    { type: 'certificate', x: 25, y: 70 },
    { type: 'scholarship', x: 85, y: 65 },
    { type: 'research', x: 45, y: 25 },
    { type: 'funding', x: 65, y: 80 },
    { type: 'education', x: 35, y: 45 },
    { type: 'opportunity', x: 55, y: 15 },
  ];

  const renderSymbol = (symbol: { type: string; x: number; y: number }, index: number) => {
    const baseClasses = "absolute opacity-5";
    
    switch (symbol.type) {
      case 'book':
        return (
          <div className={`${baseClasses} w-3 h-2 border border-blue-400/30 bg-blue-400/10`} />
        );
      case 'graduation':
        return (
          <div className={`${baseClasses} w-3 h-3 border border-emerald-400/30 bg-emerald-400/10 rotate-45`} />
        );
      case 'certificate':
        return (
          <div className={`${baseClasses} w-4 h-3 border border-purple-400/30 bg-purple-400/10 rounded-sm`} />
        );
      case 'scholarship':
        return (
          <div className={`${baseClasses} w-2 h-4 border border-yellow-400/30 bg-yellow-400/10 rounded-full`} />
        );
      case 'research':
        return (
          <div className={`${baseClasses} w-3 h-3 border border-indigo-400/30 bg-indigo-400/10 rounded-full`} />
        );
      case 'funding':
        return (
          <div className={`${baseClasses} w-2 h-2 border border-green-400/30 bg-green-400/10`} />
        );
      case 'education':
        return (
          <div className={`${baseClasses} w-3 h-3 border border-cyan-400/30 bg-cyan-400/10 rotate-12`} />
        );
      case 'opportunity':
        return (
          <div className={`${baseClasses} w-2 h-3 border border-pink-400/30 bg-pink-400/10 rounded-t-full`} />
        );
      default:
        return (
          <div className={`${baseClasses} w-2 h-2 border border-slate-400/30 bg-slate-400/10 rounded-full`} />
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating educational symbols */}
      {educationalSymbols.map((symbol, index) => (
        <motion.div
          key={`${symbol.type}-${index}`}
          {...(prefersReducedMotion ? {} : {
            ...floatingIconVariants,
            transition: {
              ...floatingIconVariants.transition,
              delay: index * 2.5,
            }
          })}
          className="absolute"
          style={{
            left: `${symbol.x}%`,
            top: `${symbol.y}%`,
          }}
        >
          {renderSymbol(symbol, index)}
        </motion.div>
      ))}

      {/* Grant/funding symbols */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`grant-${i}`}
          {...(prefersReducedMotion ? {} : {
            ...grantSymbolVariants,
            transition: {
              ...grantSymbolVariants.transition,
              delay: i * 4,
            }
          })}
          className="absolute opacity-8"
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        >
          {/* Dollar sign representation */}
          <div className="w-1 h-4 bg-emerald-400/20 relative">
            <div className="absolute top-0 left-0 w-2 h-1 border-t border-l border-emerald-400/30 rounded-tl" />
            <div className="absolute bottom-0 left-0 w-2 h-1 border-b border-r border-emerald-400/30 rounded-br" />
          </div>
        </motion.div>
      ))}

      {/* Connection network - representing educational pathways */}
      <svg className="absolute inset-0 w-full h-full opacity-15">
        <defs>
          <linearGradient id="eduGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="33%" stopColor="rgba(34, 197, 94, 0.15)" />
            <stop offset="66%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.15)" />
          </linearGradient>
        </defs>
        
        {/* Educational pathway connections */}
        {[
          "M 15 20 Q 30 35 45 25",
          "M 45 25 Q 60 40 75 30", 
          "M 25 70 Q 40 55 55 65",
          "M 75 30 Q 80 50 85 65",
          "M 35 45 Q 50 30 65 35",
        ].map((path, i) => (
          <motion.path
            key={`edu-path-${i}`}
            {...(prefersReducedMotion ? {} : {
              ...connectionVariants,
              transition: {
                ...connectionVariants.transition,
                delay: i * 3,
              }
            })}
            d={path}
            stroke="url(#eduGradient)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="1,2"
          />
        ))}
      </svg>

      {/* Subtle knowledge flow lines */}
      <motion.div
        {...(prefersReducedMotion ? {} : {
          initial: { x: "-100%", opacity: 0.02 },
          animate: { x: "100%", opacity: [0.02, 0.08, 0.02] },
          transition: { duration: 40, repeat: Infinity, ease: "linear" }
        })}
        className="absolute top-1/3 left-0 w-full h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.15) 25%,
            rgba(34, 197, 94, 0.12) 50%, 
            rgba(139, 92, 246, 0.15) 75%,
            transparent 100%)`
        }}
      />

      <motion.div
        {...(prefersReducedMotion ? {} : {
          initial: { x: "100%", opacity: 0.015 },
          animate: { x: "-100%", opacity: [0.015, 0.06, 0.015] },
          transition: { duration: 50, repeat: Infinity, ease: "linear", delay: 20 }
        })}
        className="absolute top-2/3 left-0 w-full h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(236, 72, 153, 0.12) 25%,
            rgba(99, 102, 241, 0.10) 50%,
            rgba(34, 197, 94, 0.12) 75%,
            transparent 100%)`
        }}
      />

      {/* Academic grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.008]"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};