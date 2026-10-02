"use client";

import { useState, useEffect } from "react";
import { PREMIUM_PRICE } from "@/app/lib/config";
import Link from "next/link";
import {
  User,
  MapPin,
  Code2,
  Briefcase,
  Link as LinkIcon,
  Save,
  LogOut,
  Check,
  Loader2,
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
  Globe,
  GraduationCap,
  Info,
  X,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import styles from "./editor.module.css";
import { useEditor } from "@/app/lib/editor-context";
import { useAuth } from "@/app/lib/hooks";
import { BlockType } from "@/app/lib/types";
import { DraggableSidebarBlock } from "./DraggableSidebarBlock";

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
    type: "work",
    icon: <Briefcase size={18} />,
    label: "Work",
    category: "work",
  },
  {
    type: "experience",
    icon: <Briefcase size={18} />,
    label: "Experience",
    category: "work",
  },
  {
    type: "education",
    icon: <GraduationCap size={18} />,
    label: "Education",
    category: "work",
  },
  {
    type: "saas",
    icon: <Globe size={18} />,
    label: "SaaS",
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
  // Content
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
];

interface EditorSidebarProps {
  username?: string;
  onSave?: () => Promise<void>;
  saving?: boolean;
  onGitHubImport?: () => Promise<void>;
  isPro?: boolean;
  customDomain?: string | null;
  onCustomDomainChange?: (domain: string) => void;
}

export function EditorSidebar({
  username,
  onSave,
  saving,
  onGitHubImport,
  isPro = false,
  customDomain,
  onCustomDomainChange,
}: EditorSidebarProps) {
  const { isEditMode, toggleEditMode, addBlock } = useEditor();
  const { signOut, githubUsername } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("profile");
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [domainInput, setDomainInput] = useState(customDomain || "");
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  // Sync domain input with prop
  useEffect(() => {
    setDomainInput(customDomain || "");
  }, [customDomain]);

  const publicProfileUrl = username ? `https://bentofolio.dev/${username}` : "";
  const previewPath = username ? `/${username}` : "";

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
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = publicProfileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    if (previewPath) window.open(previewPath, "_blank");
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

  const groupedBlocks = ["profile", "developer", "work", "social", "content"];
  const visibleBlocks = blockTypes.filter(
    (block) => block.category === activeCategory,
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <div className={styles.brandCard}>
          <div>
            <h1 className={styles.logo}>
              Bento<span className={styles.logoAccent}>Folio</span>
            </h1>
            <p className={styles.brandCaption}>Portfolio editor</p>
          </div>
          <div className={styles.brandBadge}>{isPro ? "Pro" : "Free"}</div>
        </div>

        <button
          type="button"
          className={`${styles.actionButton} ${styles.primaryButton} ${styles.topSaveButton}`}
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
          {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      {username && (
        <div className={styles.workspaceCard}>
          <div className={styles.workspaceHeader}>
            <div>
              <span className={styles.usernameLabel}>Public profile</span>
              <span className={styles.usernameValue}>
                bentofolio.dev/{username}
              </span>
            </div>
            <span className={styles.workspacePlan}>
              {isPro ? "Custom domain ready" : "Free site"}
            </span>
          </div>
          <div className={styles.quickRow}>
            <button
              type="button"
              className={`${styles.actionButton} ${styles.secondaryButton} ${styles.actionHalf}`}
              onClick={handlePreview}
              disabled={!username}
              title="Open in new tab"
            >
              <ExternalLink size={16} />
              Preview
            </button>

            <button
              type="button"
              className={`${styles.actionButton} ${styles.shareButton} ${styles.actionHalf}`}
              onClick={handleShare}
              disabled={!username}
              title="Copy link to clipboard"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Share"}
            </button>
          </div>

          <div className={styles.utilityGrid}>
            <Link
              href={isPro ? "/editor/analytics" : "/pricing"}
              className={styles.utilityButton}
            >
              <BarChart3 size={14} />
              <span>{isPro ? "Analytics" : "Unlock analytics"}</span>
            </Link>

            {githubUsername ? (
              <button
                className={styles.utilityButton}
                onClick={handleGitHubImport}
                disabled={importing}
              >
                {importing ? (
                  <Loader2 size={14} className={styles.spinning} />
                ) : (
                  <Github size={14} />
                )}
                <span>{importing ? "Importing" : "GitHub import"}</span>
              </button>
            ) : (
              <Link href="/api/auth/github" className={styles.utilityButton}>
                <Github size={14} />
                <span>Connect GitHub</span>
              </Link>
            )}
          </div>

          {githubUsername && (
            <span className={styles.githubHint}>Connected as @{githubUsername}</span>
          )}
        </div>
      )}

      {isPro ? (
        <div className={`${styles.section} ${styles.domainCard}`}>
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
          <div>
            <span className={styles.sectionTitle}>
              <Sparkles size={14} />
              Pro unlocks
            </span>
            <p className={styles.upgradeCopy}>
              Custom domain, analytics, and premium portfolio blocks.
            </p>
          </div>
          <span className={styles.upgradePill}>${PREMIUM_PRICE} lifetime</span>
        </Link>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            <Palette size={14} />
            Visual system
          </span>
        </div>
        <div className={styles.styleNote}>
          One focused built-in style keeps the editor, public profile, and
          analytics consistent for launch.
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.modeToggle}>
          <span className={styles.modeLabel}>Editing enabled</span>
          <button
            className={`${styles.toggle} ${isEditMode ? styles.active : ""}`}
            onClick={toggleEditMode}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </div>

      <div className={`${styles.section} ${styles.blockSection}`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            <LayoutGrid size={14} />
            Card Library
          </span>
          <span className={styles.sectionHint}>Blocks</span>
        </div>
        <div className={styles.categoryTabs}>
          {groupedBlocks.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.categoryTab} ${
                activeCategory === category ? styles.categoryTabActive : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className={styles.blockMenu}>
          {visibleBlocks.map((block) => (
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
          className={`${styles.actionButton} ${styles.secondaryButton}`}
          onClick={signOut}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
