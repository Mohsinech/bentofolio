"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import styles from "./TechStackBlock.module.css";
import { TechStackContent } from "@/app/lib/types";

interface TechStackBlockProps {
  data: TechStackContent;
}

export function TechStackBlock({ data }: TechStackBlockProps) {
  // Empty state
  if (!data.items || data.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Code2 size={14} />
          <span>Tech Stack</span>
        </div>
        <div className={styles.empty}>
          <span>Add your technologies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Code2 size={14} />
        <span>Tech Stack</span>
      </div>
      <div className={styles.grid}>
        {data.items.map((tech, index) => (
          <motion.div
            key={tech.name}
            className={styles.tech}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.techIcon}>{tech.icon}</span>
            <span>{tech.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
