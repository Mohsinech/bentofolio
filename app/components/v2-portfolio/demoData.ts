import type { V2PortfolioData } from "./types";

export const v2PreviewData: V2PortfolioData = {
  theme: "light",
  isPro: false,
  username: "mira",
  brandName: "Mira Chen",
  initials: "MC",
  eyebrow: "Available for 2 builds",
  greeting: "Hi, I am Mira Chen.",
  role: "Independent product designer and creative developer",
  headline: "Designing sharp portfolios and launch systems for builders.",
  bio: "Product designer and front-end developer helping founders turn scattered proof into compact, memorable web presence.",
  location: "Casablanca / Remote",
  focus: "Design + React",
  response: "48h response",
  portrait: {
    src: "/prebuilt/designer/varnika.jpeg",
    alt: "Portrait of Mira Chen",
    label: "Independent studio",
  },
  socials: [
    { label: "GitHub", href: "https://github.com", kind: "github" },
    { label: "Instagram", href: "https://instagram.com", kind: "instagram" },
    { label: "Email", href: "mailto:hello@example.com", kind: "mail" },
  ],
  experience: [
    {
      period: "2024 - Now",
      role: "Independent product designer and creative developer",
    },
    {
      period: "2022 - 2024",
      role: "Frontend systems for early-stage SaaS teams",
    },
    {
      period: "2020 - 2022",
      role: "Brand sites, launch pages, and client portals",
    },
  ],
  about:
    "I work best where visual taste meets shipped product: launch pages, portfolio systems, dashboards, content tools, and brand moments that need to feel useful on day one.",
  contact: {
    label: "Email me",
    title: "Email me",
    eyebrow: "Start here",
    href: "mailto:hello@example.com",
    actionType: "email",
    variant: "contrast",
  },
  projects: [
    {
      title: "VocaFlow launch system",
      type: "SaaS interface",
      year: "2026",
      image: "/prebuilt/dev/work3.png",
    },
    {
      title: "Northstar mobile studio",
      type: "Product design",
      year: "2025",
      image: "/prebuilt/designer/work2.jpeg",
    },
    {
      title: "Portfolio operations kit",
      type: "No-code builder",
      year: "2026",
      image: "/prebuilt/dev/work2.png",
    },
  ],
  skills: ["Next.js", "Figma", "Framer", "Supabase", "TypeScript", "Webflow"],
  availability: {
    title: "Open for February",
    body: "Portfolio sprint, product story, or conversion-focused landing page.",
    ctaLabel: "Send brief",
    href: "mailto:hello@example.com",
  },
  testimonial: {
    quote:
      "Mira made the portfolio feel like a product, not a pile of case studies. Our leads finally understood what we do.",
    cite: "Amal R. / Studio founder",
  },
};
