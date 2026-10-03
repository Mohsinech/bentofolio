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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Laptop,
  Loader2,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Search,
  Settings,
  Smartphone,
  Sun,
  Trash2,
  X,
} from "lucide-react";

import { useUpgrade } from "@/app/components/upgrade/UpgradeDialog";
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
import { EditorSkeleton } from "@/app/components/skeleton/Skeleton";

type LeftTab = "blocks" | "structure";
type RemovedBlock = {
  block: BlockLayout;
  content: BlockContent | undefined;
  name: string;
  wasSelected: boolean;
  disconnect: boolean;
  timer: number;
};
// How long Undo stays offered after deleting a block.
const UNDO_MS = 6000;
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
  const { openUpgrade, upgradeDialog } = useUpgrade();
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
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(PANEL_SIZES.left.default);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(PANEL_SIZES.right.default);
  const [activeResize, setActiveResize] = useState<ResizeSide | null>(null);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const hydratedProfileIdRef = useRef<string | null>(null);
  const savedSnapshotRef = useRef<string>("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [removed, setRemoved] = useState<RemovedBlock | null>(null);
  const removedRef = useRef<RemovedBlock | null>(null);
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
    setLeftCollapsed(readStoredBoolean(PANEL_STORAGE_KEYS.leftCollapsed, false));
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
  }

  // "+ Add block" under the canvas: the library, ready to search.
  function openLibrary() {
    setLeftTab("blocks");
    setLeftCollapsed(false);
    window.setTimeout(() => searchRef.current?.focus(), 60);
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
      openUpgrade("embeds");
      return;
    }

    const id = generateId();
    const defaults = getDefaultBlockSize(type);
    const size = validSizeFor(type, defaults.w, defaults.h);

    // First free spot in the grid, top to bottom.
    setLayout(addItem(layout, { id, type, w: size.w, h: size.h } as BlockLayout));
    setContent({ ...content, [id]: createDefaultBlockContent(type) });
    handleSelectBlock(id);
    showStatus(`${getBlockDefinition(type).v2Name} added`);
  }

  // Deleting is instant; a toast offers Undo for a few seconds. A SaaS
  // block's stored provider key is only removed once that window has passed.
  function finishRemoval(pending: RemovedBlock | null) {
    if (!pending) return;
    window.clearTimeout(pending.timer);
    if (pending.disconnect) void disconnectRevenue(pending.block.id);
  }

  function handleRemoveBlock(id: string) {
    const block = layout.find((item) => item.id === id);
    const blockContent = content[id];
    if (!block) return;

    finishRemoval(removedRef.current);
    const nextContent = { ...content };
    delete nextContent[id];
    setLayout(removeItem(layout, id));
    setContent(nextContent);
    if (selectedBlockId === id) selectBlock(null);

    const pending: RemovedBlock = {
      block,
      content: blockContent,
      name: getBlockDefinition(block.type).v2Name,
      wasSelected: selectedBlockId === id,
      disconnect: block.type === "saas" && revenueConnections.some((c) => c.block_id === id),
      timer: window.setTimeout(() => {
        finishRemoval(removedRef.current);
        removedRef.current = null;
        setRemoved(null);
      }, UNDO_MS),
    };
    removedRef.current = pending;
    setRemoved(pending);
  }

  function undoRemove() {
    const pending = removedRef.current;
    if (!pending) return;
    window.clearTimeout(pending.timer);
    removedRef.current = null;
    setRemoved(null);
    // Back where it was; blocks that moved into its place make room.
    const { block } = pending;
    const restored = addItem(layout, { id: block.id, type: block.type, w: block.w, h: block.h } as BlockLayout);
    setLayout(moveItem(restored, block.id, block.x, block.y));
    if (pending.content) setContent({ ...content, [block.id]: pending.content });
    if (pending.wasSelected) handleSelectBlock(block.id);
  }

  // Ctrl/Cmd+Z undoes a delete while its toast is up (not while typing).
  useEffect(() => {
    if (!removed) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      undoRemove();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Leaving the editor ends the undo window.
  useEffect(() => () => finishRemoval(removedRef.current), []);

  function dismissRemoved() {
    finishRemoval(removedRef.current);
    removedRef.current = null;
    setRemoved(null);
  }

  function handleDuplicateBlock(id: string) {
    const source = layout.find((item) => item.id === id);
    const sourceContent = content[id];
    if (!source || !sourceContent) return;
    if (getBlockDefinition(source.type).accessLevel === "pro" && !hasProAccess) {
      openUpgrade("embeds");
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

  function statusTone() {
    if (saveError && !busy) return styles.statusError;
    if (busy || hasUnsavedChanges || hasUnpublishedChanges) return styles.statusDraft;
    return styles.statusLive;
  }

  if (loading) {
    return <EditorSkeleton className={bentoFontClasses} />;
  }

  if (error || !profile) {
    return (
      <main className={`${styles.loading} ${bentoFontClasses}`}>
        <span>{error || "Couldn't load your page."}</span>
        <Link href="/auth/login">Sign in again</Link>
      </main>
    );
  }

  const changeAddress = () => setUsernameDialog(isPlaceholderUsername(profile.username) ? "claim" : "change");
  const visibleCount = layout.filter(
    (block) =>
      !(getBlockDefinition(block.type).accessLevel === "pro" && !hasProAccess) &&
      hasRenderableBlockContent(block.type, content[block.id])
  ).length;

  return (
    <>
      <main className={`${styles.mobileLock} ${bentoFontClasses}`}>
        <Link href="/" className={styles.mobileLockBrand} aria-label="bentofolio home">
          <span className={styles.mark} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          bentofolio
        </Link>
        <section className={styles.mobileLockCard}>
          <Laptop size={22} aria-hidden="true" />
          <h1>The editor needs a bigger screen.</h1>
          <p>
            Your page works on every phone, but arranging blocks needs room for the library, the grid and the
            inspector. Open bentofolio.dev on a laptop or desktop to edit.
          </p>
          <div className={styles.mobileLockActions}>
            {profileUrl && (
              <Link href={profileUrl} className={styles.primary}>
                View your page
              </Link>
            )}
            <Link href="/settings" className={styles.ghost}>
              Settings
            </Link>
            <Link href="/editor/analytics" className={styles.ghost}>
              Analytics
            </Link>
          </div>
        </section>
      </main>

      <main className={`${styles.editorShell} ${bentoFontClasses}`}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.mark} aria-label="bentofolio home">
            <i />
            <i />
            <i />
          </Link>
          <div className={styles.pageMeta}>
            <button type="button" className={styles.pageUrl} onClick={changeAddress} title="Change your page address">
              bentofolio.dev/{profile.username}
            </button>
            <span
              className={`${styles.status} ${statusTone()}`}
              aria-live="polite"
              title={saveError && !busy ? saveError : undefined}
            >
              {busy ? <Loader2 className={styles.spin} size={12} aria-hidden="true" /> : <span className={styles.statusDot} />}
              <span className={styles.statusText}>{describeState()}</span>
            </span>
          </div>

          <div className={styles.topCenter}>
            <div className={styles.seg} role="group" aria-label="Preview size">
              <button
                type="button"
                className={previewMode === "desktop" ? styles.segOn : ""}
                onClick={() => setPreviewMode("desktop")}
                aria-pressed={previewMode === "desktop"}
              >
                <Laptop size={14} aria-hidden="true" />
                Desktop
              </button>
              <button
                type="button"
                className={previewMode === "mobile" ? styles.segOn : ""}
                onClick={() => setPreviewMode("mobile")}
                aria-pressed={previewMode === "mobile"}
              >
                <Smartphone size={14} aria-hidden="true" />
                Mobile
              </button>
            </div>
            <div className={styles.seg} role="group" aria-label="Page theme">
              <button
                type="button"
                className={selectedTheme === "light" ? styles.segOn : ""}
                onClick={() => setThemeOverride("light")}
                aria-pressed={selectedTheme === "light"}
              >
                <Sun size={14} aria-hidden="true" />
                Light
              </button>
              <button
                type="button"
                className={selectedTheme === "dark" ? styles.segOn : ""}
                onClick={() => setThemeOverride("dark")}
                aria-pressed={selectedTheme === "dark"}
              >
                <Moon size={14} aria-hidden="true" />
                Dark
              </button>
            </div>
          </div>

          <div className={styles.topActions}>
            {/* Everyone: free accounts see their views there, with the upgrade. */}
            <Link href="/editor/analytics" className={styles.iconButton} aria-label="Analytics" title="Analytics">
              <BarChart3 size={16} />
            </Link>
            <Link href="/settings" className={styles.iconButton} aria-label="Settings" title="Settings">
              <Settings size={16} />
            </Link>
            <button type="button" className={styles.iconButton} onClick={signOut} aria-label="Log out" title="Log out">
              <LogOut size={16} />
            </button>
            <span className={styles.divider} aria-hidden="true" />
            {profileUrl && (
              <Link href={profileUrl} className={styles.ghost} target="_blank" rel="noopener" title="Open your live page">
                View page
              </Link>
            )}
            <button
              type="button"
              className={styles.ghost}
              onClick={() => handleSave()}
              disabled={busy || !hasUnsavedChanges}
            >
              {saving && <Loader2 className={styles.spin} size={14} aria-hidden="true" />}
              Save draft
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={handlePublish}
              disabled={busy || !hasUnpublishedChanges}
              title="Copy your draft to your live page"
            >
              {publishing && <Loader2 className={styles.spin} size={14} aria-hidden="true" />}
              {saveError && !busy ? "Retry publish" : "Publish"}
            </button>
          </div>
        </header>

        <section
          className={`${styles.workspace} ${leftCollapsed ? styles.leftCollapsed : ""} ${
            rightCollapsed ? styles.rightCollapsed : ""
          } ${activeResize ? styles.resizing : ""}`}
          style={workspaceStyle}
        >
          <aside className={styles.leftPanel} aria-label="Blocks">
            <div className={styles.panelHead}>
              <div className={styles.seg} role="tablist" aria-label="Left panel">
                <button
                  type="button"
                  role="tab"
                  aria-selected={leftTab === "blocks"}
                  className={leftTab === "blocks" ? styles.segOn : ""}
                  onClick={() => setLeftTab("blocks")}
                >
                  Add
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={leftTab === "structure"}
                  className={leftTab === "structure" ? styles.segOn : ""}
                  onClick={() => setLeftTab("structure")}
                >
                  Layers
                  <span className={styles.count}>{layout.length}</span>
                </button>
              </div>
              <button
                type="button"
                className={styles.panelCollapse}
                onClick={() => setLeftCollapsed(true)}
                aria-label="Hide blocks panel"
                aria-expanded={!leftCollapsed}
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
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

            {leftTab === "blocks" ? (
              <div className={styles.panelScroll}>
                <label className={styles.search}>
                  <Search size={14} aria-hidden="true" />
                  <span className={styles.visuallyHidden}>Search blocks</span>
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search blocks"
                  />
                </label>

                {Object.keys(groupedBlocks).length === 0 && (
                  <p className={styles.panelNote}>No block matches “{search.trim()}”.</p>
                )}

                {Object.entries(groupedBlocks).map(([category, entries]) => (
                  <section key={category} className={styles.group}>
                    <h2 className={styles.lbl}>{category}</h2>
                    {entries.map((entry) => {
                      const Icon = entry.icon;
                      const locked = entry.accessLevel === "pro" && !hasProAccess;
                      return (
                        <button
                          key={entry.legacyType}
                          type="button"
                          className={styles.blockItem}
                          onClick={() => handleAddBlock(entry.legacyType)}
                          title={entry.description}
                          aria-label={`Add ${entry.v2Name}${locked ? " (Pro)" : ""}`}
                        >
                          <span className={styles.blockTile} aria-hidden="true">
                            <Icon size={14} />
                          </span>
                          <span className={styles.blockName}>{entry.v2Name}</span>
                          {locked ? (
                            <span className={styles.proBadge}>PRO</span>
                          ) : (
                            <Plus size={14} className={styles.blockAdd} aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.panelScroll}>
                {layout.length === 0 ? (
                  <p className={styles.panelNote}>No blocks yet. Add Profile first, then your work and a way to reach you.</p>
                ) : (
                  <ol className={styles.layers}>
                    {sortByPosition<BlockLayout>(layout).map((block) => {
                      const definition = getBlockDefinition(block.type);
                      const Icon = definition.icon;
                      const isSelected = selectedBlockId === block.id;
                      const lockedPro = definition.accessLevel === "pro" && !hasProAccess;
                      const complete = hasRenderableBlockContent(block.type, content[block.id]);

                      return (
                        <li key={block.id} className={isSelected ? styles.layerOn : ""}>
                          <button type="button" className={styles.layerMain} onClick={() => handleSelectBlock(block.id)}>
                            <span className={styles.blockTile} aria-hidden="true">
                              <Icon size={14} />
                            </span>
                            <span className={styles.layerText}>
                              <strong>{definition.v2Name}</strong>
                              <small className={lockedPro || !complete ? styles.layerHidden : undefined}>
                                {lockedPro ? "Pro · hidden on your page" : complete ? `${block.w}×${block.h}` : "Needs content · hidden"}
                              </small>
                            </span>
                          </button>
                          <button
                            type="button"
                            className={styles.layerRemove}
                            onClick={() => handleRemoveBlock(block.id)}
                            aria-label={`Remove ${definition.v2Name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
          </aside>

          {leftCollapsed && (
            <button type="button" className={styles.restoreLeft} onClick={() => setLeftCollapsed(false)} aria-label="Show blocks panel">
              <ChevronRight size={15} />
            </button>
          )}

          <section className={styles.canvasPanel} aria-label="Your page">
            {layout.length === 0 ? (
              <div className={styles.emptyCanvas}>
                <p className={styles.lbl}>Empty page</p>
                <h2>Start with who you are.</h2>
                <p>Add Profile, then your work, your numbers and a way to reach you. Drag blocks to arrange them.</p>
                <button type="button" className={styles.primary} onClick={() => handleAddBlock("identity")}>
                  <Plus size={15} aria-hidden="true" />
                  Add Profile
                </button>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className={`${styles.previewScroll} ${previewMode === "mobile" ? styles.mobilePreview : styles.desktopPreview}`}
                data-preview-mode={previewMode}
              >
                <div className={styles.artboard}>
                  <div className={styles.canvasHead}>
                    <span className={styles.lbl}>
                      {previewMode === "mobile" ? "Phone · one column" : "4-column grid · drag to move, pull corners to resize"}
                    </span>
                    <span className={styles.lbl}>
                      {visibleCount === layout.length
                        ? `${layout.length} ${layout.length === 1 ? "block" : "blocks"}`
                        : `${visibleCount} of ${layout.length} shown`}
                    </span>
                  </div>
                  <div
                    className={`${bentoStyles.theme} ${bentoFontClasses} ${styles.page}`}
                    data-theme={selectedTheme}
                    style={{ padding: previewMode === "mobile" ? 14 : 28 }}
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
                  <button type="button" className={styles.addBlock} onClick={openLibrary}>
                    <Plus size={15} aria-hidden="true" />
                    Add block
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className={styles.rightPanel} aria-label="Inspector">
            <div
              className={`${styles.resizeHandle} ${styles.rightResizeHandle}`}
              role="separator"
              aria-label="Resize inspector"
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
                <div className={styles.propsHead}>
                  <div>
                    <span className={styles.lbl}>
                      {selectedDefinition.productCategory}
                      {selectedLayout ? ` · ${selectedLayout.w}×${selectedLayout.h}` : ""}
                    </span>
                    <h2>{selectedDefinition.v2Name}</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.panelCollapse}
                    onClick={() => setRightCollapsed(true)}
                    aria-label="Hide inspector"
                    aria-expanded={!rightCollapsed}
                  >
                    <PanelRightClose size={15} />
                  </button>
                </div>
                <div className={styles.propsBody}>
                  <BlockEditor embedded />
                </div>
                <div className={styles.propsFoot}>
                  <div className={styles.footButtons}>
                    <button type="button" className={styles.ghost} onClick={() => handleDuplicateBlock(selectedBlockId)}>
                      <Copy size={13} aria-hidden="true" />
                      Duplicate
                    </button>
                    <button type="button" className={styles.danger} onClick={() => handleRemoveBlock(selectedBlockId)}>
                      <Trash2 size={13} aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                  <p>Save keeps your draft. Your live page only changes when you press Publish.</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.propsHead}>
                  <div>
                    <span className={styles.lbl}>Page</span>
                    <h2>{previewData.brandName}</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.panelCollapse}
                    onClick={() => setRightCollapsed(true)}
                    aria-label="Hide inspector"
                    aria-expanded={!rightCollapsed}
                  >
                    <PanelRightClose size={15} />
                  </button>
                </div>
                <div className={styles.pagePanel}>
                  <p className={styles.hint}>Select a block on the grid to edit it.</p>
                  <dl className={styles.pageRows}>
                    <div>
                      <dt>Address</dt>
                      <dd>
                        <span>bentofolio.dev/{profile.username}</span>
                        <button type="button" className={styles.inlineLink} onClick={changeAddress}>
                          {isPlaceholderUsername(profile.username) ? "Claim a name" : "Change"}
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt>Theme</dt>
                      <dd>{selectedTheme === "dark" ? "Dark" : "Light"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{hasUnsavedChanges ? "Unsaved changes" : hasUnpublishedChanges ? "Draft not published" : "Live"}</dd>
                    </div>
                    <div>
                      <dt>Plan</dt>
                      <dd>
                        {hasProAccess ? (
                          "Pro"
                        ) : (
                          <>
                            <span>Free</span>
                            <button type="button" className={styles.inlineLink} onClick={() => openUpgrade()}>
                              Get Pro
                            </button>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                  {profileUrl && (
                    <Link href={profileUrl} className={styles.ghost} target="_blank" rel="noopener">
                      <ExternalLink size={13} aria-hidden="true" />
                      Open your live page
                    </Link>
                  )}
                </div>
              </>
            )}
          </aside>

          {rightCollapsed && (
            <button type="button" className={styles.restoreRight} onClick={() => setRightCollapsed(false)} aria-label="Show inspector">
              <ChevronLeft size={15} />
            </button>
          )}
        </section>
        {removed && (
          <div className={styles.toast} role="status" aria-live="polite" key={removed.block.id}>
            <span>
              <strong>{removed.name}</strong> removed
            </span>
            <button type="button" className={styles.toastUndo} onClick={undoRemove}>
              Undo
            </button>
            <button type="button" className={styles.toastClose} onClick={dismissRemoved} aria-label="Dismiss">
              <X size={14} />
            </button>
            <span className={styles.toastBar} style={{ animationDuration: `${UNDO_MS}ms` }} aria-hidden="true" />
          </div>
        )}
        {usernameDialog && (
          <UsernameDialog
            mode={usernameDialog}
            currentUsername={profile.username}
            initialValue={usernameDialog === "claim" && githubUsername ? normalizeUsername(githubUsername) : ""}
            onSave={handleUsernameSave}
            onClose={() => setUsernameDialog(null)}
          />
        )}
        {upgradeDialog}
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
