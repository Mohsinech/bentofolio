"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Copy,
  Download,
  GitFork,
  Play,
  Star,
} from "lucide-react";
import type { BlockContent, BlockLayout } from "@/app/lib/types";
import { getCompanyLogo } from "@/app/lib/company-logos";
import { getTechIconUrl } from "@/app/lib/tech-icons";
import {
  hasValidCoordinates,
  mapEmbedUrl,
  normalizeHref,
} from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import styles from "./bento.module.css";

// ---------------------------------------------------------------------------
// Small shared pieces
// ---------------------------------------------------------------------------

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function Label({ children }: { children: ReactNode }) {
  return <span className={styles.label}>{children}</span>;
}

function ExternalLink({
  href,
  className,
  children,
  label,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  const url = normalizeHref(href);
  if (!url) return <span className={className}>{children}</span>;
  const external = !url.startsWith("mailto:");
  return (
    <a
      href={url}
      className={className}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function initials(value: string): string {
  return (
    value
      .split(/[\s@./_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "•"
  );
}

// Company / school / product logo with a letter fallback when there is no
// image or it fails to load (favicon services sometimes return nothing).
export function Logo({ src, name, size = 30 }: { src?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const url = !failed && src ? src : null;
  return (
    <span className={styles.logo} style={{ width: size, height: size }} aria-hidden="true">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}

function companyLogo(explicit?: string, name?: string): string | null {
  if (text(explicit)) return text(explicit);
  return name && text(name) ? getCompanyLogo(name) : null;
}

type Size = { w: number; h: number };
const isSmall = (s: Size) => s.w === 1 && s.h === 1;
const isTall = (s: Size) => s.h >= 2;
const isWide = (s: Size) => s.w >= 4;

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

function IdentityBlock({
  data,
  size,
  avatarUrl,
}: {
  data: Extract<BlockContent, { type: "identity" }>["data"];
  size: Size;
  avatarUrl?: string | null;
}) {
  const name = text(data.name);
  const headline = text(data.headline) || text(data.title);
  const portrait =
    data.portraitType === "none"
      ? null
      : data.portraitType === "memoji"
        ? text(data.avatar) || null
        : text(data.avatar) || avatarUrl || null;
  const status = text(data.availability);
  const meta = [text(data.location), text(data.website)].filter(Boolean);
  const showBio = (isTall(size) || isWide(size)) && text(data.bio);

  return (
    <div className={`${styles.identity} ${isWide(size) && isTall(size) ? styles.identityHero : ""}`}>
      <div className={styles.identityTop}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.avatar} src={portrait} alt={name ? `${name}` : "Profile picture"} />
        ) : (
          <span className={styles.avatar} aria-hidden="true">
            {initials(name)}
          </span>
        )}
        {status && (
          <span className={styles.statusChip}>
            <span className={styles.pulseDot} />
            {status}
          </span>
        )}
      </div>
      <div className={styles.identityBody}>
        <h1 className={styles.name}>{name || "Your name"}</h1>
        {headline && <p className={styles.headline}>{headline}</p>}
        {showBio && <p className={styles.bio}>{text(data.bio)}</p>}
        {meta.length > 0 && <span className={styles.meta}>{meta.join(" · ")}</span>}
      </div>
    </div>
  );
}

function localTime(timezone?: string): string | null {
  const zone = text(timezone).split(/[\s·]/)[0];
  if (!zone || !zone.includes("/")) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date());
  } catch {
    return null;
  }
}

function MapBlock({ data, editing }: { data: Extract<BlockContent, { type: "map" }>["data"]; editing: boolean }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(localTime(data.timezone));
    const timer = window.setInterval(() => setTime(localTime(data.timezone)), 60_000);
    return () => window.clearInterval(timer);
  }, [data.timezone]);

  const coords = hasValidCoordinates(data);
  const showMap = coords && data.variant !== "text";
  const zoom = typeof data.zoom === "number" && data.zoom > 0 ? data.zoom : 11;

  return (
    <div className={`${styles.map} ${showMap ? "" : styles.mapText}`}>
      {showMap ? (
        <iframe
          className={styles.mapFrame}
          src={mapEmbedUrl(data.lat, data.lng, zoom)}
          title={`Map of ${text(data.location)}`}
          loading="lazy"
          tabIndex={editing ? -1 : 0}
          style={editing ? { pointerEvents: "none" } : undefined}
        />
      ) : (
        <div className={styles.mapPattern} aria-hidden="true" />
      )}
      <div className={styles.mapChip}>
        <span>{text(data.location) || "Somewhere"}</span>
        {time && <span className={styles.mono}>{time}</span>}
      </div>
    </div>
  );
}

