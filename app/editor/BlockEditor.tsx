"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Github,
  ImagePlus,
  Loader2,
  LocateFixed,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import NextImage from "next/image";
import { useEditor } from "@/app/lib/editor-context";
import { BlockContent, IdentityContent } from "@/app/lib/types";
import { importFromGitHub } from "@/app/lib/github";
import { getCompanyLogo } from "@/app/lib/company-logos";
import { DEFAULT_MEMOJI_AVATAR } from "@/app/lib/memoji";
import {
  techStack,
  getTechSuggestions,
  getTechByName,
  techCategories,
  getTechsByCategory,
  TechItem,
} from "@/app/lib/tech-stack";
import { getTechIconUrl } from "@/app/lib/tech-icons";
import styles from "./BlockEditor.module.css";
import { RevenueSource } from "./RevenueSource";

const PROFESSIONAL_TITLE_SUGGESTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Full-Stack Developer",
  "Product Designer",
  "UI/UX Designer",
  "Graphic Designer",
  "Digital Marketer",
  "Content Creator",
  "Freelancer",
  "Founder",
];

const EMPLOYMENT_TYPE_SUGGESTIONS = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Contract",
  "Internship",
  "Apprenticeship",
  "Volunteer",
  "Self-employed",
];

const SOCIAL_PLATFORM_SUGGESTIONS = [
  "GitHub",
  "LinkedIn",
  "Instagram",
  "X/Twitter",
  "Behance",
  "Dribbble",
  "YouTube",
  "TikTok",
  "Facebook",
  "Threads",
  "Website",
  "Email",
  "Other",
];

const TIMEZONE_SUGGESTIONS = [
  "Africa/Casablanca",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
];
const MEMOJI_OPTIONS = [
  DEFAULT_MEMOJI_AVATAR,
  "/momojis/1.png",
  "/momojis/2.png",
  "/momojis/3.png",
  "/momojis/4.png",
  "/momojis/5.png",
  "/momojis/6.png",
  "/momojis/7.png",
];

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return `mailto:${trimmed}`;
  if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const locationSuggestionCache = new Map<string, LocationSuggestion[]>();

function normalizeSocialPlatform(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "x/twitter" || normalized === "twitter" || normalized === "x") return "twitter";
  if (normalized === "other") return "other";
  return normalized.replace(/[^a-z]/g, "");
}

function isLikelySocialUrl(platform: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const normalizedPlatform = normalizeSocialPlatform(platform);
  if (normalizedPlatform === "email") {
    return /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(trimmed) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed);
  }

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeActionDestination(value: string, actionType?: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (actionType === "email" || actionType === "copy-email") {
    if (trimmed.startsWith("mailto:")) return trimmed;
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return `mailto:${trimmed}`;
    return trimmed;
  }
  return normalizeWebsiteInput(trimmed);
}

