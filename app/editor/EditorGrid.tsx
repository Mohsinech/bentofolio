"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
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
import { BlockLayout } from "@/app/lib/types";

export function EditorGrid() {
  const { layout, content, reorderBlocks, selectBlock, isEditMode } =
    useEditor();
  const [activeBlock, setActiveBlock] = useState<BlockLayout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for quicker drag start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const block = layout.find((b) => b.id === event.active.id);
      if (block) {
        setActiveBlock(block);
        // Deselect when starting drag
        selectBlock(null);
      }
    },
    [layout, selectBlock]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveBlock(null);

      if (over && active.id !== over.id) {
        reorderBlocks(active.id as string, over.id as string);
      }
    },
    [reorderBlocks]
  );

  const handleBackgroundClick = useCallback(() => {
    selectBlock(null);
  }, [selectBlock]);

  return (
    <div onClick={handleBackgroundClick}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
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
                  isDragActive={activeBlock !== null}
                />
              );
            })}
          </BentoGrid>
        </SortableContext>

        {/* Drag overlay for smooth dragging */}
        <DragOverlay
          dropAnimation={{
            duration: 300,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {activeBlock && content[activeBlock.id] ? (
            <BlockPreview
              layout={activeBlock}
              content={content[activeBlock.id]}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
