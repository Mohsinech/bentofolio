"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Code2,
  Briefcase,
  TrendingUp,
  Link as LinkIcon,
  FileText,
  Eye,
  Save,
  LogOut,
  Check,
  Loader2,
  DollarSign,
  Github,
  FolderGit2,
  Share2,
  CircleDot,
  Palette,
  Sparkles,
  Music,
  Quote,
  FileDown,
  Copy,
  ExternalLink,
  Youtube,
  Instagram,
  Users,
  TrendingUp as Career,
} from "lucide-react";
import styles from "./editor.module.css";
import { useEditor } from "@/app/lib/editor-context";
import { useAuth } from "@/app/lib/hooks";
import { BlockType, ThemeId } from "@/app/lib/types";
import { DraggableSidebarBlock } from "./DraggableSidebarBlock";
import { ThemeSelector } from "@/app/components/ThemeSelector";

const blockTypes: {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
  category: string;
}[] = [
  // Profile
  {
    type: "identity",
    icon: <User size={18} />,
    label: "Identity",
    category: "profile",
  },
  {
    type: "map",
    icon: <MapPin size={18} />,
    label: "Location",
    category: "profile",
  },
  {
    type: "availability",
    icon: <CircleDot size={18} />,
    label: "Status",
    category: "profile",
  },
  // Developer
  {
    type: "github",
    icon: <Github size={18} />,
    label: "GitHub",
    category: "developer",
  },
  {
    type: "projects",
    icon: <FolderGit2 size={18} />,
    label: "Projects",
    category: "developer",
  },
  {
    type: "techstack",
    icon: <Code2 size={18} />,
    label: "Tech Stack",
    category: "developer",
  },
  // Work
  {
    type: "experience",
    icon: <Briefcase size={18} />,
    label: "Experience",
    category: "work",
  },
  {
    type: "saas",
    icon: <DollarSign size={18} />,
    label: "SaaS",
    category: "work",
  },
  {
    type: "metrics",
    icon: <TrendingUp size={18} />,
    label: "Metrics",
    category: "work",
  },
  // Social
  {
    type: "social",
    icon: <Share2 size={18} />,
    label: "Social",
    category: "social",
  },
  {
    type: "link",
    icon: <LinkIcon size={18} />,
    label: "Link",
    category: "social",
  },
  {
    type: "spotify",
    icon: <Music size={18} />,
    label: "Spotify",
    category: "social",
  },
  {
    type: "youtube",
    icon: <Youtube size={18} />,
    label: "YouTube",
    category: "social",
  },
  {
    type: "instagram",
    icon: <Instagram size={18} />,
    label: "Instagram",
    category: "social",
  },
  {
    type: "network",
    icon: <Users size={18} />,
    label: "Network",
    category: "social",
  },
  // Content
  {
    type: "text",
    icon: <FileText size={18} />,
    label: "Text",
    category: "content",
  },
  {
    type: "quote",
    icon: <Quote size={18} />,
    label: "Quote",
    category: "content",
  },
  {
    type: "resume",
    icon: <FileDown size={18} />,
    label: "Resume",
    category: "content",
  },
  {
    type: "career",
    icon: <Career size={18} />,
    label: "Career",
    category: "content",
  },
];

interface EditorSidebarProps {
  username?: string;
  onSave?: () => Promise<void>;
  saving?: boolean;
  onGitHubImport?: () => Promise<void>;
  currentTheme?: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
  isPro?: boolean;
}

export function EditorSidebar({
  username,
  onSave,
  saving,
  onGitHubImport,
  currentTheme = "dark",
  onThemeChange,
  isPro = false,
}: EditorSidebarProps) {
  const { isEditMode, toggleEditMode, addBlock } = useEditor();
  const { signOut, githubUsername } = useAuth();
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = username ? `https://bentofolio.dev/${username}` : "";

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!username) return;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = profileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    if (username) {
      window.open(`/${username}`, "_blank");
    }
  };

  const handleGitHubImport = async () => {
    if (!githubUsername || !onGitHubImport) return;
    setImporting(true);
    try {
      await onGitHubImport();
    } catch (error) {
      console.error("GitHub import failed:", error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>
        Bento<span className={styles.logoAccent}>Folio</span>
      </h1>

      {username && (
        <div className={styles.usernameDisplay}>
          <span className={styles.usernameLabel}>Your profile</span>
          <span className={styles.usernameValue}>
            bentofolio.dev/{username}
          </span>
        </div>
      )}

      {/* GitHub Import */}
      {githubUsername && (
        <div className={styles.section}>
          <button
            className={`${styles.actionButton} ${styles.githubButton}`}
            onClick={handleGitHubImport}
            disabled={importing}
          >
            {importing ? (
              <Loader2 size={16} className={styles.spinning} />
            ) : (
              <Github size={16} />
            )}
            Import from GitHub
          </button>
          <span className={styles.githubHint}>@{githubUsername}</span>
        </div>
      )}

      {/* Theme Selector */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            <Palette size={14} />
            Theme
          </span>
          <Link href="/themes" className={styles.sectionLink}>
            View all
          </Link>
        </div>
        <ThemeSelector
          currentTheme={currentTheme}
          isPro={isPro}
          onSelect={(theme) => onThemeChange?.(theme)}
          compact
        />
        {!isPro && (
          <Link href="/pricing" className={styles.proHint}>
            <Sparkles size={12} />
            Unlock 9 more themes
          </Link>
        )}
      </div>

      {/* Edit mode toggle */}
      <div className={styles.section}>
        <div className={styles.modeToggle}>
          <span className={styles.modeLabel}>Edit Mode</span>
          <button
            className={`${styles.toggle} ${isEditMode ? styles.active : ""}`}
            onClick={toggleEditMode}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </div>

      {/* Add blocks menu */}
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Add Blocks</span>
        <span className={styles.sectionHint}>Click or drag to add</span>
        <div className={styles.blockMenu}>
          {blockTypes.map((block) => (
            <DraggableSidebarBlock
              key={block.type}
              type={block.type}
              icon={block.icon}
              label={block.label}
              onAdd={addBlock}
              isPro={isPro}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.primaryButton}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={16} className={styles.spinning} />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save"}
        </button>

        <div className={styles.actionRow}>
          <button
            className={`${styles.actionButton} ${styles.secondaryButton} ${styles.actionHalf}`}
            onClick={handlePreview}
            disabled={!username}
            title="Open in new tab"
          >
            <ExternalLink size={16} />
            Preview
          </button>

          <button
            className={`${styles.actionButton} ${styles.shareButton} ${styles.actionHalf}`}
            onClick={handleShare}
            disabled={!username}
            title="Copy link to clipboard"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <button
          className={`${styles.actionButton} ${styles.dangerButton}`}
          onClick={signOut}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
