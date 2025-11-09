import { motion } from "framer-motion";
import { useReducedMotion } from "../marketing/useReducedMotion";
import { GraduationCap, BookOpen, Award, DollarSign, Target, Lightbulb } from "lucide-react";

export const FloatingElements = () => {
  const prefersReducedMotion = useReducedMotion();

  const floatingVariants = (delay: number, duration: number) => prefersReducedMotion
    ? { opacity: 0.1, y: 0, x: 0, rotate: 0 }
    : {
        initial: { opacity: 0, y: 50, x: 0, rotate: 0 },
        animate: {
          opacity: [0, 0.3, 0.1, 0.4, 0.1],
          y: [-20, -60, -30, -80, -40],
          x: [0, 10, -5, 15, -10],
          rotate: [0, 5, -3, 8, -2],
        },
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }
      };

  const pulseVariants = (delay: number) => prefersReducedMotion
    ? { scale: 1, opacity: 0.05 }
    : {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
          scale: [0.8, 1.2, 0.9, 1.3, 1],
          opacity: [0, 0.1, 0.05, 0.15, 0.08],
        },
        transition: {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }
      };

  const elements = [
    { Icon: GraduationCap, position: "top-1/4 left-[10%]", delay: 0, duration: 12 },
    { Icon: BookOpen, position: "top-1/3 right-[15%]", delay: 2, duration: 15 },
    { Icon: Award, position: "top-1/2 left-[8%]", delay: 4, duration: 18 },
    { Icon: DollarSign, position: "top-2/3 right-[12%]", delay: 1, duration: 14 },
    { Icon: Target, position: "top-3/4 left-[12%]", delay: 3, duration: 16 },
    { Icon: Lightbulb, position: "top-1/2 right-[8%]", delay: 5, duration: 20 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Educational Icons */}
      {elements.map((element, index) => (
        <motion.div
          key={index}
          {...(prefersReducedMotion ? {} : floatingVariants(element.delay, element.duration))}
          className={`absolute ${element.position} z-5`}
        >
          <div className="relative">
            <element.Icon 
              size={32} 
              className="text-indigo-300/20 drop-shadow-lg" 
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-indigo-400/10 rounded-full blur-xl scale-150" />
          </div>
        </motion.div>
      ))}

      {/* Ambient Light Orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          {...(prefersReducedMotion ? {} : pulseVariants(i * 2))}
          className={`absolute w-32 h-32 rounded-full bg-gradient-radial from-indigo-400/10 via-purple-400/5 to-transparent blur-2xl ${
            i === 0 ? "top-1/4 left-1/4" :
            i === 1 ? "top-1/3 right-1/4" :
            i === 2 ? "bottom-1/3 left-1/3" :
            "bottom-1/4 right-1/3"
          }`}
        />
      ))}

      {/* Subtle Particle Stream */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            {...(prefersReducedMotion ? {} : {
              initial: { opacity: 0, y: "100vh", x: 0 },
              animate: {
                opacity: [0, 0.3, 0],
                y: ["-10vh"],
                x: [0, Math.sin(i) * 50, Math.cos(i) * 30],
              },
              transition: {
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 3,
              }
            })}
            className="absolute w-1 h-1 bg-indigo-300/30 rounded-full"
            style={{
              left: `${20 + (i * 10) % 60}%`,
            }}
          />
        ))}
      </div>

      {/* Immersive Edge Fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/20 pointer-events-none" />
      
      {/* Subtle Content Tease at Bottom */}
      <motion.div
        {...(prefersReducedMotion ? {} : {
          initial: { opacity: 0 },
          animate: { opacity: [0, 0.4, 0.2, 0.6, 0.3] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }
        })}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/20 via-purple-900/10 to-transparent"
      />

      {/* Floating Knowledge Bubbles */}
      {["Research", "Funding", "Success", "Innovation"].map((text, i) => (
        <motion.div
          key={text}
          {...(prefersReducedMotion ? {} : {
            initial: { opacity: 0, scale: 0.8, y: 20 },
            animate: {
              opacity: [0, 0.15, 0.05, 0.2, 0.08],
              scale: [0.8, 1.1, 0.9, 1.2, 1],
              y: [20, -10, 5, -20, 0],
            },
            transition: {
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 4,
            }
          })}
          className={`absolute text-xs font-medium text-indigo-200/30 backdrop-blur-sm bg-indigo-900/10 px-3 py-1 rounded-full border border-indigo-400/20 ${
            i === 0 ? "top-1/4 left-[20%]" :
            i === 1 ? "top-2/5 right-[25%]" :
            i === 2 ? "top-3/5 left-[15%]" :
            "top-1/2 right-[20%]"
          }`}
        >
          {text}
        </motion.div>
      ))}
    </div>
  );
};