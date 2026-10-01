import { getBlockDefinition } from "@/app/lib/block-registry";
import {
  SIZE_DIMENSIONS,
  compact,
  convertTemplateLayout,
  normalize,
  sizeKeyFor,
  type SizeKey,
} from "@/app/lib/bento-layout";
import { hasRenderableBlockContent } from "@/app/components/v2-portfolio/mapProfileToV2Portfolio";
import type { BlockContent, BlockLayout, BlockType } from "@/app/lib/types";

// Layouts saved before the bento grid (version 1) only kept the block order.
// Version 2 stores real grid positions.
export const GRID_LAYOUT_VERSION = 2;

export function supportedSizes(type: BlockType): SizeKey[] {
  return getBlockDefinition(type).supportedSizes as SizeKey[];
}

export function isSizeSupported(type: BlockType, w: number, h: number): boolean {
  const key = sizeKeyFor(w, h);
  return key !== null && supportedSizes(type).includes(key);
}

// A size the block supports: its current one if allowed, else its default.
export function validSizeFor(type: BlockType, w: number, h: number): { w: number; h: number } {
  if (isSizeSupported(type, w, h)) return { w, h };
  const fallback = getBlockDefinition(type).defaultSize;
  if (isSizeSupported(type, fallback.w, fallback.h)) return { w: fallback.w, h: fallback.h };
  return SIZE_DIMENSIONS[supportedSizes(type)[0]];
}

// The layout to show for a page, whatever version it was saved as.
// Deterministic, so the editor and the public page always agree.
export function resolveLayout(layout: BlockLayout[] | null | undefined, version?: number | null): BlockLayout[] {
  const items = Array.isArray(layout) ? layout.filter((item) => item && item.id && item.type) : [];
  if ((version ?? 1) >= GRID_LAYOUT_VERSION) {
    return normalize(items.map((item) => ({ ...item, ...validSizeFor(item.type, item.w, item.h) })));
  }
  return convertTemplateLayout(items, (item) => validSizeFor(item.type, item.w, item.h));
}

// What visitors see: incomplete blocks and Pro blocks on a free page are
// left out, and the rest float up to close the gaps.
export function publicLayout(
  layout: BlockLayout[],
  content: Record<string, BlockContent>,
  isPro: boolean
): BlockLayout[] {
  return compact(
    layout.filter((item) => {
      const definition = getBlockDefinition(item.type);
      if (definition.accessLevel === "pro" && !isPro) return false;
      return hasRenderableBlockContent(item.type, content[item.id]);
    })
  );
}