function isLikelyCtaDestination(actionType: string | undefined, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (actionType === "email" || actionType === "copy-email") {
    return /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(trimmed) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed);
  }

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function initialsForSkill(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatStructuredPeriod(item: {
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  period?: string;
}) {
  if (item.startDate || item.endDate || item.isCurrent) {
    return [item.startDate, item.isCurrent ? "Present" : item.endDate].filter(Boolean).join(" - ");
  }

  return item.period || "";
}


interface BlockEditorProps {
  embedded?: boolean;
}

export function BlockEditor({ embedded = false }: BlockEditorProps) {
  const { selectedBlockId, content, updateBlockContent, selectBlock } = useEditor();
  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;

  if (!selectedBlockId || !selectedContent) {
    if (embedded) return null;
    return (
      <div className={styles.empty}>
        <p>Select a block to edit</p>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className={styles.fieldsOnly}>
        <BlockFields key={selectedBlockId} blockId={selectedBlockId} content={selectedContent} onUpdate={updateBlockContent} />
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.title}>Edit {selectedContent.type}</span>
        <button type="button" className={styles.closeButton} onClick={() => selectBlock(null)} aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className={styles.fields}>
        <BlockFields key={selectedBlockId} blockId={selectedBlockId} content={selectedContent} onUpdate={updateBlockContent} />
      </div>
    </div>
  );
}

interface BlockFieldsProps {
  blockId: string;
  content: BlockContent;
  onUpdate: (id: string, content: BlockContent) => void;
}

// List helpers for blocks with items.
function patchAt<T>(list: T[] | undefined, index: number, patch: Partial<T>): T[] {
  const next = [...(list || [])];
  next[index] = { ...next[index], ...patch };
  return next;
}

function moveIn<T>(list: T[] | undefined, from: number, to: number): T[] {
  const next = [...(list || [])];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function removeAt<T>(list: T[] | undefined, index: number): T[] {
  return (list || []).filter((_, i) => i !== index);
}

function monthLabel(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return value || "";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
  );
}

function BlockFields({ blockId, content, onUpdate }: BlockFieldsProps) {
  const handleChange = (field: string, value: unknown) => {
    if (content.type === "identity" && field === "availabilityLabel") {
      onUpdate(blockId, {
        ...content,
        data: { ...content.data, eyebrow: value as string, availability: value as string },
      });
      return;
    }
    onUpdate(blockId, { ...content, data: { ...content.data, [field]: value } } as BlockContent);
  };

  switch (content.type) {
    case "identity":
      return <ProfileFields content={content.data} onChange={handleChange} />;

    case "map": {
      const data = content.data;
      const zoom = data.zoom || 12;
      return (
        <>
          <LocationAutocompleteField
            value={data.location}
            onChange={(value) => handleChange("location", value)}
            onSelect={(place) =>
              onUpdate(blockId, {
                ...content,
                data: {
                  ...data,
                  location: place.label,
                  heading: data.heading && data.heading !== data.location ? data.heading : place.label,
                  lat: place.lat,
                  lng: place.lng,
                  variant: data.variant || "map",
                },
              })
            }
            hint={data.lat && data.lng ? undefined : "Pick a suggestion to place it on the map."}
          />
          <Field
            label="Heading"
            value={data.heading || ""}
            onChange={(value) => handleChange("heading", value)}
            placeholder={data.location || "Casablanca, Morocco"}
          />
          <Field
            label="Short description"
            value={data.description || ""}
            onChange={(value) => handleChange("description", value)}
            placeholder="Available for remote work worldwide."
            multiline
            limit={120}
          />
          <TimezoneField value={data.timezone || ""} onChange={(value) => handleChange("timezone", value)} />
          <Segmented
            label="Show as"
            value={data.variant || (data.lat && data.lng ? "map" : "text")}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "map", label: "Map" },
              { value: "text", label: "Text only" },
            ]}
          />
          {(data.variant || "map") === "map" && (
            <Segmented
              label="Map area"
              value={zoom >= 11 ? "12" : zoom >= 7 ? "8" : "5"}
              onChange={(value) => handleChange("zoom", Number(value))}
              options={[
                { value: "12", label: "City" },
                { value: "8", label: "Region" },
                { value: "5", label: "Country" },
              ]}
            />
          )}
          <Field
            label="Eyebrow"
            value={data.eyebrow || ""}
            onChange={(value) => handleChange("eyebrow", value)}
            placeholder="Location"
          />
          <Field
            label="Link (optional)"
            value={data.actionUrl || ""}
            onChange={(value) => handleChange("actionUrl", value)}
            onBlur={(value) => handleChange("actionUrl", normalizeWebsiteInput(value))}
            placeholder="https://maps.google.com/…"
            type="url"
          />
        </>
      );
    }

    case "github":
      return (
        <GitHubImportEditor
          content={content.data}
          onChange={(githubContent) => onUpdate(blockId, { type: "github", data: githubContent })}
          onImport={(githubContent) => onUpdate(blockId, { type: "github", data: { ...content.data, ...githubContent } })}
        />
      );

    case "link": {
      const data = content.data;
      const actionType = data.actionType === "copy-email" ? "copy-email" : "email";
      return (
        <>
          <Field
            label="Main heading"
            value={data.title}
            onChange={(v) => handleChange("title", v)}
            placeholder="Let's collaborate"
            limit={48}
          />
          <Field
            label="Description"
            value={data.description || ""}
            onChange={(v) => handleChange("description", v)}
            placeholder="Tell me about your project and I'll reply within 24 hours."
            multiline
            limit={120}
          />
          <Field
            label="Email address"
            value={data.url.replace(/^mailto:/i, "")}
            onChange={(v) => handleChange("url", v)}
            onBlur={(value) => handleChange("url", normalizeActionDestination(value, actionType))}
            placeholder="hello@example.com"
            type="email"
            autoComplete="email"
            error={data.url && !isLikelyCtaDestination(actionType, data.url) ? "That doesn't look like an email address." : undefined}
          />
          <Segmented
            label="When clicked"
            value={actionType}
            onChange={(value) => handleChange("actionType", value)}
            options={[
              { value: "email", label: "Open email" },
              { value: "copy-email", label: "Copy address" },
            ]}
          />
          {actionType === "email" && (
            <>
              <Field
                label="Email subject"
                value={data.emailSubject || ""}
                onChange={(v) => handleChange("emailSubject", v)}
                placeholder="Project inquiry"
              />
              <Field
                label="Email body"
                value={data.emailBody || ""}
                onChange={(v) => handleChange("emailBody", v)}
                placeholder="Hi, I'd like to discuss…"
                multiline
              />
            </>
          )}
          <Field
            label="Eyebrow"
            value={data.eyebrow ?? ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="Start here"
          />
          <Field
            label="Button label"
            value={data.buttonLabel || ""}
            onChange={(v) => handleChange("buttonLabel", v)}
            placeholder="Start a project"
          />
          <Segmented
            label="Style"
            value={data.variant || "surface"}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "surface", label: "Plain" },
              { value: "contrast", label: "Dark" },
              { value: "accent", label: "Accent" },
              { value: "outline", label: "Outline" },
            ]}
          />
        </>
      );
    }

    case "work": {
      const items = content.data.items || [];
      return (
        <>
          <Field label="Title" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Recent work" />
          <Field label="Subtitle" value={content.data.subtitle || ""} onChange={(v) => handleChange("subtitle", v)} placeholder="Selected projects" />
          <ArrayField
            label="Projects"
            items={items}
            addLabel="Add project"
            summary={(item) => ({
              title: item.title,
              meta: [item.client, item.year].filter(Boolean).join(" · "),
              image: item.image,
            })}
            renderItem={(item, i) => (
              <>
                <Field compact label="Title" value={item.title || ""} onChange={(v) => handleChange("items", patchAt(items, i, { title: v }))} placeholder="Portfolio OS" />
                <div className={styles.row}>
                  <Field compact label="Client" value={item.client || ""} onChange={(v) => handleChange("items", patchAt(items, i, { client: v }))} placeholder="Northstar" />
                  <Field compact label="Year" value={item.year || ""} onChange={(v) => handleChange("items", patchAt(items, i, { year: v }))} placeholder="2026" inputMode="numeric" width="5.5rem" />
                </div>
                <FreeTextCombobox
                  compact
                  label="Category"
                  value={item.category || ""}
                  onChange={(v) => handleChange("items", patchAt(items, i, { category: v }))}
                  suggestions={["Product design", "Web app", "Brand identity", "Design system", "Development", "Mobile app"]}
                  placeholder="Product design"
                />
                <ImageUploadField label="Cover image" value={item.image || ""} onChange={(image) => handleChange("items", patchAt(items, i, { image }))} />
                <Field
                  compact
                  label="Link"
                  value={item.url || ""}
                  onChange={(v) => handleChange("items", patchAt(items, i, { url: v }))}
                  onBlur={(v) => handleChange("items", patchAt(items, i, { url: normalizeWebsiteInput(v) }))}
                  placeholder="https://…"
                  type="url"
                />
              </>
            )}
            onAdd={() => handleChange("items", [...items, { title: "", client: "", category: "", year: "", image: "", url: "" }])}
            onRemove={(i) => handleChange("items", removeAt(items, i))}
            onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
          />
          <Field
            label="Contact email (optional)"
            value={content.data.email || ""}
            onChange={(v) => handleChange("email", v)}
            placeholder="hello@example.com"
            type="email"
            autoComplete="email"
          />
        </>
      );
    }

    case "saas":
      return (
        <>
          <Field label="Name" value={content.data.name} onChange={(v) => handleChange("name", v)} placeholder="Vocaflow" />
          <Field label="Tagline" value={content.data.tagline} onChange={(v) => handleChange("tagline", v)} placeholder="Transcripts in one click" limit={80} />
          <Field
            label="Website"
            value={content.data.url}
            onChange={(v) => handleChange("url", v)}
            onBlur={(v) => handleChange("url", normalizeWebsiteInput(v))}
            placeholder="vocaflow.app"
            type="url"
          />
          <ImageUploadField label="Logo" value={content.data.logo || ""} onChange={(v) => handleChange("logo", v)} small />
          <RevenueSource
            blockId={blockId}
            hasManualNumbers={Boolean(content.data.mrr) || Boolean(content.data.totalRevenue) || (content.data.revenue || []).length > 0}
          >
            <div className={styles.row}>
              <Field
                label="MRR"
                value={content.data.mrr ? String(content.data.mrr) : ""}
                onChange={(v) => handleChange("mrr", Number(v.replace(/[^0-9.]/g, "")) || 0)}
                placeholder="4200"
                inputMode="decimal"
              />
              <SelectField
                label="Currency"
                value={content.data.currency || "USD"}
                options={["USD", "EUR", "GBP", "MAD", "INR", "CAD", "AUD"].map((c) => ({ value: c, label: c }))}
                onChange={(v) => handleChange("currency", v)}
                width="6.5rem"
              />
            </div>
            <Field
              label="Total revenue, all time (optional)"
              value={content.data.totalRevenue ? String(content.data.totalRevenue) : ""}
              onChange={(v) => handleChange("totalRevenue", v.trim() ? Number(v.replace(/[^0-9.]/g, "")) || undefined : undefined)}
              placeholder="52000"
              inputMode="decimal"
            />
            <RevenueField values={content.data.revenue || []} onChange={(values) => handleChange("revenue", values)} />
          </RevenueSource>
        </>
      );

    case "availability":
      return (
        <>
          <Segmented
            label="Status"
            value={content.data.status}
            options={[
              { value: "available", label: "Available" },
              { value: "busy", label: "Busy" },
              { value: "not-available", label: "Booked" },
            ]}
            onChange={(v) => handleChange("status", v)}
          />
          <Field label="Message" value={content.data.message} onChange={(v) => handleChange("message", v)} placeholder="Open for new projects" multiline limit={90} />
          <Field label="Next opening" value={content.data.nextOpening || ""} onChange={(v) => handleChange("nextOpening", v)} placeholder="2 spots this month" />
          <div className={styles.row}>
            <Field label="Response time" value={content.data.responseTime || ""} onChange={(v) => handleChange("responseTime", v)} placeholder="Within 24h" />
            <Field label="Rate" value={content.data.rate || ""} onChange={(v) => handleChange("rate", v)} placeholder="From $2k" />
          </div>
          <TimezoneField value={content.data.timezone || ""} onChange={(v) => handleChange("timezone", v)} />
          <Field
            label="How to reach you"
            value={content.data.preferredContact || ""}
            onChange={(v) => handleChange("preferredContact", v)}
            onBlur={(v) => handleChange("preferredContact", v.trim() ? normalizeWebsiteInput(v) : "")}
            placeholder="hello@example.com or cal.com/you"
          />
          <Field label="Button label" value={content.data.ctaLabel || ""} onChange={(v) => handleChange("ctaLabel", v)} placeholder="Start a project" />
          <Toggle label="Open to work" checked={content.data.forHire} onChange={(v) => handleChange("forHire", v)} />
        </>
      );

    case "techstack":
      return (
        <>
          <Field label="Heading" value={content.data.heading || ""} onChange={(v) => handleChange("heading", v)} placeholder="Tools I use" />
          <TechStackEditor items={content.data.items} onChange={(items) => handleChange("items", items)} />
          <Field label="Eyebrow" value={content.data.eyebrow || ""} onChange={(v) => handleChange("eyebrow", v)} placeholder="Skills" />
        </>
      );

    case "social": {
      const items = content.data.items;
      return (
        <>
          <ArrayField
            label="Links"
            items={items}
            addLabel="Add link"
            summary={(item) => ({
              title: SOCIAL_PLATFORM_SUGGESTIONS.find((name) => normalizeSocialPlatform(name) === item.platform) || item.platform || "Link",
              meta: item.username || item.url.replace(/^(https?:\/\/|mailto:)/i, ""),
            })}
            renderItem={(item, i) => (
              <>
                <Segmented
                  compact
                  label="Platform"
                  value={item.platform}
                  wrap
                  options={SOCIAL_PLATFORMS.map((p) => ({ value: p.value, label: p.label }))}
                  onChange={(value) => handleChange("items", patchAt(items, i, { platform: value as typeof item.platform }))}
                />
                <Field
                  compact
                  label={item.platform === "email" ? "Email" : "Link"}
                  value={item.url.replace(/^mailto:/i, "")}
                  onChange={(v) => handleChange("items", patchAt(items, i, { url: v }))}
                  onBlur={(v) => {
                    // A pasted profile link picks its platform.
                    const platform = guessPlatform(v) || item.platform;
                    handleChange("items", patchAt(items, i, { url: normalizeWebsiteInput(v), platform: platform as typeof item.platform }));
                  }}
                  placeholder={item.platform === "email" ? "hello@example.com" : "https://…"}
                  error={item.url && !isLikelySocialUrl(item.platform, item.url) ? "Enter a valid link or email address." : undefined}
                />
                <Field
                  compact
                  label="Label (optional)"
                  value={item.username || ""}
                  onChange={(v) => handleChange("items", patchAt(items, i, { username: v }))}
                  placeholder="@yourname"
                />
              </>
            )}
            onAdd={() =>
              handleChange(
                "items",
                items.some((item) => !item.url.trim()) ? items : [...items, { platform: "website" as const, url: "", username: "" }]
              )
            }
            onRemove={(i) => handleChange("items", removeAt(items, i))}
            onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
          />
          <Segmented
            label="Layout"
            value={content.data.variant || "icons"}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "icons", label: "Icons" },
              { value: "labels", label: "Labels" },
              { value: "list", label: "List" },
            ]}
          />
          <Field label="Heading" value={content.data.heading || ""} onChange={(v) => handleChange("heading", v)} placeholder="Elsewhere" />
        </>
      );
    }

    case "spotify":
      return (
        <Field
          label="Spotify link"
          value={content.data.spotifyUrl || ""}
          onChange={(v) => handleChange("spotifyUrl", v)}
          placeholder="https://open.spotify.com/…"
          type="url"
          hint="A track, playlist, album or artist link."
          error={
            content.data.spotifyUrl && !/open\.spotify\.com\/|spotify:/i.test(content.data.spotifyUrl)
              ? "That isn't a Spotify link."
              : undefined
          }
        />
      );

    case "experience": {
      const items = content.data.items || [];
      return (
        <>
          <Field label="Heading" value={content.data.heading || ""} onChange={(v) => handleChange("heading", v)} placeholder="Experience" />
          <ArrayField
            label="Roles"
            items={items}
            addLabel="Add role"
            summary={(item) => ({
              title: item.role || item.company,
              meta: [item.role ? item.company : "", formatStructuredPeriod({ ...item, startDate: monthLabel(item.startDate), endDate: monthLabel(item.endDate) })]
                .filter(Boolean)
                .join(" · "),
              image: item.logo || getCompanyLogo(item.company || "") || undefined,
            })}
            renderItem={(item, i) => {
              const update = (patch: Partial<typeof item>) => {
                const next = { ...item, ...patch };
                handleChange("items", patchAt(items, i, { ...patch, period: formatStructuredPeriod(next) }));
              };
              return (
                <>
                  <FreeTextCombobox
                    compact
                    label="Role"
                    value={item.role || ""}
                    onChange={(value) => handleChange("items", patchAt(items, i, { role: value }))}
                    suggestions={PROFESSIONAL_TITLE_SUGGESTIONS}
                    placeholder="Product designer"
                  />
                  <FreeTextCombobox
                    compact
                    label="Company"
                    value={item.company || ""}
                    onChange={(value) => handleChange("items", patchAt(items, i, { company: value }))}
                    suggestions={COMPANY_SUGGESTIONS}
                    placeholder="Figma, Upwork, Freelance…"
                    adornment={
                      item.logo || getCompanyLogo(item.company || "") ? (
                        <NextImage src={item.logo || getCompanyLogo(item.company || "") || ""} alt="" width={18} height={18} unoptimized />
                      ) : undefined
                    }
                  />
                  <div className={styles.row}>
                    <Field compact label="Start" type="month" value={item.startDate || ""} onChange={(v) => update({ startDate: v })} />
                    {item.isCurrent ? (
                      <div className={`${styles.field} ${styles.compact}`}>
                        <span className={styles.label}>End</span>
                        <span className={styles.staticValue}>Present</span>
                      </div>
                    ) : (
                      <Field compact label="End" type="month" value={item.endDate || ""} onChange={(v) => update({ endDate: v })} />
                    )}
                  </div>
                  <Toggle
                    label="I work here now"
                    checked={Boolean(item.isCurrent)}
                    onChange={(checked) => update({ isCurrent: checked, endDate: checked ? "" : item.endDate })}
                  />
                  {!item.startDate && item.period && (
                    <Field
                      compact
                      label="Period"
                      value={item.period}
                      onChange={(v) => handleChange("items", patchAt(items, i, { period: v }))}
                      hint="Pick start and end months above to replace this."
                    />
                  )}
                  <div className={styles.row}>
                    <FreeTextCombobox
                      compact
                      label="Type"
                      value={item.employmentType || ""}
                      onChange={(value) => handleChange("items", patchAt(items, i, { employmentType: value }))}
                      suggestions={EMPLOYMENT_TYPE_SUGGESTIONS}
                      placeholder="Full-time"
                    />
                    <Field compact label="Location" value={item.location || ""} onChange={(v) => handleChange("items", patchAt(items, i, { location: v }))} placeholder="Remote" />
                  </div>
                  <Field
                    compact
                    label="What you did"
                    value={item.description || ""}
                    onChange={(v) => handleChange("items", patchAt(items, i, { description: v }))}
                    placeholder="Led the redesign of…"
                    multiline
                    limit={200}
                  />
                  <Field
                    compact
                    label="Company website"
                    value={item.companyUrl || ""}
                    onChange={(v) => handleChange("items", patchAt(items, i, { companyUrl: v }))}
                    onBlur={(v) => handleChange("items", patchAt(items, i, { companyUrl: v.trim() ? normalizeWebsiteInput(v) : "" }))}
                    placeholder="company.com"
                    type="url"
                  />
                  <ImageUploadField label="Logo (if not found)" value={item.logo || ""} onChange={(logo) => handleChange("items", patchAt(items, i, { logo }))} small />
                </>
              );
            }}
            onAdd={() => handleChange("items", [...items, { company: "", role: "", period: "", logo: "" }])}
            onRemove={(i) => handleChange("items", removeAt(items, i))}
            onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
          />
          <Field label="Eyebrow" value={content.data.eyebrow || ""} onChange={(v) => handleChange("eyebrow", v)} placeholder="Career" />
        </>
      );
    }

    case "education": {
      const items = content.data.items || [];
      return (
        <>
          <Field label="Heading" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Education" />
          <ArrayField
            label="Schools"
            items={items}
            addLabel="Add school"
            summary={(item) => ({ title: item.school, meta: [item.degree, item.period].filter(Boolean).join(" · "), image: item.logo })}
            renderItem={(item, i) => (
              <>
                <Field compact label="School" value={item.school || ""} onChange={(v) => handleChange("items", patchAt(items, i, { school: v }))} placeholder="University of…" />
                <Field compact label="Degree or program" value={item.degree || ""} onChange={(v) => handleChange("items", patchAt(items, i, { degree: v }))} placeholder="BSc Computer Science" />
                <Field compact label="Years" value={item.period || ""} onChange={(v) => handleChange("items", patchAt(items, i, { period: v }))} placeholder="2021 – 2024" />
                <Field compact label="Note (optional)" value={item.description || ""} onChange={(v) => handleChange("items", patchAt(items, i, { description: v }))} placeholder="Graduated with honours" />
                <ImageUploadField label="Logo" value={item.logo || ""} onChange={(logo) => handleChange("items", patchAt(items, i, { logo }))} small />
              </>
            )}
            onAdd={() => handleChange("items", [...items, { school: "", degree: "", period: "", description: "", logo: "" }])}
            onRemove={(i) => handleChange("items", removeAt(items, i))}
            onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
          />
        </>
      );
    }

    case "projects":
      return <ProjectsEditor items={content.data.items || []} onChange={(items) => handleChange("items", items)} />;

    case "resume":
      return (
        <>
          <FileUploadField
            label="Your CV"
            value={content.data.fileUrl || ""}
            fileName={content.data.fileName}
            onChange={(fileUrl, fileName) =>
              onUpdate(blockId, { ...content, data: { ...content.data, fileUrl, fileName: fileName ?? content.data.fileName } })
            }
            accept=".pdf,.doc,.docx"
          />
          <Field label="Title" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Resume" />
          <Field label="Last updated" value={content.data.lastUpdated || ""} onChange={(v) => handleChange("lastUpdated", v)} placeholder="Jan 2026" />
          <Field label="Button label" value={content.data.buttonLabel || ""} onChange={(v) => handleChange("buttonLabel", v)} placeholder="Download CV" />
        </>
      );

    case "quote":
      return (
        <>
          <Field
            label="Quote"
            value={content.data.quote || ""}
            onChange={(v) => handleChange("quote", v)}
            placeholder="Mira shipped our new site in two weeks…"
            multiline
            rows={4}
            limit={220}
          />
          <Field label="Name" value={content.data.author || ""} onChange={(v) => handleChange("author", v)} placeholder="Sam Rivera" />
          <div className={styles.row}>
            <Field label="Role" value={content.data.role || ""} onChange={(v) => handleChange("role", v)} placeholder="Founder" />
            <Field label="Company" value={content.data.company || ""} onChange={(v) => handleChange("company", v)} placeholder="Northstar" />
          </div>
          <ImageUploadField label="Their photo" value={content.data.avatar || ""} onChange={(v) => handleChange("avatar", v)} small round />
          <Field
            label="Source link (optional)"
            value={content.data.sourceUrl || ""}
            onChange={(v) => handleChange("sourceUrl", v)}
            onBlur={(v) => handleChange("sourceUrl", v.trim() ? normalizeWebsiteInput(v) : "")}
            placeholder="linkedin.com/…"
            type="url"
          />
        </>
      );

    case "youtube":
      return (
        <>
          <Field
            label="YouTube link"
            value={content.data.url || ""}
            onChange={(v) => handleChange("url", v)}
            placeholder="https://youtube.com/watch?v=…"
            type="url"
            error={content.data.url && !/youtu(\.be|be\.com)/i.test(content.data.url) ? "That isn't a YouTube link." : undefined}
          />
          <Field label="Title" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Featured video" />
        </>
      );

    case "gallery": {
      const images = content.data.images || [];
      return (
        <>
          <Field label="Title" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Gallery" />
          <ArrayField
            label="Images"
            items={images}
            addLabel="Add image"
            summary={(item) => ({ title: item.alt || "Image", image: item.src })}
            renderItem={(item, i) => (
              <>
                <ImageUploadField label="Image" value={item.src || ""} onChange={(src) => handleChange("images", patchAt(images, i, { src }))} />
                <Field compact label="Caption" value={item.alt || ""} onChange={(v) => handleChange("images", patchAt(images, i, { alt: v }))} placeholder="Studio, 2026" />
              </>
            )}
            onAdd={() => handleChange("images", [...images, { src: "", alt: "" }])}
            onRemove={(i) => handleChange("images", removeAt(images, i))}
            onMove={(from, to) => handleChange("images", moveIn(images, from, to))}
          />
        </>
      );
    }

    case "instagram": {
      const setFromValue = (value: string, field: "handle" | "profileUrl") => {
        const username = extractInstagramUsername(value);
        if (!username) {
          handleChange(field, value);
          return;
        }
        onUpdate(blockId, {
          ...content,
          data: { ...content.data, handle: `@${username}`, profileUrl: `https://instagram.com/${username}` },
        });
      };
      return (
        <>
          <Field
            label="Instagram handle or link"
            value={content.data.handle || ""}
            onChange={(v) => setFromValue(v, "handle")}
            placeholder="@yourhandle"
            hint={content.data.profileUrl ? content.data.profileUrl.replace(/^https?:\/\//, "") : undefined}
          />
          <ImageUploadField label="Profile picture" value={content.data.image || ""} onChange={(v) => handleChange("image", v)} small round />
          <div className={styles.row}>
            <Field label="Followers" value={content.data.followers || ""} onChange={(v) => handleChange("followers", v)} placeholder="12.4k" />
            <Field label="Posts" value={content.data.posts || ""} onChange={(v) => handleChange("posts", v)} placeholder="186" />
          </div>
          <Field label="Engagement" value={content.data.engagement || ""} onChange={(v) => handleChange("engagement", v)} placeholder="8.7%" />
          <Field
            label="Featured post (optional)"
            value={content.data.featuredPostUrl || ""}
            onChange={(v) => handleChange("featuredPostUrl", v)}
            placeholder="https://instagram.com/p/…"
            type="url"
          />
        </>
      );
    }

    case "services": {
      const items = content.data.items || [];
      return (
        <>
          <Field label="Title" value={content.data.title || ""} onChange={(v) => handleChange("title", v)} placeholder="Services" />
          <ArrayField
            label="Services"
            items={items}
            addLabel="Add service"
            renderItem={(item, i) => (
              <input
                className={styles.input}
                value={item || ""}
                aria-label={`Service ${i + 1}`}
                onChange={(event) => {
                  const next = [...items];
                  next[i] = event.target.value;
                  handleChange("items", next);
                }}
                placeholder="Product design"
              />
            )}
            onAdd={() => handleChange("items", [...items, ""])}
            onRemove={(i) => handleChange("items", removeAt(items, i))}
            onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
          />
        </>
      );
    }

    case "tools": {
      const items = content.data.items || [];
      return (
        <>
          <Field
            label="Heading"
            value={content.data.heading || content.data.title || ""}
            onChange={(v) => onUpdate(blockId, { ...content, data: { ...content.data, heading: v, title: v } })}
            placeholder="Tools I use"
          />
          <TechStackEditor
            items={items.map((item) => ({ name: item.name, icon: item.icon || initialsForSkill(item.name), category: item.category }))}
            onChange={(next) =>
              // Keep each tool's other details (link, level) when it stays.
              handleChange(
                "items",
                next.map((entry) => ({ ...items.find((item) => item.name === entry.name), ...entry }))
              )
            }
          />
          <Field label="Eyebrow" value={content.data.eyebrow || ""} onChange={(v) => handleChange("eyebrow", v)} placeholder="Skills" />
        </>
      );
    }

    case "stats": {
      const items = content.data.items || [];
      return (
        <ArrayField
          label="Numbers"
          items={items}
          addLabel="Add number"
          renderItem={(item, i) => (
            <div className={styles.row}>
              <input
                className={styles.input}
                style={{ width: "6rem", flex: "none" }}
                value={item.value || ""}
                aria-label="Value"
                onChange={(event) => handleChange("items", patchAt(items, i, { value: event.target.value }))}
                placeholder="42"
              />
              <input
                className={styles.input}
                value={item.label || ""}
                aria-label="Label"
                onChange={(event) => handleChange("items", patchAt(items, i, { label: event.target.value }))}
                placeholder="Projects shipped"
              />
            </div>
          )}
          onAdd={() => handleChange("items", [...items, { value: "", label: "" }])}
          onRemove={(i) => handleChange("items", removeAt(items, i))}
          onMove={(from, to) => handleChange("items", moveIn(items, from, to))}
        />
      );
    }

    default:
      return <p className={styles.noFields}>This block has nothing to edit.</p>;
  }
}

