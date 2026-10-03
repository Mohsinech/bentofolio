"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Copy, GripVertical, Lock, Trash2 } from "lucide-react";
import type { BlockContent, BlockLayout, BlockType } from "@/app/lib/types";
import { getBlockDefinition } from "@/app/lib/block-registry";
import {
  DESKTOP_COLS,
  SIZE_DIMENSIONS,
  SIZE_LABELS,
  cellFromPoint,
  moveItem,
  nearestSize,
  resizeItem,
  rowAt,
  rowCount,
  rowsTo,
  sizeKeyFor,
  stepDownTarget,
  toMobileLayout,
  type SizeKey,
} from "@/app/lib/bento-layout";
import {
  draftMessageForBlock,
  hasRenderableBlockContent,
} from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import { BentoBlockBody, FULL_BLEED_TYPES, GROW_TYPES, OWN_SURFACE_TYPES } from "./BentoBlocks";
import { supportedSizes } from "./grid-layout";
import styles from "./bento.module.css";

export interface BentoEditorControls {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onLayoutChange: (layout: BlockLayout[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

interface BentoGridProps {
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  avatarUrl?: string | null;
  isPro: boolean;
  // Phone layout regardless of screen width (editor's Mobile preview).
  forceMobile?: boolean;
  editor?: BentoEditorControls;
}

type Gesture =
  | {
      kind: "move";
      id: string;
      pointerId: number;
      startX: number;
      startY: number;
      grabCol: number;
      grabRow: number;
      active: boolean;
    }
  | { kind: "resize"; id: string; pointerId: number; left: number; row: number; supported: SizeKey[] };

const DRAG_THRESHOLD = 6;

function cellStyle(desktop: BlockLayout, mobile?: BlockLayout): CSSProperties {
  return {
    "--x": desktop.x,
    "--y": desktop.y,
    "--w": desktop.w,
    "--h": desktop.h,
    "--mx": mobile?.x ?? 0,
    "--my": mobile?.y ?? desktop.y,
    "--mw": mobile?.w ?? Math.min(desktop.w, 2),
    "--mh": mobile?.h ?? desktop.h,
  } as CSSProperties;
}

export function BentoGrid({ layout, content, avatarUrl, isPro, forceMobile = false, editor }: BentoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<BlockLayout[] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const editing = Boolean(editor);
  const canArrange = editing && !forceMobile;
  const shown = preview ?? layout;
  const mobile = useMemo(() => toMobileLayout(shown), [shown]);
  const mobileById = useMemo(() => new Map(mobile.map((item) => [item.id, item])), [mobile]);
  const rows = forceMobile ? rowCount(mobile) : rowCount(shown);

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const computed = window.getComputedStyle(grid);
    const gap = parseFloat(computed.columnGap) || 14;
    // grid-auto-rows is "minmax(176px, auto)": rows are at least that tall
    // and grow with their content, so read each row's real height too.
    const rowHeight = parseFloat(/[\d.]+px/.exec(computed.gridAutoRows)?.[0] || "") || 176;
    const rows = computed.gridTemplateRows
      .split(/\s+/)
      .map((track) => parseFloat(track))
      .filter((track) => Number.isFinite(track));
    const colWidth = (rect.width - gap * (DESKTOP_COLS - 1)) / DESKTOP_COLS;
    return { left: rect.left, top: rect.top, colWidth, rowHeight, rows, gap };
  }, []);

  // ---- move -------------------------------------------------------------

  function onCellPointerDown(event: ReactPointerEvent<HTMLDivElement>, item: BlockLayout) {
    if (!canArrange || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-no-drag]")) return;
    const geometry = measure();
    if (!geometry) return;
    const grabCol = Math.max(0, Math.min(item.w - 1, Math.floor((event.clientX - geometry.left) / (geometry.colWidth + geometry.gap)) - item.x));
    const grabRow = Math.max(0, Math.min(item.h - 1, rowAt(geometry, event.clientY - geometry.top) - item.y));
    gestureRef.current = {
      kind: "move",
      id: item.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      grabCol,
      grabRow,
      active: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onCellPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const geometry = measure();
    if (!geometry) return;

    if (gesture.kind === "move") {
      if (!gesture.active) {
        if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < DRAG_THRESHOLD) return;
        gesture.active = true;
        setDraggingId(gesture.id);
        editor?.onSelect(gesture.id);
      }
      const cell = cellFromPoint(event.clientX, event.clientY, geometry);
      const item = layout.find((entry) => entry.id === gesture.id);
      if (!item) return;
      const x = Math.max(0, Math.min(DESKTOP_COLS - item.w, cell.x - gesture.grabCol));
      const y = Math.max(0, cell.y - gesture.grabRow);
      setPreview(moveItem(layout, gesture.id, x, y));
      return;
    }

    // resize
    const w = Math.round((event.clientX - gesture.left + geometry.gap / 2) / (geometry.colWidth + geometry.gap));
    const h = rowsTo(geometry, gesture.row, event.clientY - geometry.top);
    const key = nearestSize(Math.max(1, w), Math.max(1, h), gesture.supported);
    const size = SIZE_DIMENSIONS[key];
    setPreview(resizeItem(layout, gesture.id, size.w, size.h));
  }

  function finishGesture(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    setDraggingId(null);

    if (gesture.kind === "move" && !gesture.active) {
      // A click, not a drag.
      editor?.onSelect(gesture.id);
      setPreview(null);
      return;
    }
    if (!cancelled && preview) editor?.onLayoutChange(preview);
    setPreview(null);
  }

  // ---- resize -----------------------------------------------------------

  function onResizePointerDown(event: ReactPointerEvent<HTMLButtonElement>, item: BlockLayout) {
    event.stopPropagation();
    if (!canArrange) return;
    const geometry = measure();
    if (!geometry) return;
    gestureRef.current = {
      kind: "resize",
      id: item.id,
      pointerId: event.pointerId,
      left: geometry.left + item.x * (geometry.colWidth + geometry.gap),
      row: item.y,
      supported: supportedSizes(item.type),
    };
    setDraggingId(item.id);
    // Capture on the cell so its move/up handlers receive the gesture.
    (event.currentTarget.closest("[data-cell]") as HTMLElement | null)?.setPointerCapture(event.pointerId);
  }

  function applySize(item: BlockLayout, key: SizeKey) {
    const size = SIZE_DIMENSIONS[key];
    editor?.onLayoutChange(resizeItem(layout, item.id, size.w, size.h));
  }

  // ---- keyboard ---------------------------------------------------------

  function onCellKeyDown(event: ReactKeyboardEvent<HTMLDivElement>, item: BlockLayout) {
    if (!editor) return;
    if (event.key === "Enter" || event.key === " ") {
      if (event.target === event.currentTarget) {
        event.preventDefault();
        editor.onSelect(item.id);
      }
      return;
    }
    if (!canArrange || !event.altKey) return;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    const x = Math.max(0, Math.min(DESKTOP_COLS - item.w, item.x + move[0]));
    let y = item.y;
    if (move[1] < 0) y = Math.max(0, item.y - 1);
    if (move[1] > 0) {
      const down = stepDownTarget(layout, item.id);
      if (down === null) return;
      y = down;
    }
    if (x === item.x && y === item.y) return;
    editor.onLayoutChange(moveItem(layout, item.id, x, y));
  }

  // ---- render -----------------------------------------------------------

  return (
    <div
      ref={gridRef}
      className={`${styles.grid} ${forceMobile ? styles.gridMobile : ""} ${editing ? styles.gridEditing : ""} ${
        draggingId ? styles.gridDragging : ""
      }`}
      style={{ "--rows": rows } as CSSProperties}
      onPointerDown={(event) => {
        if (editor && event.target === event.currentTarget) editor.onSelect(null);
      }}
    >
      {canArrange && draggingId && <div className={styles.gridGuides} aria-hidden="true" />}

      {shown.map((item) => {
        const block = content[item.id];
        const definition = getBlockDefinition(item.type as BlockType);
        const selected = editor?.selectedId === item.id;
        const renderable = hasRenderableBlockContent(item.type, block);
        const lockedPro = definition.accessLevel === "pro" && !isPro;
        const fullBleed = FULL_BLEED_TYPES.has(item.type) && renderable;
        const ownSurface = OWN_SURFACE_TYPES.has(item.type) && renderable;
        const currentKey = sizeKeyFor(item.w, item.h);

        return (
          <div
            key={item.id}
            data-cell
            data-block={item.type}
            data-grow={GROW_TYPES.has(item.type) ? "" : undefined}
            data-top={item.y === 0 ? "true" : undefined}
            data-h={item.h}
            data-w={item.w}
            className={`${styles.cell} ${selected ? styles.cellSelected : ""} ${draggingId === item.id ? styles.cellDragging : ""}`}
            style={cellStyle(item, mobileById.get(item.id))}
            tabIndex={editing ? 0 : undefined}
            role={editing ? "button" : undefined}
            aria-label={editing ? `${definition.v2Name} block${selected ? ", selected" : ""}` : undefined}
            aria-pressed={editing ? selected : undefined}
            onPointerDown={(event) => onCellPointerDown(event, item)}
            onPointerMove={onCellPointerMove}
            onPointerUp={(event) => finishGesture(event)}
            onPointerCancel={(event) => finishGesture(event, true)}
            onKeyDown={(event) => onCellKeyDown(event, item)}
          >
            <article
              className={`${styles.card} ${fullBleed ? styles.cardBleed : ""} ${ownSurface ? styles.cardBare : ""} ${
                editing && !renderable ? styles.cardIncomplete : ""
              }`}
            >
              {block ? (
                <BentoBlockBody layout={item} content={block} editing={editing} avatarUrl={avatarUrl} />
              ) : null}
              {editing && !renderable && (
                <span className={styles.incomplete}>
                  {definition.v2Name}: {draftMessageForBlock(item.type)}
                </span>
              )}
            </article>

            {editing && lockedPro && (
              <span className={styles.proBadge} title="Hidden on your live page until you go Pro">
                <Lock size={11} aria-hidden="true" /> PRO
              </span>
            )}

            {selected && canArrange && (
              <>
                <div className={styles.toolbar} data-no-drag role="toolbar" aria-label={`${definition.v2Name} block`}>
                  <span className={styles.toolbarGrip} aria-hidden="true">
                    <GripVertical size={14} />
                  </span>
                  {supportedSizes(item.type).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={currentKey === key ? styles.toolbarActive : undefined}
                      aria-pressed={currentKey === key}
                      onClick={() => applySize(item, key)}
                      title={`${SIZE_DIMENSIONS[key].w}×${SIZE_DIMENSIONS[key].h}`}
                    >
                      {SIZE_LABELS[key]}
                    </button>
                  ))}
                  <span className={styles.toolbarDivider} aria-hidden="true" />
                  <button type="button" onClick={() => editor?.onDuplicate(item.id)} aria-label="Duplicate block">
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    className={styles.toolbarDanger}
                    onClick={() => editor?.onDelete(item.id)}
                    aria-label="Delete block"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  data-no-drag
                  className={styles.resizeHandle}
                  aria-label="Drag to resize"
                  onPointerDown={(event) => onResizePointerDown(event, item)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
