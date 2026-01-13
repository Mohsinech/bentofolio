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
      <h3 className={styles.title}>{data.title || "Career Trajectory"}</h3>

      <div className={styles.avatars}>
        {data.milestones.map((milestone, index) => (
          <div
            key={index}
            className={styles.avatarWrapper}
            title={milestone.label}
          >
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
        ))}
      </div>

      <div className={styles.progressBar}>
        {data.milestones.map((milestone, index) => (
          <div
            key={index}
            className={styles.segment}
            style={{
              width: `${(milestone.percentage / totalPercentage) * 100}%`,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <span className={styles.percentage}>{milestone.percentage}%</span>
          </div>
        ))}
      </div>

      <div className={styles.labels}>
        {data.milestones.map((milestone, index) => (
          <div
            key={index}
            className={styles.label}
            style={{
              width: `${(milestone.percentage / totalPercentage) * 100}%`,
            }}
          >
            <span className={styles.labelText}>{milestone.label}</span>
            {milestone.company && (
              <span className={styles.company}>{milestone.company}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
