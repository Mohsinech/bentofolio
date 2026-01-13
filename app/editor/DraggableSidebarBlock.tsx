"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";
import styles from "./editor.module.css";
import { BlockType, premiumBlocks } from "@/app/lib/types";

interface DraggableSidebarBlockProps {
  type: BlockType;
  icon: React.ReactNode;
  label: string;
  onAdd: (type: BlockType) => void;
  isPro?: boolean;
}

export function DraggableSidebarBlock({
  type,
  icon,
  label,
  onAdd,
  isPro = false,
}: DraggableSidebarBlockProps) {
  const isPremiumBlock = premiumBlocks.includes(type);
  const isLocked = isPremiumBlock && !isPro;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `sidebar-${type}`,
      data: {
        type: "sidebar-block",
        blockType: type,
      },
      disabled: isLocked,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : isLocked ? 0.6 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  // Fallback to click to add
  const handleClick = () => {
    if (!isDragging && !isLocked) {
      onAdd(type);
    }
  };

  // Locked block - show upgrade link
  if (isLocked) {
    return (
      <Link href="/pricing" className={styles.blockMenuItemLocked}>
        <span className={styles.blockMenuIcon}>{icon}</span>
        <span>{label}</span>
        <Lock size={12} className={styles.lockIcon} />
      </Link>
    );
  }

  return (
    <motion.button
      ref={setNodeRef}
      style={style}
      className={styles.blockMenuItem}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...attributes}
      {...listeners}
    >
      <span className={styles.blockMenuIcon}>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}
