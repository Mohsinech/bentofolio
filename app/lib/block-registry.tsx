import type { ComponentType } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CircleDot,
  Code2,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Images,
  Instagram,
  Layers3,
  Link as LinkIcon,
  Mail,
  MapPin,
  Music2,
  Play,
  Sparkles,
  User,
  Users,
  Wrench,
  Youtube,
} from "lucide-react";
import type { BlockContent, BlockLayout, BlockType } from "./types";
import { DEFAULT_MEMOJI_AVATAR } from "./memoji";

export type V2BlockCategory =
  | "Essentials"
  | "Work"
  | "Career and Proof"
  | "Media and Conversion";

export type V2ProductCategory =
  | "Identity"
  | "Work"
  | "Career"
  | "Proof"
  | "Skills"
  | "Media"
  | "Contact"
  | "Personality";

export type BlockAccessLevel = "free" | "pro";

export type BlockCapability =
  | "advancedVariants"
  | "multipleItems"
  | "liveSync"
  | "embeds"
  | "conversionTracking"
  | "basicVariants"
  | "images"
  | "motion"
  | "downloads"
  | "externalLinks";

export type BlockLegacyStatus =
  | "current"
  | "legacy-compatible"
  | "merged"
  | "planned";

export type BlockRendererKey =
  | "IdentityBlock"
  | "MapBlock"
  | "TechStackBlock"
  | "ExperienceBlock"
  | "SpotifyBlock"
  | "LinkBlock"
  | "WorkBlock"
  | "EducationBlock"
  | "SaaSBlock"
  | "GitHubBlock"
  | "ProjectsBlock"
  | "SocialBlock"
  | "AvailabilityBlock"
  | "QuoteBlock"
  | "ResumeBlock"
  | "GalleryBlock"
  | "YouTubeBlock"
  | "ServicesBlock"
  | "ToolsBlock"
  | "StatsBlock"
  | "InstagramBlock";

export type BlockSizeKey = "small" | "medium" | "large" | "wide" | "hero";

export interface BlockRegistryEntry {
  legacyType: BlockType;
  v2Name: string;
  v2Category: V2BlockCategory;
  productCategory: V2ProductCategory;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  defaultSize: Pick<BlockLayout, "w" | "h">;
  supportedSizes: BlockSizeKey[];
  accessLevel: BlockAccessLevel;
  proCapabilities: BlockCapability[];
  freeCapabilities: BlockCapability[];
  legacyStatus: BlockLegacyStatus;
  rendererKey: BlockRendererKey;
  editorLabel: string;
  editorGroup: string;
  codeVariant?: boolean;
  defaultContent: () => BlockContent;
}

