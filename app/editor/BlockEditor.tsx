"use client";

import { useRef, useState } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { useEditor } from "@/app/lib/editor-context";
import { BlockContent } from "@/app/lib/types";
import {
  techStack,
  getTechSuggestions,
  techCategories,
  getTechsByCategory,
  TechItem,
} from "@/app/lib/tech-stack";
import { getTechIconUrl } from "@/app/lib/tech-icons";
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
            label="Avatar"
            value={content.data.avatar}
            onChange={(v) => handleChange("avatar", v)}
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
          <Field
            label="Location"
            value={content.data.location}
            onChange={(v) => handleChange("location", v)}
          />
        </>
      );

    case "github":
      return (
        <>
          <Field
            label="GitHub Username"
            value={content.data.username}
            onChange={(v) => handleChange("username", v)}
          />
          <Field
            label="Followers"
            value={String(content.data.followers)}
            onChange={(v) => handleChange("followers", Number(v))}
            type="number"
          />
          <Field
            label="Repos"
            value={String(content.data.publicRepos)}
            onChange={(v) => handleChange("publicRepos", Number(v))}
            type="number"
          />
          <Field
            label="Stars"
            value={String(content.data.totalStars || 0)}
            onChange={(v) => handleChange("totalStars", Number(v))}
            type="number"
          />
        </>
      );

    case "link":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title}
            onChange={(v) => handleChange("title", v)}
          />
          <Field
            label="URL"
            value={content.data.url}
            onChange={(v) => handleChange("url", v)}
          />
        </>
      );

    case "text":
      return (
        <Field
          label="Text"
          value={content.data.text}
          onChange={(v) => handleChange("text", v)}
          multiline
        />
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
          <CheckboxField
            label="Open to work"
            checked={content.data.forHire}
            onChange={(v) => handleChange("forHire", v)}
          />
          <Field
            label="Contact Email"
            value={content.data.preferredContact || ""}
            onChange={(v) => handleChange("preferredContact", v)}
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
            <div className={styles.arrayItemRow}>
              <select
                className={styles.smallSelect}
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
                className={styles.smallInput}
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
        <ArrayField
          label="Work Experience"
          items={content.data.items || []}
          renderItem={(item, i) => (
            <div className={styles.arrayItemColumn}>
              <input
                className={styles.input}
                value={item.company || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, company: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Company"
              />
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
              { company: "", role: "", period: "" },
            ])
          }
          onRemove={(i) => {
            const newItems = (content.data.items || []).filter(
              (_, idx) => idx !== i
            );
            handleChange("items", newItems);
          }}
        />
      );

    case "metrics":
      return (
        <ArrayField
          label="Metrics"
          items={content.data.items || []}
          renderItem={(item, i) => (
            <div className={styles.arrayItemRow}>
              <input
                className={styles.smallInput}
                value={item.label || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, label: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Label"
              />
              <input
                className={styles.smallInput}
                value={item.value || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, value: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Value"
              />
            </div>
          )}
          onAdd={() =>
            handleChange("items", [
              ...(content.data.items || []),
              { label: "", value: "" },
            ])
          }
          onRemove={(i) => {
            const newItems = (content.data.items || []).filter(
              (_, idx) => idx !== i
            );
            handleChange("items", newItems);
          }}
        />
      );

    case "projects":
      return (
        <ProjectsEditor
          items={content.data.items || []}
          onChange={(items) => handleChange("items", items)}
        />
      );

    case "youtube":
      return (
        <>
          <Field
            label="Channel Name"
            value={content.data.channelName || ""}
            onChange={(v) => handleChange("channelName", v)}
            placeholder="Your channel name"
          />
          <Field
            label="Subscribers"
            value={content.data.subscribers || ""}
            onChange={(v) => handleChange("subscribers", v)}
            placeholder="e.g. 100K"
          />
          <Field
            label="Video URL"
            value={content.data.videoUrl || ""}
            onChange={(v) => handleChange("videoUrl", v)}
            placeholder="https://youtube.com/watch?v=..."
          />
          <p className={styles.fieldHint}>
            Paste a YouTube video, shorts, or playlist link
          </p>
        </>
      );

    case "instagram":
      return (
        <>
          <Field
            label="Instagram URL"
            value={content.data.postUrl || ""}
            onChange={(v) => handleChange("postUrl", v)}
            placeholder="https://instagram.com/p/... or /reel/..."
          />
          <p className={styles.fieldHint}>
            Paste any Instagram post or reel link
          </p>
        </>
      );

    case "network":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || "Network"}
            onChange={(v) => handleChange("title", v)}
          />
          <ArrayField
            label="Connections"
            items={content.data.connections || []}
            renderItem={(conn, idx) => (
              <div key={idx} className={styles.arrayItemFields}>
                <input
                  className={styles.input}
                  value={conn.name}
                  onChange={(e) => {
                    const newItems = [...(content.data.connections || [])];
                    newItems[idx] = { ...newItems[idx], name: e.target.value };
                    handleChange("connections", newItems);
                  }}
                  placeholder="Name"
                />
                <input
                  className={styles.input}
                  value={conn.avatar}
                  onChange={(e) => {
                    const newItems = [...(content.data.connections || [])];
                    newItems[idx] = {
                      ...newItems[idx],
                      avatar: e.target.value,
                    };
                    handleChange("connections", newItems);
                  }}
                  placeholder="Avatar URL"
                />
                <input
                  className={styles.input}
                  value={conn.url || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.connections || [])];
                    newItems[idx] = { ...newItems[idx], url: e.target.value };
                    handleChange("connections", newItems);
                  }}
                  placeholder="Profile URL (optional)"
                />
              </div>
            )}
            onAdd={() =>
              handleChange("connections", [
                ...(content.data.connections || []),
                { name: "", avatar: "", url: "" },
              ])
            }
            onRemove={(i) => {
              const newItems = (content.data.connections || []).filter(
                (_, idx) => idx !== i
              );
              handleChange("connections", newItems);
            }}
          />
        </>
      );

    case "resume":
      return (
        <>
          <Field
            label="Resume Title"
            value={content.data.title || "My Resume"}
            onChange={(v) => handleChange("title", v)}
            placeholder="My Resume"
          />
          <Field
            label="Resume URL"
            value={content.data.fileUrl || ""}
            onChange={(v) => handleChange("fileUrl", v)}
            placeholder="https://drive.google.com/... or PDF URL"
          />
          <Field
            label="Last Updated"
            value={content.data.lastUpdated || ""}
            onChange={(v) => handleChange("lastUpdated", v)}
            placeholder="e.g. Jan 2026"
          />
          <p className={styles.fieldHint}>
            Add a link to your resume (Google Drive, Dropbox, etc.)
          </p>
        </>
      );

    case "career":
      return (
        <>
          <Field
            label="Title"
            value={content.data.title || "Career Path"}
            onChange={(v) => handleChange("title", v)}
          />
          <ArrayField
            label="Positions"
            items={content.data.positions || []}
            renderItem={(position, idx) => (
              <div key={idx} className={styles.arrayItemFields}>
                <input
                  className={styles.input}
                  value={position.company}
                  onChange={(e) => {
                    const newItems = [...(content.data.positions || [])];
                    newItems[idx] = {
                      ...newItems[idx],
                      company: e.target.value,
                    };
                    handleChange("positions", newItems);
                  }}
                  placeholder="Company"
                />
                <input
                  className={styles.input}
                  value={position.role}
                  onChange={(e) => {
                    const newItems = [...(content.data.positions || [])];
                    newItems[idx] = { ...newItems[idx], role: e.target.value };
                    handleChange("positions", newItems);
                  }}
                  placeholder="Role/Title"
                />
                <input
                  className={styles.input}
                  value={position.dateRange}
                  onChange={(e) => {
                    const newItems = [...(content.data.positions || [])];
                    newItems[idx] = {
                      ...newItems[idx],
                      dateRange: e.target.value,
                    };
                    handleChange("positions", newItems);
                  }}
                  placeholder="Date Range (e.g. 2021 - 2024)"
                />
                <textarea
                  className={styles.textarea}
                  value={position.description || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.positions || [])];
                    newItems[idx] = {
                      ...newItems[idx],
                      description: e.target.value,
                    };
                    handleChange("positions", newItems);
                  }}
                  placeholder="Description (optional)"
                  rows={2}
                />
                <input
                  className={styles.input}
                  value={position.logo || ""}
                  onChange={(e) => {
                    const newItems = [...(content.data.positions || [])];
                    newItems[idx] = { ...newItems[idx], logo: e.target.value };
                    handleChange("positions", newItems);
                  }}
                  placeholder="Logo URL (optional)"
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={position.current || false}
                    onChange={(e) => {
                      const newItems = [...(content.data.positions || [])];
                      newItems[idx] = {
                        ...newItems[idx],
                        current: e.target.checked,
                      };
                      handleChange("positions", newItems);
                    }}
                  />
                  <span>Current Position</span>
                </label>
              </div>
            )}
            onAdd={() =>
              handleChange("positions", [
                ...(content.data.positions || []),
                {
                  company: "",
                  role: "",
                  dateRange: "",
                  description: "",
                  logo: "",
                  current: false,
                },
              ])
            }
            onRemove={(i) => {
              const newItems = (content.data.positions || []).filter(
                (_, idx) => idx !== i
              );
              handleChange("positions", newItems);
            }}
          />
        </>
      );

    default:
      return (
        <p className={styles.noFields}>
          No editable fields for this block type
        </p>
      );
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
        />
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
}

function ImageUploadField({
  label,
  value,
  onChange,
  small,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
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

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.imageUploadWrapper}>
        {value ? (
          <div className={styles.imagePreviewWrapper}>
            <img
              src={value}
              alt="Preview"
              className={small ? styles.imagePreviewSmall : styles.imagePreview}
            />
            <button
              className={styles.imageRemoveButton}
              onClick={() => onChange("")}
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
      <input
        className={styles.smallInput}
        value={value.startsWith("data:") ? "" : value}
        onChange={handleUrlPaste}
        placeholder="Or paste image URL"
        style={{ marginTop: 8 }}
      />
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
            (item) => item.name.toLowerCase() === tech.name.toLowerCase()
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
    value: string | number
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
      tech.name.toLowerCase().includes(search.toLowerCase())
  );

  const filtered = search
    ? languages.filter((tech) =>
        tech.name.toLowerCase().includes(search.toLowerCase())
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
