"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  FileText,
  MapPin,
  Loader2,
  Github,
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
import { getTechIconUrl, techIcons } from "@/app/lib/tech-icons";
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

const SKILL_CATEGORY_SUGGESTIONS = ["Development", "Design", "Marketing", "Productivity", "Other"];
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
  const { selectedBlockId, content, updateBlockContent, selectBlock } =
    useEditor();
  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;

  if (!selectedBlockId || !selectedContent) {
    if (embedded) return null;
    return (
      <div className={styles.empty}>
        <p>Select a block to edit</p>
      </div>
    );
  }

  // When embedded in PropertiesPanel, don't show the header
  if (embedded) {
    return (
      <div className={styles.fieldsOnly}>
        <BlockFields
          blockId={selectedBlockId}
          content={selectedContent}
          onUpdate={updateBlockContent}
        />
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <span className={styles.title}>Edit {selectedContent.type}</span>
        <button
          className={styles.closeButton}
          onClick={() => selectBlock(null)}
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.fields}>
        <BlockFields
          blockId={selectedBlockId}
          content={selectedContent}
          onUpdate={updateBlockContent}
        />
      </div>
    </div>
  );
}

interface BlockFieldsProps {
  blockId: string;
  content: BlockContent;
  onUpdate: (id: string, content: BlockContent) => void;
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

