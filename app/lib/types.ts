// Block types available in BentoFolio
export type BlockType =
  | "identity"
  | "map"
  | "techstack"
  | "experience"
  | "spotify"
  | "link"
  | "work"
  | "education"
  | "saas"
  | "github"
  | "projects"
  | "social"
  | "availability"
  | "quote"
  | "resume"
  | "gallery"
  | "youtube"
  | "services"
  | "tools"
  | "stats"
  | "instagram";

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
  location?: string;
  email?: string;
  website?: string;
  availability?: string;
  headline?: string;
  eyebrow?: string;
  portraitType?: "photo" | "memoji" | "none";
  portraitFocalPoint?: string;
  ctaLabel?: string;
}

export interface MapContent {
  location: string;
  lat: number;
  lng: number;
  eyebrow?: string;
  heading?: string;
  description?: string;
  timezone?: string;
  variant?: "map" | "text";
  mapUrl?: string;
  actionUrl?: string;
  zoom?: number;
}

export interface TechStackContent {
  eyebrow?: string;
  heading?: string;
  category?: string;
  variant?: string;
  items: {
    name: string;
    icon: string;
    category?: string;
    url?: string;
    proficiency?: string;
  }[];
}

export interface ExperienceContent {
  eyebrow?: string;
  heading?: string;
  variant?: string;
  items: {
    company: string;
    role: string;
    period: string;
    logo?: string;
    description?: string;
    location?: string;
    employmentType?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    companyUrl?: string;
  }[];
}

export interface SpotifyContent {
  type: "embed" | "now-playing" | "top-track";
  spotifyUrl?: string; // Spotify URL (track, playlist, album, artist)
  trackName?: string;
  artistName?: string;
  albumArt?: string;
}

export interface LinkContent {
  url: string;
  title: string;
  icon?: string;
  eyebrow?: string;
  description?: string;
  buttonLabel?: string;
  actionType?: "link" | "email" | "copy-email" | "download";
  variant?: "surface" | "contrast" | "accent" | "outline";
  openInNewTab?: boolean;
  emailSubject?: string;
  emailBody?: string;
}

export interface WorkContent {
  title: string;
  subtitle?: string;
  email?: string;
  items: {
    title: string;
    client: string;
    category: string;
    year: string;
    image?: string;
    url?: string;
  }[];
}

export interface EducationContent {
  title: string;
  eyebrow?: string;
  heading?: string;
  variant?: "timeline" | "list";
  items: {
    school: string;
    institution?: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    period: string;
    description?: string;
    location?: string;
    institutionUrl?: string;
    logo?: string;
  }[];
}

export interface SaaSContent {
  name: string;
  logo?: string;
  tagline: string;
  url: string;
  mrr: number;
  revenue: number[];
  currency?: string;
  // "YYYY-MM" of revenue[0], used for month labels on the chart.
  revenueStart?: string;
  // Active subscriptions (set by a provider sync).
  customers?: number;
  // All-time revenue, same currency. Shown as the headline when there's no MRR
  // (one-time sales), otherwise next to it.
  totalRevenue?: number;
  // Only ever set by the server from a live provider connection; anything
  // saved in page data is ignored and removed when the page is shown.
  verified?: { provider: "stripe" | "lemonsqueezy"; syncedAt: string };
  eyebrow?: string;
  heading?: string;
  variant?: "grid" | "strip";
  items?: {
    label?: string;
    value?: string;
    prefix?: string;
    suffix?: string;
    description?: string;
    url?: string;
  }[];
}

// NEW: GitHub Stats Block
export interface GitHubContent {
  username: string;
  profileUrl?: string;
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars?: number;
  contributions?: number;
  featuredRepos?: {
    name: string;
    description?: string;
    url?: string;
    stars?: number;
    language?: string;
  }[];
  eyebrow?: string;
  heading?: string;
  variant?: "profile" | "stats" | "repositories";
  showAvatar?: boolean;
  showBio?: boolean;
  showStats?: boolean;
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
  eyebrow?: string;
  heading?: string;
  variant?: string;
  items: {
    platform:
      | "twitter"
      | "x"
      | "linkedin"
      | "github"
      | "youtube"
      | "instagram"
      | "dribbble"
      | "behance"
      | "tiktok"
      | "facebook"
      | "threads"
      | "website"
      | "email"
      | "other";
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
  responseTime?: string;
  timezone?: string;
  nextOpening?: string;
  rate?: string;
  ctaLabel?: string;
}

// NEW: Quote/Testimonial Block
export interface QuoteContent {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  companyLogo?: string;
  sourceUrl?: string;
  eyebrow?: string;
  heading?: string;
  variant?: "quote" | "person" | "featured";
}

// NEW: Resume/CV Block
export interface ResumeContent {
  title: string;
  fileUrl: string;
  description?: string;
  fileName?: string;
  updatedAt?: string;
  buttonLabel?: string;
  eyebrow?: string;
  variant?: "compact" | "document";
  lastUpdated?: string;
}

export interface GalleryContent {
  title: string;
  images: {
    src: string;
    alt?: string;
  }[];
}

export interface YouTubeContent {
  title: string;
  url: string;
}

export interface ServicesContent {
  title: string;
  items: string[];
}

export interface ToolsContent {
  title: string;
  eyebrow?: string;
  heading?: string;
  category?: string;
  variant?: string;
  items: {
    name: string;
    icon?: string;
    category?: string;
    url?: string;
    proficiency?: string;
  }[];
}

export interface StatsContent {
  eyebrow?: string;
  heading?: string;
  variant?: "grid" | "strip";
  items: {
    label: string;
    value: string;
    prefix?: string;
    suffix?: string;
    description?: string;
    url?: string;
  }[];
}

export interface InstagramContent {
  handle: string;
  profileUrl: string;
  image?: string;
  followers: string;
  posts: string;
  engagement: string;
  featuredPostUrl?: string;
}

// Union type for all content
export type BlockContent =
  | { type: "identity"; data: IdentityContent }
  | { type: "map"; data: MapContent }
  | { type: "techstack"; data: TechStackContent }
  | { type: "experience"; data: ExperienceContent }
  | { type: "spotify"; data: SpotifyContent }
  | { type: "link"; data: LinkContent }
  | { type: "work"; data: WorkContent }
  | { type: "education"; data: EducationContent }
  | { type: "saas"; data: SaaSContent }
  | { type: "github"; data: GitHubContent }
  | { type: "projects"; data: ProjectsContent }
  | { type: "social"; data: SocialContent }
  | { type: "availability"; data: AvailabilityContent }
  | { type: "quote"; data: QuoteContent }
  | { type: "resume"; data: ResumeContent }
  | { type: "gallery"; data: GalleryContent }
  | { type: "youtube"; data: YouTubeContent }
  | { type: "services"; data: ServicesContent }
  | { type: "tools"; data: ToolsContent }
  | { type: "stats"; data: StatsContent }
  | { type: "instagram"; data: InstagramContent };

// Full block with layout + content
export interface Block {
  layout: BlockLayout;
  content: BlockContent;
}

// User profile (matches Supabase schema)
export interface Profile {
  id: string;
  username: string;
  avatarUrl?: string | null;
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

export type ThemeId = "dark" | "light";

// Import data from separate file to avoid exposure in dev tools
import { themes, premiumBlocks, freeBlocks } from "./themes.data";

// Re-export for external use
export { themes, premiumBlocks, freeBlocks };
