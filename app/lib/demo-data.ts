import { BlockLayout, BlockContent } from "./types";

// Demo layout for preview
export const demoLayout: BlockLayout[] = [
  { id: "identity", type: "identity", x: 0, y: 0, w: 2, h: 2 },
  { id: "map", type: "map", x: 2, y: 0, w: 2, h: 1 },
  { id: "spotify", type: "spotify", x: 3, y: 1, w: 1, h: 1 },
  { id: "techstack", type: "techstack", x: 2, y: 1, w: 2, h: 1 },
  { id: "experience", type: "experience", x: 0, y: 2, w: 2, h: 2 },
  { id: "metrics", type: "metrics", x: 2, y: 2, w: 2, h: 1 },
  { id: "link-github", type: "link", x: 2, y: 3, w: 1, h: 1 },
  { id: "link-twitter", type: "link", x: 3, y: 3, w: 1, h: 1 },
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
  spotify: {
    type: "spotify",
    data: {
      type: "now-playing",
      trackName: "Blinding Lights",
      artistName: "The Weeknd",
      albumArt:
        "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
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
  experience: {
    type: "experience",
    data: {
      items: [
        {
          company: "Vercel",
          role: "Senior Engineer",
          period: "2023 - Present",
        },
        {
          company: "Stripe",
          role: "Software Engineer",
          period: "2021 - 2023",
        },
        {
          company: "Airbnb",
          role: "Junior Developer",
          period: "2019 - 2021",
        },
      ],
    },
  },
  metrics: {
    type: "metrics",
    data: {
      items: [
        { value: "50+", label: "Projects" },
        { value: "12K", label: "GitHub Stars" },
        { value: "99%", label: "Uptime" },
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
