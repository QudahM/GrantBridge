import { useEffect, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxContainerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxContainer = ({ 
  children, 
  speed = 0.5, 
  className = "" 
}: ParallaxContainerProps) => {
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const { scrollY } = useScroll();

  const initial = elementTop - clientHeight;
  const final = elementTop + clientHeight;

  const yRange = useTransform(scrollY, [initial, final], [0, (final - initial) * speed]);

  useEffect(() => {
    const element = document.getElementById('parallax-container');
    if (element) {
      const onResize = () => {
        setElementTop(element.offsetTop);
        setClientHeight(window.innerHeight);
      };
      onResize();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  return (
    <motion.div
      id="parallax-container"
      style={{ y: yRange }}
      className={className}
    >
      {children}
    </motion.div>
  );
};