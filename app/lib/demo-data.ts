import { BlockLayout, BlockContent } from "./types";
import { DEFAULT_MEMOJI_AVATAR } from "./memoji";

// Demo layout for preview (free tier only)
export const demoLayout: BlockLayout[] = [
  { id: "identity", type: "identity", x: 0, y: 0, w: 4, h: 1 },
  { id: "work", type: "work", x: 0, y: 1, w: 2, h: 2 },
  { id: "map", type: "map", x: 2, y: 1, w: 2, h: 1 },
  { id: "techstack", type: "techstack", x: 2, y: 2, w: 2, h: 1 },
  { id: "availability", type: "availability", x: 0, y: 3, w: 2, h: 1 },
  { id: "education", type: "education", x: 2, y: 4, w: 2, h: 2 },
  { id: "link-github", type: "link", x: 2, y: 3, w: 1, h: 1 },
  { id: "link-twitter", type: "link", x: 3, y: 3, w: 1, h: 1 },
  { id: "social", type: "social", x: 2, y: 3, w: 2, h: 1 },
];

// Demo content for preview
export const demoContent: Record<string, BlockContent> = {
  identity: {
    type: "identity",
    data: {
      name: "Alex Chen",
      title: "Product Designer @ BentoStudio",
      avatar: DEFAULT_MEMOJI_AVATAR,
      bio: "Designing calm products, useful systems, and tiny details people remember.",
      location: "San Francisco, CA",
      email: "alex@example.com",
      website: "alex.dev",
      availability: "Available for work",
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
  work: {
    type: "work",
    data: {
      title: "Recent work",
      subtitle: "Selected projects",
      email: "alex@icloud.com",
      items: [
        {
          title: "Portfolio OS",
          client: "Northstar Studio",
          category: "Product design",
          year: "2026",
          image: "",
          url: "https://example.com",
        },
        {
          title: "Creator dashboard",
          client: "Bento Labs",
          category: "Web app",
          year: "2025",
          image: "",
          url: "",
        },
      ],
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
      preferredContact: "alex@example.com",
      responseTime: "Replies within 24h",
      timezone: "PST",
      nextOpening: "2 spots this month",
      rate: "Projects from $2k",
      ctaLabel: "Start a project",
    },
  },
  education: {
    type: "education",
    data: {
      title: "Education",
      items: [
        {
          school: "Design School",
          degree: "Product Design",
          period: "2021 - 2024",
          description: "Design systems, interaction, and visual craft.",
        },
      ],
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