function Chips({ items }: { items: { name: string; icon?: string; url?: string }[] }) {
  return (
    <div className={styles.chips}>
      {items
        .filter((item) => text(item.name))
        .map((item, index) => {
          const icon = text(item.icon).startsWith("http") ? text(item.icon) : getTechIconUrl(item.name);
          return (
            <span key={`${item.name}-${index}`} className={styles.chip}>
              {icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} alt="" aria-hidden="true" loading="lazy" />
              )}
              {item.name}
            </span>
          );
        })}
    </div>
  );
}

function SkillsBlock({ heading, items }: { heading: string; items: { name: string; icon?: string }[] }) {
  return (
    <div className={styles.stack}>
      <Label>{heading}</Label>
      <Chips items={items} />
    </div>
  );
}

function periodOf(item: { period?: string; startDate?: string; endDate?: string; isCurrent?: boolean }) {
  if (text(item.period)) return text(item.period);
  const start = text(item.startDate);
  const end = item.isCurrent ? "Now" : text(item.endDate);
  return [start, end].filter(Boolean).join(" — ");
}

function TimelineRows({
  rows,
  compact,
}: {
  rows: { key: string; period: string; title: string; sub: string; logo: string | null; logoName: string; href?: string }[];
  compact: boolean;
}) {
  return (
    <ol className={styles.rows}>
      {rows.map((row) => (
        <li key={row.key} className={styles.row}>
          {!compact && <span className={styles.period}>{row.period}</span>}
          <Logo src={row.logo} name={row.logoName} />
          <div className={styles.rowText}>
            <span className={styles.rowTitle}>{row.title}</span>
            <span className={styles.rowSub}>{compact ? [row.sub, row.period].filter(Boolean).join(" · ") : row.sub}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ExperienceBlock({ data, size }: { data: Extract<BlockContent, { type: "experience" }>["data"]; size: Size }) {
  const limit = isTall(size) ? 4 : isSmall(size) ? 1 : 2;
  const rows = (data.items || [])
    .filter((item) => text(item.role) || text(item.company))
    .slice(0, limit)
    .map((item, index) => ({
      key: `${item.company}-${item.role}-${index}`,
      period: periodOf(item),
      title: text(item.role) || text(item.company),
      sub: text(item.role) ? text(item.company) : "",
      logo: companyLogo(item.logo, item.companyUrl || item.company),
      logoName: text(item.company) || text(item.role),
    }));
  return (
    <div className={styles.stack}>
      <Label>{text(data.heading) || "Work experience"}</Label>
      <TimelineRows rows={rows} compact={size.w < 2} />
    </div>
  );
}

function EducationBlock({ data, size }: { data: Extract<BlockContent, { type: "education" }>["data"]; size: Size }) {
  const limit = isTall(size) ? 4 : isSmall(size) ? 1 : 2;
  const rows = (data.items || [])
    .filter((item) => text(item.school) || text(item.degree))
    .slice(0, limit)
    .map((item, index) => {
      const school = text(item.school) || text(item.institution);
      return {
        key: `${school}-${item.degree}-${index}`,
        period: periodOf(item),
        title: text(item.degree) || school,
        sub: text(item.degree) ? school : "",
        logo: companyLogo(item.logo, item.institutionUrl || school),
        logoName: school || text(item.degree),
      };
    });
  return (
    <div className={styles.stack}>
      <Label>{text(data.heading) || text(data.title) || "Education"}</Label>
      <TimelineRows rows={rows} compact={size.w < 2} />
    </div>
  );
}

function WorkBlock({ data, size, editing }: { data: Extract<BlockContent, { type: "work" }>["data"]; size: Size; editing: boolean }) {
  const projects = (data.items || []).filter((item) => text(item.title));
  const count = isWide(size) ? 3 : 1;
  const shown = projects.slice(0, count);

  return (
    <div className={`${styles.work} ${isWide(size) ? styles.workRow : ""} ${isTall(size) ? styles.workTall : ""}`}>
      {shown.map((project, index) => (
        <ExternalLink
          key={`${project.title}-${index}`}
          href={editing ? undefined : project.url}
          className={styles.project}
        >
          <span className={styles.projectImage}>
            {text(project.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.image} alt="" loading="lazy" />
            ) : (
              <span className={styles.projectPlaceholder}>{initials(project.title)}</span>
            )}
          </span>
          <span className={styles.projectCaption}>
            <span className={styles.projectTitle}>{project.title}</span>
            <span className={styles.projectMeta}>
              {[project.category, project.year].filter((v) => text(v)).join(" · ")}
              {text(project.client) && (
                <>
                  {" · "}
                  <Logo src={getCompanyLogo(project.client)} name={project.client} size={16} />
                  {project.client}
                </>
              )}
            </span>
          </span>
        </ExternalLink>
      ))}
      {!isWide(size) && projects.length > 1 && <span className={styles.moreBadge}>+{projects.length - 1}</span>}
    </div>
  );
}

function ReposBlock({ data, size }: { data: Extract<BlockContent, { type: "projects" }>["data"]; size: Size }) {
  const repos = (data.items || []).filter((item) => text(item.name)).slice(0, isTall(size) ? 4 : 2);
  return (
    <div className={styles.stack}>
      <Label>Repositories</Label>
      <ul className={styles.rows}>
        {repos.map((repo) => (
          <li key={repo.name} className={styles.row}>
            <div className={styles.rowText}>
              <ExternalLink href={repo.url} className={styles.rowTitle}>
                {repo.name}
              </ExternalLink>
              {text(repo.description) && <span className={styles.rowSub}>{repo.description}</span>}
            </div>
            <span className={styles.repoStats}>
              {text(repo.language) && (
                <span>
                  <i style={{ background: text(repo.languageColor) || "var(--bento-accent)" }} />
                  {repo.language}
                </span>
              )}
              <span>
                <Star size={12} aria-hidden="true" /> {repo.stars ?? 0}
              </span>
              <span>
                <GitFork size={12} aria-hidden="true" /> {repo.forks ?? 0}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function compactNumber(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function GitHubBlock({ data, size }: { data: Extract<BlockContent, { type: "github" }>["data"]; size: Size }) {
  const stats = [
    { label: "repos", value: data.publicRepos },
    { label: "followers", value: data.followers },
    { label: "stars", value: data.totalStars },
  ].filter((stat) => typeof stat.value === "number");
  const profileUrl = text(data.profileUrl) || (text(data.username) ? `https://github.com/${text(data.username)}` : "");

  return (
    <div className={styles.stack}>
      <div className={styles.spread}>
        <Label>{text(data.eyebrow) || "GitHub"}</Label>
        <ExternalLink href={profileUrl} className={styles.inlineLink}>
          @{text(data.username)} <ArrowUpRight size={13} aria-hidden="true" />
        </ExternalLink>
      </div>
      {!isSmall(size) && text(data.bio) && data.showBio !== false && <p className={styles.bodySmall}>{data.bio}</p>}
      <div className={styles.statRow}>
        {(isSmall(size) ? stats.slice(0, 1) : stats).map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{compactNumber(stat.value)}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X",
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
  instagram: "Instagram",
  dribbble: "Dribbble",
  behance: "Behance",
  tiktok: "TikTok",
  facebook: "Facebook",
  threads: "Threads",
  website: "Website",
  email: "Email",
  other: "Link",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#111110",
  x: "#111110",
  linkedin: "#0A66C2",
  github: "#111110",
  youtube: "#E5322D",
  instagram: "#C13584",
  dribbble: "#D9457F",
  behance: "#1769FF",
  tiktok: "#111110",
  facebook: "#1877F2",
  threads: "#111110",
  website: "#55544F",
  email: "#55544F",
  other: "#55544F",
};

function SocialBlock({ data, size }: { data: Extract<BlockContent, { type: "social" }>["data"]; size: Size }) {
  const links = (data.items || []).filter((item) => normalizeHref(item.url));
  const iconsOnly = isSmall(size) || data.variant === "icons";
  return (
    <div className={styles.stack}>
      <Label>{text(data.heading) || "Elsewhere"}</Label>
      {iconsOnly ? (
        <div className={styles.socialIcons}>
          {links.map((item, index) => (
            <ExternalLink
              key={`${item.platform}-${index}`}
              href={item.platform === "email" && !item.url.includes(":") ? `mailto:${item.url}` : item.url}
              className={styles.socialIcon}
              label={PLATFORM_LABELS[item.platform] || "Link"}
            >
              <span style={{ background: PLATFORM_COLORS[item.platform] || "#55544F" }}>
                {(PLATFORM_LABELS[item.platform] || "L").slice(0, 2)}
              </span>
            </ExternalLink>
          ))}
        </div>
      ) : (
        <ul className={styles.linkList}>
          {links.slice(0, isTall(size) ? 8 : 3).map((item, index) => (
            <li key={`${item.platform}-${index}`}>
              <ExternalLink
                href={item.platform === "email" && !item.url.includes(":") ? `mailto:${item.url}` : item.url}
                className={styles.linkRow}
              >
                <span className={styles.platform}>
                  <span className={styles.platformIcon} style={{ background: PLATFORM_COLORS[item.platform] || "#55544F" }}>
                    {(PLATFORM_LABELS[item.platform] || "L").slice(0, 2)}
                  </span>
                  {PLATFORM_LABELS[item.platform] || "Link"}
                </span>
                <span className={styles.linkHandle}>{text(item.username)}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </ExternalLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CtaBlock({ data, editing }: { data: Extract<BlockContent, { type: "link" }>["data"]; editing: boolean }) {
  const [copied, setCopied] = useState(false);
  const variant = data.variant || "contrast";
  const title = text(data.title) || "Get in touch";
  const action = data.actionType || "link";
  const href =
    action === "email" || action === "copy-email"
      ? text(data.url).replace(/^mailto:/, "")
      : text(data.url);

  const body = (
    <>
      <div className={styles.spread}>
        <Label>{text(data.eyebrow) || "Start here"}</Label>
      </div>
      <div className={styles.ctaBottom}>
        <div className={styles.ctaText}>
          <span className={styles.ctaTitle}>{title}</span>
          {text(data.description) && <span className={styles.ctaDescription}>{data.description}</span>}
        </div>
        <span className={styles.ctaButton} aria-hidden="true">
          {action === "copy-email" ? (
            copied ? <Check size={17} /> : <Copy size={17} />
          ) : action === "download" ? (
            <Download size={17} />
          ) : (
            <ArrowUpRight size={18} />
          )}
        </span>
      </div>
    </>
  );

  const className = `${styles.cta} ${styles[`cta_${variant}`] || ""}`;

  if (editing) return <div className={className}>{body}</div>;

  if (action === "copy-email") {
    return (
      <button
        type="button"
        className={className}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          } catch {
            window.location.href = `mailto:${href}`;
          }
        }}
        aria-label={copied ? "Email copied" : `Copy ${href}`}
      >
        {body}
      </button>
    );
  }

  const url =
    action === "email"
      ? `mailto:${href}${text(data.emailSubject) ? `?subject=${encodeURIComponent(text(data.emailSubject))}` : ""}`
      : normalizeHref(href);

  return (
    <a
      href={url}
      className={className}
      target={action === "link" && data.openInNewTab !== false ? "_blank" : undefined}
      rel="noopener noreferrer"
      download={action === "download" ? "" : undefined}
    >
      {body}
    </a>
  );
}

function AvailabilityBlock({ data, editing }: { data: Extract<BlockContent, { type: "availability" }>["data"]; editing: boolean }) {
  const tone = data.status === "available" ? "on" : data.status === "busy" ? "busy" : "off";
  const headline = text(data.nextOpening) || text(data.message) || (tone === "on" ? "Available" : "Not available");
  const details = [text(data.rate), text(data.responseTime) && `reply in ${text(data.responseTime)}`].filter(Boolean);
  const contact = text(data.preferredContact);
  return (
    <div className={styles.stack}>
      <Label>Availability</Label>
      <div className={styles.availability}>
        <span className={`${styles.statusLine} ${styles[`status_${tone}`]}`}>
          <span className={styles.dot} />
          {headline}
        </span>
        {details.length > 0 && <span className={styles.bodySmall}>{details.join(" · ")}</span>}
        {contact && !editing && (
          <ExternalLink href={contact} className={styles.inlineLink}>
            {text(data.ctaLabel) || "Get in touch"} →
          </ExternalLink>
        )}
      </div>
    </div>
  );
}

function QuoteBlock({ data, size }: { data: Extract<BlockContent, { type: "quote" }>["data"]; size: Size }) {
  const role = [text(data.role), text(data.company)].filter(Boolean).join(", ");
  return (
    <figure className={styles.quote}>
      <Label>{text(data.eyebrow) || "Kind words"}</Label>
      <blockquote className={isSmall(size) ? styles.quoteSmall : undefined}>“{text(data.quote)}”</blockquote>
      <figcaption className={styles.quoteBy}>
        {text(data.avatar) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.quoteAvatar} src={data.avatar} alt="" />
        ) : null}
        <span className={styles.quoteWho}>
          <strong>{text(data.author)}</strong>
          {role && <span>{role}</span>}
        </span>
        {text(data.company) && <Logo src={companyLogo(data.companyLogo, data.company)} name={data.company!} size={24} />}
      </figcaption>
    </figure>
  );
}

function ResumeBlock({ data, editing }: { data: Extract<BlockContent, { type: "resume" }>["data"]; editing: boolean }) {
  const updated = text(data.lastUpdated) || text(data.updatedAt);
  return (
    <ExternalLink href={editing ? undefined : data.fileUrl} className={styles.resume}>
      <Label>{text(data.eyebrow) || "Resume"}</Label>
      <span className={styles.resumeBottom}>
        <span className={styles.ctaText}>
          <span className={styles.resumeTitle}>{text(data.buttonLabel) || text(data.title) || "Download CV"}</span>
          <span className={styles.mono}>{[text(data.fileName), updated].filter(Boolean).join(" · ") || "PDF"}</span>
        </span>
        <span className={styles.roundIcon} aria-hidden="true">
          <Download size={16} />
        </span>
      </span>
    </ExternalLink>
  );
}

function GalleryBlock({ data, size }: { data: Extract<BlockContent, { type: "gallery" }>["data"]; size: Size }) {
  const images = (data.images || []).filter((image) => normalizeHref(image.src) || text(image.src).startsWith("/"));
  const count = isSmall(size) ? 1 : isWide(size) ? 4 : isTall(size) ? 4 : 3;
  return (
    <div className={`${styles.gallery} ${styles[`gallery_${Math.min(images.length, count)}`] || ""}`}>
      {images.slice(0, count).map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${image.src}-${index}`} src={image.src} alt={text(image.alt)} loading="lazy" />
      ))}
      {text(data.title) && <span className={styles.floatingChip}>{data.title}</span>}
    </div>
  );
}

function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function YouTubeBlock({ data, editing }: { data: Extract<BlockContent, { type: "youtube" }>["data"]; editing: boolean }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(text(data.url));
  if (!id) return <div className={styles.stack}><Label>YouTube</Label></div>;

  if (playing && !editing) {
    return (
      <iframe
        className={styles.embedFrame}
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={text(data.title) || "YouTube video"}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className={styles.video}
      onClick={() => !editing && setPlaying(true)}
      aria-label={`Play ${text(data.title) || "video"}`}
      tabIndex={editing ? -1 : 0}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className={styles.playButton} aria-hidden="true">
        <Play size={20} fill="currentColor" />
      </span>
      {text(data.title) && <span className={styles.videoTitle}>{data.title}</span>}
    </button>
  );
}

function spotifyEmbed(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/);
  return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0` : null;
}

function SpotifyBlock({ data, editing }: { data: Extract<BlockContent, { type: "spotify" }>["data"]; editing: boolean }) {
  const embed = spotifyEmbed(text(data.spotifyUrl));
  if (embed && data.type === "embed") {
    return (
      <iframe
        className={styles.embedFrame}
        src={embed}
        title="Spotify"
        loading="lazy"
        allow="encrypted-media"
        style={editing ? { pointerEvents: "none" } : undefined}
        tabIndex={editing ? -1 : 0}
      />
    );
  }
  return (
    <ExternalLink href={editing ? undefined : data.spotifyUrl} className={styles.nowPlaying}>
      <span className={styles.spread}>
        <Label>Now playing</Label>
        <span className={styles.eq} aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      </span>
      <span className={styles.track}>
        {text(data.albumArt) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.albumArt} alt="" />
        ) : (
          <span className={styles.albumPlaceholder} />
        )}
        <span className={styles.ctaText}>
          <span className={styles.trackName}>{text(data.trackName) || "Listen on Spotify"}</span>
          {text(data.artistName) && <span className={styles.trackArtist}>{data.artistName}</span>}
        </span>
      </span>
    </ExternalLink>
  );
}

function InstagramBlock({ data, size }: { data: Extract<BlockContent, { type: "instagram" }>["data"]; size: Size }) {
  const handle = text(data.handle).replace(/^@?/, "@");
  return (
    <ExternalLink href={data.profileUrl} className={`${styles.instagram} ${isTall(size) ? styles.instagramTall : ""}`}>
      <span className={styles.stack}>
        <Label>Instagram</Label>
        <span className={styles.trackName}>{handle}</span>
        <span className={styles.bodySmall}>
          {[text(data.followers) && `${data.followers} followers`, text(data.posts) && `${data.posts} posts`]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      {text(data.image) && !isSmall(size) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.instagramImage} src={data.image} alt="" loading="lazy" />
      )}
    </ExternalLink>
  );
}

function formatMoney(value: number, currency?: string): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: text(currency) || "USD",
      maximumFractionDigits: value >= 10000 ? 0 : value % 1 === 0 ? 0 : 2,
      notation: value >= 100000 ? "compact" : "standard",
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString("en")}`;
  }
}

// Revenue trend: the line draws itself in, the area fades in under it, and the
// latest point pulses. Hovering a month shows its value.
function monthLabel(start: string | undefined, offset: number): string | null {
  const match = start?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + offset, 1));
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function RevenueChart({
  values,
  currency,
  label,
  start,
}: {
  values: number[];
  currency?: string;
  label: string;
  start?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const geometry = useMemo(() => {
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const points = values.map((value, index) => ({
      x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
      y: 92 - ((value - min) / span) * 80,
    }));
    const line = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    return { points, line, area: `${line} L100,100 L0,100 Z` };
  }, [values]);

  const last = geometry.points[geometry.points.length - 1];
  const hovered = hover !== null ? geometry.points[hover] : null;

  return (
    <div className={styles.chart} onMouseLeave={() => setHover(null)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label}>
        <line x1="0" x2="100" y1="99.5" y2="99.5" className={styles.chartBase} vectorEffect="non-scaling-stroke" />
        <path d={geometry.area} className={styles.chartArea} />
        <path d={geometry.line} pathLength={1} className={styles.chartLine} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={styles.chartEnd} style={{ left: `${last.x}%`, top: `${last.y}%` }} />
      {hovered && hover !== null && (
        <>
          <span className={styles.chartCross} style={{ left: `${hovered.x}%` }} />
          <span className={styles.chartPoint} style={{ left: `${hovered.x}%`, top: `${hovered.y}%` }} />
          <span
            className={styles.chartTip}
            role="status"
            style={{
              left: `${hovered.x}%`,
              top: `${hovered.y}%`,
              transform: hovered.x > 75 ? "translate(-100%, -120%)" : hovered.x < 25 ? "translate(0, -120%)" : "translate(-50%, -120%)",
            }}
          >
            {monthLabel(start, hover) && <span className={styles.chartTipMonth}>{monthLabel(start, hover)}</span>}
            {formatMoney(values[hover], currency)}
          </span>
        </>
      )}
      <div className={styles.chartHits}>
        {values.map((_, index) => (
          <span key={index} onMouseEnter={() => setHover(index)} />
        ))}
      </div>
    </div>
  );
}

function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run || typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run]);
  return value;
}

function SaaSBlock({ data, size, editing }: { data: Extract<BlockContent, { type: "saas" }>["data"]; size: Size; editing: boolean }) {
  const revenue = (data.revenue || []).filter((v) => typeof v === "number" && Number.isFinite(v));
  const mrr = typeof data.mrr === "number" && Number.isFinite(data.mrr) ? data.mrr : revenue[revenue.length - 1] ?? 0;
  const shown = useCountUp(mrr, !editing);
  const prev = revenue.length >= 2 ? revenue[revenue.length - 2] : null;
  const growth = prev && prev > 0 ? ((revenue[revenue.length - 1] - prev) / prev) * 100 : null;
  const name = text(data.name) || "My product";
  const strip = isWide(size) && !isTall(size);

  return (
    <div className={`${styles.saas} ${strip ? styles.saasStrip : ""}`}>
      <div className={styles.saasHead}>
        <Logo src={companyLogo(data.logo, data.url)} name={name} size={36} />
        <div className={styles.ctaText}>
          <span className={styles.rowTitle}>{name}</span>
          {text(data.tagline) && <span className={styles.rowSub}>{data.tagline}</span>}
        </div>
        {!strip && text(data.url) && (
          <ExternalLink href={editing ? undefined : data.url} className={styles.pillLink}>
            {text(data.url).replace(/^https?:\/\//, "").replace(/\/$/, "")} <ArrowUpRight size={12} aria-hidden="true" />
          </ExternalLink>
        )}
      </div>
      <div className={styles.saasNumbers}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>
            MRR
            {data.verified ? (
              <span
                className={styles.verifiedBadge}
                title={`Synced from ${data.verified.provider === "stripe" ? "Stripe" : "Lemon Squeezy"} on ${new Date(
                  data.verified.syncedAt
                ).toLocaleDateString("en", { dateStyle: "medium" })}`}
              >
                <BadgeCheck size={12} aria-hidden="true" />
                Verified · {data.verified.provider === "stripe" ? "Stripe" : "Lemon Squeezy"}
              </span>
            ) : mrr > 0 || revenue.length > 0 ? (
              <span className={styles.selfReported} title="Typed in by the owner, not connected to a payment provider">
                Self-reported
              </span>
            ) : null}
          </span>
          <span className={`${styles.statValue} ${styles.bigNumber}`}>{formatMoney(Math.round(shown), data.currency)}</span>
          {data.verified && typeof data.customers === "number" && data.customers > 0 && !strip && (
            <span className={styles.statLabel}>{data.customers.toLocaleString("en")} paying customers</span>
          )}
        </div>
        {growth !== null && (
          <span className={`${styles.growth} ${growth < 0 ? styles.growthDown : ""}`}>
            {growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
      {revenue.length >= 2 && (isTall(size) || strip) && (
        <RevenueChart
          values={revenue}
          currency={data.currency}
          start={data.revenueStart}
          label={`${name} revenue over the last ${revenue.length} months`}
        />
      )}
      {editing && revenue.length < 2 && (isTall(size) || strip) && (
        <span className={styles.chartEmpty}>
          Add at least 2 months in “Monthly revenue” to show the chart
        </span>
      )}
    </div>
  );
}

function StatsBlock({ data, size }: { data: Extract<BlockContent, { type: "stats" }>["data"]; size: Size }) {
  const items = (data.items || []).filter((item) => text(item.label) && text(item.value));
  const max = isSmall(size) ? 1 : isWide(size) ? 4 : isTall(size) ? 4 : 3;
  return (
    <div className={styles.stack}>
      <Label>{text(data.heading) || text(data.eyebrow) || "By the numbers"}</Label>
      <div className={`${styles.statGrid} ${isTall(size) && !isWide(size) ? styles.statGridTwo : ""}`}>
        {items.slice(0, max).map((item, index) => (
          <ExternalLink key={`${item.label}-${index}`} href={item.url} className={styles.statCell}>
            <span className={styles.statValue}>
              {text(item.prefix)}
              {item.value}
              {text(item.suffix)}
            </span>
            <span className={styles.statLabel}>{item.label}</span>
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}

function ServicesBlock({ data, size }: { data: Extract<BlockContent, { type: "services" }>["data"]; size: Size }) {
  const items = (data.items || []).filter((item) => text(item));
  return (
    <div className={styles.stack}>
      <Label>{text(data.title) || "Services"}</Label>
      <ol className={`${styles.services} ${isWide(size) ? styles.servicesRow : ""}`}>
        {items.slice(0, isTall(size) || isWide(size) ? 6 : 3).map((item, index) => (
          <li key={`${item}-${index}`}>
            <span className={styles.mono}>{String(index + 1).padStart(2, "0")}</span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function BentoBlockBody({
  layout,
  content,
  editing,
  avatarUrl,
}: {
  layout: BlockLayout;
  content: BlockContent;
  editing: boolean;
  avatarUrl?: string | null;
}) {
  const size = { w: layout.w, h: layout.h };
  switch (content.type) {
    case "identity":
      return <IdentityBlock data={content.data} size={size} avatarUrl={avatarUrl} />;
    case "map":
      return <MapBlock data={content.data} editing={editing} />;
    case "techstack":
      return <SkillsBlock heading={text(content.data.heading) || "Tools"} items={content.data.items || []} />;
    case "tools":
      return <SkillsBlock heading={text(content.data.heading) || text(content.data.title) || "Tools"} items={content.data.items || []} />;
    case "experience":
      return <ExperienceBlock data={content.data} size={size} />;
    case "education":
      return <EducationBlock data={content.data} size={size} />;
    case "work":
      return <WorkBlock data={content.data} size={size} editing={editing} />;
    case "projects":
      return <ReposBlock data={content.data} size={size} />;
    case "github":
      return <GitHubBlock data={content.data} size={size} />;
    case "social":
      return <SocialBlock data={content.data} size={size} />;
    case "link":
      return <CtaBlock data={content.data} editing={editing} />;
    case "availability":
      return <AvailabilityBlock data={content.data} editing={editing} />;
    case "quote":
      return <QuoteBlock data={content.data} size={size} />;
    case "resume":
      return <ResumeBlock data={content.data} editing={editing} />;
    case "gallery":
      return <GalleryBlock data={content.data} size={size} />;
    case "youtube":
      return <YouTubeBlock data={content.data} editing={editing} />;
    case "spotify":
      return <SpotifyBlock data={content.data} editing={editing} />;
    case "instagram":
      return <InstagramBlock data={content.data} size={size} />;
    case "saas":
      return <SaaSBlock data={content.data} size={size} editing={editing} />;
    case "stats":
      return <StatsBlock data={content.data} size={size} />;
    case "services":
      return <ServicesBlock data={content.data} size={size} />;
    default:
      return null;
  }
}

// Blocks whose content fills the card edge to edge (no padding).
export const FULL_BLEED_TYPES = new Set(["map", "work", "gallery", "youtube", "spotify"]);
// Blocks that draw their own surface (the CTA picks its colors).
export const OWN_SURFACE_TYPES = new Set(["link"]);
