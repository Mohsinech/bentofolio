"use client";

import { CareerContent } from "@/app/lib/types";
import styles from "./CareerBlock.module.css";

interface CareerBlockProps {
  data: CareerContent;
}

export function CareerBlock({ data }: CareerBlockProps) {
  const totalPercentage = data.milestones.reduce(
    (sum, m) => sum + m.percentage,
    0
  );

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{data.title || "Career Journey"}</h3>

      <div className={styles.timeline}>
        {data.milestones.map((milestone, index) => (
          <div
            key={index}
            className={styles.milestone}
            style={{
              flex: `${milestone.percentage} 1 0%`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className={styles.milestoneIcon}>
              {milestone.icon ? (
                <img
                  src={milestone.icon}
                  alt={milestone.label}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {milestone.label.charAt(0)}
                </div>
              )}
            </div>
            <div className={styles.milestoneBar}>
              <span className={styles.percentage}>{milestone.percentage}%</span>
            </div>
            <div className={styles.milestoneInfo}>
              <span className={styles.labelText}>{milestone.label}</span>
              {milestone.company && (
                <span className={styles.company}>{milestone.company}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
