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
  EducationBlock,
  WorkBlock,
  GalleryBlock,
  InstagramBlock,
  YouTubeBlock,
  ServicesBlock,
  ToolsBlock,
  StatsBlock,
} from "@/app/components/blocks";
import { demoLayout, demoContent } from "@/app/lib/demo-data";
import { BlockLayout, BlockContent } from "@/app/lib/types";

// Block renderer - maps block type to component
function renderBlock(layout: BlockLayout, content: BlockContent) {
  switch (content.type) {
    case "identity":
      return <IdentityBlock data={content.data} />;
    case "map":
      return <MapBlock data={content.data} />;
    case "techstack":
      return <TechStackBlock data={content.data} />;
    case "experience":
      return <ExperienceBlock data={content.data} />;
    case "education":
      return <EducationBlock data={content.data} />;
    case "spotify":
      return <SpotifyBlock data={content.data} />;
    case "link":
      return <LinkBlock data={content.data} />;
    case "saas":
      return <SaaSBlock data={content.data} />;
    case "github":
      return <GitHubBlock data={content.data} />;
    case "projects":
      return <ProjectsBlock data={content.data} />;
    case "work":
      return <WorkBlock data={content.data} />;
    case "social":
      return <SocialBlock data={content.data} />;
    case "availability":
      return <AvailabilityBlock data={content.data} />;
    case "quote":
      return <QuoteBlock data={content.data} />;
    case "resume":
      return <ResumeBlock data={content.data} />;
    case "gallery":
      return <GalleryBlock data={content.data} />;
    case "instagram":
      return <InstagramBlock data={content.data} />;
    case "youtube":
      return <YouTubeBlock data={content.data} />;
    case "services":
      return <ServicesBlock data={content.data} />;
    case "tools":
      return <ToolsBlock data={content.data} />;
    case "stats":
      return <StatsBlock data={content.data} />;
    default:
      return null;
  }
}

export function ProfileGrid() {
  return (
    <BentoGrid>
      {demoLayout.map((layout, index) => {
        const content = demoContent[layout.id];
        if (!content) return null;
        const visualColSpan =
          layout.type === "availability" ||
          layout.type === "link" ||
          layout.type === "resume" ||
          layout.type === "spotify" ||
          layout.type === "instagram" ||
          layout.type === "gallery" ||
          layout.type === "youtube" ||
          layout.type === "services" ||
          layout.type === "tools" ||
          layout.type === "stats"
            ? Math.max(layout.w, 2)
            : layout.w;

        return (
          <BentoItem
            key={layout.id}
            colSpan={visualColSpan as 1 | 2 | 3 | 4}
            rowSpan={layout.h as 1 | 2 | 3 | 4}
            index={index}
          >
            {renderBlock(layout, content)}
          </BentoItem>
        );
      })}
    </BentoGrid>
  );
}
