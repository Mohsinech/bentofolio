"use client";

import { BentoGrid, BentoItem } from "@/app/components/grid";
import {
  IdentityBlock,
  MapBlock,
  TechStackBlock,
  ExperienceBlock,
  SpotifyBlock,
  MetricsBlock,
  LinkBlock,
  TextBlock,
  SaaSBlock,
  GitHubBlock,
  ProjectsBlock,
  SocialBlock,
  AvailabilityBlock,
  QuoteBlock,
  ResumeBlock,
  YouTubeBlock,
  InstagramBlock,
  NetworkBlock,
  CareerBlock,
} from "@/app/components/blocks";
import { BlockLayout, BlockContent, ThemeId, themes } from "@/app/lib/types";
import { useTheme } from "@/app/lib/theme-context";

interface PublicGridProps {
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  isPro?: boolean;
}

function renderBlock(blockContent: BlockContent, isPro: boolean = false) {
  switch (blockContent.type) {
    case "identity":
      return <IdentityBlock data={blockContent.data} verified={isPro} />;
    case "map":
      return <MapBlock data={blockContent.data} />;
    case "techstack":
      return <TechStackBlock data={blockContent.data} />;
    case "experience":
      return <ExperienceBlock data={blockContent.data} />;
    case "spotify":
      return <SpotifyBlock data={blockContent.data} />;
    case "metrics":
      return <MetricsBlock data={blockContent.data} />;
    case "link":
      return <LinkBlock data={blockContent.data} />;
    case "text":
      return <TextBlock data={blockContent.data} />;
    case "saas":
      return <SaaSBlock data={blockContent.data} />;
    case "github":
      return <GitHubBlock data={blockContent.data} />;
    case "projects":
      return <ProjectsBlock data={blockContent.data} />;
    case "social":
      return <SocialBlock data={blockContent.data} />;
    case "availability":
      return <AvailabilityBlock data={blockContent.data} />;
    case "quote":
      return <QuoteBlock data={blockContent.data} />;
    case "resume":
      return <ResumeBlock data={blockContent.data} />;
    case "youtube":
      return <YouTubeBlock data={blockContent.data} />;
    case "instagram":
      return <InstagramBlock data={blockContent.data} />;
    case "network":
      return <NetworkBlock data={blockContent.data} />;
    case "career":
      return <CareerBlock data={blockContent.data} />;
    default:
      return null;
  }
}

export function PublicGrid({
  layout,
  content,
  isPro = false,
}: PublicGridProps) {
  const { theme } = useTheme();
  const themeConfig = themes[theme];
  const cardEffect = isPro ? themeConfig?.cardEffect : "none";
  console.log(
    "PublicGrid - isPro from DB:",
    isPro,
    "Theme:",
    theme,
    "cardEffect:",
    cardEffect,
  );

  return (
    <BentoGrid isPro={isPro}>
      {layout.map((block, index) => {
        const blockContent = content[block.id];
        if (!blockContent) return null;

        return (
          <BentoItem
            key={block.id}
            colSpan={block.w as 1 | 2 | 3 | 4}
            rowSpan={block.h as 1 | 2 | 3 | 4}
            index={index}
            enableMagnetic={isPro}
            cardEffect={cardEffect}
          >
            {renderBlock(blockContent, isPro)}
          </BentoItem>
        );
      })}
    </BentoGrid>
  );
}
