import { BlockLayout, BlockContent } from "./types";

// Demo layout for preview (free tier only)
export const demoLayout: BlockLayout[] = [
  { id: "identity", type: "identity", x: 0, y: 0, w: 2, h: 2 },
  { id: "map", type: "map", x: 2, y: 0, w: 2, h: 1 },
  { id: "techstack", type: "techstack", x: 2, y: 1, w: 2, h: 1 },
  { id: "availability", type: "availability", x: 0, y: 2, w: 2, h: 1 },
  { id: "social", type: "social", x: 0, y: 3, w: 2, h: 1 },
  { id: "link-github", type: "link", x: 2, y: 2, w: 1, h: 1 },
  { id: "link-twitter", type: "link", x: 3, y: 2, w: 1, h: 1 },
];

// Demo content for preview
export const demoContent: Record<string, BlockContent> = {
  identity: {
    type: "identity",
    data: {
      name: "Alex Chen",
      title: "Full-Stack Developer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      bio: "Building things that spark joy ✨",
    },
  },
  map: {
    type: "map",
    data: {
      location: "San Francisco, CA",
      lat: 37.7749,
      lng: -122.4194,
    },
  },
  techstack: {
    type: "techstack",
    data: {
      items: [
        { name: "React", icon: "⚛️" },
        { name: "TypeScript", icon: "📘" },
        { name: "Next.js", icon: "▲" },
        { name: "Node.js", icon: "💚" },
        { name: "PostgreSQL", icon: "🐘" },
        { name: "Tailwind", icon: "🎨" },
      ],
    },
  },
  availability: {
    type: "availability",
    data: {
      status: "available",
      message: "Available for work",
      forHire: true,
    },
  },
  social: {
    type: "social",
    data: {
      items: [
        { platform: "github", url: "https://github.com" },
        { platform: "twitter", url: "https://twitter.com" },
      ],
    },
  },
  "link-github": {
    type: "link",
    data: {
      url: "https://github.com",
      title: "GitHub",
      icon: "github",
    },
  },
  "link-twitter": {
    type: "link",
    data: {
      url: "https://twitter.com",
      title: "Twitter",
      icon: "twitter",
    },
  },
};
