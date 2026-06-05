"use client";

import { BentoGrid, BentoItem } from "@/app/components/grid";
import {
  IdentityBlock,
  MapBlock,
  TechStackBlock,
  ExperienceBlock,
  SpotifyBlock,
  LinkBlock,
  SaaSBlock,
  GitHubBlock,
  ProjectsBlock,
  SocialBlock,
  AvailabilityBlock,
  QuoteBlock,
  ResumeBlock,
  WorkBlock,
  EducationBlock,
  GalleryBlock,
  InstagramBlock,
  YouTubeBlock,
  ServicesBlock,
  ToolsBlock,
  StatsBlock,
} from "@/app/components/blocks";
import { BlockLayout, BlockContent, themes } from "@/app/lib/types";
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
    case "education":
      return <EducationBlock data={blockContent.data} />;
    case "spotify":
      return <SpotifyBlock data={blockContent.data} />;
    case "link":
      return <LinkBlock data={blockContent.data} />;
    case "saas":
      return <SaaSBlock data={blockContent.data} />;
    case "github":
      return <GitHubBlock data={blockContent.data} />;
    case "projects":
      return <ProjectsBlock data={blockContent.data} />;
    case "work":
      return <WorkBlock data={blockContent.data} />;
    case "social":
      return <SocialBlock data={blockContent.data} />;
    case "availability":
      return <AvailabilityBlock data={blockContent.data} />;
    case "quote":
      return <QuoteBlock data={blockContent.data} />;
    case "resume":
      return <ResumeBlock data={blockContent.data} />;
    case "gallery":
      return <GalleryBlock data={blockContent.data} />;
    case "instagram":
      return <InstagramBlock data={blockContent.data} />;
    case "youtube":
      return <YouTubeBlock data={blockContent.data} />;
    case "services":
      return <ServicesBlock data={blockContent.data} />;
    case "tools":
      return <ToolsBlock data={blockContent.data} />;
    case "stats":
      return <StatsBlock data={blockContent.data} />;
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
  const cardEffect = themeConfig?.cardEffect || "none";
  const enableEffects = cardEffect !== "none";

  return (
    <BentoGrid isPro={enableEffects}>
      {layout.map((block, index) => {
        const blockContent = content[block.id];
        if (!blockContent) return null;
        const visualColSpan =
          block.type === "identity"
            ? 4
            : block.type === "map" ||
                block.type === "availability" ||
                block.type === "link" ||
                block.type === "resume" ||
                block.type === "spotify" ||
                block.type === "instagram" ||
                block.type === "gallery" ||
                block.type === "youtube" ||
                block.type === "services" ||
                block.type === "tools" ||
                block.type === "stats"
              ? Math.max(block.w, 2)
              : block.w;
        const visualRowSpan =
          block.type === "identity" || block.type === "spotify" ? 1 : block.h;

        return (
          <BentoItem
            key={block.id}
            colSpan={visualColSpan as 1 | 2 | 3 | 4}
            rowSpan={visualRowSpan as 1 | 2 | 3 | 4}
            index={index}
            enableMagnetic={enableEffects}
            cardEffect={cardEffect}
            disableHoverScale
          >
            {renderBlock(blockContent, isPro)}
          </BentoItem>
        );
      })}
    </BentoGrid>
  );
}
