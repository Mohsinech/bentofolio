"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Circle,
  Dribbble,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  Play,
  Send,
  Share2,
  Sun,
  Twitter,
  Youtube,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import type { BlockContent, ThemeId } from "@/app/lib/types";
import type { V2AdditionalBlock, V2PortfolioData, V2Project, V2SocialLink } from "./types";
import styles from "./V2PortfolioTemplate.module.css";

interface V2PortfolioTemplateProps {
  data: V2PortfolioData;
  mode?: "preview" | "public" | "editor";
  editor?: {
    selectedBlockId: string | null;
    onSelectBlock: (id: string) => void;
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled V2 block renderer: ${JSON.stringify(value)}`);
}

function LegacyBlockRenderer({ content, isPro }: { content: BlockContent; isPro: boolean }) {
  switch (content.type) {
    case "identity":
      return <IdentityBlock data={content.data} verified={isPro} />;
    case "map":
      return <MapBlock data={content.data} />;
    case "techstack":
      return <TechStackBlock data={content.data} />;
    case "experience":
      return <ExperienceBlock data={content.data} />;
    case "spotify":
      return <SpotifyBlock data={content.data} />;
    case "link":
      return <LinkBlock data={content.data} />;
    case "work":
      return <WorkBlock data={content.data} />;
    case "education":
      return <EducationBlock data={content.data} />;
    case "saas":
      return <SaaSBlock data={content.data} />;
    case "github":
      return <GitHubBlock data={content.data} />;
    case "projects":
      return <ProjectsBlock data={content.data} />;
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
    case "youtube":
      return <YouTubeBlock data={content.data} />;
    case "services":
      return <ServicesBlock data={content.data} />;
    case "tools":
      return <ToolsBlock data={content.data} />;
    case "stats":
      return <StatsBlock data={content.data} />;
    case "instagram":
      return <InstagramBlock data={content.data} />;
    default:
      return assertNever(content);
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "B";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${first}${second}`.toUpperCase();
}

function AnimatedCard({
  children,
  className = "",
  delay = 0,
  id,
  onClick,
  selected = false,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  onClick?: () => void;
  selected?: boolean;
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      id={id}
      className={`${styles.card} ${onClick ? styles.editorSelectable : ""} ${
        selected ? styles.editorSelected : ""
      } ${className}`}
      data-editor-selected={selected || undefined}
      style={style}
      onClickCapture={(event) => {
        if (!onClick) return;
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      initial={false}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay,
        ease: [0.2, 0, 0, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      {children}
    </motion.article>
  );
}

function MasonryCard({
  children,
  className = "",
  delay = 0,
  id,
  onClick,
  selected = false,
  span,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
  onClick?: () => void;
  selected?: boolean;
  span: 3 | 4 | 5 | 6 | 12;
}) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement | null>(null);
  const [rowSpan, setRowSpan] = useState(1);

  const measure = useCallback(() => {
    const card = cardRef.current;
    const grid = card?.parentElement;

    if (!card || !grid) return;

    const gridStyle = window.getComputedStyle(grid);
    const rowHeight = Number.parseFloat(gridStyle.gridAutoRows) || 8;
    const rowGap = Number.parseFloat(gridStyle.rowGap) || 10;
    const contentHeight = card.scrollHeight;
    const nextSpan = Math.max(1, Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap)));

    setRowSpan(nextSpan);
  }, []);

  useEffect(() => {
    const card = cardRef.current;

    if (!card) return;

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(card);

    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <motion.article
      ref={cardRef}
      id={id}
      className={`${styles.card} ${styles.masonryCard} ${onClick ? styles.editorSelectable : ""} ${
        selected ? styles.editorSelected : ""
      } ${className}`}
      data-editor-selected={selected || undefined}
      onClickCapture={(event) => {
        if (!onClick) return;
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      style={
        {
          "--bento-span": span,
          gridRowEnd: `span ${rowSpan}`,
        } as CSSProperties
      }
      initial={false}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay,
        ease: [0.2, 0, 0, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      {children}
    </motion.article>
  );
}

function SocialIcon({ link }: { link: V2SocialLink }) {
  const size = 16;

  switch (link.kind) {
    case "github":
      return <Github size={size} />;
    case "instagram":
      return <Instagram size={size} />;
    case "linkedin":
      return <Linkedin size={size} />;
    case "mail":
      return <Mail size={size} />;
    case "twitter":
      return <Twitter size={size} />;
    case "website":
      return <Globe size={size} />;
    default:
      if (link.platform === "YouTube") return <Youtube size={size} />;
      if (link.platform === "Dribbble") return <Dribbble size={size} />;
      if (link.platform === "Behance") return <span className={styles.socialGlyph}>Bē</span>;
      return <ArrowUpRight size={size} />;
  }
}

function socialAriaLabel(link: V2SocialLink, brandName: string) {
  if (link.kind === "mail") return `Email ${brandName}`;
  return `Visit ${brandName} on ${link.platform || link.label}`;
}

function SocialLinksCard({
  data,
  brandName,
  editorMode,
}: {
  data: NonNullable<V2PortfolioData["socialBlock"]>;
  brandName: string;
  editorMode: boolean;
}) {
  const variantClass =
    data.variant === "list"
      ? styles.socialBlockList
      : data.variant === "labels"
        ? styles.socialBlockLabels
        : styles.socialBlockIcons;

  return (
    <>
      {(data.eyebrow || data.heading) && (
        <div className={styles.socialBlockHeader}>
          {data.eyebrow && <span className={styles.kicker}>{data.eyebrow}</span>}
          {data.heading && <h2>{data.heading}</h2>}
        </div>
      )}
      {data.items.length > 0 ? (
        <div className={`${styles.socialBlockItems} ${variantClass}`} data-count={data.items.length}>
          {data.items.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              aria-label={socialAriaLabel(link, brandName)}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={editorMode ? (event) => event.preventDefault() : undefined}
            >
              <span className={styles.socialBlockIcon}>
                <SocialIcon link={link} />
              </span>
              {data.variant !== "icons" && (
                <span className={styles.socialBlockText}>
                  <strong>{link.platform || link.label}</strong>
                  {link.username && <small>{link.username}</small>}
                </span>
              )}
              {data.variant !== "icons" && link.external && <ExternalLink size={13} />}
            </a>
          ))}
        </div>
      ) : (
        editorMode && <p className={styles.draftMessage}>Add your social links</p>
      )}
    </>
  );
}

function CtaCardContent({
  contact,
}: {
  contact: NonNullable<V2PortfolioData["contact"]>;
}) {
  return (
    <div className={styles.contactText}>
      <h2>{contact.title}</h2>
    </div>
  );
}

function ProjectImage({ project, large = false }: { project: V2Project; large?: boolean }) {
  if (!project.image) {
    return (
      <div className={large ? styles.projectTextMediaLarge : styles.projectTextMedia}>
        <span>{project.type || "Project"}</span>
      </div>
    );
  }

  return (
    <img
      src={project.image}
      alt={`${project.title} preview`}
      loading={large ? "eager" : "lazy"}
    />
  );
}

function isSafeHref(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function formatHref(value?: string) {
  if (!isSafeHref(value)) return undefined;
  if (!value) return undefined;
  return /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
}

function CareerProofRenderer({ block, isPro }: { block: V2AdditionalBlock; isPro: boolean }) {
  const { content } = block;

  switch (content.type) {
    case "github": {
      const profileHref = formatHref(content.data.profileUrl) || (content.data.username ? `https://github.com/${content.data.username}` : undefined);
      const stats = [
        content.data.followers ? { label: "Followers", value: String(content.data.followers) } : undefined,
        content.data.publicRepos ? { label: "Repos", value: String(content.data.publicRepos) } : undefined,
        content.data.totalStars ? { label: "Stars", value: String(content.data.totalStars) } : undefined,
      ].filter(Boolean) as { label: string; value: string }[];
      const showAvatar = content.data.showAvatar !== false && Boolean(content.data.avatarUrl);
      const showBio = content.data.showBio !== false && Boolean(content.data.bio);
      const showStats = content.data.showStats !== false && stats.length > 0;

      return (
        <div className={styles.careerBlockInner}>
          <div className={styles.careerBlockHeader}>
            <span className={styles.kicker}>{content.data.eyebrow || "GitHub"}</span>
            <h2>{content.data.heading || content.data.displayName || content.data.username}</h2>
          </div>
          <div className={styles.githubProof}>
            {showAvatar && <img src={content.data.avatarUrl} alt="" />}
            <div>
              {content.data.username && <span>@{content.data.username}</span>}
              {showBio && <p>{content.data.bio}</p>}
            </div>
          </div>
          {showStats && (
            <div className={styles.metricStrip}>
              {stats.map((stat) => (
                <span key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </span>
              ))}
            </div>
          )}
          {profileHref && (
            <a className={styles.careerBlockAction} href={profileHref} target="_blank" rel="noopener noreferrer">
              View GitHub <ExternalLink size={13} />
            </a>
          )}
        </div>
      );
    }
    case "resume": {
      const href = formatHref(content.data.fileUrl);
      const updated = content.data.updatedAt || content.data.lastUpdated;
      return (
        <div className={styles.careerBlockInner}>
          <div className={styles.careerBlockHeader}>
            {content.data.eyebrow && <span className={styles.kicker}>{content.data.eyebrow}</span>}
            <h2>{content.data.title || "Resume"}</h2>
          </div>
          {content.data.description && <p>{content.data.description}</p>}
          {(content.data.fileName || updated) && (
            <p className={styles.fileMeta}>{[content.data.fileName, updated].filter(Boolean).join(" • ")}</p>
          )}
          {href && (
            <a className={styles.careerBlockAction} href={href} target="_blank" rel="noopener noreferrer">
              {content.data.buttonLabel || "Download resume"} <ExternalLink size={13} />
            </a>
          )}
        </div>
      );
    }
    case "education": {
      const items = content.data.items.filter((item) => item.school || item.institution || item.degree);
      return (
        <div className={styles.careerBlockInner}>
          <div className={styles.careerBlockHeader}>
            {content.data.eyebrow && <span className={styles.kicker}>{content.data.eyebrow}</span>}
            <h2>{content.data.heading || content.data.title || "Education"}</h2>
          </div>
          <div className={styles.careerList}>
            {items.map((item, index) => {
              const name = item.institution || item.school;
              const href = formatHref(item.institutionUrl);
              const period = item.period || [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" - ");
              return (
                <div key={`${name}-${item.degree}-${index}`} className={styles.careerListItem}>
                  <span className={styles.initialMark}>{getInitials(name || item.degree || "Education")}</span>
                  <div>
                    {href ? <a href={href}>{name}</a> : <strong>{name}</strong>}
                    <p>{[item.degree, item.field].filter(Boolean).join(" / ")}</p>
                    {period && <small>{period}</small>}
                    {item.description && <small>{item.description}</small>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "stats":
    case "saas": {
      const metrics =
        content.type === "stats"
          ? content.data.items
          : content.data.items?.length
            ? content.data.items
            : [
                content.data.mrr ? { label: "MRR", value: String(content.data.mrr), prefix: content.data.currency || "$" } : undefined,
                content.data.tagline ? { label: "Product", value: content.data.name, description: content.data.tagline, url: content.data.url } : undefined,
              ].filter(Boolean) as { label?: string; value?: string; prefix?: string; suffix?: string; description?: string; url?: string }[];
      const visibleMetrics = metrics.filter((item) => item.label || item.value);
      return (
        <div className={styles.careerBlockInner}>
          <div className={styles.careerBlockHeader}>
            <span className={styles.kicker}>{content.data.eyebrow || "Metrics"}</span>
            <h2>{content.data.heading || "Proof in numbers"}</h2>
          </div>
          <div className={styles.metricsGrid}>
            {visibleMetrics.map((metric, index) => {
              const href = formatHref(metric.url);
              const value = `${metric.prefix || ""}${metric.value || ""}${metric.suffix || ""}`;
              const body = (
                <>
                  {value && <strong>{value}</strong>}
                  {metric.label && <span>{metric.label}</span>}
                  {metric.description && <small>{metric.description}</small>}
                </>
              );
              return href ? (
                <a key={`${metric.label}-${index}`} href={href}>
                  {body}
                  <ExternalLink size={12} />
                </a>
              ) : (
                <div key={`${metric.label}-${index}`}>{body}</div>
              );
            })}
          </div>
        </div>
      );
    }
    default:
      return <LegacyBlockRenderer content={content} isPro={isPro} />;
  }
}

function LocationCardContent({
  location,
  editorMode,
}: {
  location: NonNullable<V2PortfolioData["locationBlock"]>;
  editorMode: boolean;
}) {
  const [mapFailed, setMapFailed] = useState(false);
  const isMapVariant = location.variant === "map" && Boolean(location.mapUrl) && !mapFailed;
  const coordinateLabel =
    typeof location.lat === "number" && typeof location.lng === "number"
      ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`
      : undefined;

  return (
    <div className={`${styles.locationCardInner} ${isMapVariant ? styles.locationMapVariant : styles.locationTextVariant}`}>
      {isMapVariant ? (
        <div className={styles.locationMapMedia}>
          <iframe
            src={location.mapUrl || ""}
            title={`Map of ${location.location}`}
            loading="lazy"
            tabIndex={editorMode ? -1 : 0}
            onError={() => setMapFailed(true)}
          />
          <div className={styles.locationMapTint} />
        </div>
      ) : (
        <div className={styles.locationStamp} aria-hidden="true">
          <MapPin size={34} />
          <span>{coordinateLabel || "Remote"}</span>
        </div>
      )}
      <div className={styles.locationInfo}>
        <span className={styles.kicker}>{location.eyebrow}</span>
        <div className={styles.locationHeadingRow}>
          <h2>{location.heading || location.location}</h2>
          {location.actionUrl && (
            <a
              href={location.actionUrl}
              aria-label="View location on map"
              onClick={editorMode ? (event) => event.preventDefault() : undefined}
            >
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
        {(location.timezone || location.description) && (
          <div className={styles.locationDetails}>
            {location.timezone && <span>{location.timezone}</span>}
            {location.description && <p>{location.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function additionalBlockSpan(block: V2AdditionalBlock): 3 | 4 | 6 | 12 {
  switch (block.type) {
    case "gallery":
    case "youtube":
    case "work":
    case "projects":
      return 6;
    case "education":
    case "experience":
    case "github":
    case "quote":
    case "resume":
    case "services":
    case "stats":
      return 4;
    default:
      return 3;
  }
}

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}) {
  return (
    <div className={styles.themeToggle} aria-label="Portfolio theme">
      <button
        type="button"
        className={theme === "light" ? styles.activeToggle : ""}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
      >
        <Sun size={14} />
        <span>Light</span>
      </button>
      <button
        type="button"
        className={theme === "dark" ? styles.activeToggle : ""}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>
    </div>
  );
}

export function V2PortfolioTemplate({ data, mode = "public", editor }: V2PortfolioTemplateProps) {
  const [theme, setTheme] = useState<ThemeId>(data.theme || "light");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const reduceMotion = useReducedMotion();
  const isEditorMode = mode === "editor";

  const initials = data.initials || getInitials(data.brandName);
  const socials = (data.socials || []).slice(0, 3);
  const projects = data.projects || [];
  const additionalBlocks = data.additionalBlocks || [];
  const projectCount = projects.length.toString().padStart(2, "0");
  const meta = [data.location, data.focus, data.response].filter(Boolean);
  const hasIdentity = mode === "preview" || data.hasIdentity !== false;
  const hasPortrait = Boolean(data.portrait?.src);
  const hasExperience = Boolean(data.experience?.length);
  const hasAbout = Boolean(data.about);
  const hasContact = Boolean(data.contact && (isEditorMode || data.contact.href || data.contact.copyValue));
  const hasProjects = projects.length > 0;
  const hasSkills = Boolean(data.skills?.length);
  const hasSocialBlock = Boolean(data.socialBlock && (isEditorMode || data.socialBlock.items.length > 0));
  const hasLocationBlock = Boolean(data.locationBlock?.location);
  const hasAvailability = Boolean(data.availability);
  const hasMotion = mode === "preview" || Boolean(data.motion?.enabled);
  const hasTestimonial = Boolean(data.testimonial?.quote);
  const hasContactSection =
    hasContact || hasAvailability;
  const hasLongIdentity =
    mode === "public" &&
    ((data.headline?.length || 0) > 70 || (data.bio?.length || 0) > 170);
  const secondaryItemCount = [
    hasAbout,
    hasContact,
    hasProjects,
    hasSkills,
    hasSocialBlock,
    hasLocationBlock,
    hasAvailability,
    hasMotion,
    hasTestimonial,
    additionalBlocks.length > 0,
  ].filter(Boolean).length;
  const shouldPackProofUtility =
    hasProjects && hasTestimonial && (hasAvailability || hasContact);

  function slotStyle(column: string): CSSProperties {
    return { gridColumn: column };
  }

  function identityStyle() {
    if (!hasPortrait && !hasExperience) return slotStyle("1 / span 12");
    if (!hasPortrait && hasExperience) return slotStyle("1 / span 10");
    return slotStyle("1 / span 7");
  }

  function portraitStyle() {
    return slotStyle(hasExperience ? "8 / span 3" : "8 / span 5");
  }

  function ctaSpan(): 4 | 6 {
    return secondaryItemCount === 1 ? 6 : 4;
  }

  function contactVariantClass() {
    switch (data.contact?.variant) {
      case "contrast":
        return styles.contactVariantContrast;
      case "accent":
        return styles.contactVariantAccent;
      case "outline":
        return styles.contactVariantOutline;
      default:
        return styles.contactVariantSurface;
    }
  }

  function skillsSpan(): 3 | 4 | 6 {
    if (secondaryItemCount === 1) return 6;
    return (data.skills?.length || 0) > 5 ? 4 : 3;
  }

  function socialSpan(): 3 | 4 | 6 {
    if (secondaryItemCount === 1) return 6;
    if (data.socialBlock?.variant === "list") return 6;
    if (data.socialBlock?.variant === "labels") return 4;
    return (data.socialBlock?.items.length || 0) > 3 ? 4 : 3;
  }

  function testimonialSpan(): 4 | 5 | 6 {
    const length = data.testimonial?.quote.length || 0;
    if (secondaryItemCount === 1 || length > 420) return 6;
    return length > 120 ? 5 : 4;
  }

  function projectSpan(index: number): 3 | 6 | 12 {
    if (projects.length === 1) return 6;
    if (projects.length === 2) return 6;
    return index === 0 ? 6 : 3;
  }

  const shareCurrentPage = async () => {
    const title = `${data.brandName} portfolio`;
    const url = typeof window !== "undefined" ? window.location.href : "";

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 1400);
    } catch {
      setShareStatus("idle");
    }
  };

  const portrait = useMemo(() => data.portrait, [data.portrait]);
  const editorCardProps = (slot: keyof NonNullable<V2PortfolioData["sourceBlocks"]>) => {
    const blockId = data.sourceBlocks?.[slot];

    if (!editor || !blockId) return {};

    return {
      onClick: () => editor.onSelectBlock(blockId),
      selected: editor.selectedBlockId === blockId,
    };
  };

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.frame}>
        <header className={styles.topNav} aria-label="Portfolio navigation">
          {isEditorMode ? (
          <div className={styles.brandMark}>
            <span>{initials}</span>
            <strong>{data.brandName}</strong>
          </div>
          ) : (
          <a className={styles.brandMark} href="#">
            <span>{initials}</span>
            <strong>{data.brandName}</strong>
          </a>
          )}

          {!isEditorMode && (hasProjects || hasExperience || hasContactSection) && (
            <nav className={styles.navLinks} aria-label="Portfolio sections">
              {hasProjects && <a href="#work">Work</a>}
              {hasExperience && <a href="#experience">Experience</a>}
              {hasContactSection && <a href="#contact">Contact</a>}
            </nav>
          )}

          {!isEditorMode && (
          <div className={styles.navControls}>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button
              type="button"
              className={styles.shareButton}
              onClick={shareCurrentPage}
              aria-label={shareStatus === "copied" ? "Portfolio link copied" : "Share portfolio"}
            >
              <Share2 size={14} />
              <span>{shareStatus === "copied" ? "Copied" : "Share"}</span>
            </button>
          </div>
          )}
        </header>

        <section className={styles.grid} aria-label={`${data.brandName} portfolio`}>
          {hasIdentity && (
          <AnimatedCard
            id={!hasContact && !hasAvailability && socials.length > 0 ? "contact" : undefined}
            className={`${styles.identity} ${hasLongIdentity ? styles.identityLong : ""}`}
            delay={0.02}
            style={identityStyle()}
            {...editorCardProps("identity")}
          >
            <div className={styles.identityTop}>
              <div className={styles.socials} aria-label="Social links">
                {socials.map((link) => (
                  <a key={`${link.label}-${link.href}`} href={link.href} aria-label={link.label}>
                    <SocialIcon link={link} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              {data.eyebrow && <p className={styles.intro}>{data.eyebrow}</p>}
              {data.greeting && <p className={styles.greeting}>{data.greeting}</p>}
              <h1>{data.headline || data.role || data.brandName}</h1>
              {data.bio && <p className={styles.bodyCopy}>{data.bio}</p>}
            </div>
            {meta.length > 0 && (
              <div className={styles.metaStrip}>
                {meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </AnimatedCard>
          )}

          {hasPortrait && (
          <AnimatedCard
            className={styles.portrait}
            delay={0.05}
            style={portraitStyle()}
            {...editorCardProps("portrait")}
          >
            {portrait?.src && (
              <img
                src={portrait.src}
                alt={portrait.alt}
                loading="eager"
                style={{ objectPosition: portrait.focalPoint || "center top" }}
              />
            )}
            {portrait?.label && <span className={styles.portraitBadge}>{portrait.label}</span>}
          </AnimatedCard>
          )}

          {hasExperience && (
          <AnimatedCard
            className={styles.experience}
            delay={0.08}
            id="experience"
            style={slotStyle("11 / span 2")}
            {...editorCardProps("experience")}
          >
            <span className={styles.kicker}>{data.experienceEyebrow || "CAREER"}</span>
            <strong className={styles.sectionTitle}>{data.experienceHeading || "Experience"}</strong>
            {data.experience && data.experience.length > 0 && (
              <div className={styles.timeline}>
                {data.experience.slice(0, 3).map((item) => (
                  <div className={styles.timelineItem} key={`${item.period}-${item.role}`}>
                    <span>{item.period}</span>
                    {item.companyUrl ? (
                      <a href={item.companyUrl}>{item.role}</a>
                    ) : (
                      <p>{item.role}</p>
                    )}
                    {item.description && <small>{item.description}</small>}
                  </div>
                ))}
              </div>
            )}
          </AnimatedCard>
          )}
        </section>

        {(hasAbout ||
          hasContact ||
          hasProjects ||
          hasSkills ||
          hasSocialBlock ||
          hasLocationBlock ||
          hasAvailability ||
          hasMotion ||
          hasTestimonial ||
          additionalBlocks.length > 0) && (
        <section className={styles.secondaryGrid} aria-label={`${data.brandName} portfolio blocks`}>
          {hasAbout && (
          <MasonryCard className={styles.about} delay={0.11} span={4} {...editorCardProps("about")}>
            <span className={styles.kicker}>Profile</span>
            {data.about && <p>{data.about}</p>}
          </MasonryCard>
          )}

          {hasContact && (
          <MasonryCard
            className={`${styles.contact} ${
              shouldPackProofUtility && !hasAvailability ? styles.utilityPackLeft : ""
            } ${contactVariantClass()}`}
            delay={0.14}
            id="contact"
            span={ctaSpan()}
            {...editorCardProps("contact")}
          >
            {data.contact && <CtaCardContent contact={data.contact} />}
          </MasonryCard>
          )}

          {hasSocialBlock && data.socialBlock && (
          <MasonryCard
            className={styles.socialBlock}
            delay={0.16}
            id={!hasContact && !hasAvailability ? "contact" : undefined}
            span={socialSpan()}
            {...editorCardProps("social")}
          >
            <SocialLinksCard
              data={data.socialBlock}
              brandName={data.brandName}
              editorMode={isEditorMode}
            />
          </MasonryCard>
          )}

          {hasProjects && (
          <MasonryCard
            className={styles.featuredLabel}
            delay={0.17}
            span={3}
          >
            <span>Selected projects</span>
            <strong>{projectCount}</strong>
          </MasonryCard>
          )}

          {hasProjects &&
            projects.slice(0, Math.min(projects.length, 3)).map((project, index) => (
              <MasonryCard
                key={`${project.title}-${index}`}
                className={
                  projects.length >= 3 && index > 0
                    ? index === 1
                      ? styles.projectMediumOne
                      : styles.projectMediumTwo
                    : `${styles.projectLarge} ${
                        projects.length >= 3 ? styles.projectLargePackRight : ""
                      }`
                }
                delay={0.2 + index * 0.03}
                id={index === 0 ? "work" : undefined}
                span={projectSpan(index)}
                {...editorCardProps("projects")}
              >
                {projects.length >= 3 && index > 0 ? (
                  <>
                    <ProjectImage project={project} />
                    <div className={styles.imageOverlay}>
                      {project.type && <span>{project.type}</span>}
                      <strong>{project.title}</strong>
                    </div>
                  </>
                ) : (
              <>
                <motion.div
                  className={styles.imageWrap}
                  initial={reduceMotion ? false : { clipPath: "inset(0 0 16% 0)" }}
                  animate={reduceMotion ? undefined : { clipPath: "inset(0 0 0% 0)" }}
                  transition={{ duration: 0.7, delay: 0.26, ease: [0.2, 0, 0, 1] }}
                >
                  <ProjectImage project={project} large />
                </motion.div>
                <div className={styles.projectCaption}>
                  <div>
                    {project.type && <span className={styles.kicker}>{project.type}</span>}
                    <h2>{project.title}</h2>
                  </div>
                  {project.year && <span>{project.year}</span>}
                </div>
              </>
                )}
              </MasonryCard>
            ))}

          {hasSkills && (
          <MasonryCard className={styles.tools} delay={0.29} span={skillsSpan()} {...editorCardProps("skills")}>
            <span className={styles.kicker}>{data.skillsEyebrow || "SKILLS"}</span>
            <strong className={styles.sectionTitle}>{data.skillsHeading || "Tools I use"}</strong>
            {data.skills && data.skills.length > 0 && (
              <div className={styles.toolList}>
                {data.skills.slice(0, 8).map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            )}
          </MasonryCard>
          )}

          {hasLocationBlock && data.locationBlock && (
          <MasonryCard
            className={styles.locationBlock}
            delay={0.31}
            span={data.locationBlock.description ? 4 : 3}
            {...editorCardProps("location")}
          >
            <LocationCardContent location={data.locationBlock} editorMode={isEditorMode} />
          </MasonryCard>
          )}

          {hasTestimonial && (
          <MasonryCard
            className={`${styles.testimonial} ${
              shouldPackProofUtility ? styles.proofPackRight : ""
            }`}
            delay={0.32}
            span={shouldPackProofUtility ? 6 : testimonialSpan()}
            {...editorCardProps("testimonial")}
          >
            <span className={styles.kicker}>Proof</span>
            {data.testimonial && (
              <>
                <blockquote>{data.testimonial.quote}</blockquote>
                {data.testimonial.cite && <cite>{data.testimonial.cite}</cite>}
              </>
            )}
          </MasonryCard>
          )}

          {hasAvailability && (
          <MasonryCard
            className={`${styles.availability} ${
              shouldPackProofUtility ? styles.utilityPackLeft : ""
            }`}
            delay={0.35}
            id={!hasContact ? "contact" : undefined}
            span={secondaryItemCount === 1 ? 6 : 3}
            {...editorCardProps("availability")}
          >
            {data.availability && (
              <>
                <div className={styles.availabilityTop}>
                  <span className={styles.statusDot} />
                  <span>{data.availability.title}</span>
                </div>
                {data.availability.body && <p>{data.availability.body}</p>}
                {data.availability.href ? (
                  <a href={data.availability.href} className={styles.availabilityCta}>
                    <Send size={14} />
                    {data.availability.ctaLabel || "Send brief"}
                  </a>
                ) : (
                  <span className={styles.availabilityCta}>
                    <Send size={14} />
                    {data.availability.ctaLabel || "Send brief"}
                  </span>
                )}
              </>
            )}
          </MasonryCard>
          )}

          {hasMotion && (
          <MasonryCard className={styles.playful} delay={0.38} span={3}>
            <span className={styles.kicker}>Live idea</span>
            <motion.button
              type="button"
              className={styles.playButton}
              whileTap={reduceMotion ? undefined : { scale: 0.94, rotate: -6 }}
              whileHover={reduceMotion ? undefined : { rotate: 2 }}
            >
              <Play size={16} fill="currentColor" />
              Preview motion
            </motion.button>
            <div className={styles.orbit} aria-hidden="true">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              />
              <Circle size={12} />
            </div>
          </MasonryCard>
          )}

          {additionalBlocks.map((block, index) => (
            <MasonryCard
              key={block.id}
              className={`${styles.legacyCard} ${
                ["github", "resume", "education", "stats", "saas"].includes(block.type)
                  ? styles.careerProofCard
                  : ""
              }`}
              delay={0.4 + index * 0.02}
              span={additionalBlockSpan(block)}
              onClick={editor ? () => editor.onSelectBlock(block.id) : undefined}
              selected={editor?.selectedBlockId === block.id}
            >
              <div className={styles.legacyCardHead}>
                <span className={styles.kicker}>{block.category}</span>
                <strong>{block.title}</strong>
              </div>
              {isEditorMode && block.isDraft ? (
                <div className={styles.draftCard}>
                  <strong>{block.draftMessage}</strong>
                  <p>This draft is visible only in the editor until it has publishable content.</p>
                </div>
              ) : (
                ["github", "resume", "education", "stats", "saas"].includes(block.type) ? (
                  <CareerProofRenderer block={block} isPro={Boolean(data.isPro)} />
                ) : (
                  <LegacyBlockRenderer content={block.content} isPro={Boolean(data.isPro)} />
                )
              )}
            </MasonryCard>
          ))}
        </section>
        )}

        {!isEditorMode && (mode === "preview" || !data.isPro) ? (
          <Link href="/" className={styles.madeWith} aria-label="Built with BentoFolio">
            <span className={styles.madeWithMark}>B</span>
            <span>Built with BentoFolio</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </main>
  );
}
