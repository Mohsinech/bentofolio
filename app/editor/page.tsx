"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Laptop,
  Loader2,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Smartphone,
  Sun,
  Trash2,
} from "lucide-react";

import { BlockEditor } from "./BlockEditor";
import { UsernameDialog } from "./UsernameDialog";
import { applyVerifiedRevenue } from "@/app/lib/revenue/overlay";
import { disconnectRevenue, useRevenueConnections } from "@/app/lib/hooks/useRevenueConnections";
import { isPlaceholderUsername, normalizeUsername } from "@/app/lib/usernames";
import { isFreshPage } from "@/app/lib/starters";
import { EditorProvider, useEditor } from "@/app/lib/editor-context";
import { useAuth, useProfile } from "@/app/lib/hooks";
import {
  createDefaultBlockContent,
  editorBlockLibraryEntries,
  getBlockDefinition,
  getDefaultBlockSize,
} from "@/app/lib/block-registry";
import {
  hasRenderableBlockContent,
  mapProfileToV2Portfolio,
} from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import { BentoGrid } from "@/app/components/bento/BentoGrid";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import {
  GRID_LAYOUT_VERSION,
  resolveLayout,
  validSizeFor,
} from "@/app/components/bento/grid-layout";
import bentoStyles from "@/app/components/bento/bento.module.css";
import { addItem, moveItem, removeItem, sortByPosition } from "@/app/lib/bento-layout";
import type { BlockContent, BlockLayout, BlockType, ThemeId } from "@/app/lib/types";
import { generateId } from "@/app/lib/utils";
import styles from "./editor.module.css";

type LeftTab = "blocks" | "structure";
type PreviewMode = "desktop" | "mobile";
type ResizeSide = "left" | "right";

const PANEL_STORAGE_KEYS = {
  leftWidth: "bentofolio-editor-left-panel-width",
  rightWidth: "bentofolio-editor-right-panel-width",
  leftCollapsed: "bentofolio-editor-left-panel-collapsed",
  rightCollapsed: "bentofolio-editor-right-panel-collapsed",
} as const;

const PANEL_SIZES = {
  left: { default: 260, min: 220, max: 400 },
  right: { default: 320, min: 280, max: 480 },
} as const;

function clampPanelWidth(side: ResizeSide, width: number) {
  const bounds = PANEL_SIZES[side];
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(width)));
}

function readStoredWidth(key: string, side: ResizeSide) {
  if (typeof window === "undefined") return PANEL_SIZES[side].default;

  const value = Number.parseInt(window.localStorage.getItem(key) || "", 10);
  return Number.isFinite(value) ? clampPanelWidth(side, value) : PANEL_SIZES[side].default;
}

function readStoredBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function cloneLayout(layout: BlockLayout[]) {
  return layout.map((block) => ({ ...block }));
}

function cloneContent(content: Record<string, BlockContent>) {
  return Object.fromEntries(
    Object.entries(content).map(([id, block]) => [id, structuredClone(block)])
  ) as Record<string, BlockContent>;
}

function createSnapshot(
  layout: BlockLayout[],
  content: Record<string, BlockContent>,
  theme: ThemeId
) {
  // Position order, so the same arrangement always compares equal.
  return JSON.stringify({ layout: sortByPosition(layout), content, theme });
}