function GitHubImportEditor({
  content,
  onChange,
  onImport,
}: {
  content: Extract<BlockContent, { type: "github" }>["data"];
  onChange: (content: Extract<BlockContent, { type: "github" }>["data"]) => void;
  onImport: (content: Extract<BlockContent, { type: "github" }>["data"]) => void;
}) {
  const [input, setInput] = useState(content.profileUrl || content.username || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setInput(content.profileUrl || content.username || "");
  }, [content.profileUrl, content.username]);

  const cleanUsername = input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/.*$/, "");

  const handleInputChange = (value: string) => {
    setInput(value);
    setMessage(null);

    const nextUsername = value
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\/.*$/, "");

    onChange({
      ...content,
      username: nextUsername,
      profileUrl: value.trim().startsWith("http") ? value.trim() : "",
    });
  };

  const handleImport = async () => {
    if (!cleanUsername || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const data = await importFromGitHub(cleanUsername);
      onImport(data.githubContent);
      setInput(data.githubContent.username);
      setMessage("GitHub profile imported");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "GitHub import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.githubImport}>
      <div className={styles.githubImportHeader}>
        <Github size={18} />
        <div>
          <strong>Import from GitHub</strong>
          <span>Fetch avatar, followers, repos, and stars automatically.</span>
        </div>
      </div>
      <label className={styles.label}>GitHub username</label>
      <input
        className={styles.input}
        value={input}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleImport();
          }
        }}
        placeholder="muhsench or github.com/muhsench"
        autoComplete="username"
      />
      <button
        type="button"
        className={styles.importButton}
        onClick={handleImport}
        disabled={!cleanUsername || loading}
      >
        {loading ? <Loader2 size={15} className={styles.inlineSpinner} /> : <Github size={15} />}
        {loading ? "Importing" : "Import from GitHub"}
      </button>
      {message && <p className={styles.importMessage}>{message}</p>}
    </div>
  );
}

