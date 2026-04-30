"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Code2,
  Briefcase,
  TrendingUp,
  Link as LinkIcon,
  FileText,
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
  Users,
  TrendingUp as Career,
  Globe,
  Info,
  X,
  BookOpen,
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
  {
    type: "creative",
    icon: <BookOpen size={18} />,
    label: "Creative",
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
  customDomain?: string | null;
  onCustomDomainChange?: (domain: string) => void;
}

export function EditorSidebar({
  username,
  onSave,
  saving,
  onGitHubImport,
  currentTheme = "dark",
  onThemeChange,
  isPro = false,
  customDomain,
  onCustomDomainChange,
}: EditorSidebarProps) {
  const { isEditMode, toggleEditMode, addBlock } = useEditor();
  const { signOut, githubUsername } = useAuth();
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [domainInput, setDomainInput] = useState(customDomain || "");
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  // Sync domain input with prop
  useEffect(() => {
    setDomainInput(customDomain || "");
  }, [customDomain]);

  // Use custom domain if set, otherwise bentofolio.dev
  const profileUrl = customDomain
    ? `https://${customDomain}`
    : username
      ? `https://bentofolio.dev/${username}`
      : "";

  const handleDomainSave = () => {
    if (onCustomDomainChange) {
      onCustomDomainChange(domainInput);
    }
  };

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
    if (customDomain) {
      // Open custom domain in new tab
      window.open(`https://${customDomain}`, "_blank");
    } else if (username) {
      // Open bentofolio subdomain
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

      {/* Custom Domain - Pro Feature */}
      {isPro ? (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              <Globe size={14} />
              Custom Domain
            </span>
            <button
              className={styles.helpButton}
              onClick={() => setShowDomainHelp(true)}
              title="How to setup"
            >
              <Info size={14} />
            </button>
          </div>
          {!customDomain ? (
            <>
              <p className={styles.domainExplain}>
                Buy a domain (e.g., from Namecheap) and point it to your
                portfolio
              </p>
              <input
                type="text"
                className={styles.domainInput}
                placeholder="yourname.dev"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
              />
              <button
                className={styles.domainAddButton}
                onClick={handleDomainSave}
                disabled={!domainInput.trim()}
              >
                Add Domain
              </button>
              <span className={styles.domainHint}>
                After adding, configure DNS in your domain provider
              </span>
            </>
          ) : (
            <>
              <div className={styles.domainActive}>
                <Check size={14} />
                <span>{customDomain}</span>
              </div>
              <button
                className={styles.domainChangeButton}
                onClick={() => {
                  setDomainInput("");
                  if (onCustomDomainChange) {
                    onCustomDomainChange("");
                  }
                }}
              >
                Remove Domain
              </button>
            </>
          )}

          {/* Domain Setup Help Modal */}
          {showDomainHelp && (
            <>
              <div
                className={styles.modalOverlay}
                onClick={() => setShowDomainHelp(false)}
              />
              <div className={styles.helpModal}>
                <div className={styles.helpHeader}>
                  <h3>Setup Custom Domain</h3>
                  <button
                    className={styles.closeButton}
                    onClick={() => setShowDomainHelp(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={styles.helpContent}>
                  <div className={styles.helpStep}>
                    <span className={styles.stepNumber}>1</span>
                    <div className={styles.stepContent}>
                      <strong>Buy a domain</strong>
                      <p>
                        Purchase from Namecheap, Google Domains, or any provider
                      </p>
                    </div>
                  </div>
                  <div className={styles.helpStep}>
                    <span className={styles.stepNumber}>2</span>
                    <div className={styles.stepContent}>
                      <strong>Configure DNS</strong>
                      <p>In your domain provider, add these DNS records:</p>
                      <code>A record: 76.76.21.21</code>
                      <code>or CNAME: cname.vercel-dns.com</code>
                    </div>
                  </div>
                  <div className={styles.helpStep}>
                    <span className={styles.stepNumber}>3</span>
                    <div className={styles.stepContent}>
                      <strong>Add to hosting</strong>
                      <p>Add your domain in your hosting provider dashboard</p>
                    </div>
                  </div>
                  <div className={styles.helpStep}>
                    <span className={styles.stepNumber}>4</span>
                    <div className={styles.stepContent}>
                      <strong>Add here</strong>
                      <p>Enter your domain above and click Add Domain</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link href="/pricing" className={styles.domainPromo}>
          <Globe size={14} />
          <span>Custom domain - $9 lifetime</span>
          <Sparkles size={12} className={styles.proIcon} />
        </Link>
      )}

      {/* GitHub Import */}
      {githubUsername ? (
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
      ) : (
        <div className={styles.section}>
          <Link
            href="/api/auth/github"
            className={`${styles.actionButton} ${styles.githubConnectButton}`}
          >
            <Github size={16} />
            Connect GitHub
          </Link>
          <span className={styles.githubHint}>
            Link your GitHub to import data
          </span>
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
          isPro
          onSelect={(theme) => onThemeChange?.(theme)}
          compact
        />
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
