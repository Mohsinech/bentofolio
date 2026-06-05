"use client";

import { useEffect, useRef, useState } from "react";
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
import { BlockContent } from "@/app/lib/types";
import { importFromGitHub } from "@/app/lib/github";
import { getCompanyLogo } from "@/app/lib/company-logos";
import {
  techStack,
  getTechSuggestions,
  techCategories,
  getTechsByCategory,
  TechItem,
} from "@/app/lib/tech-stack";
import { getTechIconUrl, techIcons } from "@/app/lib/tech-icons";
import styles from "./BlockEditor.module.css";

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
    onUpdate(blockId, {
      ...content,
      data: { ...content.data, [field]: value },
    } as BlockContent);
  };

  switch (content.type) {
    case "identity":
      return (
        <>
          <Field
            label="Name"
            value={content.data.name}
            onChange={(v) => handleChange("name", v)}
          />
          <Field
            label="Title"
            value={content.data.title}
            onChange={(v) => handleChange("title", v)}
          />
          <ImageUploadField
            label="Memoji"
            value={content.data.avatar}
            onChange={(v) => handleChange("avatar", v)}
          />
          <Field
            label="Availability"
            value={content.data.availability || ""}
            onChange={(v) => handleChange("availability", v)}
            placeholder="Available for work"
          />
          <Field
            label="Location"
            value={content.data.location || ""}
            onChange={(v) => handleChange("location", v)}
            placeholder="Remote"
          />
          <Field
            label="Email"
            value={content.data.email || ""}
            onChange={(v) => handleChange("email", v)}
            placeholder="hello@example.com"
          />
          <Field
            label="Website"
            value={content.data.website || ""}
            onChange={(v) => handleChange("website", v)}
            placeholder="example.com"
          />
          <Field
            label="Bio"
            value={content.data.bio || ""}
            onChange={(v) => handleChange("bio", v)}
            multiline
          />
        </>
      );

    case "map":
      return (
        <>
          <LocationAutocompleteField
            value={content.data.location}
            onChange={(value) => handleChange("location", value)}
            onSelect={(place) => {
              onUpdate(blockId, {
                ...content,
                data: {
                  ...content.data,
                  location: place.label,
                  lat: place.lat,
                  lng: place.lng,
                },
              });
            }}
          />
        </>
      );

    case "github":
      return (
        <GitHubImportEditor
          username={content.data.username}
          onImport={(githubContent) =>
            onUpdate(blockId, { type: "github", data: githubContent })
          }
        />
      );

    case "link":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title}
            onChange={(v) => handleChange("title", v)}
            placeholder="Let's Collaborate"
          />
          <Field
            label="Email or URL"
            value={content.data.url}
            onChange={(v) => handleChange("url", v)}
            placeholder="hello@example.com"
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
          <Field
            label="MRR"
            value={String(content.data.mrr)}
            onChange={(v) => handleChange("mrr", Number(v))}
            type="number"
          />
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
        <TechStackEditor
          items={content.data.items}
          onChange={(items) => handleChange("items", items)}
        />
      );

    case "social":
      return (
        <ArrayField
          label="Social Links"
          items={content.data.items}
          renderItem={(item, i) => (
            <div className={styles.arrayItemColumn}>
              <select
                className={styles.select}
                value={item.platform}
                onChange={(e) => {
                  const newItems = [...content.data.items];
                  newItems[i] = {
                    ...item,
                    platform: e.target.value as typeof item.platform,
                  };
                  handleChange("items", newItems);
                }}
              >
                <option value="github">GitHub</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="dribbble">Dribbble</option>
                <option value="behance">Behance</option>
                <option value="website">Website</option>
                <option value="email">Email</option>
              </select>
              <input
                className={styles.input}
                value={item.url}
                onChange={(e) => {
                  const newItems = [...content.data.items];
                  newItems[i] = { ...item, url: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="URL"
              />
            </div>
          )}
          onAdd={() =>
            handleChange("items", [
              ...content.data.items,
              { platform: "website" as const, url: "" },
            ])
          }
          onRemove={(i) => {
            const newItems = content.data.items.filter((_, idx) => idx !== i);
            handleChange("items", newItems);
          }}
        />
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
                        logo: getCompanyLogo(company) || "",
                      };
                      handleChange("items", newItems);
                    }}
                    placeholder="Upwork, Facebook, Figma..."
                  />
                </div>
                <input
                  className={styles.input}
                  value={item.role || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, role: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="Role"
                />
                <input
                  className={styles.smallInput}
                  value={item.period || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.items || [])];
                    newItems[i] = { ...item, period: e.target.value };
                    handleChange("items", newItems);
                  }}
                  placeholder="2022 - Present"
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
            label="Title"
            value={content.data.title || ""}
            onChange={(v) => handleChange("title", v)}
          />
          <ArrayField
            label="Tools"
            items={content.data.items || []}
            renderItem={(item, i) => (
              <div className={styles.arrayItemColumn}>
                <input
                  className={styles.input}
                  value={item.name || ""}
                  onChange={(event) => {
                    const items = [...(content.data.items || [])];
                    items[i] = { ...item, name: event.target.value };
                    handleChange("items", items);
                  }}
                  placeholder="Figma"
                  list="tool-name-suggestions"
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
          />
          <datalist id="tool-name-suggestions">
            {techIcons.map((icon) => (
              <option key={icon.name} value={icon.name} />
            ))}
          </datalist>
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
  username,
  onImport,
}: {
  username: string;
  onImport: (content: Extract<BlockContent, { type: "github" }>["data"]) => void;
}) {
  const [input, setInput] = useState(username || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const cleanUsername = input
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\/.*$/, "");

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
        onChange={(event) => setInput(event.target.value)}
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
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}

function Field({
  label,
  value,
  onChange,
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
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={styles.input}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
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
        setSuggestions(
          places.map((place) => {
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
          }),
        );
        setOpen(true);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  return (
    <div className={styles.field}>
      <label className={styles.label}>Location</label>
      <div className={styles.locationInputWrap}>
        <MapPin size={15} className={styles.locationInputIcon} />
        <input
          className={`${styles.input} ${styles.locationInput}`}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search a city, country, or place"
        />
        {loading && <Loader2 size={15} className={styles.locationSpinner} />}
      </div>

      {open && suggestions.length > 0 && (
        <div className={styles.locationSuggestions}>
          {suggestions.map((place) => (
            <button
              key={place.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(place);
                setOpen(false);
              }}
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
}

function ArrayField<T>({
  label,
  items,
  renderItem,
  onAdd,
  onRemove,
}: ArrayFieldProps<T>) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.arrayItems}>
        {items.map((item, i) => (
          <div key={i} className={styles.arrayItem}>
            {renderItem(item, i)}
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
  items: { name: string; icon: string }[];
  onChange: (items: { name: string; icon: string }[]) => void;
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
    // Check if already added
    if (
      items.some((item) => item.name.toLowerCase() === tech.name.toLowerCase())
    ) {
      return;
    }
    onChange([...items, { name: tech.name, icon: tech.icon }]);
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
          placeholder="Search technologies..."
        />
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
