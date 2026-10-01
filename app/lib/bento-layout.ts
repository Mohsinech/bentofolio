// Bento grid layout engine.
//
// Pure functions over { id, x, y, w, h } items on a fixed-column grid with
// vertical gravity: blocks float up into free space, and moving or resizing a
// block pushes the ones it lands on downward. No React, no DOM, so it can be
// unit-tested on its own (see bento-layout.test.ts).

export const DESKTOP_COLS = 4;
export const MOBILE_COLS = 2;
export const MAX_ROWS_PER_BLOCK = 4;

export type SizeKey = "small" | "medium" | "large" | "wide" | "hero";

export const SIZE_DIMENSIONS: Record<SizeKey, { w: number; h: number }> = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
  wide: { w: 4, h: 1 },
  hero: { w: 4, h: 2 },
};

export const SIZE_LABELS: Record<SizeKey, string> = {
  small: "S",
  medium: "M",
  large: "L",
  wide: "Wide",
  hero: "Hero",
};

export interface GridItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function sizeKeyFor(w: number, h: number): SizeKey | null {
  for (const key of Object.keys(SIZE_DIMENSIONS) as SizeKey[]) {
    const size = SIZE_DIMENSIONS[key];
    if (size.w === w && size.h === h) return key;
  }
  return null;
}

// The supported size closest to w × h (used when a resize handle is dragged).
export function nearestSize(w: number, h: number, supported: SizeKey[]): SizeKey {
  let best = supported[0];
  let bestScore = Infinity;
  for (const key of supported) {
    const size = SIZE_DIMENSIONS[key];
    const score = Math.abs(size.w - w) * 2 + Math.abs(size.h - h);
    if (score < bestScore) {
      best = key;
      bestScore = score;
    }
  }
  return best;
}

export function collides(a: GridItem, b: GridItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function collidesWithAny(item: GridItem, placed: GridItem[]): boolean {
  return placed.some((other) => collides(item, other));
}

export function sortByPosition<T extends GridItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.y - b.y || a.x - b.x);
}

function toInt(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
}

// Keeps an item inside the grid with whole-number values.
export function clampItem<T extends GridItem>(item: T, cols: number): T {
  const w = Math.min(Math.max(toInt(item.w, 1), 1), cols);
  const h = Math.min(Math.max(toInt(item.h, 1), 1), MAX_ROWS_PER_BLOCK);
  const x = Math.min(Math.max(toInt(item.x, 0), 0), cols - w);
  const y = Math.max(toInt(item.y, 0), 0);
  return { ...item, x, y, w, h };
}

// Moves every item as far up as it can go, in reading order. Never changes x.
export function compact<T extends GridItem>(items: T[]): T[] {
  const placed: T[] = [];
  for (const item of sortByPosition(items)) {
    let next = { ...item, y: 0 };
    while (collidesWithAny(next, placed)) next = { ...next, y: next.y + 1 };
    placed.push(next);
  }
  return placed;
}

// Places items in the given order; `fixed` items keep their spot and the rest
// are pushed down until nothing overlaps.
function resolve<T extends GridItem>(fixed: T[], others: T[]): T[] {
  const placed: T[] = [...fixed];
  for (const item of sortByPosition(others)) {
    let next = { ...item };
    while (collidesWithAny(next, placed)) next = { ...next, y: next.y + 1 };
    placed.push(next);
  }
  return placed;
}

// Repairs any layout: clamps, removes overlaps, floats everything up.
export function normalize<T extends GridItem>(items: T[], cols = DESKTOP_COLS): T[] {
  const clamped = items.map((item) => clampItem(item, cols));
  return compact(resolve([], clamped));
}

// Puts one item at (x, y); anything it lands on moves down. The other blocks
// first close the gap the item leaves, so dragging a block down past its
// neighbour swaps them instead of gravity pulling it straight back.
export function moveItem<T extends GridItem>(
  items: T[],
  id: string,
  x: number,
  y: number,
  cols = DESKTOP_COLS
): T[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  const moved = clampItem({ ...target, x, y }, cols);
  const others = compact(items.filter((item) => item.id !== id));
  return compact(resolve([moved], others));
}