function EditorStudio() {
  const {
    profile,
    loading,
    error,
    saveError,
    saveProfile,
    saving,
    publishProfile,
    publishing,
    updateUsername,
    hasProAccess,
  } = useProfile();
  const { signOut, githubUsername } = useAuth();
  const router = useRouter();
  // A brand-new account (nothing saved or published) starts in onboarding.
  const isFresh = Boolean(profile && isFreshPage(profile));
  useEffect(() => {
    if (isFresh) router.replace("/onboarding");
  }, [isFresh, router]);
  // "claim" opens on its own for user_xxxxxxxx accounts; "change" from settings.
  const [usernameDialog, setUsernameDialog] = useState<"claim" | "change" | null>(null);
  const claimPromptedRef = useRef(false);
  const {
    layout,
    content,
    selectedBlockId,
    setLayout,
    setContent,
    selectBlock,
  } = useEditor();
  const revenueConnections = useRevenueConnections();
  // Canvas shows verified numbers exactly as visitors will see them.
  const canvasContent = useMemo(
    () => applyVerifiedRevenue(content, revenueConnections),
    [content, revenueConnections]
  );
  const [leftTab, setLeftTab] = useState<LeftTab>("blocks");
  const [search, setSearch] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [themeOverride, setThemeOverride] = useState<ThemeId | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(true);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(PANEL_SIZES.left.default);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(PANEL_SIZES.right.default);
  const [activeResize, setActiveResize] = useState<ResizeSide | null>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const hydratedProfileIdRef = useRef<string | null>(null);
  const savedSnapshotRef = useRef<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<{
    side: ResizeSide;
    startX: number;
    startWidth: number;
    handle: HTMLElement;
    pointerId: number;
  } | null>(null);

  const selectedTheme = themeOverride ?? profile?.theme ?? "light";
  const profileUrl = profile?.username ? `/${profile.username}` : "";
  const selectedLayout = layout.find((block) => block.id === selectedBlockId);
  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;
  const selectedDefinition = selectedLayout ? getBlockDefinition(selectedLayout.type) : null;
  const currentSnapshot = useMemo(
    () => createSnapshot(layout, content, selectedTheme),
    [layout, content, selectedTheme]
  );
  const hasUnsavedChanges = Boolean(savedSnapshotRef.current && currentSnapshot !== savedSnapshotRef.current);
  // What visitors see right now. Differs from the saved draft until Publish.
  const publishedSnapshot = useMemo(
    () =>
      profile
        ? createSnapshot(
            resolveLayout(profile.published.layout, profile.published.layoutVersion),
            profile.published.content,
            profile.published.theme
          )
        : "",
    [profile]
  );
  const hasUnpublishedChanges = Boolean(
    publishedSnapshot && currentSnapshot !== publishedSnapshot
  );
  const busy = saving || publishing;
  const workspaceStyle = {
    "--left-panel-width": `${leftPanelWidth}px`,
    "--right-panel-width": `${rightPanelWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!profile || hydratedProfileIdRef.current === profile.id) return;

    // Old template layouts open converted to the grid, in their block order.
    const nextLayout = cloneLayout(resolveLayout(profile.layout, profile.layoutVersion));
    const nextContent = cloneContent(profile.content || {});
    const nextTheme = profile.theme || "light";

    setLayout(nextLayout);
    setContent(nextContent);
    setThemeOverride(nextTheme);
    hydratedProfileIdRef.current = profile.id;
    savedSnapshotRef.current = createSnapshot(nextLayout, nextContent, nextTheme);
  }, [profile, setContent, setLayout]);

  useEffect(() => {
    if (!profile || claimPromptedRef.current || isFreshPage(profile)) return;
    claimPromptedRef.current = true;
    if (isPlaceholderUsername(profile.username)) setUsernameDialog("claim");
  }, [profile]);

  async function handleUsernameSave(username: string) {
    const result = await updateUsername(username);
    if (result.ok) {
      setUsernameDialog(null);
      showStatus(`Your page is now bentofolio.dev/${username}`);
    }
    return result;
  }

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (previewMode === "mobile") {
      setLeftCollapsed(true);
    }
  }, [previewMode]);

  useEffect(() => {
    setLeftPanelWidth(readStoredWidth(PANEL_STORAGE_KEYS.leftWidth, "left"));
    setRightPanelWidth(readStoredWidth(PANEL_STORAGE_KEYS.rightWidth, "right"));
    setLeftCollapsed(readStoredBoolean(PANEL_STORAGE_KEYS.leftCollapsed, true));
    setRightCollapsed(readStoredBoolean(PANEL_STORAGE_KEYS.rightCollapsed, false));
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    window.localStorage.setItem(PANEL_STORAGE_KEYS.leftWidth, String(leftPanelWidth));
    window.localStorage.setItem(PANEL_STORAGE_KEYS.rightWidth, String(rightPanelWidth));
    window.localStorage.setItem(PANEL_STORAGE_KEYS.leftCollapsed, String(leftCollapsed));
    window.localStorage.setItem(PANEL_STORAGE_KEYS.rightCollapsed, String(rightCollapsed));
  }, [leftCollapsed, leftPanelWidth, preferencesLoaded, rightCollapsed, rightPanelWidth]);

  useEffect(() => {
    function finishResize({ restoreStartWidth = false } = {}) {
      const resizeState = resizeStateRef.current;

      if (!resizeState) return;

      if (restoreStartWidth) {
        if (resizeState.side === "left") {
          setLeftPanelWidth(resizeState.startWidth);
        } else {
          setRightPanelWidth(resizeState.startWidth);
        }
      }

      try {
        resizeState.handle.releasePointerCapture(resizeState.pointerId);
      } catch {
        // The pointer may already be released by the browser.
      }

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      resizeStateRef.current = null;
      setActiveResize(null);
    }

    function handlePointerMove(event: PointerEvent) {
      const resizeState = resizeStateRef.current;

      if (!resizeState) return;

      event.preventDefault();
      const delta = event.clientX - resizeState.startX;
      const nextWidth =
        resizeState.side === "left"
          ? resizeState.startWidth + delta
          : resizeState.startWidth - delta;

      if (resizeState.side === "left") {
        setLeftPanelWidth(clampPanelWidth("left", nextWidth));
      } else {
        setRightPanelWidth(clampPanelWidth("right", nextWidth));
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        finishResize({ restoreStartWidth: true });
      }
    }

    function handlePointerEnd() {
      finishResize();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("keydown", handleKeyDown);
      finishResize();
    };
  }, []);

  const previewData = useMemo(
    () =>
      mapProfileToV2Portfolio({
        username: profile?.username || "profile",
        isPro: Boolean(hasProAccess),
        theme: selectedTheme,
        avatarUrl: profile?.avatarUrl,
        layout,
        content,
        mode: "editor",
      }),
    [content, hasProAccess, layout, profile?.avatarUrl, profile?.username, selectedTheme]
  );

  const groupedBlocks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = editorBlockLibraryEntries.filter((entry) => {
      const searchable = `${entry.v2Name} ${entry.description} ${entry.v2Category}`.toLowerCase();
      return !query || searchable.includes(query);
    });

    return filtered.reduce<Record<string, typeof editorBlockLibraryEntries>>((groups, entry) => {
      groups[entry.v2Category] ||= [];
      groups[entry.v2Category].push(entry);
      return groups;
    }, {});
  }, [search]);

  function showStatus(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(null), 1600);
  }

  function handleSelectBlock(id: string) {
    selectBlock(id);
    setRightCollapsed(false);
    setLeftCollapsed(true);
  }

  function handleResizePointerDown(side: ResizeSide, event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    resizeStateRef.current = {
      side,
      startX: event.clientX,
      startWidth: side === "left" ? leftPanelWidth : rightPanelWidth,
      handle,
      pointerId: event.pointerId,
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    setActiveResize(side);
  }

  function handleResizeKeyDown(side: ResizeSide, event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 24 : 10;
    const currentWidth = side === "left" ? leftPanelWidth : rightPanelWidth;
    const setWidth = (width: number) => {
      if (side === "left") {
        setLeftPanelWidth(width);
      } else {
        setRightPanelWidth(width);
      }
    };

    if (event.key === "Home") {
      event.preventDefault();
      setWidth(PANEL_SIZES[side].min);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setWidth(PANEL_SIZES[side].max);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      setWidth(PANEL_SIZES[side].default);
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const signedStep = side === "left" ? direction * step : -direction * step;
    setWidth(clampPanelWidth(side, currentWidth + signedStep));
  }

  function handleAddBlock(type: BlockType) {
    const definition = getBlockDefinition(type);

    if (definition.accessLevel === "pro" && !hasProAccess) {
      showStatus("This block is Pro");
      return;
    }

    const id = generateId();
    const defaults = getDefaultBlockSize(type);
    const size = validSizeFor(type, defaults.w, defaults.h);

    // First free spot in the grid, top to bottom.
    setLayout(addItem(layout, { id, type, w: size.w, h: size.h } as BlockLayout));
    setContent({ ...content, [id]: createDefaultBlockContent(type) });
    setLeftTab("structure");
    handleSelectBlock(id);
    showStatus(`${getBlockDefinition(type).v2Name} added`);
  }

  function handleRemoveBlock(id: string) {
    const block = layout.find((item) => item.id === id);
    const blockName = block ? getBlockDefinition(block.type).v2Name : "block";

    if (!window.confirm(`Remove ${blockName}?`)) return;

    const nextContent = { ...content };
    delete nextContent[id];
    // A removed SaaS block shouldn't leave a stored provider key behind.
    if (block?.type === "saas" && revenueConnections.some((c) => c.block_id === id)) {
      void disconnectRevenue(id);
    }
    setLayout(removeItem(layout, id));
    setContent(nextContent);
    selectBlock(null);
    showStatus("Block removed");
  }

  function handleDuplicateBlock(id: string) {
    const source = layout.find((item) => item.id === id);
    const sourceContent = content[id];
    if (!source || !sourceContent) return;
    if (getBlockDefinition(source.type).accessLevel === "pro" && !hasProAccess) {
      showStatus("This block is Pro");
      return;
    }
    const copyId = generateId();
    // Add it, then place it right under the original.
    const withCopy = addItem(layout, { id: copyId, type: source.type, w: source.w, h: source.h } as BlockLayout);
    setLayout(moveItem(withCopy, copyId, source.x, source.y + source.h));
    setContent({ ...content, [copyId]: structuredClone(sourceContent) });
    handleSelectBlock(copyId);
    showStatus("Block duplicated");
  }

  // Saves the draft. Returns false when the save failed (saveError is set and
  // shown in the toolbar; the editor and its changes stay as they are).
  async function handleSave({ quiet = false } = {}): Promise<boolean> {
    const snapshot = createSnapshot(layout, content, selectedTheme);
    try {
      await saveProfile({
        layout,
        content,
        theme: selectedTheme,
        layoutVersion: GRID_LAYOUT_VERSION,
      });
    } catch {
      return false;
    }
    savedSnapshotRef.current = snapshot;
    if (!quiet) showStatus("Draft saved");
    return true;
  }

  async function handlePublish() {
    if (hasUnsavedChanges && !(await handleSave({ quiet: true }))) return;
    try {
      await publishProfile();
    } catch {
      return;
    }
    showStatus("Published");
  }

  function describeState() {
    if (saving) return "Saving";
    if (publishing) return "Publishing";
    if (saveError) return saveError;
    if (status) return status;
    if (hasUnsavedChanges) return "Unsaved changes";
    if (hasUnpublishedChanges) return "Draft · not published";
    return "Live";
  }

  if (loading) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spin} size={26} />
        <span>Opening BentoFolio editor...</span>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className={styles.loading}>
        <span>{error || "Could not load your portfolio."}</span>
        <Link href="/auth/login">Sign in again</Link>
      </main>
    );
  }

  return (
    <>
      <main className={styles.mobileLock}>
        <Link href="/" className={styles.mobileLockLogo}>
          Bento<span>Folio</span>
        </Link>
        <section className={styles.mobileLockCard}>
          <Laptop size={30} />
          <span>Desktop editing</span>
          <h1>Full editing works best on desktop.</h1>
          <p>
            Your portfolio is fully responsive, but the editor needs room for the block
            library, canvas, and properties panel.
          </p>
          <div className={styles.mobileLockActions}>
            {profileUrl && <Link href={profileUrl}>View portfolio</Link>}
            <button type="button" onClick={() => window.alert("We will remind you in-product soon.")}>
              Open desktop later
            </button>
          </div>
        </section>
      </main>

      <main className={styles.editorShell} data-editor-theme={selectedTheme}>
        <header className={styles.toolbar}>
          <div className={styles.toolbarIdentity}>
            <Link href="/" className={styles.productMark} aria-label="BentoFolio home">
              <span>B</span>
              <strong>BentoFolio</strong>
            </Link>
            <div className={styles.portfolioMeta} title={`@${profile.username}`}>
              <strong>{previewData.brandName}</strong>
              <span>@{profile.username}</span>
            </div>
          </div>

          <div className={styles.toolbarViewControls}>
            <div className={styles.segmented} role="group" aria-label="Preview size">
              <button
                type="button"
                className={previewMode === "desktop" ? styles.segmentActive : ""}
                onClick={() => setPreviewMode("desktop")}
                aria-pressed={previewMode === "desktop"}
              >
                <Laptop size={14} />
                Desktop
              </button>
              <button
                type="button"
                className={previewMode === "mobile" ? styles.segmentActive : ""}
                onClick={() => setPreviewMode("mobile")}
                aria-pressed={previewMode === "mobile"}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>

            <div className={styles.segmented} role="group" aria-label="Theme">
              <button
                type="button"
                className={selectedTheme === "light" ? styles.segmentActive : ""}
                onClick={() => setThemeOverride("light")}
                aria-pressed={selectedTheme === "light"}
              >
                <Sun size={14} />
                Light
              </button>
              <button
                type="button"
                className={selectedTheme === "dark" ? styles.segmentActive : ""}
                onClick={() => setThemeOverride("dark")}
                aria-pressed={selectedTheme === "dark"}
              >
                <Moon size={14} />
                Dark
              </button>
            </div>

            {profileUrl && (
              <Link href={profileUrl} className={styles.tertiaryAction}>
                <Eye size={14} />
                Preview
              </Link>
            )}
          </div>

          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => {
                setLeftTab("blocks");
                setLeftCollapsed(false);
              }}
            >
              <Plus size={14} />
              Blocks
            </button>
            <div className={styles.saveCluster}>
              <div
                className={`${styles.saveState} ${
                  saveError && !busy
                    ? styles.saveStateError
                    : hasUnsavedChanges || hasUnpublishedChanges
                      ? styles.saveStateUnsaved
                      : styles.saveStateSaved
                }`}
                aria-live="polite"
                title={saveError && !busy ? saveError : undefined}
              >
                {busy ? <Loader2 className={styles.spin} size={15} /> : <span className={styles.saveDot} />}
                <span>{describeState()}</span>
              </div>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => handleSave()}
                disabled={busy || !hasUnsavedChanges}
              >
                {saving ? <Loader2 className={styles.spin} size={14} /> : <Save size={14} />}
                Save draft
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={handlePublish}
                disabled={busy || !hasUnpublishedChanges}
                title="Copy your draft to your live page"
              >
                {publishing ? <Loader2 className={styles.spin} size={14} /> : <Send size={14} />}
                {saveError && !busy ? "Retry publish" : "Publish"}
              </button>
            </div>
            {profileUrl && (
              <Link href={profileUrl} className={styles.secondaryAction}>
                View live
              </Link>
            )}
            <Link href="/settings" className={styles.iconButton} aria-label="Settings" title="Settings">
              <Settings size={15} />
            </Link>
            <button type="button" className={styles.iconButton} onClick={signOut} aria-label="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <section
          className={`${styles.workspace} ${leftCollapsed ? styles.leftCollapsed : ""} ${
            rightCollapsed ? styles.rightCollapsed : ""
          } ${activeResize ? styles.resizing : ""}`}
          style={workspaceStyle}
        >
          <aside className={styles.leftPanel} aria-label="Editor block panel">
            <button
              type="button"
              className={styles.panelCollapse}
              onClick={() => setLeftCollapsed(true)}
              aria-label="Collapse block panel"
              aria-expanded={!leftCollapsed}
            >
              <PanelLeftClose size={15} />
            </button>
            <div
              className={`${styles.resizeHandle} ${styles.leftResizeHandle}`}
              role="separator"
              aria-label="Resize blocks panel"
              aria-orientation="vertical"
              aria-valuemin={PANEL_SIZES.left.min}
              aria-valuemax={PANEL_SIZES.left.max}
              aria-valuenow={leftPanelWidth}
              tabIndex={0}
              onPointerDown={(event) => handleResizePointerDown("left", event)}
              onDoubleClick={() => setLeftPanelWidth(PANEL_SIZES.left.default)}
              onKeyDown={(event) => handleResizeKeyDown("left", event)}
            />

            <div className={styles.tabs} role="tablist" aria-label="Editor left panel">
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === "blocks"}
                className={leftTab === "blocks" ? styles.tabActive : ""}
                onClick={() => setLeftTab("blocks")}
              >
                Blocks
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === "structure"}
                className={leftTab === "structure" ? styles.tabActive : ""}
                onClick={() => setLeftTab("structure")}
              >
                Structure
              </button>
            </div>

            {leftTab === "blocks" ? (
              <div className={styles.panelScroll}>
                <label className={styles.searchBox}>
                  <Search size={15} />
                  <span className={styles.visuallyHidden}>Search blocks</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search blocks"
                  />
                </label>

                {Object.entries(groupedBlocks).map(([category, entries]) => (
                  <section key={category} className={styles.blockGroup}>
                    <h2>{category}</h2>
                    {entries.map((entry) => {
                      const Icon = entry.icon;
                      const locked = entry.accessLevel === "pro" && !hasProAccess;

                      return (
                        <article key={entry.legacyType} className={styles.blockCard}>
                          <Icon size={17} />
                          <div>
                            <strong>{entry.v2Name}</strong>
                            <p>{entry.description}</p>
                          </div>
                          <span className={locked ? styles.proBadge : styles.freeBadge}>
                            {entry.accessLevel === "pro" ? "Pro" : "Free"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddBlock(entry.legacyType)}
                            aria-label={`Add ${entry.v2Name}`}
                          >
                            <Plus size={15} />
                          </button>
                        </article>
                      );
                    })}
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.panelScroll}>
                {layout.length === 0 ? (
                  <div className={styles.panelEmpty}>
                    <strong>No blocks yet</strong>
                    <p>Add your introduction, portrait, projects, and contact CTA.</p>
                  </div>
                ) : (
                  <ol className={styles.structureList}>
                    {sortByPosition<BlockLayout>(layout).map((block) => {
                      const definition = getBlockDefinition(block.type);
                      const Icon = definition.icon;
                      const isSelected = selectedBlockId === block.id;
                      const lockedPro = definition.accessLevel === "pro" && !hasProAccess;
                      const complete = hasRenderableBlockContent(block.type, content[block.id]);

                      return (
                        <li key={block.id}>
                          <button
                            type="button"
                            className={isSelected ? styles.structureActive : ""}
                            onClick={() => handleSelectBlock(block.id)}
                          >
                            <Icon size={16} />
                            <span>
                              <strong>{definition.v2Name}</strong>
                              <small>
                                {lockedPro
                                  ? "Pro · hidden on your page"
                                  : complete
                                    ? `${block.w}×${block.h}`
                                    : "Needs content · hidden"}
                              </small>
                            </span>
                          </button>
                          <div className={styles.structureActions}>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlock(block.id)}
                              aria-label={`Remove ${definition.v2Name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </aside>

          {leftCollapsed && (
            <button
              type="button"
              className={styles.restoreLeft}
              onClick={() => setLeftCollapsed(false)}
              aria-label="Expand block panel"
            >
              <ChevronRight size={16} />
            </button>
          )}

          <section className={styles.canvasPanel} aria-label="Portfolio preview">
            <div className={styles.canvasTopline}>
              <div>
                <strong>Preview</strong>
              </div>
            </div>

            {layout.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <h2>Add your introduction</h2>
                <p>Start with Profile, then add projects, skills and a way to contact you. Drag blocks to arrange them.</p>
                <button type="button" onClick={() => handleAddBlock("identity")}>
                  <Plus size={15} />
                  Add Profile
                </button>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className={`${styles.previewScroll} ${
                  previewMode === "mobile" ? styles.mobilePreview : styles.desktopPreview
                }`}
                data-preview-mode={previewMode}
              >
                <div className={styles.artboardViewport}>
                  <div className={styles.artboard}>
                    <div
                      className={`${bentoStyles.theme} ${bentoFontClasses}`}
                      data-theme={selectedTheme}
                      style={{ background: "var(--bento-bg)", padding: previewMode === "mobile" ? 14 : 28, borderRadius: 14 }}
                    >
                      <BentoGrid
                        layout={layout}
                        content={canvasContent}
                        avatarUrl={profile.avatarUrl}
                        isPro={Boolean(hasProAccess)}
                        forceMobile={previewMode === "mobile"}
                        editor={{
                          selectedId: selectedBlockId,
                          onSelect: (id) => (id ? handleSelectBlock(id) : selectBlock(null)),
                          onLayoutChange: setLayout,
                          onDuplicate: handleDuplicateBlock,
                          onDelete: handleRemoveBlock,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className={styles.rightPanel} aria-label="Properties panel">
            <button
              type="button"
              className={styles.panelCollapse}
              onClick={() => setRightCollapsed(true)}
              aria-label="Collapse properties panel"
              aria-expanded={!rightCollapsed}
            >
              <PanelRightClose size={15} />
            </button>
            <div
              className={`${styles.resizeHandle} ${styles.rightResizeHandle}`}
              role="separator"
              aria-label="Resize properties panel"
              aria-orientation="vertical"
              aria-valuemin={PANEL_SIZES.right.min}
              aria-valuemax={PANEL_SIZES.right.max}
              aria-valuenow={rightPanelWidth}
              tabIndex={0}
              onPointerDown={(event) => handleResizePointerDown("right", event)}
              onDoubleClick={() => setRightPanelWidth(PANEL_SIZES.right.default)}
              onKeyDown={(event) => handleResizeKeyDown("right", event)}
            />

            {selectedContent && selectedDefinition && selectedBlockId ? (
              <>
                <div className={styles.propertiesHead}>
                  <span>{selectedDefinition.productCategory}</span>
                  <h2>{selectedDefinition.v2Name}</h2>
                  {selectedLayout && (
                    <p>
                      Current size: {selectedLayout.w} x {selectedLayout.h}
                    </p>
                  )}
                </div>
                <BlockEditor embedded />
                <div className={styles.destructiveZone}>
                  <button type="button" onClick={() => handleRemoveBlock(selectedBlockId)}>
                    <Trash2 size={14} />
                    Remove block
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.settingsPanel}>
                <span>Portfolio settings</span>
                <h2>{previewData.brandName}</h2>
                <dl>
                  <div>
                    <dt>Theme</dt>
                    <dd>{selectedTheme}</dd>
                  </div>
                  <div>
                    <dt>Public URL</dt>
                    <dd>
                      {profileUrl || "Not available"}{" "}
                      <button
                        type="button"
                        className={styles.inlineLink}
                        onClick={() =>
                          setUsernameDialog(
                            isPlaceholderUsername(profile.username) ? "claim" : "change"
                          )
                        }
                      >
                        {isPlaceholderUsername(profile.username) ? "Claim name" : "Change"}
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      {hasUnsavedChanges
                        ? "Unsaved changes"
                        : hasUnpublishedChanges
                          ? "Draft not published"
                          : "Live"}
                    </dd>
                  </div>
                </dl>
                {profileUrl && (
                  <Link href={profileUrl} className={styles.settingsLink}>
                    <Eye size={14} />
                    Open public portfolio
                  </Link>
                )}
              </div>
            )}
          </aside>

          {rightCollapsed && (
            <button
              type="button"
              className={styles.restoreRight}
              onClick={() => setRightCollapsed(false)}
              aria-label="Expand properties panel"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </section>
        {usernameDialog && (
          <UsernameDialog
            mode={usernameDialog}
            currentUsername={profile.username}
            initialValue={
              usernameDialog === "claim" && githubUsername
                ? normalizeUsername(githubUsername)
                : ""
            }
            onSave={handleUsernameSave}
            onClose={() => setUsernameDialog(null)}
          />
        )}
      </main>
    </>
  );
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorStudio />
    </EditorProvider>
  );
}
