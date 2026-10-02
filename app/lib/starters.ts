import { createDefaultBlockContent } from "@/app/lib/block-registry";
import { addItem } from "@/app/lib/bento-layout";
import { DEFAULT_MEMOJI_AVATAR } from "@/app/lib/memoji";
import type { BlockContent, BlockLayout, BlockType } from "@/app/lib/types";

// Starter layouts for onboarding. Each is a real grid layout with the
// person's basics filled in. Blocks that need facts only they know (projects,
// testimonial, links) start empty: the editor shows them as "add …" cards,
// and empty blocks never appear on the live page, so nothing made-up can be
// published by accident.

export type StarterId = "blank" | "designer" | "developer" | "founder";

export interface StarterInfo {
  id: StarterId;
  name: string;
  description: string;
  includes: string[];
  // Mini preview: [colSpan, rowSpan, tone] in a 4-column grid.
  preview: [number, number, "card" | "soft" | "map" | "dark" | "accent" | "warm"][];
}

export const STARTERS: StarterInfo[] = [
  {
    id: "designer",
    name: "Designer",
    description: "Big visuals, projects first.",
    includes: ["Profile", "Projects", "Availability", "Testimonial", "Social links", "Call to action"],
    preview: [
      [2, 2, "card"],
      [2, 2, "warm"],
      [2, 1, "card"],
      [2, 1, "soft"],
      [2, 1, "card"],
      [2, 1, "dark"],
    ],
  },
  {
    id: "developer",
    name: "Developer",
    description: "GitHub, stack and experience.",
    includes: ["Profile", "GitHub", "Skills", "Experience", "Repositories", "Location", "Call to action"],
    preview: [
      [2, 2, "card"],
      [2, 1, "accent"],
      [2, 1, "card"],
      [2, 2, "card"],
      [2, 1, "soft"],
      [1, 1, "map"],
      [1, 1, "dark"],
    ],
  },
  {
    id: "founder",
    name: "Founder",
    description: "Verified revenue and what you've built.",
    includes: ["Profile", "SaaS revenue", "Numbers", "Experience", "Social links", "Call to action"],
    preview: [
      [2, 2, "card"],
      [2, 2, "accent"],
      [2, 1, "card"],
      [2, 1, "soft"],
      [2, 1, "card"],
      [2, 1, "dark"],
    ],
  },
  {
    id: "blank",
    name: "Blank",
    description: "Just your profile. Build the rest yourself.",
    includes: ["Profile"],
    preview: [[2, 2, "card"]],
  },
];

export interface StarterBasics {
  name: string;
  headline: string;
  location: string;
  picture: "photo" | "memoji" | "none";
  // Uploaded or GitHub photo URL, used when picture is "photo".
  photo?: string | null;
  openToWork: boolean;
  githubUsername?: string | null;
}

// What onboarding could read from GitHub (all optional).
export interface StarterGitHub {
  githubContent?: Extract<BlockContent, { type: "github" }>["data"];
  repos?: { name: string; description: string; url: string; stars: number; forks: number; language: string; languageColor?: string }[];
  languages?: string[];
  profileUrl?: string;
}

type Piece = { type: BlockType; w: number; h: number; content: BlockContent };