// Where to send a block for a one-step move down (keyboard): just past the
// nearest block below it, accounting for that block floating up into the gap.
export function stepDownTarget(items: GridItem[], id: string): number | null {
  const item = items.find((entry) => entry.id === id);
  if (!item) return null;
  const below = items
    .filter(
      (other) =>
        other.id !== id &&
        other.y >= item.y + item.h &&
        other.x < item.x + item.w &&
        item.x < other.x + other.w
    )
    .sort((a, b) => a.y - b.y)[0];
  if (!below) return null;
  return Math.max(item.y + 1, below.y + below.h - item.h);
}

export function resizeItem<T extends GridItem>(
  items: T[],
  id: string,
  w: number,
  h: number,
  cols = DESKTOP_COLS
): T[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  const resized = clampItem({ ...target, w, h }, cols);
  const others = items.filter((item) => item.id !== id);
  return compact(resolve([resized], others));
}

// First free spot scanning top to bottom, left to right.
export function findFreeSpot(
  items: GridItem[],
  w: number,
  h: number,
  cols = DESKTOP_COLS,
  minY = 0
): { x: number; y: number } {
  const width = Math.min(w, cols);
  for (let y = minY; ; y++) {
    for (let x = 0; x <= cols - width; x++) {
      if (!collidesWithAny({ id: "\u0000probe", x, y, w: width, h }, items)) return { x, y };
    }
  }
}

export function addItem<T extends GridItem>(
  items: T[],
  item: Omit<T, "x" | "y"> & Partial<Pick<T, "x" | "y">>,
  cols = DESKTOP_COLS
): T[] {
  const w = Math.min(item.w, cols);
  const spot = findFreeSpot(items, w, item.h, cols);
  return [...items, { ...item, w, x: spot.x, y: spot.y } as T];
}

export function removeItem<T extends GridItem>(items: T[], id: string): T[] {
  return compact(items.filter((item) => item.id !== id));
}

export function rowCount(items: GridItem[]): number {
  return items.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

// Packs items in the order given, each into the first free spot. Used to
// convert old template layouts and to build the phone layout.
export function packInOrder<T extends GridItem>(
  items: T[],
  cols: number,
  { keepOrder = false }: { keepOrder?: boolean } = {}
): T[] {
  const placed: T[] = [];
  let minY = 0;
  for (const item of items) {
    const w = Math.min(item.w, cols);
    const spot = findFreeSpot(placed, w, item.h, cols, keepOrder ? minY : 0);
    placed.push({ ...item, w, x: spot.x, y: spot.y });
    if (keepOrder) minY = spot.y;
  }
  return placed;
}

// Phone layout from the desktop one: 2 columns, same reading order. Wide
// blocks become 2 wide; nothing gets taller.
export function toMobileLayout<T extends GridItem>(items: T[]): T[] {
  return packInOrder(
    sortByPosition(items).map((item) => ({ ...item, w: Math.min(item.w, MOBILE_COLS) })),
    MOBILE_COLS,
    { keepOrder: true }
  );
}

// Converts a layout saved by the old fixed template, where only the order
// mattered (y was the position in the list and x was stale). Sizes are kept
// when the block supports them, otherwise the block's default size is used.
export function convertTemplateLayout<T extends GridItem>(
  items: T[],
  sizeFor: (item: T) => { w: number; h: number }
): T[] {
  const ordered = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => toInt(a.item.y, a.index) - toInt(b.item.y, b.index) || a.index - b.index)
    .map(({ item }) => ({ ...item, ...sizeFor(item) }));
  return compact(packInOrder(ordered, DESKTOP_COLS));
}

// Grid cell under a point, given the grid's measured geometry.
export function cellFromPoint(
  px: number,
  py: number,
  geometry: { left: number; top: number; colWidth: number; rowHeight: number; gap: number },
  cols = DESKTOP_COLS
): { x: number; y: number } {
  const x = Math.floor((px - geometry.left + geometry.gap / 2) / (geometry.colWidth + geometry.gap));
  const y = Math.floor((py - geometry.top + geometry.gap / 2) / (geometry.rowHeight + geometry.gap));
  return { x: Math.min(Math.max(x, 0), cols - 1), y: Math.max(y, 0) };
}

export function layoutsEqual(a: GridItem[], b: GridItem[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(b.map((item) => [item.id, item]));
  return a.every((item) => {
    const other = byId.get(item.id);
    return other && other.x === item.x && other.y === item.y && other.w === item.w && other.h === item.h;
  });
}
