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

    // Detect if it's a light theme (minimal)
    const isLightTheme = theme === "minimal";

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

    // Theme-aware sidebar and UI element colors
    if (isLightTheme) {
      root.style.setProperty("--sidebar-bg", "rgba(255, 255, 255, 0.7)");
      root.style.setProperty("--card-bg-subtle", "rgba(0, 0, 0, 0.03)");
      root.style.setProperty("--card-bg-hover", "rgba(0, 0, 0, 0.06)");
      root.style.setProperty("--scrollbar-thumb", "rgba(0, 0, 0, 0.15)");
      root.style.setProperty("--scrollbar-thumb-hover", "rgba(0, 0, 0, 0.25)");
      root.style.setProperty(
        "--shadow-hover",
        "0 4px 12px rgba(0, 0, 0, 0.08)"
      );
      // Block control buttons for light theme
      root.style.setProperty("--control-bg", "rgba(255, 255, 255, 0.8)");
      root.style.setProperty("--control-bg-hover", "rgba(255, 255, 255, 0.95)");
      root.style.setProperty("--accent-bg", "rgba(15, 23, 42, 0.1)");
      root.style.setProperty("--accent-bg-hover", "rgba(15, 23, 42, 0.15)");
      root.style.setProperty("--accent-border", "rgba(15, 23, 42, 0.2)");
      root.style.setProperty("--accent-border-hover", "rgba(15, 23, 42, 0.3)");
    } else {
      root.style.setProperty("--sidebar-bg", "rgba(0, 0, 0, 0.4)");
      root.style.setProperty("--card-bg-subtle", "rgba(255, 255, 255, 0.03)");
      root.style.setProperty("--card-bg-hover", "rgba(255, 255, 255, 0.08)");
      root.style.setProperty("--scrollbar-thumb", "rgba(255, 255, 255, 0.1)");
      root.style.setProperty(
        "--scrollbar-thumb-hover",
        "rgba(255, 255, 255, 0.2)"
      );
      root.style.setProperty("--shadow-hover", "0 4px 12px rgba(0, 0, 0, 0.2)");
      // Block control buttons for dark themes
      root.style.setProperty("--control-bg", "rgba(0, 0, 0, 0.6)");
      root.style.setProperty("--control-bg-hover", "rgba(0, 0, 0, 0.8)");
      root.style.setProperty("--accent-bg", "rgba(139, 92, 246, 0.2)");
      root.style.setProperty("--accent-bg-hover", "rgba(139, 92, 246, 0.3)");
      root.style.setProperty("--accent-border", "rgba(139, 92, 246, 0.3)");
      root.style.setProperty(
        "--accent-border-hover",
        "rgba(139, 92, 246, 0.5)"
      );
    }

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

    // Set body background with image
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
