"use client";

import { useRef } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useEditor } from "@/app/lib/editor-context";
import { BlockContent } from "@/app/lib/types";
import styles from "./BlockEditor.module.css";

export function BlockEditor() {
  const { selectedBlockId, content, updateBlockContent, selectBlock } =
    useEditor();
  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;

  if (!selectedBlockId || !selectedContent) {
    return (
      <div className={styles.empty}>
        <p>Select a block to edit</p>
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
        <ArrayField
          label="Technologies"
          items={content.data.items}
          renderItem={(item, i) => (
            <div className={styles.arrayItemRow}>
              <input
                className={styles.smallInput}
                value={item.icon}
                onChange={(e) => {
                  const newItems = [...content.data.items];
                  newItems[i] = { ...item, icon: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Icon"
                style={{ width: 50 }}
              />
              <input
                className={styles.smallInput}
                value={item.name}
                onChange={(e) => {
                  const newItems = [...content.data.items];
                  newItems[i] = { ...item, name: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Name"
              />
            </div>
          )}
          onAdd={() =>
            handleChange("items", [
              ...content.data.items,
              { name: "", icon: "💻" },
            ])
          }
          onRemove={(i) => {
            const newItems = content.data.items.filter((_, idx) => idx !== i);
            handleChange("items", newItems);
          }}
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
        <ArrayField
          label="Projects"
          items={content.data.items || []}
          renderItem={(item, i) => (
            <div className={styles.arrayItemColumn}>
              <input
                className={styles.input}
                value={item.name || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, name: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Project name"
              />
              <input
                className={styles.input}
                value={item.description || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, description: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Description"
              />
              <input
                className={styles.smallInput}
                value={item.url || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, url: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="URL"
              />
              <input
                className={styles.smallInput}
                value={item.language || ""}
                onChange={(e) => {
                  const newItems = [...(content.data.items || [])];
                  newItems[i] = { ...item, language: e.target.value };
                  handleChange("items", newItems);
                }}
                placeholder="Language (e.g. TypeScript)"
              />
            </div>
          )}
          onAdd={() =>
            handleChange("items", [
              ...(content.data.items || []),
              { name: "", description: "", url: "", language: "" },
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
