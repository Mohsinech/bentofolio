"use client";

import { ReactNode, useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MagneticCardProps {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
  strength?: number;
}

export function MagneticCard({
  children,
  className = "",
  enabled = true,
  strength = 0.15,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || !enabled) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      setPosition({
        x: distanceX * strength,
        y: distanceY * strength,
      });
    },
    [strength, enabled]
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
}
