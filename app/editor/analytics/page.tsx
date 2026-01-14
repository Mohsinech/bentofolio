"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useProfile } from "@/app/lib/hooks";
import styles from "./analytics.module.css";

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  recentViews: Array<{
    date: string;
    count: number;
  }>;
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { profile, loading: profileLoading, hasProAccess } = useProfile();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    if (profile && hasProAccess) {
      fetchAnalytics();
    }
  }, [profile, hasProAccess, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pro required screen
  if (profileLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile || !hasProAccess) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/editor" className={styles.backLink}>
            <ArrowLeft size={20} />
            Back to Editor
          </Link>
        </header>

        <div className={styles.proRequired}>
          <div className={styles.lockIcon}>
            <Sparkles size={48} />
          </div>
          <h1 className={styles.proTitle}>Profile Analytics</h1>
          <p className={styles.proDesc}>
            Track views, clicks, and referrers to your portfolio
          </p>
          <div className={styles.proFeatures}>
            <div className={styles.proFeature}>
              <Eye size={20} />
              <span>Total profile views</span>
            </div>
            <div className={styles.proFeature}>
              <MousePointerClick size={20} />
              <span>Click tracking</span>
            </div>
            <div className={styles.proFeature}>
              <TrendingUp size={20} />
              <span>Growth trends</span>
            </div>
            <div className={styles.proFeature}>
              <Calendar size={20} />
              <span>Historical data</span>
            </div>
          </div>
          <Link href="/pricing" className={styles.upgradeButton}>
            <Sparkles size={16} />
            Upgrade to Pro — $29
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/editor" className={styles.backLink}>
            <ArrowLeft size={20} />
            Back to Editor
          </Link>
        </header>
        <div className={styles.loading}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/editor" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Editor
        </Link>
        <h1 className={styles.title}>Profile Analytics</h1>
      </header>

      {/* Time Range Selector */}
      <div className={styles.timeRange}>
        <button
          className={`${styles.timeButton} ${
            timeRange === "7d" ? styles.active : ""
          }`}
          onClick={() => setTimeRange("7d")}
        >
          Last 7 days
        </button>
        <button
          className={`${styles.timeButton} ${
            timeRange === "30d" ? styles.active : ""
          }`}
          onClick={() => setTimeRange("30d")}
        >
          Last 30 days
        </button>
        <button
          className={`${styles.timeButton} ${
            timeRange === "all" ? styles.active : ""
          }`}
          onClick={() => setTimeRange("all")}
        >
          All time
        </button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon}>
            <Eye size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Views</span>
            <span className={styles.statValue}>
              {analytics?.totalViews.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon}>
            <MousePointerClick size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Clicks</span>
            <span className={styles.statValue}>
              {analytics?.totalClicks.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Click Rate</span>
            <span className={styles.statValue}>
              {analytics?.totalViews
                ? (
                    ((analytics.totalClicks || 0) / analytics.totalViews) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Chart */}
      <div className={`${styles.chartCard} glass`}>
        <h2 className={styles.cardTitle}>
          <Calendar size={18} />
          Daily Views
        </h2>
        <div className={styles.chart}>
          {analytics?.recentViews && analytics.recentViews.length > 0 ? (
            <div className={styles.barChart}>
              {analytics.recentViews.map((day, i) => {
                const maxCount = Math.max(
                  ...analytics.recentViews.map((d) => d.count)
                );
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={i} className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.count} views`}
                    >
                      <span className={styles.barValue}>{day.count}</span>
                    </div>
                    <span className={styles.barLabel}>
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Eye size={32} />
              <p>No views yet. Share your portfolio to start tracking!</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Referrers */}
      <div className={`${styles.referrersCard} glass`}>
        <h2 className={styles.cardTitle}>
          <TrendingUp size={18} />
          Top Referrers
        </h2>
        {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
          <div className={styles.referrersList}>
            {analytics.topReferrers.map((referrer, i) => (
              <div key={i} className={styles.referrerItem}>
                <span className={styles.referrerSource}>{referrer.source}</span>
                <span className={styles.referrerCount}>{referrer.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <MousePointerClick size={32} />
            <p>No referrer data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