function createDefaultContentMap(): { [Type in BlockType]: () => Extract<BlockContent, { type: Type }> } {
  return {
    identity: () => ({
      type: "identity",
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
    }),
    map: () => ({
      type: "map",
      data: { location: "Your City", lat: 0, lng: 0 },
    }),
    techstack: () => ({
      type: "techstack",
      data: {
        items: [
          { name: "Next.js", icon: "/icons/tech/nextjs-original.svg" },
          { name: "React", icon: "/icons/tech/react-original.svg" },
          { name: "TypeScript", icon: "/icons/tech/typescript-original.svg" },
        ],
      },
    }),
    experience: () => ({
      type: "experience",
      data: {
        items: [
          {
            company: "Studio",
            role: "Designer / Developer",
            period: "2024 - Now",
          },
        ],
      },
    }),
    spotify: () => ({ type: "spotify", data: { type: "embed", spotifyUrl: "" } }),
    link: () => ({
      type: "link",
      data: { url: "hello@example.com", title: "Let's Collaborate" },
    }),
    work: () => ({
      type: "work",
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
    }),
    education: () => ({
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
    }),
    saas: () => ({
      type: "saas",
      data: {
        name: "My SaaS",
        tagline: "A small product worth sharing.",
        url: "https://example.com",
        mrr: 1000,
        revenue: [100, 240, 420, 680, 900, 1200],
      },
    }),
    github: () => ({
      type: "github",
      data: {
        username: "",
        followers: 0,
        following: 0,
        publicRepos: 0,
        totalStars: 0,
      },
    }),
    projects: () => ({
      type: "projects",
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
    }),
    social: () => ({
      type: "social",
      data: {
        items: [
          { platform: "github", url: "https://github.com" },
          { platform: "linkedin", url: "https://linkedin.com" },
          { platform: "website", url: "https://example.com" },
        ],
      },
    }),
    availability: () => ({
      type: "availability",
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
    }),
    quote: () => ({
      type: "quote",
      data: {
        quote: "A short testimonial or belief statement.",
        author: "Someone Great",
      },
    }),
    resume: () => ({
      type: "resume",
      data: { title: "Resume", fileUrl: "", lastUpdated: "May 2026" },
    }),
    gallery: () => ({ type: "gallery", data: { title: "Gallery", images: [] } }),
    youtube: () => ({ type: "youtube", data: { title: "Featured video", url: "" } }),
    services: () => ({
      type: "services",
      data: {
        title: "What I can help with",
        items: ["Product design", "Framer", "Web apps", "Brand systems"],
      },
    }),
    tools: () => ({
      type: "tools",
      data: {
        title: "Tools I use",
        items: [
          { name: "Figma", icon: "F" },
          { name: "Framer", icon: "Fr" },
          { name: "Notion", icon: "N" },
        ],
      },
    }),
    stats: () => ({
      type: "stats",
      data: {
        items: [
          { value: "6+", label: "Years" },
          { value: "42", label: "Projects" },
          { value: "12k", label: "Users reached" },
          { value: "98%", label: "Happy clients" },
        ],
      },
    }),
    instagram: () => ({
      type: "instagram",
      data: {
        handle: "@yourhandle",
        profileUrl: "https://instagram.com/yourhandle",
        image: "",
        followers: "12.4k",
        posts: "186",
        engagement: "8.7%",
        featuredPostUrl: "",
      },
    }),
  };
}

const defaultContentMap = createDefaultContentMap();