function block<T extends BlockType>(type: T, data: Partial<Extract<BlockContent, { type: T }>["data"]>): BlockContent {
  const base = createDefaultBlockContent(type) as Extract<BlockContent, { type: T }>;
  return { type, data: { ...base.data, ...data } } as BlockContent;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

let counter = 0;
function newId(): string {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function identity(basics: StarterBasics): Piece {
  const headline = clean(basics.headline);
  const avatar =
    basics.picture === "photo" ? clean(basics.photo) : basics.picture === "memoji" ? DEFAULT_MEMOJI_AVATAR : "";
  return {
    type: "identity",
    w: 2,
    h: 2,
    content: block("identity", {
      name: clean(basics.name) || "Your Name",
      title: headline,
      headline,
      avatar,
      portraitType: basics.picture === "photo" && !avatar ? "none" : basics.picture,
      bio: "",
      location: clean(basics.location),
      email: "",
      website: "",
      availability: basics.openToWork ? "Available for work" : "",
      eyebrow: basics.openToWork ? "Available for work" : "",
      ctaLabel: "",
    }),
  };
}

function availability(): Piece {
  return {
    type: "availability",
    w: 2,
    h: 1,
    content: block("availability", {
      status: "available",
      message: "Open to new work",
      forHire: true,
      preferredContact: "",
      responseTime: "",
      timezone: "",
      nextOpening: "",
      rate: "",
      ctaLabel: "",
    }),
  };
}

function social(basics: StarterBasics, github?: StarterGitHub): Piece {
  const username = clean(basics.githubUsername);
  const items = username
    ? [{ platform: "github" as const, url: github?.profileUrl || `https://github.com/${username}`, username }]
    : [];
  return { type: "social", w: 2, h: 1, content: block("social", { variant: "list", items }) };
}

function callToAction(w = 2): Piece {
  return {
    type: "link",
    w,
    h: 1,
    content: block("link", { url: "", title: "Email me", eyebrow: "Say hello", actionType: "email", variant: "contrast" }),
  };
}

function pieces(id: StarterId, basics: StarterBasics, github?: StarterGitHub): Piece[] {
  const list: Piece[] = [identity(basics)];
  const location = clean(basics.location);

  if (id === "designer") {
    list.push({ type: "work", w: 2, h: 2, content: block("work", { items: [] }) });
    if (basics.openToWork) list.push(availability());
    list.push({ type: "quote", w: 2, h: 1, content: block("quote", {}) });
    list.push(social(basics, github));
    list.push(callToAction());
  }

  if (id === "developer") {
    list.push({
      type: "github",
      w: 2,
      h: 1,
      // Only filled when GitHub data was read; otherwise the editor asks for it.
      content: block("github", github?.githubContent ?? { username: "", followers: 0, following: 0, publicRepos: 0 }),
    });
    list.push({
      type: "techstack",
      w: 2,
      h: 1,
      content: block("techstack", { items: (github?.languages ?? []).map((name) => ({ name, icon: "" })) }),
    });
    list.push({ type: "experience", w: 2, h: 2, content: block("experience", { items: [] }) });
    list.push({ type: "projects", w: 2, h: 1, content: block("projects", { items: (github?.repos ?? []).slice(0, 4) }) });
    if (location) {
      list.push({ type: "map", w: 1, h: 1, content: block("map", { location, heading: location, variant: "text" }) });
    }
    list.push(callToAction(location ? 1 : 2));
  }

  if (id === "founder") {
    list.push({ type: "saas", w: 2, h: 2, content: block("saas", {}) });
    list.push({ type: "stats", w: 2, h: 1, content: block("stats", { items: [] }) });
    list.push({ type: "experience", w: 2, h: 1, content: block("experience", { items: [] }) });
    list.push(social(basics, github));
    list.push(callToAction());
  }

  return list;
}

// Builds the starter as a saved-ready grid layout (version 2) and content.
export function buildStarter(
  id: StarterId,
  basics: StarterBasics,
  github?: StarterGitHub
): { layout: BlockLayout[]; content: Record<string, BlockContent> } {
  let layout: BlockLayout[] = [];
  const content: Record<string, BlockContent> = {};
  for (const piece of pieces(id, basics, github)) {
    const blockId = newId();
    layout = addItem(layout, { id: blockId, type: piece.type, w: piece.w, h: piece.h });
    content[blockId] = piece.content;
  }
  return { layout, content };
}

// A new account's page: nothing saved or published yet.
export function isFreshPage(page: {
  layout?: unknown[] | null;
  content?: Record<string, unknown> | null;
  published?: { layout?: unknown[] | null; content?: Record<string, unknown> | null } | null;
}): boolean {
  const empty = (layout?: unknown[] | null, content?: Record<string, unknown> | null) =>
    (!layout || layout.length === 0) && (!content || Object.keys(content).length === 0);
  return empty(page.layout, page.content) && empty(page.published?.layout, page.published?.content);
}
