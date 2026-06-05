"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { ThemeId, themes } from "@/app/lib/types";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  theme: ThemeId;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const themeConfig = themes[theme];
    if (!themeConfig) return;

    const root = document.documentElement;
    root.dataset.theme = theme;

    // Apply theme CSS variables (matching globals.css variable names)
    root.style.setProperty("--bg-primary", themeConfig.background);
    root.style.setProperty("--bg-secondary", themeConfig.background);
    root.style.setProperty("--bg-card", themeConfig.cardBackground);
    root.style.setProperty("--border-subtle", themeConfig.cardBorder);
    root.style.setProperty("--border-hover", themeConfig.cardBorder);
    root.style.setProperty("--glow-color", themeConfig.glow);
    root.style.setProperty("--glow-accent", themeConfig.glow);
    root.style.setProperty("--text-primary", themeConfig.text);
    root.style.setProperty("--text-secondary", themeConfig.textMuted);
    root.style.setProperty("--text-muted", themeConfig.textMuted);
    root.style.setProperty("--accent", themeConfig.accent);

    const isLight = theme === "light";
    root.style.setProperty(
      "--sidebar-bg",
      isLight ? "rgba(255, 255, 255, 0.72)" : "rgba(0, 0, 0, 0.4)",
    );
    root.style.setProperty(
      "--card-bg-subtle",
      isLight ? "rgba(124, 58, 237, 0.055)" : "rgba(255, 255, 255, 0.03)",
    );
    root.style.setProperty(
      "--card-bg-hover",
      isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(255, 255, 255, 0.08)",
    );
    root.style.setProperty(
      "--scrollbar-thumb",
      isLight ? "rgba(124, 58, 237, 0.18)" : "rgba(255, 255, 255, 0.1)",
    );
    root.style.setProperty(
      "--scrollbar-thumb-hover",
      isLight ? "rgba(124, 58, 237, 0.28)" : "rgba(255, 255, 255, 0.2)",
    );
    root.style.setProperty(
      "--shadow-hover",
      isLight
        ? "0 10px 30px rgba(80, 46, 140, 0.12)"
        : "0 4px 12px rgba(0, 0, 0, 0.2)",
    );
    root.style.setProperty(
      "--control-bg",
      isLight ? "rgba(255, 255, 255, 0.82)" : "rgba(0, 0, 0, 0.6)",
    );
    root.style.setProperty(
      "--control-bg-hover",
      isLight ? "rgba(245, 240, 255, 0.96)" : "rgba(0, 0, 0, 0.8)",
    );
    root.style.setProperty(
      "--accent-bg",
      isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(215, 255, 95, 0.12)",
    );
    root.style.setProperty(
      "--accent-bg-hover",
      isLight ? "rgba(124, 58, 237, 0.16)" : "rgba(215, 255, 95, 0.18)",
    );
    root.style.setProperty(
      "--accent-border",
      isLight ? "rgba(124, 58, 237, 0.18)" : "rgba(215, 255, 95, 0.18)",
    );
    root.style.setProperty(
      "--accent-border-hover",
      isLight ? "rgba(124, 58, 237, 0.3)" : "rgba(215, 255, 95, 0.28)",
    );

    // Premium glassmorphism effects
    const blur = themeConfig.blur || 12;
    const glowIntensity = themeConfig.glowIntensity || 1;
    const cardOpacity = themeConfig.cardOpacity || 0.6;

    root.style.setProperty("--blur-amount", `${blur}px`);
    root.style.setProperty("--glow-intensity", `${glowIntensity}`);
    root.style.setProperty("--card-opacity", `${cardOpacity}`);

    // Gradient border for premium themes
    if (themeConfig.gradientBorder) {
      root.style.setProperty("--gradient-border", themeConfig.gradientBorder);
      root.style.setProperty("--has-gradient-border", "1");
    } else {
      root.style.setProperty("--gradient-border", "none");
      root.style.setProperty("--has-gradient-border", "0");
    }

    // Animated border glow
    if (themeConfig.borderGlow) {
      root.style.setProperty("--border-glow", "1");
    } else {
      root.style.setProperty("--border-glow", "0");
    }

    // Fun animation effects
    root.style.setProperty(
      "--has-particles",
      themeConfig.particles ? "1" : "0",
    );
    root.style.setProperty(
      "--particle-color",
      themeConfig.particleColor || "rgba(139, 92, 246, 0.5)",
    );
    root.style.setProperty(
      "--has-mouse-glow",
      themeConfig.mouseGlow ? "1" : "0",
    );
    root.style.setProperty("--card-effect", themeConfig.cardEffect || "none");
    root.style.setProperty("--has-blobs", themeConfig.blobs ? "1" : "0");
    if (themeConfig.blobColors && themeConfig.blobColors.length >= 3) {
      root.style.setProperty("--blob-color-1", themeConfig.blobColors[0]);
      root.style.setProperty("--blob-color-2", themeConfig.blobColors[1]);
      root.style.setProperty("--blob-color-3", themeConfig.blobColors[2]);
    }

    if (themeConfig.backgroundImage) {
      document.body.style.background = `${themeConfig.backgroundImage}, ${themeConfig.background}`;
      document.body.style.backgroundColor = themeConfig.background;
    } else {
      document.body.style.background = themeConfig.background;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
