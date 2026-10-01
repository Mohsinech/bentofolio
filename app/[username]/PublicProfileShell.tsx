"use client";

import { V2PortfolioTemplate } from "@/app/components/v2-portfolio/V2PortfolioTemplate";
import { mapProfileToV2Portfolio } from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import type { BlockContent, BlockLayout, ThemeId } from "@/app/lib/types";

interface PublicProfileShellProps {
  username: string;
  isPro: boolean;
  theme: ThemeId;
  avatarUrl?: string | null;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
}

export function PublicProfileShell({
  username,
  isPro,
  theme,
  avatarUrl,
  layout,
  content,
}: PublicProfileShellProps) {
  const portfolioData = mapProfileToV2Portfolio({
    username,
    isPro,
    theme,
    avatarUrl,
    layout,
    content,
  });

  return <V2PortfolioTemplate data={portfolioData} mode="public" />;
}