    onUpdate(blockId, {
      ...content,
      data: { ...content.data, [field]: value },
    } as BlockContent);
  };

  switch (content.type) {
    case "identity":
      return <ProfileFields content={content.data} onChange={handleChange} />;

    case "map":
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow || ""}
            onChange={(value) => handleChange("eyebrow", value)}
            placeholder="LOCATION"
          />
          <Field
            label="Heading"
            value={content.data.heading || ""}
            onChange={(value) => handleChange("heading", value)}
            placeholder={content.data.location || "Casablanca, Morocco"}
          />
          <LocationAutocompleteField
            value={content.data.location}
            onChange={(value) => handleChange("location", value)}
            onSelect={(place) => {
              onUpdate(blockId, {
                ...content,
                data: {
                  ...content.data,
                  location: place.label,
                  heading: content.data.heading || place.label,
                  lat: place.lat,
                  lng: place.lng,
                  variant: content.data.variant || "map",
                },
              });
            }}
          />
          <div className={styles.field}>
            <label className={styles.label}>Short description</label>
            <textarea
              className={styles.textarea}
              value={content.data.description || ""}
              onChange={(event) => handleChange("description", event.target.value)}
              placeholder="Available for remote work worldwide."
              rows={3}
            />
            <p className={styles.fieldHint}>
              {(content.data.description || "").length}/120 characters suggested
            </p>
          </div>
          <FreeTextCombobox
            label="Timezone"
            value={content.data.timezone || ""}
            onChange={(value) => handleChange("timezone", value)}
            suggestions={TIMEZONE_SUGGESTIONS}
            placeholder="Africa/Casablanca"
          />
          <SelectField
            label="Display style"
            value={content.data.variant || (content.data.lat && content.data.lng ? "map" : "text")}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "map", label: "Map" },
              { value: "text", label: "Text" },
            ]}
          />
          <Field
            label="Map zoom"
            value={String(content.data.zoom || 12)}
            onChange={(value) => handleChange("zoom", Number(value) || 12)}
            type="number"
            placeholder="12"
          />
          <Field
            label="Optional action URL"
            value={content.data.actionUrl || ""}
            onChange={(value) => handleChange("actionUrl", value)}
            onBlur={(value) => handleChange("actionUrl", normalizeWebsiteInput(value))}
            placeholder="https://maps.google.com/..."
            type="url"
          />
        </>
      );

    case "github":
      return (
        <GitHubImportEditor
          content={content.data}
          onChange={(githubContent) =>
            onUpdate(blockId, { type: "github", data: githubContent })
          }
          onImport={(githubContent) =>
            onUpdate(blockId, {
              type: "github",
              data: { ...content.data, ...githubContent },
            })
          }
        />
      );

    case "link":
      const actionType =
        content.data.actionType === "copy-email" ? "copy-email" : "email";
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow ?? ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="Start here"
          />
          <div className={styles.field}>
            <label className={styles.label}>Main heading</label>
            <textarea
              className={styles.textarea}
              value={content.data.title}
              onChange={(event) => handleChange("title", event.target.value)}
              placeholder="Let's collaborate"
              rows={2}
            />
            <p className={styles.fieldHint}>
              {content.data.title.length}/48 characters suggested
            </p>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={content.data.description || ""}
              onChange={(event) => handleChange("description", event.target.value)}
              placeholder="Tell me about your project and I'll reply within 24 hours."
              rows={3}
            />
            <p className={styles.fieldHint}>
              {(content.data.description || "").length}/120 characters suggested
            </p>
          </div>
          <SelectField
            label="Action type"
            value={actionType}
            onChange={(value) => handleChange("actionType", value)}
            options={[
              { value: "email", label: "Send email" },
              { value: "copy-email", label: "Copy email" },
            ]}
          />
          <Field
            label="Destination"
            value={content.data.url}
            onChange={(v) => handleChange("url", v)}
            onBlur={(value) => handleChange("url", normalizeActionDestination(value, actionType))}
            placeholder="hello@example.com"
            type="email"
          />
          {content.data.url && !isLikelyCtaDestination(actionType, content.data.url) && (
            <p className={styles.fieldHint}>Enter a valid destination for this action type.</p>
          )}
          {actionType === "email" && (
            <>
              <Field
                label="Email subject"
                value={content.data.emailSubject || ""}
                onChange={(v) => handleChange("emailSubject", v)}
                placeholder="Project inquiry"
              />
              <div className={styles.field}>
                <label className={styles.label}>Email body</label>
                <textarea
                  className={styles.textarea}
                  value={content.data.emailBody || ""}
                  onChange={(event) => handleChange("emailBody", event.target.value)}
                  placeholder="Hi, I'd like to discuss..."
                  rows={3}
                />
              </div>
            </>
          )}
          <Field
            label="Button label"
            value={content.data.buttonLabel || ""}
            onChange={(v) => handleChange("buttonLabel", v)}
            placeholder="Start a project"
          />
          <SelectField
            label="Visual style"
            value={content.data.variant || "surface"}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "surface", label: "Surface" },
              { value: "contrast", label: "Contrast" },
              { value: "accent", label: "Accent" },
              { value: "outline", label: "Outline" },
            ]}
          />
        </>
      );

    case "work":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || ""}
            onChange={(v) => handleChange("title", v)}
            placeholder="Recent work"
          />
          <Field
            label="Subtitle"
            value={content.data.subtitle || ""}
            onChange={(v) => handleChange("subtitle", v)}
            placeholder="Selected projects"
          />
          <Field
            label="Email"
            value={content.data.email || ""}
            onChange={(v) => handleChange("email", v)}
            placeholder="hello@icloud.com"
          />
          <ArrayField
            label="Work Items"
            items={content.data.items || []}
            renderItem={(item, idx) => (
              <div key={idx} className={styles.arrayItemColumn}>
                <input
                  className={styles.input}
                  value={item.title || ""}
                  list="work-title-suggestions"
                  autoComplete="on"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], title: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Project title"
                />
                <input
                  className={styles.input}
                  value={item.client || ""}
                  list="work-client-suggestions"
                  autoComplete="on"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], client: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Client or studio"
                />
                <input
                  className={styles.input}
                  value={item.category || ""}
                  list="work-category-suggestions"
                  autoComplete="on"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], category: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Product design, web app..."
                />
                <input
                  className={styles.smallInput}
                  value={item.year || ""}
                  autoComplete="on"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], year: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="2026"
                />
                <ImageUploadField
                  label="Preview image"
                  value={item.image || ""}
                  onChange={(url) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], image: url };
                    handleChange("items", newItems);
                  }}
                  small
                  maxSizeMB={10}
                />
                <input
                  className={styles.input}
                  value={item.url || ""}
                  list="url-suggestions"
                  autoComplete="on"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[idx] = { ...newItems[idx], url: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Project URL"
                />
              </div>
            )}
            onAdd={() =>
              handleChange("items", [
                ...(content.data.items || []),
                {
                  title: "",
                  client: "",
                  category: "",
                  year: "",
                  image: "",
                  url: "",
                },
              ])
            }
            onRemove={(i) => {
              const newItems = (content.data.items || []).filter(
                (_, idx) => idx !== i,
              );
              handleChange("items", newItems);
            }}
          />
          <datalist id="work-title-suggestions">
            {["Portfolio OS", "Creator dashboard", "Mobile app redesign", "Brand system"].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <datalist id="work-client-suggestions">
            {["Northstar Studio", "Bento Labs", "Independent", "Studio"].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <datalist id="work-category-suggestions">
            {["Product design", "Web app", "Brand identity", "Design system", "Development"].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <datalist id="url-suggestions">
            {["https://example.com", "https://dribbble.com/username", "https://github.com/username"].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </>
      );

    case "saas":
      return (
        <>
          <Field
            label="Name"
            value={content.data.name}
            onChange={(v) => handleChange("name", v)}
          />
          <Field
            label="Tagline"
            value={content.data.tagline}
            onChange={(v) => handleChange("tagline", v)}
          />
          <Field
            label="URL"
            value={content.data.url}
            onChange={(v) => handleChange("url", v)}
          />
          <ImageUploadField
            label="Logo"
            value={content.data.logo || ""}
            onChange={(v) => handleChange("logo", v)}
            small
          />
          <RevenueSource
            blockId={blockId}
            hasManualNumbers={
              Boolean(content.data.mrr) || Boolean(content.data.totalRevenue) || (content.data.revenue || []).length > 0
            }
          >
            <Field
              label="MRR"
              value={String(content.data.mrr)}
              onChange={(v) => handleChange("mrr", Number(v))}
              type="number"
            />
            <SelectField
              label="Currency"
              value={content.data.currency || "USD"}
              options={["USD", "EUR", "GBP", "MAD", "INR", "CAD", "AUD"].map((c) => ({ value: c, label: c }))}
              onChange={(v) => handleChange("currency", v)}
            />
            <Field
              label="Total revenue (all time, optional)"
              value={content.data.totalRevenue ? String(content.data.totalRevenue) : ""}
              onChange={(v) => handleChange("totalRevenue", v.trim() ? Number(v) : undefined)}
              type="number"
            />
            <RevenueField
              values={content.data.revenue || []}
              onChange={(values) => handleChange("revenue", values)}
            />
          </RevenueSource>
        </>
      );

    case "availability":
      return (
        <>
          <SelectField
            label="Status"
            value={content.data.status}
            options={[
              { value: "available", label: "Available" },
              { value: "busy", label: "Busy" },
              { value: "not-available", label: "Not Available" },
            ]}
            onChange={(v) => handleChange("status", v)}
          />
          <Field
            label="Message"
            value={content.data.message}
            onChange={(v) => handleChange("message", v)}
            multiline
          />
          <Field
            label="Next opening"
            value={content.data.nextOpening || ""}
            onChange={(v) => handleChange("nextOpening", v)}
            placeholder="2 spots this month"
          />
          <Field
            label="Response time"
            value={content.data.responseTime || ""}
            onChange={(v) => handleChange("responseTime", v)}
            placeholder="Replies within 24h"
          />
          <Field
            label="Timezone"
            value={content.data.timezone || ""}
            onChange={(v) => handleChange("timezone", v)}
            placeholder="GMT+1"
          />
          <Field
            label="Rate"
            value={content.data.rate || ""}
            onChange={(v) => handleChange("rate", v)}
            placeholder="Projects from $2k"
          />
          <CheckboxField
            label="Open to work"
            checked={content.data.forHire}
            onChange={(v) => handleChange("forHire", v)}
          />
          <Field
            label="Contact"
            value={content.data.preferredContact || ""}
            onChange={(v) => handleChange("preferredContact", v)}
            placeholder="hello@example.com or https://cal.com/you"
          />
          <Field
            label="CTA label"
            value={content.data.ctaLabel || ""}
            onChange={(v) => handleChange("ctaLabel", v)}
            placeholder="Start a project"
          />
        </>
      );

    case "techstack":
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow || ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="SKILLS"
          />
          <Field
            label="Heading"
            value={content.data.heading || ""}
            onChange={(v) => handleChange("heading", v)}
            placeholder="Tools I use"
          />
          <FreeTextCombobox
            label="Category"
            value={content.data.category || ""}
            onChange={(v) => handleChange("category", v)}
            suggestions={SKILL_CATEGORY_SUGGESTIONS}
            placeholder="Development, Design..."
          />
          <TechStackEditor
            items={content.data.items}
            onChange={(items) => handleChange("items", items)}
          />
        </>
      );

    case "social":
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow || ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="Connect"
          />
          <Field
            label="Heading"
            value={content.data.heading || ""}
            onChange={(v) => handleChange("heading", v)}
            placeholder="Social Links"
          />
          <SelectField
            label="Layout style"
            value={content.data.variant || "icons"}
            onChange={(value) => handleChange("variant", value)}
            options={[
              { value: "icons", label: "Icons" },
              { value: "labels", label: "Labels" },
              { value: "list", label: "List" },
            ]}
          />
          <ArrayField
            label="Social Links"
            items={content.data.items}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <FreeTextCombobox
                  label="Platform"
                  value={item.platform || ""}
                  onChange={(value) => {
                    const newItems = [...content.data.items];
                    newItems[i] = {
                      ...item,
                      platform: normalizeSocialPlatform(value) as typeof item.platform,
                    };
                    handleChange("items", newItems);
                  }}
                  suggestions={SOCIAL_PLATFORM_SUGGESTIONS}
                  placeholder="GitHub, Website, Other..."
                />
                <input
                  className={styles.input}
                  value={item.username || ""}
                  onChange={(e) => {
                    const newItems = [...content.data.items];
                    newItems[i] = { ...item, username: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Label or username"
                />
                <input
                  className={styles.input}
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...content.data.items];
                    newItems[i] = { ...item, url: e.target.value };
                    handleChange("items", newItems);
                  }}
                  onBlur={(event) => {
                    const newItems = [...content.data.items];
                    newItems[i] = { ...item, url: normalizeWebsiteInput(event.target.value) };
                    handleChange("items", newItems);
                  }}
                  placeholder="https://... or hello@example.com"
                />
                {item.url && !isLikelySocialUrl(item.platform, item.url) && (
                  <p className={styles.fieldHint}>Enter a valid URL or email address.</p>
                )}
              </div>
            )}
            onAdd={() =>
              handleChange(
                "items",
                content.data.items.some((item) => !item.url.trim())
                  ? content.data.items
                  : [
                      ...content.data.items,
                      { platform: "website" as const, url: "", username: "" },
                    ]
              )
            }
            onRemove={(i) => {
              const newItems = content.data.items.filter((_, idx) => idx !== i);
              handleChange("items", newItems);
            }}
            onMove={(from, to) => {
              const newItems = [...content.data.items];
              const [item] = newItems.splice(from, 1);
              newItems.splice(to, 0, item);
              handleChange("items", newItems);
            }}
          />
        </>
      );

    case "spotify":
      return (
        <>
          <Field
            label="Spotify URL"
            value={content.data.spotifyUrl || ""}
            onChange={(v) => handleChange("spotifyUrl", v)}
            placeholder="https://open.spotify.com/playlist/... or track/album"
          />
          <p className={styles.fieldHint}>
            Paste any Spotify link (track, playlist, album, or artist)
          </p>
        </>
      );

    case "experience":
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow || ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="CAREER"
          />
          <Field
            label="Heading"
            value={content.data.heading || ""}
            onChange={(v) => handleChange("heading", v)}
            placeholder="Experience"
          />
          <ArrayField
            label="Work Experience"
            items={content.data.items || []}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <div className={styles.companyInputRow}>
                  <div className={styles.companyLogoPreview}>
                    {item.logo || getCompanyLogo(item.company || "") ? (
                      <NextImage
                        src={item.logo || getCompanyLogo(item.company || "") || ""}
                        alt={item.company || "Company logo"}
                        width={28}
                        height={28}
                      />
                    ) : (
                      <span>{(item.company || "?").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <input
                    className={styles.input}
                    value={item.company || ""}
                    list="experience-company-suggestions"
                    autoComplete="on"
                    onChange={(e) => {
                      const company = e.target.value;
                      const newItems = [...(content.data.items || [])];
                      newItems[i] = {
                        ...item,
                        company,
                      };
                      handleChange("items", newItems);
                    }}
                    placeholder="Upwork, Facebook, Figma..."
                  />
                </div>
                <FreeTextCombobox
                  label="Role"
                  value={item.role || ""}
                  onChange={(value) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, role: value };
                    handleChange("items", newItems);
                  }}
                  suggestions={PROFESSIONAL_TITLE_SUGGESTIONS}
                  placeholder="Product Designer"
                />
                <FreeTextCombobox
                  label="Employment type"
                  value={item.employmentType || ""}
                  onChange={(value) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, employmentType: value };
                    handleChange("items", newItems);
                  }}
                  suggestions={EMPLOYMENT_TYPE_SUGGESTIONS}
                  placeholder="Full-time, Freelance..."
                />
                <input
                  className={styles.smallInput}
                  value={item.startDate || ""}
                  type="month"
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = {
                      ...item,
                      startDate: e.target.value,
                      period: formatStructuredPeriod({ ...item, startDate: e.target.value }),
                    };
                    handleChange("items", newItems);
                  }}
                  aria-label="Start date"
                />
                <CheckboxField
                  label="Currently working here"
                  checked={Boolean(item.isCurrent)}
                  onChange={(checked) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = {
                      ...item,
                      isCurrent: checked,
                      endDate: checked ? "" : item.endDate,
                      period: formatStructuredPeriod({
                        ...item,
                        isCurrent: checked,
                        endDate: checked ? "" : item.endDate,
                      }),
                    };
                    handleChange("items", newItems);
                  }}
                />
                {!item.isCurrent && (
                  <input
                    className={styles.smallInput}
                    value={item.endDate || ""}
                    type="month"
                    onChange={(e) => {
                      const newItems = [...(content.data.items || [])];
                      newItems[i] = {
                        ...item,
                        endDate: e.target.value,
                        period: formatStructuredPeriod({ ...item, endDate: e.target.value }),
                      };
                      handleChange("items", newItems);
                    }}
                    aria-label="End date"
                  />
                )}
                <input
                  className={styles.smallInput}
                  value={item.period || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, period: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Legacy period, e.g. 2022 - Present"
                />
                <input
                  className={styles.input}
                  value={item.location || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, location: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Remote, San Francisco..."
                />
                <textarea
                  className={styles.textarea}
                  value={item.description || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, description: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="What did you do there?"
                  rows={3}
                />
                <ImageUploadField
                  label="Company logo"
                  value={item.logo || ""}
                  onChange={(logo) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, logo };
                    handleChange("items", newItems);
                  }}
                  small
                />
                <input
                  className={styles.input}
                  value={item.companyUrl || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, companyUrl: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="https://company.com"
                />
              </div>
            )}
            onAdd={() =>
              handleChange("items", [
                ...(content.data.items || []),
                { company: "", role: "", period: "", logo: "" },
              ])
            }
            onRemove={(i) => {
              const newItems = (content.data.items || []).filter(
                (_, idx) => idx !== i,
              );
              handleChange("items", newItems);
            }}
            onMove={(from, to) => {
              const newItems = [...(content.data.items || [])];
              const [item] = newItems.splice(from, 1);
              newItems.splice(to, 0, item);
              handleChange("items", newItems);
            }}
          />
          <datalist id="experience-company-suggestions">
            {getFieldSuggestions("Company").map((company) => (
              <option key={company} value={company} />
            ))}
          </datalist>
        </>
      );

    case "education":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || "Education"}
            onChange={(v) => handleChange("title", v)}
          />
          <ArrayField
            label="Education"
            items={content.data.items || []}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <input
                  className={styles.input}
                  value={item.school || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, school: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="School"
                />
                <input
                  className={styles.input}
                  value={item.degree || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, degree: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Degree / Program"
                />
                <input
                  className={styles.smallInput}
                  value={item.period || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, period: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="2021 - 2024"
                />
                <input
                  className={styles.input}
                  value={item.description || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, description: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Short description"
                />
                <ImageUploadField
                  label="Logo"
                  value={item.logo || ""}
                  onChange={(url) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, logo: url };
                    handleChange("items", newItems);
                  }}
                  small
                />
              </div>
            )}
            onAdd={() =>
              handleChange("items", [
                ...(content.data.items || []),
                { school: "", degree: "", period: "", description: "", logo: "" },
              ])
            }
            onRemove={(i) => {
              const newItems = (content.data.items || []).filter(
                (_, idx) => idx !== i,
              );
              handleChange("items", newItems);
            }}
          />
        </>
      );

    case "projects":
      return (
        <ProjectsEditor
          items={content.data.items || []}
          onChange={(items) => handleChange("items", items)}
        />
      );

    case "resume":
      return (
        <>
          <input
            className={styles.input}
            value={content.data.title || "My Resume"}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="My Resume"
          />
          <FileUploadField
            label="Upload Resume (PDF)"
            value={content.data.fileUrl || ""}
            onChange={(v) => handleChange("fileUrl", v)}
            accept=".pdf,.doc,.docx"
            hint="Upload your resume file"
          />
          <input
            className={styles.input}
            style={{
              fontFamily: "var(--font-editor-body), system-ui",
              marginBottom: 6,
            }}
            value={content.data.lastUpdated || ""}
            onChange={(e) => handleChange("lastUpdated", e.target.value)}
            placeholder="e.g. Jan 2026"
          />
        </>
      );
    case "quote":
      return (
        <>
          <textarea
            className={styles.textarea}
            style={{
              fontFamily: "var(--font-editor-body), system-ui",
              marginBottom: 6,
            }}
            value={content.data.quote || ""}
            onChange={(e) => handleChange("quote", e.target.value)}
            placeholder="Enter quote..."
            rows={3}
          />
          <input
            className={styles.input}
            style={{
              fontFamily: "var(--font-editor-heading), system-ui",
              marginBottom: 6,
            }}
            value={content.data.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            placeholder="Author name"
          />
          <input
            className={styles.input}
            style={{
              fontFamily: "var(--font-editor-body), system-ui",
              marginBottom: 6,
            }}
            value={content.data.role || ""}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder="Author role (optional)"
          />
          <input
            className={styles.input}
            style={{
              fontFamily: "var(--font-editor-body), system-ui",
              marginBottom: 6,
            }}
            value={content.data.company || ""}
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder="Author company (optional)"
          />
          <ImageUploadField
            label="Avatar"
            value={content.data.avatar || ""}
            onChange={(v) => handleChange("avatar", v)}
            small
          />
        </>
      );

    case "youtube":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || ""}
            onChange={(v) => handleChange("title", v)}
            placeholder="Featured video"
          />
          <Field
            label="URL"
            value={content.data.url || ""}
            onChange={(v) => handleChange("url", v)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </>
      );

    case "gallery":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || ""}
            onChange={(v) => handleChange("title", v)}
            placeholder="Gallery"
          />
          <ArrayField
            label="Images"
            items={content.data.images || []}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <ImageUploadField
                  label="Image"
                  value={item.src || ""}
                  onChange={(src) => {
                    const images = [...(content.data.images || [])];
                    images[i] = { ...item, src };
                    handleChange("images", images);
                  }}
                  small
                />
                <input
                  className={styles.input}
                  value={item.alt || ""}
                  onChange={(event) => {
                    const images = [...(content.data.images || [])];
                    images[i] = { ...item, alt: event.target.value };
                    handleChange("images", images);
                  }}
                  placeholder="Caption"
                />
              </div>
            )}
            onAdd={() =>
              handleChange("images", [...(content.data.images || []), { src: "", alt: "" }])
            }
            onRemove={(i) =>
              handleChange(
                "images",
                (content.data.images || []).filter((_, idx) => idx !== i),
              )
            }
          />
        </>
      );

    case "instagram":
      const handleInstagramProfileChange = (value: string) => {
        const username = extractInstagramUsername(value);

        if (!username) {
          handleChange("profileUrl", value);
          return;
        }

        onUpdate(blockId, {
          ...content,
          data: {
            ...content.data,
            handle: `@${username}`,
            profileUrl: `https://instagram.com/${username}`,
          },
        });
      };

      const handleInstagramHandleChange = (value: string) => {
        const username = extractInstagramUsername(value);

        if (!username) {
          handleChange("handle", value);
          return;
        }

        onUpdate(blockId, {
          ...content,
          data: {
            ...content.data,
            handle: `@${username}`,
            profileUrl: content.data.profileUrl || `https://instagram.com/${username}`,
          },
        });
      };

      return (
        <>
          <Field
            label="Handle"
            value={content.data.handle || ""}
            onChange={handleInstagramHandleChange}
            placeholder="@yourhandle"
          />
          <Field
            label="Profile URL"
            value={content.data.profileUrl || ""}
            onChange={handleInstagramProfileChange}
            placeholder="https://instagram.com/yourhandle"
          />
          <ImageUploadField
            label="Profile image"
            value={content.data.image || ""}
            onChange={(v) => handleChange("image", v)}
            small
          />
          <Field
            label="Followers"
            value={content.data.followers || ""}
            onChange={(v) => handleChange("followers", v)}
            placeholder="12.4k"
          />
          <Field
            label="Posts"
            value={content.data.posts || ""}
            onChange={(v) => handleChange("posts", v)}
            placeholder="186"
          />
          <Field
            label="Engagement"
            value={content.data.engagement || ""}
            onChange={(v) => handleChange("engagement", v)}
            placeholder="8.7%"
          />
          <Field
            label="Featured post URL"
            value={content.data.featuredPostUrl || ""}
            onChange={(v) => handleChange("featuredPostUrl", v)}
            placeholder="https://instagram.com/p/..."
          />
        </>
      );

    case "services":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || ""}
            onChange={(v) => handleChange("title", v)}
          />
          <ArrayField
            label="Services"
            items={content.data.items || []}
            renderItem={(item, i) => (
              <input
                className={styles.input}
                value={item || ""}
                onChange={(event) => {
                  const items = [...(content.data.items || [])];
                  items[i] = event.target.value;
                  handleChange("items", items);
                }}
                placeholder="Product design"
              />
            )}
            onAdd={() => handleChange("items", [...(content.data.items || []), ""])}
            onRemove={(i) =>
              handleChange(
                "items",
                (content.data.items || []).filter((_, idx) => idx !== i),
              )
            }
          />
        </>
      );

    case "tools":
      return (
        <>
          <Field
            label="Eyebrow"
            value={content.data.eyebrow || ""}
            onChange={(v) => handleChange("eyebrow", v)}
            placeholder="SKILLS"
          />
          <Field
            label="Heading"
            value={content.data.heading || content.data.title || ""}
            onChange={(v) => {
              onUpdate(blockId, {
                ...content,
                data: { ...content.data, heading: v, title: v },
              });
            }}
            placeholder="Tools I use"
          />
          <FreeTextCombobox
            label="Category"
            value={content.data.category || ""}
            onChange={(v) => handleChange("category", v)}
            suggestions={SKILL_CATEGORY_SUGGESTIONS}
            placeholder="Design, Development..."
          />
          <ArrayField
            label="Tools"
            items={content.data.items || []}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <FreeTextCombobox
                  label="Tool"
                  value={item.name || ""}
                  onChange={(value) => {
                    const items = [...(content.data.items || [])];
                    const known = getTechByName(value);
                    items[i] = {
                      ...item,
                      name: value,
                      icon: known?.icon || item.icon || initialsForSkill(value),
                      category: known?.category || item.category,
                    };
                    handleChange("items", items);
                  }}
                  suggestions={techIcons.map((icon) => icon.name)}
                  placeholder="Figma"
                />
                <input
                  className={styles.smallInput}
                  value={item.icon || ""}
                  onChange={(event) => {
                    const items = [...(content.data.items || [])];
                    items[i] = { ...item, icon: event.target.value };
                    handleChange("items", items);
                  }}
                  placeholder="Icon text"
                />
              </div>
            )}
            onAdd={() => handleChange("items", [...(content.data.items || []), { name: "", icon: "" }])}
            onRemove={(i) =>
              handleChange(
                "items",
                (content.data.items || []).filter((_, idx) => idx !== i),
              )
            }
            onMove={(from, to) => {
              const items = [...(content.data.items || [])];
              const [item] = items.splice(from, 1);
              items.splice(to, 0, item);
              handleChange("items", items);
            }}
          />
        </>
      );

    case "stats":
      return (
        <ArrayField
          label="Stats"
          items={content.data.items || []}
          renderItem={(item, i) => (
            <div className={styles.arrayItemColumn}>
              <input
                className={styles.input}
                value={item.value || ""}
                onChange={(event) => {
                  const items = [...(content.data.items || [])];
                  items[i] = { ...item, value: event.target.value };
                  handleChange("items", items);
                }}
                placeholder="42"
              />
              <input
                className={styles.input}
                value={item.label || ""}
                onChange={(event) => {
                  const items = [...(content.data.items || [])];
                  items[i] = { ...item, label: event.target.value };
                  handleChange("items", items);
                }}
                placeholder="Projects"
              />
            </div>
          )}
          onAdd={() => handleChange("items", [...(content.data.items || []), { value: "", label: "" }])}
          onRemove={(i) =>
            handleChange(
              "items",
              (content.data.items || []).filter((_, idx) => idx !== i),
            )
          }
        />
      );

    default:
      return (
        <p className={styles.noFields}>
          No editable fields for this block type
        </p>
      );
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

