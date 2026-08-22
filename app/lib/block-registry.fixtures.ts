import type { BlockContent, BlockLayout, BlockType } from "./types";
import {
  blockRegistry,
  createDefaultBlockContent,
  getDefaultBlockSize,
  legacyBlockTypes,
  resolveLegacyBlock,
} from "./block-registry";

export const representativeLegacyLayouts = Object.fromEntries(
  legacyBlockTypes.map((type, index) => {
    const size = getDefaultBlockSize(type);
    return [
      type,
      {
        id: `fixture-${type}`,
        type,
        x: 0,
        y: index,
        w: size.w,
        h: size.h,
      },
    ];
  }),
) as Record<BlockType, BlockLayout>;

export const representativeLegacyContent = Object.fromEntries(
  legacyBlockTypes.map((type) => [
    type,
    createDefaultBlockContent(type),
  ]),
) as Record<BlockType, BlockContent>;

export const representativeResolvedLegacyBlocks = Object.fromEntries(
  legacyBlockTypes.map((type) => [type, resolveLegacyBlock(type)]),
) as Record<BlockType, ReturnType<typeof resolveLegacyBlock>>;

const registryCompletenessCheck: Record<BlockType, unknown> = blockRegistry;
const layoutCompletenessCheck: Record<BlockType, BlockLayout> =
  representativeLegacyLayouts;
const contentCompletenessCheck: Record<BlockType, BlockContent> =
  representativeLegacyContent;

export function assertRepresentativeLegacyFixtures() {
  return legacyBlockTypes.every((type) => {
    const layout = layoutCompletenessCheck[type];
    const content = contentCompletenessCheck[type];
    const definition = registryCompletenessCheck[type];
    return Boolean(
      definition &&
        layout.type === type &&
        content.type === type &&
        representativeResolvedLegacyBlocks[type].legacyType === type,
    );
  });
}
