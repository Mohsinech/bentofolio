"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import html2canvas from "html2canvas";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Code2,
  Copy,
  Eye,
  Facebook,
  FileText,
  FolderGit2,
  Gift,
  Globe,
  GraduationCap,
  Grid3X3,
  Images,
  Instagram,
  Layers3,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Plus,
  Save,
  Settings,
  Share2,
  Sparkles,
  Sun,
  TrendingUp,
  Trash2,
  Upload,
  User,
  Users,
  Wrench,
  X,
  Youtube,
} from "lucide-react";

import { BlockEditor } from "./BlockEditor";
import { EditorProvider, useEditor } from "@/app/lib/editor-context";
import { ThemeProvider } from "@/app/lib/theme-context";
import { useAuth, useProfile } from "@/app/lib/hooks";
import { importFromGitHub } from "@/app/lib/github";
import { DEFAULT_MEMOJI_AVATAR } from "@/app/lib/memoji";
import { generateId } from "@/app/lib/utils";
import {
  AvailabilityBlock,
  EducationBlock,
  ExperienceBlock,
  GalleryBlock,
  GitHubBlock,
  IdentityBlock,
  InstagramBlock,
  LinkBlock,
  MapBlock,
  ProjectsBlock,
  QuoteBlock,
  ResumeBlock,
  SaaSBlock,
  ServicesBlock,
  SocialBlock,
  SpotifyBlock,
  StatsBlock,
  TechStackBlock,
  ToolsBlock,
  WorkBlock,
  YouTubeBlock,
} from "@/app/components/blocks";
import {
  BlockContent,
  BlockLayout,
  BlockType,
  ThemeId,
  premiumBlocks,
} from "@/app/lib/types";
import styles from "./editor.module.css";