// Input field component
interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  multiline,
  placeholder,
}: FieldProps) {
  const suggestions = getFieldSuggestions(label);
  const listId =
    !multiline && type === "text" && suggestions.length > 0
      ? `suggestions-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {multiline ? (
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={styles.input}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur?.(e.target.value)}
          placeholder={placeholder}
          autoComplete="on"
          list={listId}
        />
      )}
      {listId && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </div>
  );
}

function getFieldSuggestions(label: string) {
  const key = label.toLowerCase();

  if (key.includes("title")) {
    return [
      "Product Designer",
      "Creative Developer",
      "Full-Stack Developer",
      "Design Engineer",
      "Brand Designer",
      "Recent work",
      "Selected projects",
    ];
  }

  if (key.includes("subtitle")) {
    return ["Selected projects", "Recent launches", "Case studies", "Client work"];
  }

  if (key.includes("status") || key.includes("availability")) {
    return ["Available for work", "Open to freelance", "Booking Q3 projects", "Busy this month"];
  }

  if (key.includes("email")) {
    return ["hello@icloud.com", "work@example.com", "studio@example.com"];
  }

  if (key.includes("url") || key.includes("website")) {
    return ["https://example.com", "https://dribbble.com/username", "https://github.com/username"];
  }

  if (key.includes("company") || key.includes("client")) {
    return [
      "Upwork",
      "Facebook",
      "Meta",
      "Google",
      "Apple",
      "Microsoft",
      "Amazon",
      "Netflix",
      "Spotify",
      "LinkedIn",
      "GitHub",
      "Figma",
      "Adobe",
      "Canva",
      "Notion",
      "Vercel",
      "Stripe",
      "Shopify",
      "Airbnb",
      "Uber",
      "Independent",
      "Studio",
      "Bento Labs",
      "Northstar Studio",
    ];
  }

  return [];
}

interface LocationSuggestion {
  id: string;
  label: string;
  detail: string;
  lat: number;
  lng: number;
}

interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function LocationAutocompleteField({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: LocationSuggestion) => void;
}) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3) {
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
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const places = (await response.json()) as NominatimPlace[];
        const mappedPlaces = places
          .map((place) => {
            const city =
              place.address?.city ||
              place.address?.town ||
              place.address?.village ||
              "";
            const detail = [city, place.address?.state, place.address?.country]
              .filter(Boolean)
              .join(", ");

            return {
              id: String(place.place_id),
              label: place.display_name,
              detail: detail || place.type || "Location",
              lat: Number(place.lat),
              lng: Number(place.lon),
            };
          })
          .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));

        locationSuggestionCache.set(cacheKey, mappedPlaces);
        setSuggestions(mappedPlaces);
        setOpen(mappedPlaces.length > 0);
        setActiveIndex(0);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 420);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function selectSuggestion(place: LocationSuggestion) {
    onSelect(place);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>Location</label>
      <div className={styles.locationInputWrap}>
        <MapPin size={15} className={styles.locationInputIcon} />
        <input
          className={`${styles.input} ${styles.locationInput}`}
          type="text"
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(0);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }

            if (!open || suggestions.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }

            if (event.key === "Enter") {
              event.preventDefault();
              selectSuggestion(suggestions[activeIndex]);
            }
          }}
          placeholder="Search a city, country, or place"
        />
        {loading && <Loader2 size={15} className={styles.locationSpinner} />}
      </div>

      {open && suggestions.length > 0 && (
        <div className={styles.locationSuggestions} id={listId} role="listbox">
          {suggestions.map((place, index) => (
            <button
              key={place.id}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? styles.autocompleteOptionActive : undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(place)}
            >
              <MapPin size={14} />
              <span>
                <strong>{place.label.split(",")[0]}</strong>
                <small>{place.detail}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Select field component
interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

// Monthly revenue for the SaaS chart, oldest first. Kept as text while typing
// so "1200, " doesn't get rewritten under the cursor.
function RevenueField({
  values,
  onChange,
}: {
  values: number[];
  onChange: (values: number[]) => void;
}) {
  const [draft, setDraft] = useState(() => values.join(", "));
  const id = useId();

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        Monthly revenue
      </label>
      <textarea
        id={id}
        className={styles.textarea}
        value={draft}
        placeholder="1200, 1450, 1890, 2380, 3050"
        rows={2}
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
      <span className={styles.fieldHint}>
        Oldest to newest, separated by commas. The chart shows when there are 2 or more months
        and the block is size L or Wide.
      </span>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProfileFields({
  content,
  onChange,
}: {
  content: IdentityContent;
  onChange: (field: string, value: unknown) => void;
}) {
  const portraitType = content.portraitType || "memoji";
  const availability = content.eyebrow ?? content.availability ?? "";
  const bioLength = content.bio?.length || 0;

  return (
    <>
      <Field
        label="Name"
        value={content.name || ""}
        onChange={(value) => onChange("name", value)}
        placeholder="Alice Chen"
      />
      <FreeTextCombobox
        label="Professional title"
        value={content.title || ""}
        onChange={(value) => onChange("title", value)}
        suggestions={PROFESSIONAL_TITLE_SUGGESTIONS}
        placeholder="Product Designer"
      />
      <Field
        label="Main headline"
        value={content.headline || ""}
        onChange={(value) => onChange("headline", value)}
        placeholder="Designing sharp products people remember."
        multiline
      />
      <div className={styles.field}>
        <label className={styles.label}>Introduction</label>
        <textarea
          className={styles.textarea}
          value={content.bio || ""}
          onChange={(event) => onChange("bio", event.target.value)}
          rows={4}
          placeholder="A short note about what you do, who you help, and how you work."
        />
        <p className={styles.fieldHint}>{bioLength}/240 characters suggested</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Portrait</label>
        <div className={styles.segmentControl} role="group" aria-label="Portrait type">
          {(["photo", "memoji", "none"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={portraitType === type ? styles.segmentControlActive : ""}
              onClick={() => {
                onChange("portraitType", type);
                if (type === "memoji" && !content.avatar) {
                  onChange("avatar", DEFAULT_MEMOJI_AVATAR);
                }
              }}
              aria-pressed={portraitType === type}
            >
              {type[0].toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {portraitType === "photo" && (
        <>
          <ImageUploadField
            label="Photo"
            value={content.avatar || ""}
            onChange={(value) => onChange("avatar", value)}
          />
          <SelectField
            label="Focal point"
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
          <label className={styles.label}>Memoji</label>
          <div className={styles.memojiPicker}>
            {MEMOJI_OPTIONS.map((src) => (
              <button
                key={src}
                type="button"
                className={content.avatar === src ? styles.memojiActive : ""}
                onClick={() => onChange("avatar", src)}
                aria-label="Select memoji"
                aria-pressed={content.avatar === src}
              >
                <NextImage src={src} alt="" width={42} height={42} />
              </button>
            ))}
          </div>
          {content.avatar && (
            <button
              type="button"
              className={styles.secondaryEditorButton}
              onClick={() => onChange("avatar", "")}
            >
              Remove memoji
            </button>
          )}
        </div>
      )}
      {portraitType === "none" && (
        <p className={styles.fieldHint}>
          No portrait card will render publicly. The identity card expands into that space.
        </p>
      )}
      <Field
        label="Availability label"
        value={availability}
        onChange={(value) => {
          onChange("availabilityLabel", value);
        }}
        placeholder="Available for freelance"
      />
      <Field
        label="Location"
        value={content.location || ""}
        onChange={(value) => onChange("location", value)}
        placeholder="London, UK"
      />
      <Field
        label="Email"
        value={content.email || ""}
        onChange={(value) => onChange("email", value)}
        placeholder="hello@example.com"
        type="email"
      />
      <Field
        label="Website"
        value={content.website || ""}
        onChange={(value) => onChange("website", value)}
        onBlur={(value) => onChange("website", normalizeWebsiteInput(value))}
        placeholder="example.com"
        type="url"
      />
    </>
  );
}

interface FreeTextComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

function FreeTextCombobox({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
}: FreeTextComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const reactId = useId();
  const listId = `combobox-${reactId}`;
  const query = value.trim().toLowerCase();
  const filtered = suggestions
    .filter((suggestion) => !query || suggestion.toLowerCase().includes(query))
    .slice(0, 8);

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.autocompleteWrapper}>
        <input
          className={styles.input}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined
          }
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              return;
            }

            if (!isOpen || filtered.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }

            if (event.key === "Enter") {
              event.preventDefault();
              selectSuggestion(filtered[activeIndex]);
            }
          }}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 140)}
          placeholder={placeholder}
        />
        {isOpen && filtered.length > 0 && (
          <div className={styles.autocompleteDropdown} role="listbox" id={listId}>
            {filtered.map((suggestion, index) => (
              <button
                key={suggestion}
                id={`${listId}-${index}`}
                type="button"
                className={`${styles.autocompleteOption} ${
                  index === activeIndex ? styles.autocompleteOptionActive : ""
                }`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Checkbox field component
interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className={styles.checkboxField}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.checkbox}
      />
      <label className={styles.checkboxLabel}>{label}</label>
    </div>
  );
}

// Array field component for lists
interface ArrayFieldProps<T> {
  label: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
}

function ArrayField<T>({
  label,
  items,
  renderItem,
  onAdd,
  onRemove,
  onMove,
}: ArrayFieldProps<T>) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.arrayItems}>
        {items.map((item, i) => (
          <div key={i} className={styles.arrayItem}>
            {renderItem(item, i)}
            {onMove && (
              <div className={styles.arrayMoveActions}>
                <button
                  type="button"
                  className={styles.arrayMoveButton}
                  onClick={() => onMove(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${label} item up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.arrayMoveButton}
                  onClick={() => onMove(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${label} item down`}
                >
                  ↓
                </button>
              </div>
            )}
            <button className={styles.removeButton} onClick={() => onRemove(i)}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button className={styles.addButton} onClick={onAdd}>
        <Plus size={14} />
        Add item
      </button>
    </div>
  );
}

