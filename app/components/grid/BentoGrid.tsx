"use client";

import { ReactNode, useRef, useState, useCallback } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
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
  cardEffect?: "wiggle" | "bounce" | "jelly" | "none";
  disableHoverScale?: boolean;
}

export function BentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  index = 0,
  enableMagnetic = false,
  cardEffect = "none",
  disableHoverScale = false,
}: BentoItemProps) {
  const colClass = styles[`col${colSpan}`];
  const rowClass = styles[`row${rowSpan}`];

  // 3D Tilt effect state
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || !enableMagnetic) return;

      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Calculate tilt (inverted for natural feel)
      const intensity = 15; // More noticeable tilt for premium effect
      const rotateY = (x - 0.5) * intensity;
      const rotateX = (0.5 - y) * intensity;

      setTilt({ rotateX, rotateY });
    },
    [enableMagnetic],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  // Card effect-specific hover animations
  const getHoverAnimation = (): TargetAndTransition | undefined => {
    if (disableHoverScale) return undefined;

    switch (cardEffect) {
      case "wiggle":
        return {
          scale: 1.02,
          rotate: [0, -1, 1, -1, 0],
          transition: {
            scale: { duration: 0.3 },
            rotate: {
              duration: 0.4,
              repeat: Infinity,
              repeatType: "reverse",
            },
          },
        };
      case "bounce":
        return {
          y: -8,
          scale: 1.04,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
          },
        };
      case "jelly":
        return {
          scale: 1.03,
          transition: {
            duration: 0.3,
          },
        };
      default:
        return {
          scale: 1.02,
          transition: { duration: 0.3 },
        };
    }
  };

  // Card effect-specific tap animations
  const getTapAnimation = (): TargetAndTransition | undefined => {
    if (disableHoverScale) return undefined;

    if (cardEffect === "jelly") {
      return {
        scale: [1, 0.95, 1.05, 0.98, 1],
        transition: { duration: 0.4 },
      };
    }
    return { scale: 0.98 };
  };

  return (
    <motion.div
      ref={ref}
      className={cn(styles.item, colClass, rowClass, "glass glow", className)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isHovering && enableMagnetic && !disableHoverScale ? 1.02 : 1,
        rotateX: enableMagnetic ? tilt.rotateX : 0,
        rotateY: enableMagnetic ? tilt.rotateY : 0,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        scale: { type: "spring", stiffness: 300, damping: 20 },
        rotateX: { type: "spring", stiffness: 300, damping: 20 },
        rotateY: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileHover={getHoverAnimation()}
      whileTap={getTapAnimation()}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: enableMagnetic ? "1200px" : undefined,
        transformStyle: enableMagnetic ? "preserve-3d" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}
