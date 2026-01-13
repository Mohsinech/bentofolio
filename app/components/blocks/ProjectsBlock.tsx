"use client";

import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, FolderGit2 } from "lucide-react";
import styles from "./ProjectsBlock.module.css";
import { ProjectsContent } from "@/app/lib/types";

interface ProjectsBlockProps {
  data: ProjectsContent;
}

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// Language color mapping
const languageColors: Record<string, string> = {
  typescript: "#3178c6",
  javascript: "#f7df1e",
  python: "#3572a5",
  java: "#b07219",
  go: "#00add8",
  rust: "#dea584",
  ruby: "#701516",
  php: "#4f5d95",
  swift: "#f05138",
  kotlin: "#a97bff",
  html: "#e34c26",
  css: "#563d7c",
  scss: "#c6538c",
  vue: "#41b883",
  react: "#61dafb",
  default: "#6366f1",
};

function getLanguageColor(lang: string): string {
  return languageColors[lang?.toLowerCase()] || languageColors.default;
}

export function ProjectsBlock({ data }: ProjectsBlockProps) {
  const { items } = data;

  // Fallback for empty state
  if (!items || items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.title}>Projects</span>
        </div>
        <div className={styles.empty}>
          <FolderGit2 size={32} />
          <span>Add your projects</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Projects</span>
      </div>

      <div className={styles.projects}>
        {items.slice(0, 4).map((project, i) => (
          <motion.a
            key={`${project.name}-${i}`}
            href={project.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.project}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 4 }}
          >
            <div className={styles.projectMain}>
              <div className={styles.projectName}>
                <span className={styles.name}>
                  {project.name || "Untitled"}
                </span>
                {project.url && (
                  <ExternalLink size={12} className={styles.externalIcon} />
                )}
              </div>
              {project.description && (
                <span className={styles.description}>
                  {project.description}
                </span>
              )}
            </div>

            <div className={styles.projectMeta}>
              {project.language && (
                <span className={styles.language}>
                  <span
                    className={styles.languageDot}
                    style={{
                      backgroundColor:
                        project.languageColor ||
                        getLanguageColor(project.language),
                    }}
                  />
                  {project.language}
                </span>
              )}
              <span className={styles.stat}>
                <Star size={12} />
                {formatNumber(project.stars)}
              </span>
              <span className={styles.stat}>
                <GitFork size={12} />
                {formatNumber(project.forks)}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