export const blockRegistry = {
  identity: {
    legacyType: "identity",
    v2Name: "Profile",
    v2Category: "Essentials",
    productCategory: "Identity",
    description: "Primary creator profile with name, role, bio, avatar, and key contact details.",
    icon: User,
    defaultSize: { w: 4, h: 1 },
    supportedSizes: ["medium", "wide", "hero"],
    accessLevel: "free",
    freeCapabilities: ["images", "externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "IdentityBlock",
    editorLabel: "Identity",
    editorGroup: "Profile",
    defaultContent: defaultContentMap.identity,
  },
  map: {
    legacyType: "map",
    v2Name: "Location",
    v2Category: "Essentials",
    productCategory: "Contact",
    description: "Location, region, timezone, or map context for the public portfolio.",
    icon: MapPin,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium"],
    accessLevel: "free",
    freeCapabilities: ["basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "merged",
    rendererKey: "MapBlock",
    editorLabel: "Location",
    editorGroup: "Profile",
    defaultContent: defaultContentMap.map,
  },
  techstack: {
    legacyType: "techstack",
    v2Name: "Skills",
    v2Category: "Career and Proof",
    productCategory: "Skills",
    description: "Technical or creative skills presented as icons, chips, or grouped lists.",
    icon: Layers3,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "images", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "merged",
    rendererKey: "TechStackBlock",
    editorLabel: "Stack",
    editorGroup: "Proof",
    defaultContent: defaultContentMap.techstack,
  },
  experience: {
    legacyType: "experience",
    v2Name: "Experience",
    v2Category: "Work",
    productCategory: "Career",
    description: "Career history, roles, companies, and time periods.",
    icon: FileText,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "images", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "ExperienceBlock",
    editorLabel: "Experience",
    editorGroup: "Work",
    defaultContent: defaultContentMap.experience,
  },
  spotify: {
    legacyType: "spotify",
    v2Name: "Embed",
    v2Category: "Media and Conversion",
    productCategory: "Media",
    description: "Legacy Spotify media embed, now represented by the V2 Embed block.",
    icon: Music2,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "pro",
    freeCapabilities: [],
    proCapabilities: ["embeds", "advancedVariants"],
    legacyStatus: "legacy-compatible",
    rendererKey: "SpotifyBlock",
    editorLabel: "Spotify",
    editorGroup: "Media",
    defaultContent: defaultContentMap.spotify,
  },
  link: {
    legacyType: "link",
    v2Name: "CTA",
    v2Category: "Essentials",
    productCategory: "Contact",
    description: "Primary link, email action, or conversion call-to-action.",
    icon: LinkIcon,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants", "conversionTracking"],
    legacyStatus: "merged",
    rendererKey: "LinkBlock",
    editorLabel: "Link",
    editorGroup: "Content",
    defaultContent: defaultContentMap.link,
  },
  work: {
    legacyType: "work",
    v2Name: "Projects",
    v2Category: "Work",
    productCategory: "Work",
    description: "Selected project collection with images, clients, categories, years, and links.",
    icon: BriefcaseBusiness,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["medium", "large", "wide"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "images", "externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "WorkBlock",
    editorLabel: "Work",
    editorGroup: "Proof",
    defaultContent: defaultContentMap.work,
  },
  education: {
    legacyType: "education",
    v2Name: "Education",
    v2Category: "Career and Proof",
    productCategory: "Career",
    description: "Education, certifications, credentials, and learning history.",
    icon: GraduationCap,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "images", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "EducationBlock",
    editorLabel: "Education",
    editorGroup: "Work",
    defaultContent: defaultContentMap.education,
  },
  saas: {
    legacyType: "saas",
    v2Name: "Metrics",
    v2Category: "Career and Proof",
    productCategory: "Proof",
    description: "Legacy product revenue/proof card, mapped to V2 Metrics or Featured Project.",
    icon: Globe,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "merged",
    rendererKey: "SaaSBlock",
    editorLabel: "SaaS",
    editorGroup: "Work",
    defaultContent: defaultContentMap.saas,
  },
  github: {
    legacyType: "github",
    v2Name: "GitHub",
    v2Category: "Career and Proof",
    productCategory: "Proof",
    description: "GitHub profile proof with followers, repositories, and stars.",
    icon: Code2,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["basicVariants", "externalLinks"],
    proCapabilities: ["advancedVariants", "liveSync"],
    legacyStatus: "current",
    rendererKey: "GitHubBlock",
    editorLabel: "GitHub",
    editorGroup: "Proof",
    defaultContent: defaultContentMap.github,
  },
  projects: {
    legacyType: "projects",
    v2Name: "Projects",
    v2Category: "Work",
    productCategory: "Work",
    description: "Code-oriented project collection with repository metadata and language stats.",
    icon: FolderGit2,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["medium", "large", "wide"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants", "liveSync"],
    legacyStatus: "merged",
    rendererKey: "ProjectsBlock",
    editorLabel: "Projects",
    editorGroup: "Proof",
    codeVariant: true,
    defaultContent: defaultContentMap.projects,
  },
  social: {
    legacyType: "social",
    v2Name: "Social Links",
    v2Category: "Essentials",
    productCategory: "Contact",
    description: "Public social and profile links.",
    icon: Users,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants", "conversionTracking"],
    legacyStatus: "current",
    rendererKey: "SocialBlock",
    editorLabel: "Social",
    editorGroup: "Profile",
    defaultContent: defaultContentMap.social,
  },
  availability: {
    legacyType: "availability",
    v2Name: "Availability",
    v2Category: "Essentials",
    productCategory: "Contact",
    description: "Hiring status, response expectations, rate, and contact CTA.",
    icon: CircleDot,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["externalLinks", "basicVariants"],
    proCapabilities: ["advancedVariants", "conversionTracking"],
    legacyStatus: "current",
    rendererKey: "AvailabilityBlock",
    editorLabel: "Status",
    editorGroup: "Profile",
    defaultContent: defaultContentMap.availability,
  },
  quote: {
    legacyType: "quote",
    v2Name: "Testimonial",
    v2Category: "Career and Proof",
    productCategory: "Proof",
    description: "Single client quote, testimonial, or proof statement.",
    icon: Sparkles,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["basicVariants"],
    proCapabilities: ["advancedVariants", "multipleItems"],
    legacyStatus: "merged",
    rendererKey: "QuoteBlock",
    editorLabel: "Quote",
    editorGroup: "Content",
    defaultContent: defaultContentMap.quote,
  },
  resume: {
    legacyType: "resume",
    v2Name: "Resume",
    v2Category: "Career and Proof",
    productCategory: "Career",
    description: "Downloadable resume, CV, or credentials file.",
    icon: FileText,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium"],
    accessLevel: "free",
    freeCapabilities: ["downloads", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "ResumeBlock",
    editorLabel: "Resume",
    editorGroup: "Content",
    defaultContent: defaultContentMap.resume,
  },
  gallery: {
    legacyType: "gallery",
    v2Name: "Gallery",
    v2Category: "Media and Conversion",
    productCategory: "Media",
    description: "Image gallery for selected visuals, work shots, or personal media.",
    icon: Images,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["small", "medium", "large", "wide"],
    accessLevel: "free",
    freeCapabilities: ["images", "multipleItems", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "GalleryBlock",
    editorLabel: "Gallery",
    editorGroup: "Media",
    defaultContent: defaultContentMap.gallery,
  },
  youtube: {
    legacyType: "youtube",
    v2Name: "Embed",
    v2Category: "Media and Conversion",
    productCategory: "Media",
    description: "Legacy YouTube video embed, now represented by the V2 Embed block.",
    icon: Youtube,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["medium", "large", "wide"],
    accessLevel: "pro",
    freeCapabilities: [],
    proCapabilities: ["embeds", "advancedVariants"],
    legacyStatus: "legacy-compatible",
    rendererKey: "YouTubeBlock",
    editorLabel: "YouTube",
    editorGroup: "Media",
    defaultContent: defaultContentMap.youtube,
  },
  services: {
    legacyType: "services",
    v2Name: "Services",
    v2Category: "Work",
    productCategory: "Work",
    description: "Services, offers, or ways the creator can help.",
    icon: Sparkles,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "current",
    rendererKey: "ServicesBlock",
    editorLabel: "Services",
    editorGroup: "Work",
    defaultContent: defaultContentMap.services,
  },
  tools: {
    legacyType: "tools",
    v2Name: "Skills",
    v2Category: "Career and Proof",
    productCategory: "Skills",
    description: "Tools and software used by the creator, merged into V2 Skills.",
    icon: Wrench,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "images", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "merged",
    rendererKey: "ToolsBlock",
    editorLabel: "Tools",
    editorGroup: "Work",
    defaultContent: defaultContentMap.tools,
  },
  stats: {
    legacyType: "stats",
    v2Name: "Metrics",
    v2Category: "Career and Proof",
    productCategory: "Proof",
    description: "Manual public-facing metrics, achievements, and proof numbers.",
    icon: BarChart3,
    defaultSize: { w: 2, h: 1 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "free",
    freeCapabilities: ["multipleItems", "basicVariants"],
    proCapabilities: ["advancedVariants"],
    legacyStatus: "merged",
    rendererKey: "StatsBlock",
    editorLabel: "Stats",
    editorGroup: "Proof",
    defaultContent: defaultContentMap.stats,
  },
  instagram: {
    legacyType: "instagram",
    v2Name: "Embed",
    v2Category: "Media and Conversion",
    productCategory: "Media",
    description: "Legacy Instagram profile or post card, now represented by the V2 Embed block.",
    icon: Instagram,
    defaultSize: { w: 2, h: 2 },
    supportedSizes: ["small", "medium", "large"],
    accessLevel: "pro",
    freeCapabilities: [],
    proCapabilities: ["embeds", "advancedVariants"],
    legacyStatus: "legacy-compatible",
    rendererKey: "InstagramBlock",
    editorLabel: "Instagram",
    editorGroup: "Media",
    defaultContent: defaultContentMap.instagram,
  },
} satisfies { [Type in BlockType]: BlockRegistryEntry & { legacyType: Type } };

export const blockRegistryEntries = Object.values(blockRegistry);

export const legacyBlockTypes = Object.keys(blockRegistry) as BlockType[];

export const editorBlockOrder = [
  "identity",
  "map",
  "availability",
  "social",
  "github",
  "work",
  "projects",
  "techstack",
  "link",
  "quote",
  "resume",
  "spotify",
  "youtube",
  "gallery",
  "instagram",
  "experience",
  "education",
  "saas",
  "services",
  "tools",
  "stats",
] satisfies BlockType[];

export const editorBlockLibraryEntries = editorBlockOrder.map(
  (type) => blockRegistry[type],
);

export const quickCreateBlockTypes = [
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
] satisfies BlockType[];

export const plannedV2Blocks = [
  {
    v2Name: "About",
    v2Category: "Essentials",
    productCategory: "Identity",
    accessLevel: "free",
    proCapabilities: ["advancedVariants"],
    icon: FileText,
  },
  {
    v2Name: "Featured Project",
    v2Category: "Work",
    productCategory: "Work",
    accessLevel: "free",
    proCapabilities: ["advancedVariants"],
    icon: ArrowUpRight,
  },
  {
    v2Name: "Case Study",
    v2Category: "Work",
    productCategory: "Work",
    accessLevel: "pro",
    proCapabilities: ["advancedVariants", "multipleItems", "images"],
    icon: FolderGit2,
  },
  {
    v2Name: "Client Logos",
    v2Category: "Career and Proof",
    productCategory: "Proof",
    accessLevel: "pro",
    proCapabilities: ["advancedVariants", "multipleItems", "images"],
    icon: Users,
  },
  {
    v2Name: "Motion",
    v2Category: "Media and Conversion",
    productCategory: "Personality",
    accessLevel: "pro",
    proCapabilities: ["motion", "advancedVariants"],
    icon: Play,
  },
  {
    v2Name: "Contact Form",
    v2Category: "Media and Conversion",
    productCategory: "Contact",
    accessLevel: "pro",
    proCapabilities: ["conversionTracking"],
    icon: Mail,
  },
  {
    v2Name: "Booking",
    v2Category: "Media and Conversion",
    productCategory: "Contact",
    accessLevel: "pro",
    proCapabilities: ["conversionTracking", "embeds"],
    icon: CalendarClock,
  },
] as const;

export function getBlockDefinition(type: BlockType) {
  return blockRegistry[type];
}

export function getDefaultBlockSize(type: BlockType) {
  return getBlockDefinition(type).defaultSize;
}

export function createDefaultBlockContent(type: BlockType): BlockContent {
  return getBlockDefinition(type).defaultContent();
}

export function hasBlockCapability(
  type: BlockType,
  capability: BlockCapability,
  access: BlockAccessLevel = "free",
) {
  const definition = getBlockDefinition(type);
  const freeCapabilities = definition.freeCapabilities as BlockCapability[];
  const proCapabilities = definition.proCapabilities as BlockCapability[];
  return access === "pro"
    ? [...freeCapabilities, ...proCapabilities].includes(capability)
    : freeCapabilities.includes(capability);
}

export function resolveLegacyBlock(type: BlockType) {
  const definition = getBlockDefinition(type);
  return {
    legacyType: definition.legacyType,
    v2Name: definition.v2Name,
    rendererKey: definition.rendererKey,
    defaultSize: definition.defaultSize,
    legacyStatus: definition.legacyStatus,
  };
}
