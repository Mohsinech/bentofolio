"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Trash2, GripVertical, Pencil } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import styles from "./DraggableBlock.module.css";
import gridStyles from "../components/grid/BentoGrid.module.css";
import { cn } from "@/app/lib/utils";
import { useEditor } from "@/app/lib/editor-context";
import { BlockLayout, BlockContent } from "@/app/lib/types";
import {
  IdentityBlock,
  MapBlock,
  TechStackBlock,
  ExperienceBlock,
  SpotifyBlock,
  MetricsBlock,
  LinkBlock,
  TextBlock,
  SaaSBlock,
  GitHubBlock,
  ProjectsBlock,
  SocialBlock,
  AvailabilityBlock,
  QuoteBlock,
  ResumeBlock,
  YouTubeBlock,
  InstagramBlock,
  NetworkBlock,
  CareerBlock,
} from "@/app/components/blocks";

interface DraggableBlockProps {
  layout: BlockLayout;
  content: BlockContent;
  index: number;
  isDragActive?: boolean;
  enableMagnetic?: boolean;
  cardEffect?: "wiggle" | "bounce" | "jelly" | "none";
}

interface BlockPreviewProps {
  layout: BlockLayout;
  content: BlockContent;
}

function renderBlock(content: BlockContent) {
  switch (content.type) {
    case "identity":
      return <IdentityBlock data={content.data} />;
    case "map":
      return <MapBlock data={content.data} />;
    case "techstack":
      return <TechStackBlock data={content.data} />;
    case "experience":
      return <ExperienceBlock data={content.data} />;
    case "spotify":
      return <SpotifyBlock data={content.data} />;
    case "metrics":
      return <MetricsBlock data={content.data} />;
    case "link":
      return <LinkBlock data={content.data} />;
    case "text":
      return <TextBlock data={content.data} />;
    case "saas":
      return <SaaSBlock data={content.data} />;
    case "github":
      return <GitHubBlock data={content.data} />;
    case "projects":
      return <ProjectsBlock data={content.data} />;
    case "social":
      return <SocialBlock data={content.data} />;
    case "availability":
      return <AvailabilityBlock data={content.data} />;
    case "quote":
      return <QuoteBlock data={content.data} />;
    case "resume":
      return <ResumeBlock data={content.data} />;
    case "youtube":
      return <YouTubeBlock data={content.data} />;
    case "instagram":
      return <InstagramBlock data={content.data} />;
    case "network":
      return <NetworkBlock data={content.data} />;
    case "career":
      return <CareerBlock data={content.data} />;
    default:
      return <div>Unknown block</div>;
  }
}

// Preview component shown during drag
export function BlockPreview({ layout, content }: BlockPreviewProps) {
  const colClass = gridStyles[`col${layout.w}`];
  const rowClass = gridStyles[`row${layout.h}`];

  return (
    <div
      className={cn(
        gridStyles.item,
        colClass,
        rowClass,
        "glass",
        styles.preview,
      )}
    >
      <div className={styles.content}>{renderBlock(content)}</div>
    </div>
  );
}

export function DraggableBlock({
  layout,
  content,
  index,
  isDragActive,
  enableMagnetic = false,
  cardEffect = "none",
}: DraggableBlockProps) {
  const { isEditMode, selectedBlockId, selectBlock, removeBlock } = useEditor();

  // 3D Tilt effect state
  const tiltRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleTiltMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltRef.current || !enableMagnetic || isEditMode) return;

      const rect = tiltRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const intensity = 15; // Increased for more noticeable effect
      const rotateY = (x - 0.5) * intensity;
      const rotateX = (0.5 - y) * intensity;

      setTilt({ rotateX, rotateY });
    },
    [enableMagnetic, isEditMode],
  );

  const handleTiltEnter = useCallback(() => {
    if (enableMagnetic && !isEditMode) setIsHovering(true);
  }, [enableMagnetic, isEditMode]);

  const handleTiltLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: layout.id,
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.2, 0, 0, 1)", // Smoother ease-out
    },
  });

  // Optimized transform with GPU acceleration
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "none" // No transition while dragging for instant feedback
      : transition || "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    willChange: isDragging ? "transform" : "auto", // GPU hint
  };

  const colClass = gridStyles[`col${layout.w}`];
  const rowClass = gridStyles[`row${layout.h}`];
  const isSelected = selectedBlockId === layout.id;

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode && !isDragging) {
      e.stopPropagation();
      selectBlock(layout.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(layout.id);
  };

  // In edit mode, make the whole block draggable
  const dragProps = isEditMode ? { ...attributes, ...listeners } : {};

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        (tiltRef as any).current = node;
      }}
      style={{
        ...style,
        perspective: enableMagnetic && !isEditMode ? "1200px" : undefined,
        transformStyle:
          enableMagnetic && !isEditMode ? "preserve-3d" : undefined,
      }}
      className={cn(
        gridStyles.item,
        colClass,
        rowClass,
        "glass glow",
        styles.block,
        isEditMode && styles.editable,
        isSelected && styles.selected,
        isDragging && styles.dragging,
        isDragActive && !isDragging && styles.shifting,
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.03 : isHovering && enableMagnetic ? 1.02 : 1,
        rotateX: enableMagnetic && !isEditMode ? tilt.rotateX : 0,
        rotateY: enableMagnetic && !isEditMode ? tilt.rotateY : 0,
      }}
      transition={{
        duration: 0.25,
        delay: index * 0.02,
        ease: [0.2, 0, 0, 1],
        rotateX: { type: "spring", stiffness: 300, damping: 20 },
        rotateY: { type: "spring", stiffness: 300, damping: 20 },
      }}
      onClick={handleClick}
      onMouseMove={handleTiltMove}
      onMouseEnter={handleTiltEnter}
      onMouseLeave={handleTiltLeave}
      whileHover={
        !isEditMode && !isDragging ? { y: -4, scale: 1.01 } : undefined
      }
      {...dragProps}
    >
      {/* Drag handle + Edit + Delete (Edit mode only) */}
      {isEditMode && (
        <div className={styles.controls}>
          <div className={styles.dragHandle}>
            <GripVertical size={16} />
          </div>
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(layout.id);
            }}
          >
            <Pencil size={14} />
          </button>
          <button className={styles.deleteButton} onClick={handleRemove}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Block content */}
      <div className={cn(styles.content, isDragging && styles.contentDragging)}>
        {renderBlock(content)}
      </div>
    </motion.div>
  );
}
