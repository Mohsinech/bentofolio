"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ThemeEffects.module.css";

// Seeded random function for deterministic results
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Floating particles component
export function FloatingParticles({ count = 20, color = "var(--accent)" }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: seededRandom(i + 1) * 6 + 2,
        x: seededRandom(i + 10) * 100,
        y: seededRandom(i + 20) * 100,
        duration: seededRandom(i + 30) * 20 + 15,
        delay: seededRandom(i + 40) * 5,
        xOffset: seededRandom(i + 50) * 20 - 10,
      })),
    [count]
  );

  return (
    <div className={styles.particlesContainer}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={styles.particle}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: color,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, p.xOffset, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Mouse glow follower
export function MouseGlow({ color = "var(--glow-accent)", size = 300 }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className={styles.mouseGlow}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        width: size,
        height: size,
      }}
      animate={{
        x: position.x - size / 2,
        y: position.y - size / 2,
        opacity: isVisible ? 0.4 : 0,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
      }}
    />
  );
}

// Sparkle effect component
interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function SparkleEffect({ children }: { children: React.ReactNode }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const createSparkle = (x: number, y: number) => {
    const sparkle: Sparkle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 10 + 5,
      color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`, // Gold to yellow
    };
    setSparkles((prev) => [...prev, sparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 1000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.85) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        createSparkle(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.sparkleContainer}
      onMouseMove={handleMouseMove}
    >
      {children}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className={styles.sparkle}
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{ scale: 0, rotate: 0, opacity: 1 }}
            animate={{ scale: 1, rotate: 180, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Blob animation background
export function AnimatedBlobs({ colors = ["#a855f7", "#6366f1", "#8b5cf6"] }) {
  return (
    <div className={styles.blobsContainer}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className={styles.blob}
          style={{ backgroundColor: color }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}

// Confetti burst effect
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  const confetti = useMemo(() => {
    const colors = ["#a855f7", "#6366f1", "#ec4899", "#f59e0b", "#22c55e"];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      angle: (i / 50) * 360,
      distance: seededRandom(i + 100) * 200 + 100,
      rotation: seededRandom(i + 150) * 720,
    }));
  }, []);

  return (
    <AnimatePresence>
      {trigger && (
        <div className={styles.confettiContainer}>
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              className={styles.confetti}
              style={{ backgroundColor: c.color }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: Math.cos((c.angle * Math.PI) / 180) * c.distance,
                y: Math.sin((c.angle * Math.PI) / 180) * c.distance + 100,
                opacity: 0,
                scale: 0,
                rotate: c.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Wiggle wrapper for cards
export function WiggleCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{
        rotate: [0, -1, 1, -1, 0],
        transition: {
          duration: 0.4,
          repeat: Infinity,
          repeatType: "reverse",
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}

// Bouncy hover effect
export function BouncyCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10,
        },
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}

// Jelly effect on click
export function JellyCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{
        scale: [1, 0.95, 1.05, 0.98, 1],
        transition: { duration: 0.4 },
      }}
    >
      {children}
    </motion.div>
  );
}

// Rainbow border animation
export function RainbowBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.rainbowBorderWrapper}>
      <div className={styles.rainbowBorder} />
      <div className={styles.rainbowContent}>{children}</div>
    </div>
  );
}

// Typewriter effect for text
export function TypewriterText({
  text,
  speed = 50,
}: {
  text: string;
  speed?: number;
}) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  );
}

// Pulse ring effect
export function PulseRing({ color = "var(--accent)" }) {
  return (
    <div className={styles.pulseRingContainer}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={styles.pulseRing}
          style={{ borderColor: color }}
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Theme effects wrapper - renders background effects based on current theme
interface ThemeEffectsWrapperProps {
  particles?: boolean;
  particleColor?: string;
  mouseGlow?: boolean;
  blobs?: boolean;
  blobColors?: string[];
}

export function ThemeEffectsWrapper({
  particles,
  particleColor,
  mouseGlow,
  blobs,
  blobColors,
}: ThemeEffectsWrapperProps) {
  return (
    <>
      {particles && (
        <FloatingParticles
          count={25}
          color={particleColor || "var(--accent)"}
        />
      )}
      {mouseGlow && <MouseGlow color="var(--glow-accent)" size={350} />}
      {blobs && blobColors && <AnimatedBlobs colors={blobColors} />}
    </>
  );
}

// Card wrapper that applies the correct animation effect based on theme
interface AnimatedCardProps {
  effect?: "wiggle" | "bounce" | "jelly" | "none";
  children: React.ReactNode;
}

export function AnimatedCard({ effect = "none", children }: AnimatedCardProps) {
  switch (effect) {
    case "wiggle":
      return <WiggleCard>{children}</WiggleCard>;
    case "bounce":
      return <BouncyCard>{children}</BouncyCard>;
    case "jelly":
      return <JellyCard>{children}</JellyCard>;
    default:
      return <>{children}</>;
  }
}