function extractInstagramUsername(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(trimmed)) {
    return trimmed.replace(/^@/, "");
  }

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host !== "instagram.com") return "";

    const [username] = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => part.trim());

    if (
      !username ||
      ["p", "reel", "reels", "stories", "explore", "accounts"].includes(
        username.toLowerCase(),
      )
    ) {
      return "";
    }

    return /^@?[a-zA-Z0-9._]{1,30}$/.test(username)
      ? username.replace(/^@/, "")
      : "";
  } catch {
    return "";
  }
}


// ---------------------------------------------------------------------------
// Shared fields
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS: { value: string; label: string; hosts?: RegExp }[] = [
  { value: "github", label: "GitHub", hosts: /(^|\.)github\.com$/ },
  { value: "linkedin", label: "LinkedIn", hosts: /(^|\.)linkedin\.com$/ },
  { value: "twitter", label: "X", hosts: /(^|\.)(x\.com|twitter\.com)$/ },
  { value: "instagram", label: "Instagram", hosts: /(^|\.)instagram\.com$/ },
  { value: "youtube", label: "YouTube", hosts: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { value: "dribbble", label: "Dribbble", hosts: /(^|\.)dribbble\.com$/ },
  { value: "behance", label: "Behance", hosts: /(^|\.)behance\.net$/ },
  { value: "tiktok", label: "TikTok", hosts: /(^|\.)tiktok\.com$/ },
  { value: "threads", label: "Threads", hosts: /(^|\.)threads\.net$/ },
  { value: "facebook", label: "Facebook", hosts: /(^|\.)(facebook\.com|fb\.com)$/ },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
];

// A pasted link picks its platform (github.com/… → GitHub).
function guessPlatform(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(mailto:)?[^@\s/]+@[^@\s]+\.[^@\s]+$/i.test(trimmed)) return "email";
  try {
    const host = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, "");
    return SOCIAL_PLATFORMS.find((p) => p.hosts?.test(host))?.value ?? null;
  } catch {
    return null;
  }
}

