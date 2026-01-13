"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import styles from "./profile.module.css";

interface ViewsCounterProps {
  username: string;
  isPro: boolean;
}

export function ViewsCounter({ username, isPro }: ViewsCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!isPro) return;

    const fetchViews = async () => {
      try {
        const res = await fetch(
          `/api/analytics?username=${username}&period=all`
        );
        if (res.ok) {
          const data = await res.json();
          setViews(data.totalViews || 0);
        }
      } catch {
        // Silently fail
      }
    };

    fetchViews();
  }, [username, isPro]);

  if (!isPro || views === null) return null;

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className={styles.viewsCounter}>
      <Eye size={14} />
      <span>{formatViews(views)} views</span>
    </div>
  );
}
