"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface MagneticOptions {
  strength?: number; // How strong the magnetic pull is (default: 0.3)
  ease?: number; // Ease back speed (default: 0.15)
  enabled?: boolean; // Whether magnetic effect is enabled
}

export function useMagnetic(options: MagneticOptions = {}) {
  const { strength = 0.3, ease = 0.15, enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    // Lerp towards target
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

    setPosition({
      x: Math.round(currentRef.current.x * 100) / 100,
      y: Math.round(currentRef.current.y * 100) / 100,
    });

    // Continue animation if not at rest
    if (
      Math.abs(targetRef.current.x - currentRef.current.x) > 0.01 ||
      Math.abs(targetRef.current.y - currentRef.current.y) > 0.01
    ) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [ease]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current || !enabled) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      targetRef.current = {
        x: distanceX * strength,
        y: distanceY * strength,
      };

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [strength, enabled, animate]
  );

  const handleMouseLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave, enabled]);

  return {
    ref,
    style: enabled
      ? {
          transform: `translate(${position.x}px, ${position.y}px)`,
        }
      : {},
  };
}
