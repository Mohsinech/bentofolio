"use client";

import { ReactNode } from "react";
import { AnalyticsTracker } from "@/app/components/AnalyticsTracker";
import { ThemeProvider } from "@/app/lib/theme-context";
import { ThemeEffectsWrapper } from "@/app/components/ThemeEffects";
import { ThemeId, themes } from "@/app/lib/types";

interface ProfileClientWrapperProps {
  username: string;
  isPro: boolean;
  theme: ThemeId;
  children: ReactNode;
}

export function ProfileClientWrapper({
  username,
  isPro,
  theme,
  children,
}: ProfileClientWrapperProps) {
  const themeConfig = themes[theme];

  return (
    <ThemeProvider theme={theme}>
      <AnalyticsTracker username={username} isPro={isPro} />
      {/* Fun interactive theme effects for Pro users */}
      {isPro && themeConfig && (
        <ThemeEffectsWrapper
          particles={themeConfig.particles}
          particleColor={themeConfig.particleColor}
          mouseGlow={themeConfig.mouseGlow}
          blobs={themeConfig.blobs}
          blobColors={themeConfig.blobColors}
        />
      )}
      {children}
    </ThemeProvider>
  );
}
