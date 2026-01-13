"use client";

import { ReactNode, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./BentoGrid.module.css";
import { cn } from "@/app/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  isEditing?: boolean;
  isPro?: boolean;
}

export function BentoGrid({
  children,
  className,
  isEditing,
  isPro,
}: BentoGridProps) {
  return (
    <div
      className={cn(styles.grid, className)}
      data-editing={isEditing ? "true" : undefined}
      data-pro={isPro ? "true" : undefined}
    >
      {children}
    </div>
  );
}

interface BentoItemProps {
  children: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3 | 4;
  className?: string;
  index?: number;
  enableMagnetic?: boolean;
}

export function BentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  index = 0,
  enableMagnetic = false,
}: BentoItemProps) {
  const colClass = styles[`col${colSpan}`];
  const rowClass = styles[`row${rowSpan}`];

  // Magnetic effect state
  const ref = useRef<HTMLDivElement>(null);
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || !enableMagnetic) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      setMagneticPos({
        x: distanceX * 0.08,
        y: distanceY * 0.08,
      });
    },
    [enableMagnetic]
  );

  const handleMouseLeave = useCallback(() => {
    setMagneticPos({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn(styles.item, colClass, rowClass, "glass glow", className)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: magneticPos.x,
        ...(enableMagnetic && { y: magneticPos.y }),
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.34, 1.56, 0.64, 1], // bounce ease
        x: { type: "spring", stiffness: 400, damping: 30 },
        y: { type: "spring", stiffness: 400, damping: 30 },
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
