import type { BlockContent, BlockType, ThemeId } from "@/app/lib/types";

export interface V2SocialLink {
  label: string;
  href: string;
  kind?: "github" | "instagram" | "linkedin" | "mail" | "website" | "twitter" | "default";
  platform?: string;
  username?: string;
  external?: boolean;
}

export interface V2SocialLinksBlock {
  eyebrow?: string;
  heading?: string;
  variant: "icons" | "labels" | "list";
  items: V2SocialLink[];
}

export interface V2Project {
  title: string;
  type?: string;
  year?: string;
  image?: string;
  href?: string;
}

export interface V2ExperienceItem {
  period: string;
  role: string;
  description?: string;
  location?: string;
  companyUrl?: string;
  logo?: string;
}

export interface V2LocationBlock {
  eyebrow: string;
  heading: string;
  location: string;
  description?: string;
  timezone?: string;
  variant: "map" | "text";
  lat?: number;
  lng?: number;
  mapUrl?: string;
  actionUrl?: string;
  zoom?: number;
}

export interface V2AdditionalBlock {
  id: string;
  type: BlockType;
  title: string;
  category: string;
  content: BlockContent;
  isDraft: boolean;
  draftMessage: string;
}

export interface V2PortfolioData {
  theme?: ThemeId;
  isPro?: boolean;
  username?: string;
  brandName: string;
  hasIdentity?: boolean;
  initials?: string;
  eyebrow?: string;
  greeting?: string;
  role?: string;
  headline?: string;
  bio?: string;
  location?: string;
  focus?: string;
  response?: string;
  portrait?: {
    src?: string;
    alt: string;
    label?: string;
    focalPoint?: string;
  };
  socials?: V2SocialLink[];
  socialBlock?: V2SocialLinksBlock;
  experience?: V2ExperienceItem[];
  experienceEyebrow?: string;
  experienceHeading?: string;
  about?: string;
  contact?: {
    label: string;
    href?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    buttonLabel?: string;
    actionType: "email" | "copy-email";
    variant?: "surface" | "contrast" | "accent" | "outline";
    openInNewTab?: boolean;
    copyValue?: string;
  };
  projects?: V2Project[];
  skills?: string[];
  skillsEyebrow?: string;
  skillsHeading?: string;
  locationBlock?: V2LocationBlock;
  availability?: {
    title: string;
    body?: string;
    ctaLabel?: string;
    href?: string;
  };
  testimonial?: {
    quote: string;
    cite?: string;
  };
  motion?: {
    enabled: boolean;
  };
  additionalBlocks?: V2AdditionalBlock[];
  sourceBlocks?: Partial<
    Record<
      | "identity"
      | "portrait"
      | "experience"
      | "about"
      | "contact"
      | "projects"
      | "skills"
      | "social"
      | "location"
      | "availability"
      | "testimonial",
      string
    >
  >;
}
