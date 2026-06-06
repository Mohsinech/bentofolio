"use client";

import { useState, useEffect, useCallback } from "react";
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
  recentClicks: Array<{
    date: string;
    count: number;
  }>;
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildLinePath(
  data: { date: string; count: number }[],
  maxValue: number,
  width: number,
  height: number
) {
  if (!data.length) return "";
  return data
    .map((item, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - (item.count / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TrendChart({
  views,
  clicks,
}: {
  views: AnalyticsData["recentViews"];
  clicks: AnalyticsData["recentClicks"];
}) {
  const width = 760;
  const height = 260;
  const chartPadding = 18;
  const maxValue = Math.max(
    1,
    ...views.map((item) => item.count),
    ...clicks.map((item) => item.count)
  );
  const viewPath = buildLinePath(views, maxValue, width, height);
  const clickPath = buildLinePath(clicks, maxValue, width, height);
  const areaPath = viewPath
    ? `${viewPath} L ${width} ${height} L 0 ${height} Z`
    : "";
  const labelStep = Math.max(1, Math.ceil(views.length / 6));

  return (
    <div className={styles.realChart}>
      <svg
        viewBox={`0 0 ${width + chartPadding * 2} ${height + 54}`}
        role="img"
        aria-label="Views and clicks over time"
      >
        <defs>
          <linearGradient id="viewsFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d7ff5f" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#d7ff5f" stopOpacity="0" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${chartPadding} ${chartPadding})`}>
          {[0, 1, 2, 3].map((line) => {
            const y = (line / 3) * height;
            return (
              <line
                key={line}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                className={styles.gridLine}
              />
            );
          })}
          {areaPath && <path d={areaPath} className={styles.areaPath} />}
          {viewPath && (
            <path d={viewPath} className={styles.viewPath} filter="url(#softGlow)" />
          )}
          {clickPath && <path d={clickPath} className={styles.clickPath} />}
          {views.map((item, index) => {
            const x =
              views.length === 1 ? width / 2 : (index / (views.length - 1)) * width;
            const y = height - (item.count / maxValue) * height;
            const showLabel = index % labelStep === 0 || index === views.length - 1;

            return (
              <g key={item.date}>
                <circle cx={x} cy={y} r="4.5" className={styles.viewDot}>
                  <title>
                    {formatShortDate(item.date)}: {item.count} views
                  </title>
                </circle>
                {showLabel && (
                  <text x={x} y={height + 30} className={styles.axisLabel}>
                    {formatShortDate(item.date)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const { profile, loading: profileLoading, hasProAccess } = useProfile();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");

  const fetchAnalytics = useCallback(async () => {
    if (!profile?.username) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics?username=${profile.username}&period=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.username, timeRange]);

  useEffect(() => {
    if (profile && hasProAccess) {
      fetchAnalytics();
    }
  }, [profile, hasProAccess, fetchAnalytics]);

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
        <div className={styles.shell}>
          <header className={styles.header}>
            <Link href="/editor" className={styles.backLink}>
              <ArrowLeft size={20} />
              Back to Editor
            </Link>
          </header>

          <div className={styles.proRequired}>
            <div className={styles.lockIcon}>
              <Sparkles size={32} />
            </div>
            <span className={styles.eyebrow}>Pro feature</span>
            <h1 className={styles.proTitle}>Profile Analytics</h1>
            <p className={styles.proDesc}>
              Understand views, clicks, and referrers without leaving your
              BentoFolio workspace.
            </p>
            <div className={styles.proFeatures}>
              <div className={styles.proFeature}>
                <Eye size={18} />
                <span>Total profile views</span>
              </div>
              <div className={styles.proFeature}>
                <MousePointerClick size={18} />
                <span>Click tracking</span>
              </div>
              <div className={styles.proFeature}>
                <TrendingUp size={18} />
                <span>Traffic trends</span>
              </div>
              <div className={styles.proFeature}>
                <Calendar size={18} />
                <span>Recent activity</span>
              </div>
            </div>
            <Link href="/pricing" className={styles.upgradeButton}>
              <Sparkles size={16} />
              Get Pro — $9
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.shell}>
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
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.eyebrow}>Analytics</span>
            <h1 className={styles.title}>Profile performance</h1>
            <p className={styles.subtitle}>
              Track what happens after people open your portfolio.
            </p>
          </div>
          <Link href="/editor" className={styles.backLink}>
            <ArrowLeft size={20} />
            Back to Editor
          </Link>
        </header>

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

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Eye size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Views</span>
              <span className={styles.statValue}>
                {(analytics?.totalViews || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MousePointerClick size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Clicks</span>
              <span className={styles.statValue}>
                {(analytics?.totalClicks || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
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

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Calendar size={18} />
              Traffic trend
            </h2>
            <div className={styles.legend}>
              <span>
                <i className={styles.viewsKey} />
                Views
              </span>
              <span>
                <i className={styles.clicksKey} />
                Clicks
              </span>
            </div>
          </div>
          <div className={styles.chart}>
            {analytics?.recentViews && analytics.recentViews.length > 0 ? (
              <TrendChart
                views={analytics.recentViews}
                clicks={analytics.recentClicks || []}
              />
            ) : (
              <div className={styles.emptyState}>
                <Eye size={32} />
                <p>No views yet. Share your portfolio to start tracking.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.referrersCard}>
          <h2 className={styles.cardTitle}>
            <TrendingUp size={18} />
            Top Referrers
          </h2>
          {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
            <div className={styles.referrersList}>
              {analytics.topReferrers.map((referrer) => {
                const maxCount = Math.max(
                  ...analytics.topReferrers.map((item) => item.count)
                );
                const width =
                  maxCount > 0 ? `${(referrer.count / maxCount) * 100}%` : "0%";

                return (
                  <div key={referrer.source} className={styles.referrerItem}>
                    <div className={styles.referrerTop}>
                      <span className={styles.referrerSource}>
                        {referrer.source}
                      </span>
                      <span className={styles.referrerCount}>
                        {referrer.count}
                      </span>
                    </div>
                    <div className={styles.referrerTrack}>
                      <span style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <TrendingUp size={32} />
              <p>No referrer data yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