const COMPANY_SUGGESTIONS = [
  "Freelance",
  "Self-employed",
  "Upwork",
  "Fiverr",
  "Google",
  "Meta",
  "Apple",
  "Microsoft",
  "Amazon",
  "Netflix",
  "Spotify",
  "Figma",
  "Notion",
  "Vercel",
  "Stripe",
  "Shopify",
  "Airbnb",
  "Uber",
  "Adobe",
  "Canva",
  "GitHub",
  "LinkedIn",
];

const AVAILABILITY_SUGGESTIONS = ["Available for work", "Open to freelance", "Open to full-time roles", "Booking next month", "Not taking work"];

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  // Suggested length: shows a counter, amber past it.
  limit?: number;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "url";
  // Smaller label, for fields inside a list item.
  compact?: boolean;
  width?: string;
}

function FieldShell({
  id,
  label,
  compact,
  width,
  hint,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  compact?: boolean;
  width?: string;
  hint?: string;
  error?: string;
  counter?: { length: number; limit: number };
  children: React.ReactNode;
}) {
  const over = counter ? counter.length > counter.limit : false;
  return (
    <div className={`${styles.field} ${compact ? styles.compact : ""}`} style={width ? { flex: `0 0 ${width}`, width } : undefined}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {counter && counter.length > counter.limit * 0.7 && (
          <span className={`${styles.counter} ${over ? styles.counterOver : ""}`} aria-live="polite">
            {counter.length}/{counter.limit}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className={styles.fieldError} id={`${id}-msg`}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.fieldHint} id={`${id}-msg`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  multiline,
  rows = 3,
  placeholder,
  limit,
  hint,
  error,
  autoComplete = "off",
  inputMode,
  compact,
  width,
}: FieldProps) {
  const id = useId();
  const shared = {
    id,
    className: `${multiline ? styles.textarea : styles.input} ${error ? styles.invalid : ""}`,
    value,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || hint ? `${id}-msg` : undefined,
    onBlur: onBlur ? (event: { target: { value: string } }) => onBlur(event.target.value) : undefined,
  };
  return (
    <FieldShell
      id={id}
      label={label}
      compact={compact}
      width={width}
      hint={hint}
      error={error}
      counter={limit ? { length: value.length, limit } : undefined}
    >
      {multiline ? (
        <textarea {...shared} rows={rows} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input
          {...shared}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          spellCheck={type === "text" ? undefined : false}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

// Two to four choices: one click, all visible.
function Segmented({
  label,
  value,
  options,
  onChange,
  compact,
  wrap,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  compact?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className={`${styles.field} ${compact ? styles.compact : ""}`}>
      <span className={styles.label}>{label}</span>
      <div className={`${styles.segmentControl} ${wrap ? styles.segmentWrap : ""}`} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={value === option.value ? styles.segmentControlActive : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  width?: string;
}

// Few options become a segmented control; more get a styled select.
function SelectField({ label, value, options, onChange, width }: SelectFieldProps) {
  const id = useId();
  if (options.length <= 4 && !width) {
    return <Segmented label={label} value={value} options={options} onChange={onChange} />;
  }
  return (
    <FieldShell id={id} label={label} width={width}>
      <div className={styles.selectWrap}>
        <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={styles.selectChevron} aria-hidden="true" />
      </div>
    </FieldShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className={styles.toggleField}>
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className={styles.toggleInput} />
      <span className={styles.toggleTrack} aria-hidden="true">
        <span className={styles.toggleThumb} />
      </span>
    </label>
  );
}

// Monthly revenue for the SaaS chart, oldest first. Kept as text while typing
// so "1200, " doesn't get rewritten under the cursor.
function RevenueField({ values, onChange }: { values: number[]; onChange: (values: number[]) => void }) {
  const [draft, setDraft] = useState(() => values.join(", "));
  const id = useId();
  return (
    <FieldShell
      id={id}
      label="Monthly revenue"
      hint="Oldest to newest, separated by commas. The chart shows from 2 months, on L and Wide sizes."
    >
      <textarea
        id={id}
        className={styles.textarea}
        value={draft}
        placeholder="1200, 1450, 1890, 2380, 3050"
        rows={2}
        inputMode="decimal"
        onChange={(event) => {
          setDraft(event.target.value);
          onChange(
            event.target.value
              .split(/[\s,;]+/)
              .map((part) => Number(part.replace(/[^0-9.-]/g, "")))
              .filter((n) => Number.isFinite(n) && n >= 0)
              .slice(-24)
          );
        }}
      />
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

function ProfileFields({ content, onChange }: { content: IdentityContent; onChange: (field: string, value: unknown) => void }) {
  const portraitType = content.portraitType || "memoji";
  const availability = content.eyebrow ?? content.availability ?? "";

  return (
    <>
      <Field label="Name" value={content.name || ""} onChange={(value) => onChange("name", value)} placeholder="Mira Chen" autoComplete="name" />
      <FreeTextCombobox
        label="Title"
        value={content.title || ""}
        onChange={(value) => onChange("title", value)}
        suggestions={PROFESSIONAL_TITLE_SUGGESTIONS}
        placeholder="Product designer"
      />
      <Field
        label="Headline"
        value={content.headline || ""}
        onChange={(value) => onChange("headline", value)}
        placeholder="Designing sharp products people remember."
        multiline
        rows={2}
        limit={90}
      />
      <Field
        label="Introduction"
        value={content.bio || ""}
        onChange={(value) => onChange("bio", value)}
        placeholder="What you do, who you help, and how you work."
        multiline
        rows={4}
        limit={240}
        hint="Shows on the larger profile sizes."
      />
      <Segmented
        label="Portrait"
        value={portraitType}
        options={[
          { value: "photo", label: "Photo" },
          { value: "memoji", label: "Memoji" },
          { value: "none", label: "None" },
        ]}
        onChange={(type) => {
          onChange("portraitType", type);
          if (type === "memoji" && !content.avatar) onChange("avatar", DEFAULT_MEMOJI_AVATAR);
        }}
      />
      {portraitType === "photo" && (
        <>
          <ImageUploadField label="Photo" value={content.avatar || ""} onChange={(value) => onChange("avatar", value)} small round />
          <Segmented
            label="Crop"
            value={content.portraitFocalPoint || "center top"}
            onChange={(value) => onChange("portraitFocalPoint", value)}
            options={[
              { value: "center top", label: "Top" },
              { value: "center center", label: "Center" },
              { value: "center bottom", label: "Bottom" },
            ]}
          />
        </>
      )}
      {portraitType === "memoji" && (
        <div className={styles.field}>
          <span className={styles.label}>Memoji</span>
          <div className={styles.memojiPicker} role="radiogroup" aria-label="Memoji">
            {MEMOJI_OPTIONS.map((src, index) => (
              <button
                key={src}
                type="button"
                role="radio"
                className={content.avatar === src ? styles.memojiActive : ""}
                onClick={() => onChange("avatar", src)}
                aria-label={`Memoji ${index + 1}`}
                aria-checked={content.avatar === src}
              >
                <NextImage src={src} alt="" width={40} height={40} />
              </button>
            ))}
          </div>
        </div>
      )}
      <FreeTextCombobox
        label="Status"
        value={availability}
        onChange={(value) => onChange("availabilityLabel", value)}
        suggestions={AVAILABILITY_SUGGESTIONS}
        placeholder="Available for work"
        hint="The green pill on your card. Leave empty to hide it."
        showAll
      />
      <LocationAutocompleteField
        value={content.location || ""}
        onChange={(value) => onChange("location", value)}
        onSelect={(place) => onChange("location", place.label)}
        placeholder="City, country"
      />
      <Field
        label="Email"
        value={(content.email || "").replace(/^mailto:/i, "")}
        onChange={(value) => onChange("email", value.trim())}
        placeholder="hello@example.com"
        type="email"
        autoComplete="email"
        hint="Shown on your card as a link."
        error={content.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(content.email.replace(/^mailto:/i, "")) ? "Check the address." : undefined}
      />
      <Field
        label="Website"
        value={content.website || ""}
        onChange={(value) => onChange("website", value)}
        onBlur={(value) => onChange("website", value.trim() ? normalizeWebsiteInput(value) : "")}
        placeholder="yourname.com"
        type="url"
        autoComplete="url"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Combobox: free text with suggestions in our own dropdown
// ---------------------------------------------------------------------------

interface FreeTextComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  hint?: string;
  compact?: boolean;
  // Small picture or icon inside the input, on the left.
  adornment?: React.ReactNode;
  // Show every suggestion on focus, not only matches.
  showAll?: boolean;
}

function FreeTextCombobox({ label, value, onChange, suggestions, placeholder, hint, compact, adornment, showAll }: FreeTextComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typed, setTyped] = useState(false);
  const id = useId();
  const listId = `${id}-list`;
  const query = value.trim().toLowerCase();
  const filtered = suggestions
    .filter((s) => (showAll && !typed) || !query || s.toLowerCase().includes(query))
    .filter((s) => s.toLowerCase() !== query || (showAll && !typed))
    .slice(0, 8);

  const choose = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setTyped(false);
    setActiveIndex(0);
  };

  return (
    <FieldShell id={id} label={label} compact={compact} hint={hint}>
      <div className={styles.autocompleteWrapper}>
        {adornment && <span className={styles.inputAdornment}>{adornment}</span>}
        <input
          id={id}
          className={`${styles.input} ${adornment ? styles.withAdornment : ""}`}
          role="combobox"
          aria-expanded={isOpen && filtered.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          value={value}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setTyped(true);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") return setIsOpen(false);
            if (!isOpen || filtered.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(filtered[activeIndex]);
            }
          }}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          placeholder={placeholder}
        />
        {isOpen && filtered.length > 0 && (
          <div className={styles.autocompleteDropdown} role="listbox" id={listId}>
            {filtered.map((suggestion, index) => (
              <button
                key={suggestion}
                id={`${listId}-${index}`}
                type="button"
                className={`${styles.autocompleteOption} ${index === activeIndex ? styles.autocompleteOptionActive : ""}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(suggestion)}
              >
                <span>{suggestion}</span>
                {suggestion === value && <Check size={13} aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Location: search places, or use where you are
// ---------------------------------------------------------------------------

interface LocationSuggestion {
  id: string;
  // Short: "Casablanca, Morocco".
  label: string;
  detail: string;
  lat: number;
  lng: number;
}

interface NominatimPlace {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

function toSuggestion(place: NominatimPlace): LocationSuggestion | null {
  const lat = Number(place.lat);
  const lng = Number(place.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const a = place.address || {};
  const town = a.city || a.town || a.village || a.municipality || place.name || place.display_name.split(",")[0];
  const country = a.country || "";
  const label = [town, country && country !== town ? country : ""].filter(Boolean).join(", ");
  const detail = [a.state || a.county, country].filter((part) => part && part !== town).join(", ");
  return { id: String(place.place_id), label: label || place.display_name, detail, lat, lng };
}

function LocationAutocompleteField({
  label = "Location",
  value,
  onChange,
  onSelect,
  placeholder = "Search a city",
  hint,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: LocationSuggestion) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Only search after the person types (not for a value loaded from the page).
  const [typed, setTyped] = useState(false);
  const id = useId();
  const listId = `${id}-list`;

  useEffect(() => {
    const query = value.trim();
    if (!typed || query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const cacheKey = query.toLowerCase();
    const cached = locationSuggestionCache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setOpen(cached.length > 0);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&featuretype=settlement&accept-language=en&q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const places = (await response.json()) as NominatimPlace[];
        const seen = new Set<string>();
        const mapped = places
          .map(toSuggestion)
          .filter((place): place is LocationSuggestion => Boolean(place))
          .filter((place) => (seen.has(place.label) ? false : (seen.add(place.label), true)))
          .slice(0, 5);
        locationSuggestionCache.set(cacheKey, mapped);
        setSuggestions(mapped);
        setOpen(true);
        setActiveIndex(0);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, typed]);

  function choose(place: LocationSuggestion) {
    onSelect(place);
    setTyped(false);
    setOpen(false);
    setActiveIndex(0);
    setMessage(null);
  }

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setMessage("Your browser can't share a location.");
      return;
    }
    setLocating(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10&accept-language=en&lat=${latitude}&lon=${longitude}`
          );
          const place = toSuggestion((await response.json()) as NominatimPlace);
          if (place) choose({ ...place, lat: latitude, lng: longitude });
          else setMessage("Couldn't name that place. Type your city instead.");
        } catch {
          setMessage("Couldn't look up your location. Type your city instead.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setMessage("Location access was blocked. Type your city instead.");
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  }

  const noResults = open && typed && !loading && suggestions.length === 0 && value.trim().length >= 2;

  return (
    <FieldShell id={id} label={label} hint={message || hint}>
      <div className={styles.autocompleteWrapper}>
        <MapPin size={15} className={styles.locationInputIcon} aria-hidden="true" />
        <input
          id={id}
          className={`${styles.input} ${styles.locationInput}`}
          type="text"
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setTyped(true);
            setActiveIndex(0);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Escape") return setOpen(false);
            if (!open || suggestions.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(suggestions[activeIndex]);
            }
          }}
          placeholder={placeholder}
        />
        {loading || locating ? (
          <Loader2 size={15} className={styles.locationSpinner} aria-label="Searching" />
        ) : (
          <button type="button" className={styles.inputAction} onClick={useCurrentLocation} title="Use my location" aria-label="Use my location">
            <LocateFixed size={15} />
          </button>
        )}
        {(open && suggestions.length > 0) || noResults ? (
          <div className={styles.autocompleteDropdown} id={listId} role="listbox">
            {suggestions.map((place, index) => (
              <button
                key={place.id}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`${styles.autocompleteOption} ${styles.placeOption} ${index === activeIndex ? styles.autocompleteOptionActive : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(place)}
              >
                <MapPin size={14} aria-hidden="true" />
                <span>
                  <strong>{place.label}</strong>
                  {place.detail && <small>{place.detail}</small>}
                </span>
              </button>
            ))}
            {noResults && <p className={styles.dropdownNote}>No places match. Keep typing, or leave it as written.</p>}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}

// ---------------------------------------------------------------------------
// Timezone: every IANA zone, plus a one-click "mine"
// ---------------------------------------------------------------------------

function allTimezones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? TIMEZONE_SUGGESTIONS;
  } catch {
    return TIMEZONE_SUGGESTIONS;
  }
}

function TimezoneField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [mine, setMine] = useState("");
  useEffect(() => {
    setMine(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  }, []);
  const zones = useMemo(allTimezones, []);
  return (
    <div className={styles.stack}>
      <FreeTextCombobox
        label="Timezone"
        value={value}
        onChange={onChange}
        suggestions={zones}
        placeholder="Africa/Casablanca"
        hint={value ? "Visitors see your local time." : undefined}
      />
      {mine && value !== mine && (
        <button type="button" className={styles.linkButton} onClick={() => onChange(mine)}>
          <Clock size={13} aria-hidden="true" /> Use mine ({mine.replace(/_/g, " ")})
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lists: collapsible items with a one-line summary
// ---------------------------------------------------------------------------

interface ArrayFieldProps<T> {
  label: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  // With a summary, each item is a row that opens to edit (one at a time).
  summary?: (item: T, index: number) => { title?: string; meta?: string; image?: string };
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
  addLabel?: string;
}

function ArrayField<T>({ label, items, renderItem, summary, onAdd, onRemove, onMove, addLabel = "Add item" }: ArrayFieldProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length === 1 ? 0 : null);
  const previousLength = useRef(items.length);

  // A newly added item opens for editing.
  useEffect(() => {
    if (items.length > previousLength.current) setOpenIndex(items.length - 1);
    previousLength.current = items.length;
  }, [items.length]);

  const move = (from: number, to: number) => {
    onMove?.(from, to);
    if (openIndex === from) setOpenIndex(to);
    else if (openIndex === to) setOpenIndex(from);
  };

  const remove = (index: number) => {
    onRemove(index);
    if (openIndex === index) setOpenIndex(null);
    else if (openIndex !== null && openIndex > index) setOpenIndex(openIndex - 1);
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {items.length > 0 && <span className={styles.counter}>{items.length}</span>}
      </div>
      <div className={styles.list}>
        {items.map((item, i) => {
          const actions = (
            <div className={styles.itemActions}>
              {onMove && (
                <>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move down">
                    <ArrowDown size={13} />
                  </button>
                </>
              )}
              <button type="button" className={`${styles.iconButton} ${styles.iconDanger}`} onClick={() => remove(i)} aria-label="Remove">
                <Trash2 size={13} />
              </button>
            </div>
          );

          if (!summary) {
            return (
              <div key={i} className={styles.inlineItem}>
                <div className={styles.inlineItemBody}>{renderItem(item, i)}</div>
                {actions}
              </div>
            );
          }

          const info = summary(item, i);
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
              <div className={styles.itemHead}>
                <button type="button" className={styles.itemToggle} onClick={() => setOpenIndex(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className={styles.itemThumb} aria-hidden="true">
                    {info.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={info.image} alt="" />
                    ) : (
                      (info.title || "?").trim().slice(0, 1).toUpperCase() || "?"
                    )}
                  </span>
                  <span className={styles.itemText}>
                    <strong className={info.title ? undefined : styles.itemUntitled}>{info.title || "Untitled"}</strong>
                    {info.meta && <small>{info.meta}</small>}
                  </span>
                  <ChevronDown size={15} className={styles.itemChevron} aria-hidden="true" />
                </button>
                {actions}
              </div>
              {isOpen && <div className={styles.itemBody}>{renderItem(item, i)}</div>}
            </div>
          );
        })}
      </div>
      <button type="button" className={styles.addButton} onClick={onAdd}>
        <Plus size={14} aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

// Pictures are stored with the page, so they're resized before saving: a
// phone photo goes from ~4 MB to ~150 KB, and the page saves and loads fast.
async function prepareImage(file: File, maxSide: number): Promise<string> {
  const readAsDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  // Vector and animated images stay as they are.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return readAsDataUrl();

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("unreadable"));
      image.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return readAsDataUrl();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const webp = canvas.toDataURL("image/webp", 0.86);
    if (webp.startsWith("data:image/webp")) return webp;
    return file.type === "image/png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function useDropzone(onFile: (file: File) => void) {
  const [dragging, setDragging] = useState(false);
  return {
    dragging,
    handlers: {
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(true);
      },
      onDragLeave: () => setDragging(false),
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onFile(file);
      },
    },
  };
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Logos and avatars: smaller preview, smaller stored size.
  small?: boolean;
  round?: boolean;
  maxSizeMB?: number;
}

function ImageUploadField({ label, value, onChange, small, round, maxSizeMB = 15 }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("That isn't an image. Use JPG, PNG, WebP or SVG.");
    if (file.size > maxSizeMB * 1024 * 1024) return setError(`That image is over ${maxSizeMB} MB.`);
    setBusy(true);
    try {
      onChange(await prepareImage(file, small ? 400 : 1600));
    } catch {
      setError("Couldn't read that image. Try another one.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  const { dragging, handlers } = useDropzone(handleFile);

  return (
    <FieldShell id={id} label={label} error={error ?? undefined}>
      {value ? (
        <div className={`${styles.mediaPreview} ${small ? styles.mediaSmall : ""}`} {...handlers}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={`${styles.mediaImage} ${round ? styles.round : ""}`} />
          <div className={styles.mediaActions}>
            <button type="button" className={styles.smallButton} onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 size={13} className={styles.inlineSpinner} /> : <Upload size={13} />}
              Replace
            </button>
            <button type="button" className={`${styles.smallButton} ${styles.smallDanger}`} onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          className={`${styles.dropzone} ${small ? styles.dropzoneSmall : ""} ${dragging ? styles.dropzoneActive : ""}`}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          {...handlers}
        >
          {busy ? <Loader2 size={16} className={styles.inlineSpinner} /> : <ImagePlus size={16} />}
          <span>
            <strong>{busy ? "Preparing…" : "Upload an image"}</strong>
            <small>or drop it here</small>
          </span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className={styles.hiddenInput} tabIndex={-1} />
    </FieldShell>
  );
}

interface FileUploadFieldProps {
  label: string;
  value: string;
  fileName?: string;
  onChange: (value: string, fileName?: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

// A CV: upload (stored with the page, so kept small) or link to one.
function FileUploadField({ label, value, fileName, onChange, accept = ".pdf,.doc,.docx", maxSizeMB = 4 }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is over ${maxSizeMB} MB. Upload it to Google Drive or Dropbox and paste the link below.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string, file.name);
    reader.readAsDataURL(file);
  };
  const { dragging, handlers } = useDropzone(handleFile);
  const isUpload = value.startsWith("data:");
  const shownName = isUpload ? fileName || "Uploaded file" : value.replace(/^https?:\/\//, "").split("?")[0];

  return (
    <>
      <FieldShell id={id} label={label} error={error ?? undefined}>
        {value ? (
          <div className={styles.filePreview}>
            <span className={styles.fileIcon}>
              <FileText size={16} />
            </span>
            <span className={styles.fileName} title={shownName}>
              {shownName}
            </span>
            <button type="button" className={`${styles.iconButton} ${styles.iconDanger}`} onClick={() => onChange("", "")} aria-label="Remove file">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            id={id}
            type="button"
            className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ""}`}
            onClick={() => inputRef.current?.click()}
            {...handlers}
          >
            <Upload size={16} />
            <span>
              <strong>Upload a PDF</strong>
              <small>or drop it here · up to {maxSizeMB} MB</small>
            </span>
          </button>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className={styles.hiddenInput} tabIndex={-1} />
      </FieldShell>
      {!isUpload && (
        <Field
          label="Or link to it"
          value={value}
          onChange={(v) => onChange(v)}
          onBlur={(v) => onChange(v.trim() ? normalizeWebsiteInput(v) : "")}
          placeholder="Google Drive, Dropbox or Notion link"
          type="url"
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

interface TechStackEditorProps {
  items: { name: string; icon: string; category?: string }[];
  onChange: (items: { name: string; icon: string; category?: string }[]) => void;
}

function TechIcon({ name, fallbackIcon }: { name: string; fallbackIcon: string }) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = getTechIconUrl(name);
  if (iconUrl && !imgError) {
    return <NextImage src={iconUrl} alt="" width={16} height={16} className={styles.techIconSvg} onError={() => setImgError(true)} unoptimized />;
  }
  return <span className={styles.techFallback}>{fallbackIcon || initialsForSkill(name)}</span>;
}

function TechStackEditor({ items, onChange }: TechStackEditorProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const id = useId();
  const has = (name: string) => items.some((item) => item.name.trim().toLowerCase() === name.trim().toLowerCase());

  const suggestions = (
    query ? getTechSuggestions(query) : category === "all" ? techStack.slice(0, 18) : getTechsByCategory(category as TechItem["category"])
  ).slice(0, 18);
  const exactMatch = query.trim() && techStack.some((tech) => tech.name.toLowerCase() === query.trim().toLowerCase());

  const add = (name: string) => {
    const clean = name.trim();
    if (!clean || has(clean)) return;
    const known = getTechByName(clean);
    onChange([...items, { name: known?.name || clean, icon: known?.icon || initialsForSkill(clean), category: known?.category }]);
    setQuery("");
  };

  const toggle = (tech: TechItem) => {
    if (has(tech.name)) onChange(items.filter((item) => item.name.toLowerCase() !== tech.name.toLowerCase()));
    else add(tech.name);
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <span className={styles.label}>Your stack</span>
        {items.length > 0 && <span className={styles.counter}>{items.length}</span>}
      </div>

      {items.length > 0 ? (
        <div className={styles.techChips}>
          {items.map((item, i) => (
            <span key={`${item.name}-${i}`} className={styles.techChip}>
              <span className={styles.techChipIcon}>
                <TechIcon name={item.name} fallbackIcon={item.icon} />
              </span>
              <span className={styles.techChipName}>{item.name}</span>
              {i > 0 && (
                <button type="button" className={styles.techChipButton} onClick={() => onChange(moveIn(items, i, i - 1))} aria-label={`Move ${item.name} earlier`}>
                  <ArrowLeft size={11} />
                </button>
              )}
              <button type="button" className={styles.techChipButton} onClick={() => onChange(items.filter((_, index) => index !== i))} aria-label={`Remove ${item.name}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className={styles.fieldHint}>Pick from the list below or type any skill.</p>
      )}

      <div className={styles.autocompleteWrapper}>
        <Search size={14} className={styles.locationInputIcon} aria-hidden="true" />
        <input
          id={id}
          className={`${styles.input} ${styles.locationInput}`}
          value={query}
          aria-label="Search or add a skill"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(suggestions[0] && query && suggestions[0].name.toLowerCase().startsWith(query.toLowerCase()) ? suggestions[0].name : query);
            }
          }}
          placeholder="Search or add a skill"
          autoComplete="off"
        />
      </div>

      {!query && (
        <div className={styles.chipRow} role="radiogroup" aria-label="Category">
          {[{ value: "all", label: "Popular" }, ...techCategories].map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="radio"
              aria-checked={category === cat.value}
              className={`${styles.filterChip} ${category === cat.value ? styles.filterChipOn : ""}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.techSuggestions}>
        {suggestions.map((tech) => {
          const added = has(tech.name);
          return (
            <button
              key={tech.name}
              type="button"
              className={`${styles.techSuggestion} ${added ? styles.added : ""}`}
              onClick={() => toggle(tech)}
              aria-pressed={added}
            >
              <span className={styles.techSuggestionIcon}>
                <TechIcon name={tech.name} fallbackIcon={tech.icon} />
              </span>
              <span className={styles.techSuggestionName}>{tech.name}</span>
              {added ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}
            </button>
          );
        })}
        {query.trim() && !exactMatch && !has(query) && (
          <button type="button" className={`${styles.techSuggestion} ${styles.techCustom}`} onClick={() => add(query)}>
            <Plus size={13} aria-hidden="true" />
            <span className={styles.techSuggestionName}>Add “{query.trim()}”</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

interface ProjectItem {
  name: string;
  description: string;
  url: string;
  language: string;
  stars?: number;
  forks?: number;
}

function ProjectsEditor({ items, onChange }: { items: ProjectItem[]; onChange: (items: ProjectItem[]) => void }) {
  const update = (index: number, patch: Partial<ProjectItem>) => onChange(patchAt(items, index, patch));
  return (
    <ArrayField
      label="Projects"
      items={items}
      addLabel="Add project"
      summary={(item) => ({ title: item.name, meta: [item.language, item.url.replace(/^https?:\/\/(www\.)?/, "")].filter(Boolean).join(" · ") })}
      renderItem={(item, i) => (
        <>
          <Field compact label="Name" value={item.name || ""} onChange={(v) => update(i, { name: v })} placeholder="bentofolio" />
          <Field compact label="Description" value={item.description || ""} onChange={(v) => update(i, { description: v })} placeholder="What it does, in a line" multiline rows={2} limit={110} />
          <Field
            compact
            label="Link"
            value={item.url || ""}
            onChange={(v) => update(i, { url: v })}
            onBlur={(v) => update(i, { url: v.trim() ? normalizeWebsiteInput(v) : "" })}
            placeholder="github.com/you/project"
            type="url"
          />
          <FreeTextCombobox
            compact
            label="Language"
            value={item.language || ""}
            onChange={(v) => update(i, { language: v })}
            suggestions={techStack.filter((tech) => tech.category === "language" || tech.category === "frontend").map((tech) => tech.name)}
            placeholder="TypeScript"
            adornment={item.language && getTechIconUrl(item.language) ? <NextImage src={getTechIconUrl(item.language)!} alt="" width={14} height={14} unoptimized /> : undefined}
          />
        </>
      )}
      onAdd={() => onChange([...items, { name: "", description: "", url: "", language: "" }])}
      onRemove={(i) => onChange(removeAt(items, i))}
      onMove={(from, to) => onChange(moveIn(items, from, to))}
    />
  );
}
