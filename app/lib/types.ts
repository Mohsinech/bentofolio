// Block types available in BentoFolio
export type BlockType =
  | "identity"
  | "map"
  | "techstack"
  | "experience"
  | "spotify"
  | "metrics"
  | "link"
  | "text"
  | "saas"
  | "github"
  | "projects"
  | "social"
  | "availability"
  | "quote"
  | "resume"
  | "youtube"
  | "instagram"
  | "network"
  | "career";

// Position and size of a block in the grid
export interface BlockLayout {
  id: string;
  type: BlockType;
  x: number; // column start (0-indexed)
  y: number; // row start (0-indexed)
  w: number; // width in columns
  h: number; // height in rows
}

// Content for each block type
export interface IdentityContent {
  name: string;
  title: string;
  avatar: string;
  bio?: string;
}

export interface MapContent {
  location: string;
  lat: number;
  lng: number;
}

export interface TechStackContent {
  items: {
    name: string;
    icon: string;
  }[];
}

export interface ExperienceContent {
  items: {
    company: string;
    role: string;
    period: string;
    logo?: string;
  }[];
}

export interface SpotifyContent {
  type: "embed" | "now-playing" | "top-track";
  spotifyUrl?: string; // Spotify URL (track, playlist, album, artist)
  trackName?: string;
  artistName?: string;
  albumArt?: string;
}

export interface MetricsContent {
  items: {
    value: string;
    label: string;
  }[];
}

export interface LinkContent {
  url: string;
  title: string;
  icon?: string;
}

export interface TextContent {
  text: string;
}

export interface SaaSContent {
  name: string;
  logo?: string;
  tagline: string;
  url: string;
  mrr: number;
  revenue: number[];
  currency?: string;
}

// NEW: GitHub Stats Block
export interface GitHubContent {
  username: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars?: number;
  contributions?: number;
}

// NEW: Projects Block (fetched from GitHub)
export interface ProjectsContent {
  items: {
    name: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    language: string;
    languageColor?: string;
  }[];
}

// NEW: Social Links Block
export interface SocialContent {
  items: {
    platform:
      | "twitter"
      | "linkedin"
      | "github"
      | "youtube"
      | "instagram"
      | "dribbble"
      | "behance"
      | "website"
      | "email";
    url: string;
    username?: string;
  }[];
}

// NEW: Availability Block
export interface AvailabilityContent {
  status: "available" | "busy" | "not-available";
  message: string;
  forHire: boolean;
  preferredContact?: string;
}

// NEW: Quote/Testimonial Block
export interface QuoteContent {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

// NEW: Resume/CV Block
export interface ResumeContent {
  title: string;
  fileUrl: string;
  lastUpdated?: string;
}

// NEW: YouTube Block - Channel with video embed
export interface YouTubeContent {
  channelName: string;
  subscribers: string;
  videoUrl?: string; // YouTube video URL for embed
}

// NEW: Instagram Block - Simple URL-based embed
export interface InstagramContent {
  postUrl: string; // Instagram post URL
}

// NEW: Network/Connections Block
export interface NetworkContent {
  title: string;
  connections: {
    name: string;
    avatar: string;
    url?: string;
  }[];
}

// NEW: Career Trajectory Block
export interface CareerContent {
  title: string;
  milestones: {
    label: string;
    percentage: number;
    icon?: string;
    company?: string;
  }[];
}

// Union type for all content
export type BlockContent =
  | { type: "identity"; data: IdentityContent }
  | { type: "map"; data: MapContent }
  | { type: "techstack"; data: TechStackContent }
  | { type: "experience"; data: ExperienceContent }
  | { type: "spotify"; data: SpotifyContent }
  | { type: "metrics"; data: MetricsContent }
  | { type: "link"; data: LinkContent }
  | { type: "text"; data: TextContent }
  | { type: "saas"; data: SaaSContent }
  | { type: "github"; data: GitHubContent }
  | { type: "projects"; data: ProjectsContent }
  | { type: "social"; data: SocialContent }
  | { type: "availability"; data: AvailabilityContent }
  | { type: "quote"; data: QuoteContent }
  | { type: "resume"; data: ResumeContent }
  | { type: "youtube"; data: YouTubeContent }
  | { type: "instagram"; data: InstagramContent }
  | { type: "network"; data: NetworkContent }
  | { type: "career"; data: CareerContent };

// Full block with layout + content
export interface Block {
  layout: BlockLayout;
  content: BlockContent;
}

// User profile (matches Supabase schema)
export interface Profile {
  id: string;
  username: string;
  theme: ThemeId;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  isPro: boolean;
  customDomain?: string | null;
  createdAt: string;
  updatedAt: string;
}

// GitHub API Response types
export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
}

// Theme configuration
export interface ThemeConfig {
  name: string;
  description: string;
  background: string;
  backgroundImage?: string; // CSS background-image for theme
  cardBackground: string;
  cardBorder: string;
  glow: string;
  text: string;
  textMuted: string;
  accent: string;
  isPremium: boolean;
  preview: string; // Preview gradient/image for theme selector
  // Premium effects
  blur?: number; // Backdrop blur in px
  glowIntensity?: number; // Glow intensity multiplier
  borderGlow?: boolean; // Animated border glow
  gradientBorder?: string; // Gradient border for cards
  cardOpacity?: number; // Card background opacity (0-1)
  // Fun animations
  particles?: boolean; // Floating particles
  particleColor?: string; // Particle color
  mouseGlow?: boolean; // Mouse follow glow
  cardEffect?: "wiggle" | "bounce" | "jelly" | "none"; // Card hover animation
  blobs?: boolean; // Animated background blobs
  blobColors?: string[]; // Blob colors
}

export type ThemeId =
  | "dark"
  | "cyberpunk"
  | "lofi"
  | "ocean"
  | "forest"
  | "sunset"
  | "monochrome"
  | "neon"
  | "minimal"
  | "nord";

// Import data from separate file to avoid exposure in dev tools
import { themes, premiumBlocks, freeBlocks } from "./themes.data";

// Re-export for external use
export { themes, premiumBlocks, freeBlocks };
