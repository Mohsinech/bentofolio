"use client";

import Link from "next/link";
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
  ArrowDown,
  ArrowUp,
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
  Smartphone,
  Sun,
  Trash2,
} from "lucide-react";

import { BlockEditor } from "./BlockEditor";
import { EditorProvider, useEditor } from "@/app/lib/editor-context";
import { useAuth, useProfile } from "@/app/lib/hooks";
import {
  createDefaultBlockContent,
  editorBlockLibraryEntries,
  getBlockDefinition,
  getDefaultBlockSize,
} from "@/app/lib/block-registry";
import { mapProfileToV2Portfolio } from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import { V2PortfolioTemplate } from "@/app/components/v2-portfolio/V2PortfolioTemplate";
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
  return JSON.stringify({ layout, content, theme });
}

function EditorStudio() {
  const { profile, loading, error, saveProfile, saving, hasProAccess } = useProfile();
  const { signOut } = useAuth();
  const {
    layout,
    content,
    selectedBlockId,
    setLayout,
    setContent,
    selectBlock,
  } = useEditor();
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
  const workspaceStyle = {
    "--left-panel-width": `${leftPanelWidth}px`,
    "--right-panel-width": `${rightPanelWidth}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!profile || hydratedProfileIdRef.current === profile.id) return;

    const nextLayout = cloneLayout(profile.layout || []);
    const nextContent = cloneContent(profile.content || {});
    const nextTheme = profile.theme || "light";

    setLayout(nextLayout);
    setContent(nextContent);
    setThemeOverride(nextTheme);
    hydratedProfileIdRef.current = profile.id;
    savedSnapshotRef.current = createSnapshot(nextLayout, nextContent, nextTheme);
  }, [profile, setContent, setLayout]);

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
  const fixedTemplateBlockIds = useMemo(
    () => new Set(Object.values(previewData.sourceBlocks || {}).filter(Boolean)),
    [previewData.sourceBlocks]
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
    const size = getDefaultBlockSize(type);
    const nextBlock: BlockLayout = {
      id,
      type,
      x: 0,
      y: layout.length,
      w: size.w,
      h: size.h,
    };

    setLayout([...layout, nextBlock]);
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
    setLayout(layout.filter((item) => item.id !== id));
    setContent(nextContent);
    selectBlock(null);
    showStatus("Block removed");
  }

  function handleMoveBlock(id: string, direction: -1 | 1) {
    const index = layout.findIndex((block) => block.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= layout.length) return;

    const nextLayout = [...layout];
    const [block] = nextLayout.splice(index, 1);
    nextLayout.splice(nextIndex, 0, block);
    setLayout(nextLayout.map((item, y) => ({ ...item, y })));
    handleSelectBlock(id);
    showStatus("Structure updated");
  }

  async function handleSave() {
    await saveProfile({
      layout,
      content,
      theme: selectedTheme,
    });
    savedSnapshotRef.current = createSnapshot(layout, content, selectedTheme);
    showStatus("Saved");
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
                  hasUnsavedChanges ? styles.saveStateUnsaved : styles.saveStateSaved
                }`}
                aria-live="polite"
              >
                {saving ? <Loader2 className={styles.spin} size={15} /> : <span className={styles.saveDot} />}
                <span>{saving ? "Saving" : status || (hasUnsavedChanges ? "Unsaved" : "Saved")}</span>
              </div>
              <button type="button" className={styles.primaryAction} onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className={styles.spin} size={14} /> : <Save size={14} />}
                Save
              </button>
            </div>
            {profileUrl && (
              <Link href={profileUrl} className={styles.secondaryAction}>
                View live
              </Link>
            )}
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
                    {layout.map((block, index) => {
                      const definition = getBlockDefinition(block.type);
                      const Icon = definition.icon;
                      const isSelected = selectedBlockId === block.id;
                      const isFixedTemplateSlot = fixedTemplateBlockIds.has(block.id);

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
                                {isFixedTemplateSlot
                                  ? "Fixed template slot"
                                  : content[block.id]
                                    ? "Visible"
                                    : "Missing content"}
                              </small>
                            </span>
                          </button>
                          <div className={styles.structureActions}>
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(block.id, -1)}
                              disabled={isFixedTemplateSlot || index === 0}
                              aria-label={`Move ${definition.v2Name} up`}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveBlock(block.id, 1)}
                              disabled={isFixedTemplateSlot || index === layout.length - 1}
                              aria-label={`Move ${definition.v2Name} down`}
                            >
                              <ArrowDown size={13} />
                            </button>
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
                <p>Start with Profile, Projects, Skills, and a CTA to preview your V2 portfolio.</p>
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
                    <V2PortfolioTemplate
                      key={`${selectedTheme}-${previewMode}`}
                      data={previewData}
                      mode="editor"
                      editor={{
                        selectedBlockId,
                        onSelectBlock: handleSelectBlock,
                      }}
                    />
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
                    <dd>{profileUrl || "Not available"}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{hasUnsavedChanges ? "Unsaved changes" : "Saved"}</dd>
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
