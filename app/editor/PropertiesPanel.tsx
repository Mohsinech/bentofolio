"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Layers } from "lucide-react";
import { useEditor } from "@/app/lib/editor-context";
import { BlockEditor } from "./BlockEditor";
import styles from "./PropertiesPanel.module.css";

export function PropertiesPanel() {
  const { selectedBlockId, content, selectBlock } = useEditor();
  const selectedContent = selectedBlockId ? content[selectedBlockId] : null;

  return (
    <AnimatePresence mode="wait">
      {selectedBlockId && selectedContent ? (
        <motion.aside
          key="properties"
          className={styles.panel}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Layers size={16} />
              <span>Properties</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => selectBlock(null)}
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.blockType}>
            <span className={styles.blockTypeLabel}>Block Type</span>
            <span className={styles.blockTypeName}>
              {formatBlockType(selectedContent.type)}
            </span>
          </div>

          <div className={styles.content}>
            <BlockEditor embedded />
          </div>
        </motion.aside>
      ) : (
        <motion.aside
          key="empty"
          className={`${styles.panel} ${styles.empty}`}
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className={styles.emptyState}>
            <Layers size={32} className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              Select a block to edit its properties
            </p>
            <span className={styles.emptyHint}>
              Click on any block in the canvas
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function formatBlockType(type: string): string {
  return type
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
