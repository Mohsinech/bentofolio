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
    case "spotify":
      return <SpotifyBlock data={content.data} />;
    case "metrics":
      return <MetricsBlock data={content.data} />;
    case "link":
      return <LinkBlock data={content.data} />;
    case "text":
      return <TextBlock data={content.data} />;
    case "saas":
      return <SaaSBlock data={content.data} />;
    case "github":
      return <GitHubBlock data={content.data} />;
    case "projects":
      return <ProjectsBlock data={content.data} />;
    case "social":
      return <SocialBlock data={content.data} />;
    case "availability":
      return <AvailabilityBlock data={content.data} />;
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

        return (
          <BentoItem
            key={layout.id}
            colSpan={layout.w as 1 | 2 | 3 | 4}
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
