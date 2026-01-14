"use client";

import { CareerContent } from "@/app/lib/types";
import { Briefcase } from "lucide-react";
import styles from "./CareerBlock.module.css";

interface CareerBlockProps {
  data: CareerContent;
}

export function CareerBlock({ data }: CareerBlockProps) {
  if (!data.positions || data.positions.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{data.title || "Career Path"}</h3>
        <div className={styles.empty}>
          <Briefcase size={32} strokeWidth={1.5} />
          <p>No positions added yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{data.title || "Career Path"}</h3>

      <div className={styles.timeline}>
        {data.positions.map((position, index) => (
          <div
            key={index}
            className={styles.position}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.timelineLine} />
            <div className={styles.positionDot}>
              {position.current && <div className={styles.currentPulse} />}
            </div>

            <div className={styles.positionContent}>
              <div className={styles.positionHeader}>
                {position.logo ? (
                  <img
                    src={position.logo}
                    alt={position.company}
                    className={styles.logo}
                  />
                ) : (
                  <div className={styles.logoPlaceholder}>
                    {position.company.charAt(0)}
                  </div>
                )}
                <div className={styles.headerText}>
                  <div className={styles.company}>
                    {position.company}
                    {position.current && (
                      <span className={styles.currentBadge}>Current</span>
                    )}
                  </div>
                  <div className={styles.role}>{position.role}</div>
                </div>
              </div>

              <div className={styles.dateRange}>{position.dateRange}</div>

              {position.description && (
                <p className={styles.description}>{position.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
