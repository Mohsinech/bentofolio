"use client";

import { ReactNode } from "react";
import { AnalyticsTracker } from "@/app/components/AnalyticsTracker";
import { ThemeProvider } from "@/app/lib/theme-context";
import { ThemeId } from "@/app/lib/types";

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
  return (
    <ThemeProvider theme={theme}>
      <AnalyticsTracker username={username} isPro={isPro} />
      {children}
    </ThemeProvider>
  );
}