const navItems = [
  { id: "portfolio", label: "Portfolio", icon: Grid3X3 },
  { id: "blocks", label: "Blocks", icon: Layers3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const blockLibrary: {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  group: string;
}[] = [
  { type: "identity", label: "Identity", icon: User, group: "Profile" },
  { type: "map", label: "Location", icon: MapPin, group: "Profile" },
  { type: "availability", label: "Status", icon: CircleDot, group: "Profile" },
  { type: "social", label: "Social", icon: Users, group: "Profile" },
  { type: "github", label: "GitHub", icon: Code2, group: "Proof" },
  { type: "work", label: "Work", icon: BriefcaseBusiness, group: "Proof" },
  { type: "projects", label: "Projects", icon: FolderGit2, group: "Proof" },
  { type: "techstack", label: "Stack", icon: Layers3, group: "Proof" },
  { type: "link", label: "Link", icon: LinkIcon, group: "Content" },
  { type: "quote", label: "Quote", icon: Sparkles, group: "Content" },
  { type: "resume", label: "Resume", icon: FileText, group: "Content" },
  { type: "spotify", label: "Spotify", icon: Eye, group: "Media" },
  { type: "youtube", label: "YouTube", icon: Youtube, group: "Media" },
  { type: "gallery", label: "Gallery", icon: Images, group: "Media" },
  { type: "instagram", label: "Instagram", icon: Instagram, group: "Media" },
  { type: "experience", label: "Experience", icon: FileText, group: "Work" },
  { type: "education", label: "Education", icon: GraduationCap, group: "Work" },
  { type: "saas", label: "SaaS", icon: Globe, group: "Work" },
  { type: "services", label: "Services", icon: Sparkles, group: "Work" },
  { type: "tools", label: "Tools", icon: Wrench, group: "Work" },
  { type: "stats", label: "Stats", icon: TrendingUp, group: "Proof" },
];

const quickCreate: BlockType[] = [
  "identity",
  "work",
  "projects",
  "techstack",
  "social",
  "link",
  "spotify",
  "instagram",
  "gallery",
  "saas",
  "education",
];

const starterTemplates: {
  id: "designer" | "developer" | "influencer" | "pro";
  label: string;
  helper: string;
  isPro?: boolean;
  blocks: { type: BlockType; x: number; y: number; w: number; h: number }[];
}[] = [
  {
    id: "designer",
    label: "Designer",
    helper: "Free",
    blocks: [
      { type: "identity", x: 0, y: 0, w: 4, h: 1 },
      { type: "education", x: 0, y: 1, w: 2, h: 2 },
      { type: "availability", x: 2, y: 1, w: 2, h: 1 },
      { type: "link", x: 2, y: 2, w: 2, h: 1 },
      { type: "quote", x: 0, y: 3, w: 2, h: 1 },
      { type: "resume", x: 2, y: 3, w: 2, h: 1 },
      { type: "work", x: 0, y: 4, w: 2, h: 2 },
      { type: "tools", x: 2, y: 4, w: 2, h: 1 },
      { type: "social", x: 2, y: 5, w: 2, h: 1 },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    helper: "Pro",
    isPro: true,
    blocks: [
      { type: "identity", x: 0, y: 0, w: 4, h: 1 },
      { type: "techstack", x: 0, y: 1, w: 2, h: 2 },
      { type: "experience", x: 2, y: 1, w: 2, h: 2 },
      { type: "projects", x: 0, y: 3, w: 2, h: 2 },
      { type: "link", x: 2, y: 3, w: 2, h: 1 },
      { type: "availability", x: 2, y: 4, w: 2, h: 1 },
      { type: "github", x: 0, y: 5, w: 2, h: 1 },
      { type: "youtube", x: 2, y: 5, w: 2, h: 2 },
      { type: "stats", x: 0, y: 6, w: 2, h: 1 },
    ],
  },
  {
    id: "influencer",
    label: "Influencer",
    helper: "Free",
    blocks: [
      { type: "identity", x: 0, y: 0, w: 4, h: 1 },
      { type: "work", x: 0, y: 1, w: 2, h: 2 },
      { type: "quote", x: 2, y: 1, w: 2, h: 1 },
      { type: "availability", x: 2, y: 2, w: 2, h: 1 },
      { type: "tools", x: 0, y: 3, w: 2, h: 1 },
      { type: "social", x: 2, y: 3, w: 2, h: 1 },
      { type: "link", x: 0, y: 4, w: 2, h: 1 },
      { type: "map", x: 2, y: 4, w: 2, h: 1 },
    ],
  },
  {
    id: "pro",
    label: "Pro launch",
    helper: "Pro",
    isPro: true,
    blocks: [
      { type: "identity", x: 0, y: 0, w: 4, h: 1 },
      { type: "github", x: 0, y: 1, w: 2, h: 1 },
      { type: "projects", x: 2, y: 1, w: 2, h: 2 },
      { type: "saas", x: 0, y: 2, w: 2, h: 2 },
      { type: "spotify", x: 2, y: 3, w: 2, h: 1 },
      { type: "link", x: 0, y: 4, w: 2, h: 1 },
      { type: "stats", x: 0, y: 5, w: 2, h: 1 },
      { type: "youtube", x: 0, y: 6, w: 2, h: 2 },
      { type: "services", x: 2, y: 6, w: 2, h: 1 },
    ],
  },
];

function templateRequiresPro(template: (typeof starterTemplates)[number]) {
  return Boolean(template.isPro);
}

function getBlockSize(type: BlockType) {
  switch (type) {
    case "identity":
      return { w: 4, h: 1 };
    case "github":
    case "saas":
    case "social":
    case "availability":
    case "link":
    case "resume":
    case "map":
      return { w: 2, h: 1 };
    case "projects":
    case "work":
    case "education":
    case "techstack":
    case "experience":
      return { w: 2, h: 2 };
    case "youtube":
    case "gallery":
      return { w: 2, h: 2 };
    case "spotify":
      return { w: 2, h: 1 };
    case "services":
    case "tools":
    case "stats":
      return { w: 2, h: 1 };
    default:
      return { w: 1, h: 1 };
  }
}

function createDefaultContent(type: BlockType): BlockContent {
  switch (type) {
    case "identity":
      return {
        type,
        data: {
          name: "Your Name",
          title: "Product Designer @ YourStudio",
          avatar: DEFAULT_MEMOJI_AVATAR,
          bio: "Designing calm products, useful systems, and tiny details people remember.",
          location: "Remote",
          email: "hello@example.com",
          website: "example.com",
          availability: "Available for work",
        },
      };
    case "map":
      return { type, data: { location: "Your City", lat: 0, lng: 0 } };
    case "techstack":
      return {
        type,
        data: {
          items: [
            { name: "Next.js", icon: "/icons/tech/nextjs-original.svg" },
            { name: "React", icon: "/icons/tech/react-original.svg" },
            { name: "TypeScript", icon: "/icons/tech/typescript-original.svg" },
          ],
        },
      };
    case "experience":
      return {
        type,
        data: {
          items: [
            {
              company: "Studio",
              role: "Designer / Developer",
              period: "2024 - Now",
            },
          ],
        },
      };
    case "education":
      return {
        type,
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
      };
    case "spotify":
      return { type, data: { type: "embed", spotifyUrl: "" } };
    case "youtube":
      return { type, data: { title: "Featured video", url: "" } };
    case "gallery":
      return { type, data: { title: "Gallery", images: [] } };
    case "instagram":
      return {
        type,
        data: {
          handle: "@yourhandle",
          profileUrl: "https://instagram.com/yourhandle",
          image: "",
          followers: "12.4k",
          posts: "186",
          engagement: "8.7%",
          featuredPostUrl: "",
        },
      };
    case "services":
      return {
        type,
        data: {
          title: "What I can help with",
          items: ["Product design", "Framer", "Web apps", "Brand systems"],
        },
      };
    case "tools":
      return {
        type,
        data: {
          title: "Tools I use",
          items: [
            { name: "Figma", icon: "F" },
            { name: "Framer", icon: "Fr" },
            { name: "Notion", icon: "N" },
          ],
        },
      };
    case "stats":
      return {
        type,
        data: {
          items: [
            { value: "6+", label: "Years" },
            { value: "42", label: "Projects" },
            { value: "12k", label: "Users reached" },
            { value: "98%", label: "Happy clients" },
          ],
        },
      };
    case "link":
      return {
        type,
        data: { url: "hello@example.com", title: "Let's Collaborate" },
      };
    case "work":
      return {
        type,
        data: {
          title: "Recent work",
          subtitle: "Selected projects",
          email: "hello@icloud.com",
          items: [
            {
              title: "Mobile portfolio system",
              client: "Northstar Studio",
              category: "Product design",
              year: "2026",
              image: "",
              url: "https://example.com",
            },
            {
              title: "Creative dashboard",
              client: "Bento Labs",
              category: "Web app",
              year: "2025",
              image: "",
              url: "",
            },
          ],
        },
      };
    case "saas":
      return {
        type,
        data: {
          name: "My SaaS",
          tagline: "A small product worth sharing.",
          url: "https://example.com",
          mrr: 1000,
          revenue: [100, 240, 420, 680, 900, 1200],
        },
      };
    case "github":
      return {
        type,
        data: {
          username: "",
          followers: 0,
          following: 0,
          publicRepos: 0,
          totalStars: 0,
        },
      };
    case "projects":
      return {
        type,
        data: {
          items: [
            {
              name: "New project",
              description: "Describe what you built.",
              url: "https://example.com",
              stars: 0,
              forks: 0,
              language: "TypeScript",
              languageColor: "#3178c6",
            },
          ],
        },
      };
    case "social":
      return {
        type,
        data: {
          items: [
            { platform: "github", url: "https://github.com" },
            { platform: "linkedin", url: "https://linkedin.com" },
            { platform: "website", url: "https://example.com" },
          ],
        },
      };
    case "availability":
      return {
        type,
        data: {
          status: "available",
          message: "Open to selected work.",
          forHire: true,
          preferredContact: "hello@example.com",
          responseTime: "Replies within 24h",
          timezone: "GMT+1",
          nextOpening: "2 spots this month",
          rate: "Projects from $2k",
          ctaLabel: "Start a project",
        },
      };
    case "quote":
      return {
        type,
        data: {
          quote: "A short testimonial or belief statement.",
          author: "Someone Great",
        },
      };
    case "resume":
      return {
        type,
        data: { title: "Resume", fileUrl: "", lastUpdated: "May 2026" },
      };
  }
}

function customizeTemplateContent(
  templateId: (typeof starterTemplates)[number]["id"],
  content: BlockContent,
  username?: string,
): BlockContent {
  const displayUsername = username || "muhsench";

  if (content.type === "identity") {
    const dataByTemplate = {
      designer: {
        name: "Alice",
        title: "Independent Product Designer",
        avatar: "/prebuilt/designer/varnika.jpeg",
        bio: "I design polished apps, calm product systems, and launch-ready websites for creative teams.",
        location: "London, UK",
        email: "hello@alice.design",
        website: "alice.design",
        availability: "Available for design sprints",
      },
      developer: {
        name: "Mohsine Chedgane",
        title: "Software Engineer",
        avatar: "/prebuilt/dev/profile.png",
        bio: "Building the future of the web. Interactive freelancer, full stack developer, and founder of BentoFolio. I help brands thrive by building fast, beautiful, and scalable web applications.",
        location: "Casablanca, Morocco",
        email: "chedganemouhssine@gmail.com",
        website: "muhsench.com",
        availability: "Available for collaboration",
      },
      influencer: {
        name: "Fernanda Ramirez",
        title: "Content Creator",
        avatar: "/prebuilt/inf/inf.jpg",
        bio: "Helping you become your own dream woman and build a life you can't stop thinking about. Listen to the podcast below.",
        location: "USA",
        email: "fernanda@contact.me",
        website: "fernandaramirez.com/the-podcast",
        availability: "Open for brand collaborations",
      },
      pro: {
        name: `@${displayUsername}`,
        title: "Founder building in public",
        avatar: "/momojis/52.png",
        bio: "Launching calm software, sharing the process, and turning tiny bets into useful products.",
        location: "Remote",
        email: "founder@launchos.co",
        website: "launchos.co",
        availability: "Taking 2 advisory calls",
      },
    } satisfies Record<typeof templateId, typeof content.data>;

    return {
      ...content,
      data: dataByTemplate[templateId],
    };
  }

  if (content.type === "work") {
    return {
      ...content,
      data: {
        ...content.data,
        title:
          templateId === "developer"
            ? "Shipped products"
            : templateId === "pro"
              ? "Launch work"
              : "Selected work",
        subtitle:
          templateId === "developer"
            ? "Production builds"
            : templateId === "pro"
              ? "Recent experiments"
              : "Recent projects",
        email:
          templateId === "developer"
            ? "chedganemouhssine@gmail.com"
            : templateId === "pro"
              ? "founder@launchos.co"
              : "hello@alice.design",
        items:
          templateId === "developer"
            ? [
                {
                  title: "VocaFlow",
                  client: "VocaFlow Studio",
                  category: "AI tool",
                  year: "2025",
                  image: "/prebuilt/dev/work1.png",
                  url: "https://vocaflow.app",
                },
                {
                  title: "Developer workspace",
                  client: "Muhsen Studio",
                  category: "Full-stack",
                  year: "2025",
                  image: "/prebuilt/dev/work2.png",
                  url: "https://muhsench.com",
                },
                {
                  title: "Founder dashboard",
                  client: "BentoFolio",
                  category: "SaaS product",
                  year: "2026",
                  image: "/prebuilt/dev/work3.png",
                  url: "https://bentofolio.dev",
                },
              ]
            : [
                {
                  title: "iOS onboarding redesign",
                  client: "Luma Studio",
                  category: "Product design",
                  year: "2026",
                  image: "/prebuilt/designer/work1.jpeg",
                  url: "https://example.com",
                },
                {
                  title: "Creator analytics dashboard",
                  client: "Northstar",
                  category: "UI/UX",
                  year: "2025",
                  image: "/prebuilt/designer/work2.jpeg",
                  url: "https://example.com",
                },
                {
                  title: "Design system refresh",
                  client: "Atelier One",
                  category: "Design system",
                  year: "2025",
                  image: "/prebuilt/designer/work3.jpeg",
                  url: "https://example.com",
                },
              ],
      },
    };
  }

  if (content.type === "techstack" && templateId === "developer") {
    return {
      ...content,
      data: {
        items: [
          { name: "Next.js", icon: "/icons/tech/nextjs-original.svg" },
          { name: "React", icon: "/icons/tech/react-original.svg" },
          { name: "TypeScript", icon: "/icons/tech/typescript-original.svg" },
          { name: "Node.js", icon: "/icons/tech/nodejs-original.svg" },
          { name: "PostgreSQL", icon: "/icons/tech/postgresql-original.svg" },
          { name: "MongoDB", icon: "/icons/tech/mongodb-original.svg" },
          { name: "Tailwind CSS", icon: "/icons/tech/tailwindcss-plain.svg" },
          { name: "Supabase", icon: "S" },
          { name: "Git", icon: "/icons/tech/git-original.svg" },
          { name: "Docker", icon: "/icons/tech/docker-original.svg" },
          { name: "Vercel", icon: "▲" },
          { name: "Figma", icon: "/icons/tech/figma-original.svg" },
        ],
      },
    };
  }

  if (content.type === "techstack" && templateId !== "developer") {
    return {
      ...content,
      data: {
        items: [
          { name: "Figma", icon: "/icons/tech/figma-original.svg" },
          { name: "Framer", icon: "Fr" },
          { name: "Webflow", icon: "/icons/tech/webflow-original.svg" },
          { name: "Notion", icon: "N" },
        ],
      },
    };
  }

  if (content.type === "experience") {
    if (templateId === "developer") {
      return {
        ...content,
        data: {
          items: [
            {
              company: "VocaFlow",
              role: "Founder / Full-stack Engineer",
              period: "2025 - Now",
            },
            {
              company: "Upwork",
              role: "Top Rated Full-stack Freelancer",
              period: "2023 - Now",
            },
            {
              company: "Facebook",
              role: "Frontend Engineer",
              period: "2022 - 2023",
            },
            {
              company: "Nova Labs",
              role: "Software Engineer",
              period: "2021 - 2022",
            },
          ],
        },
      };
    }

    return {
      ...content,
      data: {
        items: [
          {
            company: "VVStudios",
            role: "Senior Product Designer",
            period: "2024 - Now",
          },
          {
            company: "Freelance",
            role: "Brand + Web Designer",
            period: "2022 - 2024",
          },
        ],
      },
    };
  }

  if (content.type === "saas" && templateId === "pro") {
    return {
      ...content,
      data: {
        ...content.data,
        name: "Launch OS",
        tagline: "A small SaaS growing week by week.",
        url: "https://launchos.co",
        logo: "/ph.jpeg",
        mrr: 4200,
        revenue: [400, 620, 980, 1500, 2400, 4200],
      },
    };
  }

  if (content.type === "github") {
    return {
      ...content,
      data: {
        username: displayUsername,
        followers: templateId === "developer" ? 1240 : 680,
        following: 92,
        publicRepos: templateId === "developer" ? 48 : 18,
        totalStars: templateId === "developer" ? 860 : 240,
      },
    };
  }

  if (content.type === "projects") {
    return {
      ...content,
      data: {
        items: [
          {
            name: templateId === "pro" ? "launch-os" : "portfolio-kit",
            description: "A polished starter for launching creative work fast.",
            url: "https://github.com/example/portfolio-kit",
            stars: 328,
            forks: 42,
            language: "TypeScript",
            languageColor: "#3178c6",
          },
          {
            name: "bento-components",
            description:
              "Reusable cards, animation presets, and public profile blocks.",
            url: "https://github.com/example/bento-components",
            stars: 156,
            forks: 19,
            language: "React",
            languageColor: "#61dafb",
          },
        ],
      },
    };
  }

  if (content.type === "availability") {
    return {
      ...content,
      data: {
        status: "available",
        message:
          templateId === "developer"
            ? "Available for SaaS builds and frontend systems."
            : templateId === "influencer"
              ? "Open to lifestyle, travel, and product partnerships."
              : "Open to selected portfolio, brand, and product design work.",
        forHire: true,
        preferredContact:
          templateId === "developer"
            ? "chedganemouhssine@gmail.com"
            : templateId === "influencer"
              ? "collab@miralane.co"
              : "hello@alice.design",
        responseTime: "Replies within 24h",
        timezone:
          templateId === "developer"
            ? "CET"
            : templateId === "influencer"
              ? "PST"
              : "GMT",
        nextOpening: "2 spots this month",
        rate:
          templateId === "developer"
            ? "Builds from $4k"
            : templateId === "influencer"
              ? "Campaigns from $3k"
              : "Sprints from $2.5k",
        ctaLabel:
          templateId === "influencer" ? "Plan a campaign" : "Start a project",
      },
    };
  }

  if (content.type === "link") {
    return {
      ...content,
      data: {
        title: "Let's Collaborate",
        url:
          templateId === "developer"
            ? "chedganemouhssine@gmail.com"
            : templateId === "pro"
              ? "founder@launchos.co"
              : templateId === "influencer"
                ? "collab@miralane.co"
                : "hello@alice.design",
      },
    };
  }

  if (content.type === "education" && templateId === "designer") {
    return {
      ...content,
      data: {
        title: "Design background",
        items: [
          {
            school: "Central Saint Martins",
            degree: "BA Product & Interaction Design",
            period: "2020 - 2023",
            description:
              "Studied visual systems, digital product craft, user research, and launch-ready brand experiences.",
          },
          {
            school: "Interaction Design Foundation",
            degree: "UX Research & Design Systems",
            period: "2024",
            description:
              "Focused on usability, interface structure, and scalable component libraries.",
          },
        ],
      },
    };
  }

  if (content.type === "quote" && templateId === "designer") {
    return {
      ...content,
      data: {
        quote:
          "Alice turns fuzzy product ideas into interfaces that feel simple, premium, and ready to ship.",
        author: "Luma Studio",
        role: "Creative Direction Team",
        company: "Luma Studio",
      },
    };
  }

  if (content.type === "social") {
    if (templateId === "designer") {
      return {
        ...content,
        data: {
          items: [
            {
              platform: "instagram",
              url: "https://instagram.com/alicedesign",
              username: "alicedesign",
            },
            {
              platform: "twitter",
              url: "https://x.com/alicedesign",
              username: "alicedesign",
            },
            {
              platform: "dribbble",
              url: "https://dribbble.com/alicedesign",
              username: "alicedesign",
            },
            {
              platform: "website",
              url: "https://alice.design",
            },
          ],
        },
      };
    }

    return {
      ...content,
      data: {
        items: [
          {
            platform: "instagram",
            url: "https://instagram.com/miralane",
            username: "miralane",
          },
          {
            platform: "twitter",
            url: "https://x.com/bentofolio",
            username: "bentofolio",
          },
          {
            platform: "youtube",
            url: "https://youtube.com/@miralane",
            username: "miralane",
          },
          {
            platform: "website",
            url:
              templateId === "influencer"
                ? "https://miralane.co"
                : "https://bentofolio.dev",
          },
        ],
      },
    };
  }

  if (content.type === "resume") {
    return {
      ...content,
      data: {
        title:
          templateId === "developer"
            ? "Developer resume"
            : templateId === "designer"
              ? "Alice portfolio deck"
              : "Portfolio deck",
        fileUrl: "https://example.com/resume.pdf",
        lastUpdated: "May 2026",
      },
    };
  }

  if (content.type === "spotify" && templateId === "pro") {
    return {
      ...content,
      data: {
        type: "embed",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWVqfgj8NZEp1",
      },
    };
  }

  if (content.type === "youtube") {
    return {
      ...content,
      data: {
        title:
          templateId === "influencer"
            ? "Creator vlog"
            : templateId === "developer"
              ? "Build log: shipping a dashboard"
              : templateId === "designer"
                ? "Alice design walkthrough"
                : "Studio walkthrough",
        url:
          templateId === "developer"
            ? "https://www.youtube.com/watch?v=IXOk6o-Omps"
            : templateId === "pro"
              ? "https://www.youtube.com/watch?v=RwkGSPp6yG0&pp=ygUOY2luZW1hdGljIHZsb2c%3D"
              : templateId === "designer"
                ? "https://www.youtube.com/watch?v=GQS7wPujL2k&pp=ygUIZGVzaWduZXI%3D"
                : templateId === "influencer"
                  ? "https://www.youtube.com/watch?v=SlgKIJaoXd8&pp=ygUEdmxvZw%3D%3D"
                  : "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      },
    };
  }

  if (content.type === "instagram") {
    return {
      ...content,
      data: {
        handle: templateId === "influencer" ? "@fernandaraamirez" : "@miralane",
        profileUrl:
          templateId === "influencer"
            ? "https://instagram.com/fernandaraamirez"
            : "https://instagram.com/miralane",
        image:
          templateId === "influencer"
            ? "/prebuilt/inf/ig-profile.jpg"
            : "/momojis/41.png",
        followers: templateId === "influencer" ? "1.6M" : "148k",
        posts: templateId === "influencer" ? "1.1k" : "612",
        engagement: templateId === "influencer" ? "8.9%" : "9.4%",
        featuredPostUrl: "https://instagram.com",
      },
    };
  }

  if (content.type === "gallery") {
    return {
      ...content,
      data: {
        title:
          templateId === "designer"
            ? "Alice's visual archive"
            : templateId === "influencer"
              ? "Podcast episodes"
              : "Favorite snapshots",
        images:
          templateId === "designer"
            ? [
                {
                  src: "/prebuilt/designer/work1.jpeg",
                  alt: "Alice project one",
                },
                {
                  src: "/prebuilt/designer/work2.jpeg",
                  alt: "Alice project two",
                },
                {
                  src: "/prebuilt/designer/work3.jpeg",
                  alt: "Alice project three",
                },
                {
                  src: "/prebuilt/designer/varnika.jpeg",
                  alt: "Alice portrait",
                },
              ]
            : templateId === "influencer"
              ? [
                  { src: "/prebuilt/inf/ep.jpg", alt: "Podcast episode cover" },
                  { src: "/prebuilt/inf/ep1.jpg", alt: "Podcast episode one" },
                  { src: "/prebuilt/inf/ep2.jpg", alt: "Podcast episode two" },
                  {
                    src: "/prebuilt/inf/ep3.jpg",
                    alt: "Podcast episode three",
                  },
                ]
              : [
                  { src: "/momojis/13.png", alt: "Studio avatar" },
                  { src: "/momojis/41.png", alt: "Creative avatar" },
                  { src: "/momojis/54.png", alt: "Project avatar" },
                  { src: "/momojis/27.png", alt: "Mood avatar" },
                ],
      },
    };
  }

  if (content.type === "services") {
    return {
      ...content,
      data: {
        title:
          templateId === "influencer"
            ? "Brand collabs"
            : templateId === "developer"
              ? "Engineering services"
              : templateId === "pro"
                ? "Launch support"
                : "Alice design studio",
        items:
          templateId === "influencer"
            ? [
                "UGC videos",
                "Sponsored posts",
                "Travel campaigns",
                "Product launches",
              ]
            : templateId === "developer"
              ? [
                  "SaaS dashboards",
                  "Design systems",
                  "API integrations",
                  "Performance polish",
                ]
              : [
                  "iOS app design",
                  "Design systems",
                  "Framer websites",
                  "Launch visuals",
                ],
      },
    };
  }

  if (content.type === "tools") {
    return {
      ...content,
      data: {
        title: "Daily tools",
        items:
          templateId === "developer"
            ? [
                { name: "React", icon: "/icons/tech/react-original.svg" },
                { name: "Next.js", icon: "/icons/tech/nextjs-original.svg" },
                {
                  name: "TypeScript",
                  icon: "/icons/tech/typescript-original.svg",
                },
                { name: "Figma", icon: "/icons/tech/figma-original.svg" },
              ]
            : [
                { name: "Figma", icon: "/icons/tech/figma-original.svg" },
                { name: "Framer", icon: "Fr" },
                { name: "Webflow", icon: "/icons/tech/webflow-original.svg" },
                { name: "Spline", icon: "S" },
              ],
      },
    };
  }

  if (content.type === "stats") {
    return {
      ...content,
      data: {
        items: [
          {
            value: templateId === "pro" ? "$4.2k" : "6+",
            label: templateId === "pro" ? "MRR" : "Years",
          },
          {
            value: templateId === "influencer" ? "148k" : "42",
            label: templateId === "influencer" ? "Followers" : "Projects",
          },
          {
            value: templateId === "influencer" ? "2.3M" : "12k",
            label:
              templateId === "influencer" ? "Monthly reach" : "Users reached",
          },
          {
            value: templateId === "influencer" ? "9.4%" : "98%",
            label: templateId === "influencer" ? "Engagement" : "Happy clients",
          },
        ],
      },
    };
  }

  return content;
}

function renderBlock(content: BlockContent, isPro = false) {
  switch (content.type) {
    case "identity":
      return <IdentityBlock data={content.data} verified={isPro} />;
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

function formatBlockType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function isLegacyDemoIdentity(block: BlockContent) {
  return (
    block.type === "identity" &&
    block.data.name === "Alex Chen" &&
    block.data.title === "Product Designer @ BentoStudio" &&
    block.data.email === "alex@example.com" &&
    block.data.website === "alex.dev"
  );
}

function isLegacyDefaultAvatar(avatar?: string) {
  return (
    !avatar ||
    avatar.includes("api.dicebear.com") ||
    avatar.includes("tapback.co/api/avatar.webp")
  );
}

function normalizeLoadedContent(
  savedContent: Record<string, BlockContent>,
  username?: string,
) {
  return Object.fromEntries(
    Object.entries(savedContent).map(([id, block]) => {
      if (block.type !== "identity") return [id, block];

      if (isLegacyDemoIdentity(block)) {
        return [
          id,
          {
            ...block,
            data: {
              ...block.data,
              name: username ? `@${username}` : "Your Name",
              title: "Product Designer @ YourStudio",
              avatar: DEFAULT_MEMOJI_AVATAR,
              bio: "Designing calm products, useful systems, and tiny details people remember.",
              location: "Remote",
              email: "hello@example.com",
              website: "example.com",
            },
          },
        ];
      }

      if (isLegacyDefaultAvatar(block.data.avatar)) {
        return [
          id,
          {
            ...block,
            data: {
              ...block.data,
              avatar: DEFAULT_MEMOJI_AVATAR,
            },
          },
        ];
      }

      return [id, block];
    }),
  ) as Record<string, BlockContent>;
}

function normalizeLoadedLayout(savedLayout: BlockLayout[]) {
  return savedLayout.map((block) =>
    block.type === "spotify"
      ? { ...block, w: Math.max(block.w, 2), h: 1 }
      : (block.type === "availability" ||
            block.type === "link" ||
            block.type === "resume" ||
            block.type === "instagram" ||
            block.type === "gallery" ||
            block.type === "youtube" ||
            block.type === "services" ||
            block.type === "tools" ||
            block.type === "stats") &&
          block.w < 2
        ? { ...block, w: 2 }
        : block,
  );
}

function cloneLayout(layout: BlockLayout[]) {
  return layout.map((block) => ({ ...block }));
}

function cloneContent(content: Record<string, BlockContent>) {
  return Object.fromEntries(
    Object.entries(content).map(([id, block]) => [id, structuredClone(block)]),
  ) as Record<string, BlockContent>;
}

function ShareBentoModal({
  username,
  avatarUrl,
  onClose,
}: {
  username: string;
  avatarUrl?: string | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://bentofolio.dev";
  const profileUrl = `${appUrl}/${username}`;
  const shareText = "I just made my BentoFolio. Check it out:";

  const copyText = async (text = profileUrl) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const openShareUrl = (url: string) => {
    window.open(url, "_blank", "width=640,height=520");
  };

  const createShareImage = async () => {
    if (!cardRef.current) return null;

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: "#111112",
      scale: 2,
      useCORS: true,
    });

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(
          new File([blob], `${username}-bentofolio.png`, {
            type: "image/png",
          }),
        );
      }, "image/png");
    });
  };

  const shareCardImage = async () => {
    setSharingImage(true);
    const file = await createShareImage();
    const canShareFile =
      file &&
      typeof navigator !== "undefined" &&
      "canShare" in navigator &&
      navigator.canShare?.({ files: [file] });

    if (file && canShareFile) {
      await navigator
        .share({
          title: `${username}'s BentoFolio`,
          text: `${shareText} ${profileUrl}`,
          files: [file],
        })
        .catch(() => null);
      setSharingImage(false);
      return;
    }

    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    }

    setSharingImage(false);
  };

  const openInstagramStory = async () => {
    await shareCardImage();
    window.location.href = "instagram://story-camera";
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.shareModalOverlay}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={styles.celebrationLayer} aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <motion.span
              key={index}
              style={{
                left: `${8 + ((index * 17) % 86)}%`,
                background:
                  index % 3 === 0
                    ? "#d7ff5f"
                    : index % 3 === 1
                      ? "#ffffff"
                      : "#8fb3ff",
              }}
              initial={{ y: -30, opacity: 0, rotate: 0 }}
              animate={{ y: "96vh", opacity: [0, 1, 1, 0], rotate: 260 }}
              transition={{
                duration: 2.2 + (index % 5) * 0.22,
                delay: index * 0.045,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <motion.div
          className={styles.shareModal}
          initial={{ y: 34, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <button
            type="button"
            className={styles.shareClose}
            onClick={onClose}
            aria-label="Close share popup"
          >
            <X size={16} />
          </button>

          <motion.div
            ref={cardRef}
            className={styles.sharePreview}
            initial={{ rotate: -2, scale: 0.94 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 16,
              delay: 0.1,
            }}
          >
            <div className={styles.sharePreviewGrid}>
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className={styles.sharePreviewAvatar}>
              {avatarUrl ? (
                <NextImage
                  src={avatarUrl}
                  alt={username}
                  width={78}
                  height={78}
                  unoptimized
                />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <strong>@{username}</strong>
            <Link href="/" className={styles.shareCreateButton}>
              Create yours
            </Link>
          </motion.div>

          <div className={styles.shareCopy}>
            <span className={styles.eyebrow}>You shipped it</span>
            <h2>Surprise. Your BentoFolio is live.</h2>
            <p>
              Share the mini card itself, or send the live profile link. On
              mobile, Instagram can appear as a story/share target.
            </p>
            <div className={styles.shareUrl}>{profileUrl}</div>
            <div className={styles.shareActions}>
              <button
                type="button"
                onClick={shareCardImage}
                disabled={sharingImage}
              >
                {sharingImage ? <Loader2 size={16} /> : <Sparkles size={16} />}
                {sharingImage ? "Creating card" : "Share card"}
              </button>
              <button type="button" onClick={() => copyText()}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() =>
                  openShareUrl(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      shareText,
                    )}&url=${encodeURIComponent(profileUrl)}`,
                  )
                }
              >
                <Share2 size={16} />
                Twitter
              </button>
              <button
                type="button"
                onClick={() =>
                  openShareUrl(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      profileUrl,
                    )}`,
                  )
                }
              >
                <Facebook size={16} />
                Facebook
              </button>
              <button
                type="button"
                onClick={openInstagramStory}
                disabled={sharingImage}
              >
                <Instagram size={16} />
                Instagram story
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EditorStudio() {
  const { profile, loading, saveProfile, saving, hasProAccess } = useProfile();
  const { githubUsername, signOut } = useAuth();
  const {
    layout,
    content,
    selectedBlockId,
    setLayout,
    setContent,
    selectBlock,
  } = useEditor();
  const [activeView, setActiveView] =
    useState<(typeof navItems)[number]["id"]>("portfolio");
  const [status, setStatus] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [themeOverride, setThemeOverride] = useState<ThemeId | null>(null);
  const [hasReferralReward, setHasReferralReward] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const savedPortfolioRef = useRef<{
    layout: BlockLayout[];
    content: Record<string, BlockContent>;
  } | null>(null);
  const hydratedProfileIdRef = useRef<string | null>(null);
  const selectedTheme = themeOverride ?? profile?.theme ?? "dark";

  useEffect(() => {
    async function fetchReferralReward() {
      try {
        const response = await fetch("/api/referrals");
        if (!response.ok) return;
        const data = await response.json();
        setHasReferralReward(Boolean(data.reward?.code));
      } catch {
        setHasReferralReward(false);
      }
    }

    fetchReferralReward();
  }, []);

  useEffect(() => {
    if (!profile || hydratedProfileIdRef.current === profile.id) return;

    const nextLayout = normalizeLoadedLayout(profile.layout || []);
    const nextContent = normalizeLoadedContent(
      profile.content || {},
      profile.username,
    );

    setLayout(nextLayout);
    setContent(nextContent);
    savedPortfolioRef.current = {
      layout: cloneLayout(nextLayout),
      content: cloneContent(nextContent),
    };
    hydratedProfileIdRef.current = profile.id;
  }, [profile, setContent, setLayout]);

  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;
  const profileUrl = profile?.username ? `/${profile.username}` : "";

  const handleSave = async () => {
    await saveProfile({
      layout,
      content,
      theme: selectedTheme,
    });
    savedPortfolioRef.current = {
      layout: cloneLayout(layout),
      content: cloneContent(content),
    };
    setStatus("Saved");

    const sharePromptKey = profile?.username
      ? `bentofolio-share-prompt:${profile.username}`
      : "";
    if (
      sharePromptKey &&
      layout.length > 0 &&
      !window.localStorage.getItem(sharePromptKey)
    ) {
      window.localStorage.setItem(sharePromptKey, "seen");
      setShowShareModal(true);
    }

    window.setTimeout(() => setStatus(null), 1800);
  };

  const handleAddBlock = (type: BlockType) => {
    if (premiumBlocks.includes(type) && !hasProAccess) {
      setStatus("This card is Pro");
      window.setTimeout(() => setStatus(null), 1800);
      return;
    }
    const id = generateId();
    const size = getBlockSize(type);
    const newBlock: BlockLayout = {
      id,
      type,
      x: 0,
      y: layout.length,
      w: size.w,
      h: size.h,
    };

    setLayout([...layout, newBlock]);
    setContent({
      ...content,
      [id]: createDefaultContent(type),
    });
    selectBlock(id);
    setActiveView("portfolio");
    setStatus(`${formatBlockType(type)} added`);
    window.setTimeout(() => setStatus(null), 1800);
  };

  const handleRemoveBlock = (id: string) => {
    const nextLayout = layout.filter((block) => block.id !== id);
    const nextContent = { ...content };
    delete nextContent[id];
    setLayout(nextLayout);
    setContent(nextContent);
    selectBlock(null);
    setStatus("Card deleted");
    window.setTimeout(() => setStatus(null), 1600);
  };

  const handleClearCanvas = () => {
    setLayout([]);
    setContent({});
    selectBlock(null);
    setStatus("Canvas cleared");
    window.setTimeout(() => setStatus(null), 1600);
  };

  const handleApplyTemplate = async (
    template: (typeof starterTemplates)[number],
  ) => {
    if (templateRequiresPro(template) && !hasProAccess) {
      setStatus("This template includes Pro cards");
      window.setTimeout(() => setStatus(null), 1800);
      return;
    }

    const nextLayout: BlockLayout[] = [];
    const nextContent: Record<string, BlockContent> = {};

    template.blocks.forEach((block) => {
      const id = generateId();
      nextLayout.push({ id, ...block });
      nextContent[id] = customizeTemplateContent(
        template.id,
        createDefaultContent(block.type),
        profile?.username,
      );
    });

    setLayout(nextLayout);
    setContent(nextContent);
    selectBlock(null);
    setActiveView("portfolio");

    setStatus(`${template.label} template loaded`);

    window.setTimeout(() => setStatus(null), 1800);
  };

  const handleRestorePortfolio = () => {
    const savedPortfolio = savedPortfolioRef.current;
    if (!savedPortfolio) return;

    setLayout(cloneLayout(savedPortfolio.layout));
    setContent(cloneContent(savedPortfolio.content));
    selectBlock(null);
    setActiveView("portfolio");
    setStatus("My portfolio restored");
    window.setTimeout(() => setStatus(null), 1800);
  };

  const handleGitHubImport = async () => {
    if (!githubUsername) return;

    const data = await importFromGitHub(githubUsername);
    const newLayout: BlockLayout[] = [];
    const newContent: Record<string, BlockContent> = {};

    const identityId = generateId();
    newLayout.push({
      id: identityId,
      type: "identity",
      x: 0,
      y: 0,
      w: 4,
      h: 1,
    });
    newContent[identityId] = { type: "identity", data: data.identityContent };

    const projectsId = generateId();
    newLayout.push({
      id: projectsId,
      type: "projects",
      x: 0,
      y: 1,
      w: 2,
      h: 2,
    });
    newContent[projectsId] = { type: "projects", data: data.projectsContent };

    const techId = generateId();
    newLayout.push({ id: techId, type: "techstack", x: 2, y: 0, w: 2, h: 2 });
    newContent[techId] = { type: "techstack", data: data.techStackContent };

    const socialId = generateId();
    newLayout.push({ id: socialId, type: "social", x: 2, y: 2, w: 2, h: 1 });
    newContent[socialId] = { type: "social", data: data.socialContent };

    if (hasProAccess) {
      const githubId = generateId();
      newLayout.push({ id: githubId, type: "github", x: 0, y: 3, w: 2, h: 1 });
      newContent[githubId] = { type: "github", data: data.githubContent };
    }

    setLayout(newLayout);
    setContent(newContent);
    setActiveView("portfolio");
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spin} size={28} />
        <span>Opening studio...</span>
      </div>
    );
  }

  return (
    <ThemeProvider theme={selectedTheme}>
      <main className={styles.mobileLock}>
        <Link href="/" className={styles.mobileLockLogo}>
          Bento<span>Folio</span>
        </Link>
        <div className={styles.mobileLockCard}>
          <Grid3X3 size={34} />
          <span>Desktop studio</span>
          <h1>Open BentoFolio on a larger screen to edit.</h1>
          <p>
            The editor needs canvas space for blocks, inspector controls, and
            drag interactions. Public profiles, pricing, discover, and auth
            still work beautifully on mobile.
          </p>
          {profileUrl && (
            <Link href={profileUrl} className={styles.mobileLockButton}>
              Preview your BentoFolio
              <Eye size={16} />
            </Link>
          )}
        </div>
      </main>

      <main className={styles.studio}>
        <aside
          className={`${styles.rail} ${
            sidebarCollapsed ? styles.railCollapsed : ""
          }`}
        >
          <button
            className={styles.collapseButton}
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
          <Link href="/" className={styles.logo}>
            {sidebarCollapsed ? (
              "B"
            ) : (
              <>
                Bento<span>Folio</span>
              </>
            )}
          </Link>
          <div className={styles.userMini}>
            <div className={styles.avatar}>
              {profile?.avatarUrl ? (
                <NextImage
                  src={profile.avatarUrl}
                  alt={profile?.username || "Workspace avatar"}
                  width={34}
                  height={34}
                  unoptimized
                />
              ) : (
                profile?.username?.charAt(0) || "B"
              )}
            </div>
            <div className={styles.userMeta}>
              <strong>@{profile?.username || "profile"}</strong>
              <small>{hasProAccess ? "Pro workspace" : "Free workspace"}</small>
            </div>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={activeView === item.id ? styles.navActive : ""}
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <Link href="/invite" className={styles.navLinkButton}>
              <Gift size={16} />
              <span>{hasReferralReward ? "Get your coupon" : "Invite"}</span>
            </Link>
          </nav>

          <div className={styles.railFooter}>
            <button
              type="button"
              onClick={handleSave}
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className={styles.spin} size={16} />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? "Saving" : status || "Save"}</span>
            </button>
            {profileUrl && (
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className={styles.secondaryButton}
              >
                <Share2 size={16} />
                <span>Share my Bento</span>
              </button>
            )}
            {profileUrl && (
              <Link
                href={profileUrl}
                target="_blank"
                className={styles.secondaryButton}
              >
                <Eye size={16} />
                <span>Preview</span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className={styles.textButton}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <section className={styles.stage}>
          <header className={styles.topbar}>
            <div>
              <span>Bento studio</span>
              <h1>Portfolio Canvas</h1>
            </div>
            <div className={styles.topActions}>
              <div className={styles.themeSwitch} aria-label="Portfolio theme">
                <button
                  className={selectedTheme === "dark" ? styles.themeActive : ""}
                  onClick={() => setThemeOverride("dark")}
                  title="Dark yellow-green theme"
                >
                  <Moon size={14} />
                  Dark
                </button>
                <button
                  className={
                    selectedTheme === "light" ? styles.themeActive : ""
                  }
                  onClick={() => setThemeOverride("light")}
                  title="Light white-purple theme"
                >
                  <Sun size={14} />
                  Light
                </button>
              </div>
              <button
                className={styles.primaryToolbarButton}
                onClick={() => setActiveView("blocks")}
              >
                <Plus size={15} />
                Add card
              </button>
              {hasProAccess ? (
                <button
                  type="button"
                  className={styles.domainToolbarButton}
                  onClick={() => setActiveView("settings")}
                >
                  <Globe size={15} />
                  Add your domain
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className={`${styles.domainToolbarButton} ${styles.proLocked}`}
                  title="Custom domains are Pro"
                >
                  <Globe size={15} />
                  Add your domain
                  <em>Pro</em>
                </Link>
              )}
              <Link href="/editor/analytics" className={styles.iconPill}>
                <BarChart3 size={15} />
                Analytics
              </Link>
              {githubUsername && (
                <button
                  className={styles.iconPill}
                  onClick={handleGitHubImport}
                >
                  <Code2 size={15} />
                  Import GitHub
                </button>
              )}
            </div>
          </header>

          <div className={styles.templateBar}>
            <div>
              <span>Start faster</span>
              <strong>Pre-built templates</strong>
            </div>
            <div
              className={styles.templatePills}
              aria-label="Starter templates"
            >
              <button
                className={styles.templateButton}
                onClick={handleRestorePortfolio}
                title="Return to your saved portfolio"
              >
                <ChevronLeft size={14} />
                <span>My Portfolio</span>
                <em>Saved</em>
              </button>
              {starterTemplates.map((template) => {
                const requiresPro = templateRequiresPro(template);
                const locked = requiresPro && !hasProAccess;
                return (
                  <button
                    key={template.id}
                    className={`${styles.templateButton} ${locked ? styles.proLocked : ""}`}
                    onClick={() => handleApplyTemplate(template)}
                    title={
                      locked
                        ? "Upgrade to use this Pro template"
                        : `Start with ${template.label}`
                    }
                  >
                    <Sparkles size={14} />
                    <span>{template.label}</span>
                    <em>{requiresPro ? "Pro" : template.helper}</em>
                  </button>
                );
              })}
            </div>
          </div>

          {activeView === "portfolio" && (
            <PortfolioView
              layout={layout}
              content={content}
              selectedBlockId={selectedBlockId}
              onSelect={selectBlock}
              onRemove={handleRemoveBlock}
              onClearCanvas={handleClearCanvas}
              onOpenBlocks={() => setActiveView("blocks")}
              onAddBlock={handleAddBlock}
              isPro={Boolean(hasProAccess)}
            />
          )}

          {activeView === "blocks" && (
            <BlocksView isPro={Boolean(hasProAccess)} onAdd={handleAddBlock} />
          )}

          {activeView === "settings" && (
            <SettingsView
              isPro={Boolean(hasProAccess)}
              avatarUrl={profile?.avatarUrl}
              customDomain={profile?.customDomain}
              saveProfile={saveProfile}
            />
          )}
        </section>

        <aside className={styles.inspector}>
          {selectedContent ? (
            <>
              <div className={styles.inspectorHead}>
                <div>
                  <span>Selected card</span>
                  <strong>{formatBlockType(selectedContent.type)}</strong>
                </div>
                {selectedBlockId && (
                  <button
                    className={styles.inspectorDelete}
                    onClick={() => handleRemoveBlock(selectedBlockId)}
                  >
                    <Trash2 size={14} />
                    Delete card
                  </button>
                )}
              </div>
              <BlockEditor embedded />
            </>
          ) : (
            <div className={styles.emptyInspector}>
              <Layers3 size={30} />
              <h2>No card selected</h2>
              <p>Pick a card from the canvas to edit it.</p>
            </div>
          )}
        </aside>
      </main>
      {showShareModal && profile?.username && (
        <ShareBentoModal
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </ThemeProvider>
  );
}

function PortfolioView({
  layout,
  content,
  selectedBlockId,
  onSelect,
  onRemove,
  onClearCanvas,
  onOpenBlocks,
  onAddBlock,
  isPro,
}: {
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  selectedBlockId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onClearCanvas: () => void;
  onOpenBlocks: () => void;
  onAddBlock: (type: BlockType) => void;
  isPro: boolean;
}) {
  return (
    <div
      className={styles.portfolioSurface}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const blockType = event.dataTransfer.getData(
          "application/x-bentofolio-block",
        ) as BlockType;
        if (blockType) onAddBlock(blockType);
      }}
    >
      <div className={styles.portfolioHeader}>
        <div>
          <span>Public profile layout</span>
          <strong>Drop blocks here or click a quick block to add it.</strong>
        </div>
        <div className={styles.canvasActions}>
          <button onClick={onOpenBlocks}>
            <Plus size={15} />
            All cards
          </button>
          {layout.length > 0 && (
            <button onClick={onClearCanvas}>
              <Trash2 size={15} />
              Clear
            </button>
          )}
          <small>
            {layout.length} {layout.length === 1 ? "card" : "cards"}
          </small>
        </div>
      </div>
      <div className={styles.quickCreate}>
        <span className={styles.quickCreateLabel}>Quick add</span>
        {quickCreate.map((type) => {
          const block = blockLibrary.find((item) => item.type === type);
          if (!block) return null;
          const Icon = block.icon;
          const locked = premiumBlocks.includes(type) && !isPro;
          return (
            <button
              key={type}
              className={locked ? styles.proLocked : ""}
              onClick={() => onAddBlock(type)}
              title={locked ? `${block.label} is Pro` : `Add ${block.label}`}
            >
              <Icon size={15} />
              {block.label}
              {locked && <em>Pro</em>}
            </button>
          );
        })}
      </div>
      <div className={styles.cardGrid}>
        {layout.length === 0 && (
          <div className={styles.dropPlaceholder}>
            <Plus size={22} />
            <strong>Canvas is empty</strong>
            <span>
              Drop a block here or click a block from the left sidebar.
            </span>
          </div>
        )}
        {layout.map((block) => {
          const blockContent = content[block.id];
          if (!blockContent) return null;
          const visualWidth =
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
          return (
            <article
              key={block.id}
              className={`${styles.canvasCard} ${selectedBlockId === block.id ? styles.cardSelected : ""} ${styles[`span${Math.min(visualWidth, 4)}`] || ""}`}
              onClick={() => onSelect(block.id)}
            >
              <div className={styles.cardToolbar}>
                <span>{formatBlockType(block.type)}</span>
                <div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(block.id);
                    }}
                    aria-label="Edit card"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(block.id);
                    }}
                    aria-label="Delete card"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
              <div className={styles.cardPreview}>
                {renderBlock(blockContent, isPro)}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function BlocksView({
  isPro,
  onAdd,
}: {
  isPro: boolean;
  onAdd: (type: BlockType) => void;
}) {
  return (
    <div className={styles.blocksSurface}>
      {blockLibrary.map((block) => {
        const Icon = block.icon;
        const locked = premiumBlocks.includes(block.type) && !isPro;
        return (
          <button
            key={block.type}
            className={locked ? styles.proLocked : ""}
            onClick={() => onAdd(block.type)}
            title={locked ? `${block.label} is Pro` : `Add ${block.label}`}
          >
            <Icon size={18} />
            <span>{block.label}</span>
            <small>{locked ? "Pro" : block.group}</small>
            <Plus size={14} />
          </button>
        );
      })}
    </div>
  );
}

function SettingsView({
  isPro,
  avatarUrl,
  customDomain,
  saveProfile,
}: {
  isPro: boolean;
  avatarUrl?: string | null;
  customDomain?: string | null;
  saveProfile: (updates: {
    avatarUrl?: string | null;
    customDomain?: string | null;
  }) => Promise<void>;
}) {
  const [avatar, setAvatar] = useState(avatarUrl || "");
  const [domain, setDomain] = useState(customDomain || "");
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const hasDomain = Boolean(customDomain);

  const handleAvatarFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage("Choose an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarMessage("Image must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result || ""));
      setAvatarMessage("Image ready. Save to apply it.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.settingsSurface}>
      <section>
        <User size={22} />
        <h2>Workspace image</h2>
        <p>
          Change the small image shown in the editor sidebar for your workspace.
        </p>
        <div className={styles.avatarSettingsRow}>
          <div className={styles.avatarPreview}>
            {avatar ? (
              <NextImage
                src={avatar}
                alt="Workspace avatar preview"
                width={64}
                height={64}
                unoptimized
              />
            ) : (
              <span>B</span>
            )}
          </div>
          <div className={styles.avatarSettingsActions}>
            <label className={styles.avatarUploadButton}>
              <Upload size={15} />
              Upload image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleAvatarFile(event.target.files?.[0])}
              />
            </label>
            <button onClick={() => saveProfile({ avatarUrl: avatar || null })}>
              <Check size={15} />
              Save image
            </button>
            {avatar && (
              <button
                className={styles.dangerButton}
                onClick={() => {
                  setAvatar("");
                  saveProfile({ avatarUrl: null });
                }}
              >
                <Trash2 size={15} />
                Remove
              </button>
            )}
          </div>
        </div>
        {avatarMessage && (
          <p className={styles.settingsNote}>{avatarMessage}</p>
        )}
      </section>
      <section>
        <Globe size={22} />
        <h2>Custom domain</h2>
        <p>Connect a domain when you want the portfolio to feel fully yours.</p>
        <div className={styles.domainRow}>
          <input
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="yourname.dev"
            disabled={!isPro}
          />
          <button
            disabled={!isPro}
            onClick={() => saveProfile({ customDomain: domain })}
          >
            <Check size={15} />
            Save
          </button>
          {hasDomain && (
            <button
              disabled={!isPro}
              className={styles.dangerButton}
              onClick={() => {
                setDomain("");
                saveProfile({ customDomain: null });
              }}
            >
              <Trash2 size={15} />
              Remove
            </button>
          )}
        </div>
        {hasDomain && (
          <p className={styles.domainCurrent}>
            Current custom domain: <strong>{customDomain}</strong>
          </p>
        )}
        {!isPro && (
          <Link href="/pricing">Upgrade to Pro to unlock domains</Link>
        )}
        <div className={styles.domainGuide}>
          <div className={styles.domainGuideHeader}>
            <div>
              <span>Vercel hosting</span>
              <strong>Quick DNS instructions</strong>
            </div>
            <a
              href="https://vercel.com/docs/domains/set-up-custom-domain"
              target="_blank"
              rel="noreferrer"
            >
              Open guide
            </a>
          </div>
          <ol className={styles.domainSteps}>
            <li>
              Save the domain here, then add the same domain in your BentoFolio
              Vercel project.
            </li>
            <li>
              Open your domain registrar DNS settings and use the record Vercel
              asks for.
            </li>
            <li>
              For an apex domain, use an <strong>A</strong> record pointing to{" "}
              <code>76.76.21.21</code>.
            </li>
            <li>
              For a subdomain like <code>www</code>, use a{" "}
              <strong>CNAME</strong> record. If Vercel shows a unique CNAME, use
              that exact value.
            </li>
          </ol>
          <div
            className={styles.dnsCards}
            aria-label="Common Vercel DNS records"
          >
            <div>
              <span>Root domain</span>
              <strong>@</strong>
              <code>A 76.76.21.21</code>
            </div>
            <div>
              <span>Subdomain</span>
              <strong>www</strong>
              <code>CNAME cname.vercel-dns-0.com</code>
            </div>
          </div>
        </div>
      </section>
      <section>
        <Mail size={22} />
        <h2>Public notes</h2>
        <p>
          Add Workflow Notes from the sidebar to show a Notion-like public space
          on your portfolio.
        </p>
      </section>
    </div>
  );
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorStudio />
    </EditorProvider>
  );
}
