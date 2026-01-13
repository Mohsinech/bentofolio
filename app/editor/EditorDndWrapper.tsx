"use client";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useCallback } from "react";
import { BentoGrid } from "@/app/components/grid";
import { useEditor } from "@/app/lib/editor-context";
import { DraggableBlock, BlockPreview } from "./DraggableBlock";
import { BlockLayout, BlockType } from "@/app/lib/types";
import styles from "./editor.module.css";

interface DragItem {
  type: "existing-block" | "new-block";
  blockLayout?: BlockLayout;
  blockType?: BlockType;
}

export function EditorDndWrapper({ children }: { children: React.ReactNode }) {
  const { layout, content, reorderBlocks, addBlock, selectBlock, isEditMode } =
    useEditor();
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeId = String(active.id);

      // Check if it's a sidebar block
      if (activeId.startsWith("sidebar-")) {
        const blockType = active.data.current?.blockType as BlockType;
        setActiveItem({
          type: "new-block",
          blockType,
        });
      } else {
        // It's an existing block
        const block = layout.find((b) => b.id === activeId);
        if (block) {
          setActiveItem({
            type: "existing-block",
            blockLayout: block,
          });
          selectBlock(null);
        }
      }
    },
    [layout, selectBlock]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // New block from sidebar
      if (activeId.startsWith("sidebar-") && active.data.current?.blockType) {
        const blockType = active.data.current.blockType as BlockType;
        addBlock(blockType);
        return;
      }

      // Reorder existing blocks
      if (activeId !== overId && !overId.startsWith("sidebar-")) {
        reorderBlocks(activeId, overId);
      }
    },
    [addBlock, reorderBlocks]
  );

  const handleBackgroundClick = useCallback(() => {
    selectBlock(null);
  }, [selectBlock]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      {/* Render sidebar and main content as children */}
      {children}

      {/* Main grid area with sortable context */}
      <main className={styles.main} onClick={handleBackgroundClick}>
        <div className={styles.gridWrapper} id="portfolio-grid">
          <SortableContext
            items={layout.map((block) => block.id)}
            strategy={rectSortingStrategy}
          >
            <BentoGrid isEditing={isEditMode}>
              {layout.map((block, index) => {
                const blockContent = content[block.id];
                if (!blockContent) return null;

                return (
                  <DraggableBlock
                    key={block.id}
                    layout={block}
                    content={blockContent}
                    index={index}
                    isDragActive={activeItem !== null}
                  />
                );
              })}
            </BentoGrid>
          </SortableContext>
        </div>
      </main>

      {/* Drag overlay */}
      <DragOverlay
        dropAnimation={{
          duration: 300,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {activeItem?.type === "existing-block" &&
        activeItem.blockLayout &&
        content[activeItem.blockLayout.id] ? (
          <BlockPreview
            layout={activeItem.blockLayout}
            content={content[activeItem.blockLayout.id]}
          />
        ) : activeItem?.type === "new-block" && activeItem.blockType ? (
          <div className={styles.newBlockPreview}>
            <span className={styles.newBlockLabel}>
              + {activeItem.blockType}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