// Image upload field component
interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  small?: boolean;
  maxSizeMB?: number;
}

function ImageUploadField({
  label,
  value,
  onChange,
  small,
  maxSizeMB = 10,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image must be less than ${maxSizeMB}MB`);
      return;
    }

    // Convert to base64 for local preview (in production, you'd upload to storage)
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.imageUploadWrapper}>
        {value ? (
          <div className={styles.imagePreviewWrapper}>
            <NextImage
              src={value}
              alt="Preview"
              width={small ? 40 : 80}
              height={small ? 40 : 80}
              className={small ? styles.imagePreviewSmall : styles.imagePreview}
            />
            <button
              type="button"
              className={styles.imageRemoveButton}
              onClick={() => onChange("")}
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className={small ? styles.imageDropzoneSmall : styles.imageDropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} />
            <span>Click to upload</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
      </div>
    </div>
  );
}

// File Upload Field (for PDFs, documents, etc.)
interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  hint?: string;
}

function FileUploadField({
  label,
  value,
  onChange,
  accept = ".pdf,.doc,.docx",
  hint,
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const fileName = value.startsWith("data:")
    ? "Uploaded file"
    : value
      ? value.split("/").pop() || "File"
      : "";

  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.fileUploadContainer}>
        {value ? (
          <div className={styles.filePreview}>
            <FileText size={20} />
            <span className={styles.fileName}>{fileName}</span>
            <button
              className={styles.imageRemoveButton}
              onClick={() => onChange("")}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className={styles.fileDropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} />
            <span>Click to upload file</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
      </div>
      <input
        className={styles.urlInput}
        value={value.startsWith("data:") ? "" : value}
        onChange={handleUrlPaste}
        placeholder="Or paste file URL (Google Drive, Dropbox, etc.)"
      />
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

// Tech Stack Editor with autocomplete
interface TechStackEditorProps {
  items: { name: string; icon: string; category?: string }[];
  onChange: (items: { name: string; icon: string; category?: string }[]) => void;
}

// Tech icon component for editor
function TechIcon({
  name,
  fallbackIcon,
}: {
  name: string;
  fallbackIcon: string;
}) {
  const [imgError, setImgError] = useState(false);
  const iconUrl = getTechIconUrl(name);

  if (iconUrl && !imgError) {
    return (
      <NextImage
        src={iconUrl}
        alt={name}
        width={16}
        height={16}
        className={styles.techIconSvg}
        onError={() => setImgError(true)}
      />
    );
  }
  return <span>{fallbackIcon}</span>;
}

function TechStackEditor({ items, onChange }: TechStackEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const suggestions = searchQuery
    ? getTechSuggestions(searchQuery)
    : selectedCategory === "all"
      ? techStack.slice(0, 12)
      : getTechsByCategory(selectedCategory as TechItem["category"]);

  const handleAddTech = (tech: TechItem) => {
    if (
      items.some((item) => item.name.toLowerCase() === tech.name.toLowerCase())
    ) {
      return;
    }
    onChange([...items, { name: tech.name, icon: tech.icon, category: tech.category }]);
    setSearchQuery("");
  };

  const handleAddCustomSkill = () => {
    const name = searchQuery.trim();
    if (!name) return;
    if (items.some((item) => item.name.trim().toLowerCase() === name.toLowerCase())) return;

    const known = getTechByName(name);
    onChange([
      ...items,
      {
        name,
        icon: known?.icon || initialsForSkill(name),
        category: known?.category || (selectedCategory === "all" ? undefined : selectedCategory),
      },
    ]);
    setSearchQuery("");
  };

  const handleRemoveTech = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>Technologies</label>

      {/* Selected techs */}
      {items.length > 0 && (
        <div className={styles.techChips}>
          {items.map((item, i) => (
            <div key={i} className={styles.techChip}>
              <span className={styles.techChipIcon}>
                <TechIcon name={item.name} fallbackIcon={item.icon} />
              </span>
              <span className={styles.techChipName}>{item.name}</span>
              <button
                className={styles.techChipRemove}
                onClick={() => handleRemoveTech(i)}
              >
                <X size={12} />
              </button>
              <button
                className={styles.techChipRemove}
                onClick={() => i > 0 && onChange(items.map((entry, index) => {
                  if (index === i - 1) return items[i];
                  if (index === i) return items[i - 1];
                  return entry;
                }))}
                disabled={i === 0}
                aria-label={`Move ${item.name} up`}
              >
                ↑
              </button>
              <button
                className={styles.techChipRemove}
                onClick={() => i < items.length - 1 && onChange(items.map((entry, index) => {
                  if (index === i + 1) return items[i];
                  if (index === i) return items[i + 1];
                  return entry;
                }))}
                disabled={i === items.length - 1}
                aria-label={`Move ${item.name} down`}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div className={styles.techCategoryFilter}>
        <button
          className={`${styles.techCategoryBtn} ${
            selectedCategory === "all" ? styles.active : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {techCategories.map((cat) => (
          <button
            key={cat.value}
            className={`${styles.techCategoryBtn} ${
              selectedCategory === cat.value ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className={styles.techSearchWrapper}>
        <input
          className={styles.input}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddCustomSkill();
            }
          }}
          placeholder="Search technologies..."
        />
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddCustomSkill}
          disabled={!searchQuery.trim()}
        >
          <Plus size={14} />
          Add custom skill
        </button>
      </div>

      {/* Suggestions grid */}
      <div className={styles.techSuggestions}>
        {suggestions.slice(0, 12).map((tech) => {
          const isAdded = items.some(
            (item) => item.name.toLowerCase() === tech.name.toLowerCase(),
          );
          return (
            <button
              key={tech.name}
              className={`${styles.techSuggestion} ${
                isAdded ? styles.added : ""
              }`}
              onClick={() => !isAdded && handleAddTech(tech)}
              disabled={isAdded}
            >
              <span className={styles.techSuggestionIcon}>
                <TechIcon name={tech.name} fallbackIcon={tech.icon} />
              </span>
              <span className={styles.techSuggestionName}>{tech.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Projects Editor with language autocomplete
interface ProjectItem {
  name: string;
  description: string;
  url: string;
  language: string;
  stars?: number;
  forks?: number;
}

interface ProjectsEditorProps {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}

function ProjectsEditor({ items, onChange }: ProjectsEditorProps) {
  const handleAdd = () => {
    onChange([...items, { name: "", description: "", url: "", language: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: keyof ProjectItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>Projects</label>
      <div className={styles.arrayItems}>
        {items.map((item, i) => (
          <div key={i} className={styles.arrayItem}>
            <div className={styles.arrayItemColumn}>
              <input
                className={styles.input}
                value={item.name || ""}
                onChange={(e) => handleUpdate(i, "name", e.target.value)}
                placeholder="Project name"
              />
              <input
                className={styles.input}
                value={item.description || ""}
                onChange={(e) => handleUpdate(i, "description", e.target.value)}
                placeholder="Description"
              />
              <input
                className={styles.smallInput}
                value={item.url || ""}
                onChange={(e) => handleUpdate(i, "url", e.target.value)}
                placeholder="URL"
              />
              <LanguageAutocomplete
                value={item.language || ""}
                onChange={(lang) => handleUpdate(i, "language", lang)}
              />
            </div>
            <button
              className={styles.removeButton}
              onClick={() => handleRemove(i)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button className={styles.addButton} onClick={handleAdd}>
        <Plus size={14} />
        Add project
      </button>
    </div>
  );
}

// Language autocomplete component
interface LanguageAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

function LanguageAutocomplete({ value, onChange }: LanguageAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter languages based on search
  const languages = techStack.filter(
    (tech) =>
      tech.category === "language" ||
      tech.category === "frontend" ||
      tech.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filtered = search
    ? languages.filter((tech) =>
        tech.name.toLowerCase().includes(search.toLowerCase()),
      )
    : languages;

  const handleSelect = (tech: TechItem) => {
    onChange(tech.name);
    setSearch(tech.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange("");
    }
  };

  return (
    <div className={styles.autocompleteWrapper} ref={wrapperRef}>
      <div className={styles.autocompleteInput}>
        {value && getTechIconUrl(value) && (
          <NextImage
            src={getTechIconUrl(value)!}
            alt={value}
            width={14}
            height={14}
            className={styles.autocompleteIcon}
          />
        )}
        <input
          className={styles.smallInput}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Type to search language..."
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <div className={styles.autocompleteDropdown}>
          {filtered.slice(0, 8).map((tech) => (
            <button
              key={tech.name}
              className={styles.autocompleteOption}
              onClick={() => handleSelect(tech)}
              type="button"
            >
              <TechIcon name={tech.name} fallbackIcon={tech.icon} />
              <span>{tech.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
