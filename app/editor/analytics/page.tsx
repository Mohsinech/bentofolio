"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, Copy, Loader2 } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import m from "@/app/components/marketing/marketing.module.css";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { delta, type Dashboard, type Period } from "@/app/lib/analytics";
import { useProfile } from "@/app/lib/hooks";
import { useUpgrade } from "@/app/components/upgrade/UpgradeDialog";
import s from "./analytics.module.css";

type Locked = { locked: true; period: Period; totals: { views: number; visitors: number } };
type Data = ({ locked: false } & Dashboard) | Locked;

const PERIODS: Period[] = [7, 30, 90];

const BLOCK_NAMES: Record<string, string> = {
  social: "Social links",
  link: "Call to action",
  github: "GitHub",
  projects: "Projects",
  work: "Projects",
  saas: "SaaS",
  identity: "Profile",
  resume: "Resume",
  experience: "Experience",
  education: "Education",
  cv: "CV view",
};

function compact(n: number): string {
  return new Intl.NumberFormat("en", { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}

function dayLabel(date: string, withYear = false): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function prettyUrl(url: string): string {
  return url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function Delta({ current, previous }: { current: number; previous: number }) {
  const change = delta(current, previous);
  if (change === null) return <span className={s.deltaNone}>No earlier data</span>;
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={up ? s.deltaUp : s.deltaDown}>
      <Icon size={13} aria-hidden="true" />
      {Math.abs(change * 100).toFixed(0)}% <span className={s.deltaNote}>vs previous</span>
    </span>
  );
}

function Breakdown({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; sub?: string; count: number }[];
  empty: string;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <section className={s.card} aria-label={title}>
      <h2 className={s.cardTitle}>{title}</h2>
      {rows.length === 0 ? (
        <p className={s.muted}>{empty}</p>
      ) : (
        <ul className={s.list}>
          {rows.map((row) => (
            <li key={`${row.label}-${row.sub ?? ""}`} className={s.listRow}>
              <span className={s.listBar} style={{ width: `${(row.count / max) * 100}%` }} aria-hidden="true" />
              <span className={s.listLabel}>
                {row.label}
                {row.sub && <span className={s.listSub}>{row.sub}</span>}
              </span>
              <span className={s.listCount}>{compact(row.count)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DailyChart({ daily }: { daily: Dashboard["daily"] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.views), 0);
  const last = daily.length - 1;
  const mid = Math.floor(last / 2);
  return (
    <div className={s.chart}>
      <div className={s.plot} onMouseLeave={() => setActive(null)} aria-hidden="true">
        {max > 0 && (
          <>
            <span className={s.guide} />
            <span className={s.guideLabel}>{compact(max)}</span>
          </>
        )}
        {daily.map((day, index) => (
          <span key={day.date} className={`${s.slot} ${active === index ? s.slotOn : ""}`} onMouseEnter={() => setActive(index)}>
            <span
              className={`${s.bar} ${day.views === 0 ? s.barEmpty : ""}`}
              style={{ height: day.views > 0 ? `max(${(day.views / max) * 100}%, 3px)` : undefined, animationDelay: `${Math.min(index * 15, 600)}ms` }}
            />
            {active === index && (
              <span
                className={s.tip}
                style={
                  index > last - 4
                    ? { right: 0, transform: "translateY(-100%)" }
                    : index < 4
                      ? { left: 0, transform: "translateY(-100%)" }
                      : { left: "50%", transform: "translate(-50%, -100%)" }
                }
              >
                <span className={s.tipDate}>{dayLabel(day.date, true)}</span>
                {day.views} {day.views === 1 ? "view" : "views"} · {day.visitors} {day.visitors === 1 ? "visitor" : "visitors"}
              </span>
            )}
          </span>
        ))}
      </div>
      <div className={s.axis} aria-hidden="true">
        <span>{dayLabel(daily[0].date)}</span>
        <span>{dayLabel(daily[mid].date)}</span>
        <span>{dayLabel(daily[last].date)}</span>
      </div>
      <table className={s.srOnly}>
        <caption>Views per day</caption>
        <tbody>
          {daily.map((day) => (
            <tr key={day.date}>
              <th scope="row">{dayLabel(day.date, true)}</th>
              <td>
                {day.views} views, {day.visitors} visitors
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsPage() {
  const { profile, loading: profileLoading } = useProfile();
  const [period, setPeriod] = useState<Period>(30);
  const { openUpgrade, upgradeDialog } = useUpgrade();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const username = profile?.username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/analytics?username=${encodeURIComponent(username)}&period=${period}d`)
      .then(async (response) => {
        const json = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(json.error || "Couldn't load analytics.");
        if (!cancelled) setData(json);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Couldn't load analytics."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [username, period]);

  const pageUrl = username ? `bentofolio.dev/${username}` : "";
  const full = data && !data.locked ? data : null;

  const lists = useMemo(() => {
    if (!full) return null;
    const totalDevices = full.devices.reduce((sum, d) => sum + d.count, 0) || 1;
    return {
      sources: full.sources.map((row) => ({ label: row.name, count: row.count })),
      countries: full.countries.map((row) => ({ label: countryName(row.code), count: row.count })),
      devices: full.devices.map((row) => ({
        label: row.name,
        sub: `${Math.round((row.count / totalDevices) * 100)}%`,
        count: row.count,
      })),
      links: full.links.map((row) => ({
        label: prettyUrl(row.url),
        sub: row.block ? BLOCK_NAMES[row.block] ?? row.block : undefined,
        count: row.count,
      })),
    };
  }, [full]);

  async function copyLink() {
    await navigator.clipboard?.writeText(`https://${pageUrl}`).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <header className={s.topbar}>
        <Link href="/" className={s.mark} aria-label="bentofolio home">
          <i />
          <i />
          <i />
        </Link>
        <span className={s.barTitle}>Analytics</span>
        <Link href="/settings" className={s.barLink}>
          Settings
        </Link>
        <Link href="/editor" className={`${m.btn} ${m.btnGhost} ${s.small}`}>
          Back to editor
        </Link>
      </header>

      <main className={s.main}>
        <div className={s.titleRow}>
          <div className={s.titleText}>
            <h1 className={s.title}>Analytics</h1>
            {username && (
              <a className={m.lbl} href={`/${username}`} target="_blank" rel="noopener noreferrer">
                {pageUrl} ↗
              </a>
            )}
          </div>
          <div className={s.segment} role="radiogroup" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={period === p}
                className={period === p ? s.segmentOn : undefined}
                onClick={() => setPeriod(p)}
              >
                {p} days
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}

        {(profileLoading || (loading && !data)) && !error && <Loader2 size={20} className={s.spin} aria-label="Loading" />}

        {data?.locked && (
          <section className={`${s.card} ${s.locked}`}>
            <span className={m.lbl}>Last {data.period} days</span>
            <p className={s.lockedNumber}>
              {compact(data.totals.views)} <span>{data.totals.views === 1 ? "view" : "views"}</span>
            </p>
            <p className={s.lockedText}>
              {data.totals.views > 0
                ? `From ${compact(data.totals.visitors)} ${data.totals.visitors === 1 ? "visitor" : "visitors"}. See where they came from, which countries, which devices, and which links they clicked.`
                : "Share your link to start getting visits. With Pro you see where visitors come from and what they click."}
            </p>
            <div className={s.lockedActions}>
              <button type="button" className={`${m.btn} ${m.btnAccent}`} onClick={() => openUpgrade("analytics")}>
                Unlock analytics — ${PREMIUM_PRICE} once
              </button>
              <button type="button" className={`${m.btn} ${m.btnGhost}`} onClick={copyLink}>
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copied ? "Copied" : "Copy your link"}
              </button>
            </div>
          </section>
        )}

        {full && lists && (
          <div className={`${s.grid} ${loading ? s.dim : ""}`}>
            <div className={s.tiles}>
              {[
                { label: "Views", value: compact(full.totals.views), cur: full.totals.views, prev: full.previous.views },
                { label: "Visitors", value: compact(full.totals.visitors), cur: full.totals.visitors, prev: full.previous.visitors },
                { label: "Link clicks", value: compact(full.totals.clicks), cur: full.totals.clicks, prev: full.previous.clicks },
                {
                  label: "Click rate",
                  value: `${Math.round(full.totals.clickRate * 100)}%`,
                  cur: full.totals.clickRate,
                  prev: full.previous.clickRate,
                },
              ].map((tile) => (
                <div key={tile.label} className={s.tile}>
                  <span className={s.tileLabel}>{tile.label}</span>
                  <span className={s.tileValue}>{tile.value}</span>
                  <Delta current={tile.cur} previous={tile.prev} />
                </div>
              ))}
            </div>

            <section className={`${s.card} ${s.wide}`} aria-label="Views per day">
              <div className={s.cardHead}>
                <h2 className={s.cardTitle}>Views per day</h2>
                <span className={m.lbl}>Hover a day for details</span>
              </div>
              {full.totals.views === 0 ? (
                <div className={s.empty}>
                  <p>No visits in the last {full.period} days yet.</p>
                  <button type="button" className={`${m.btn} ${m.btnGhost} ${s.small}`} onClick={copyLink}>
                    {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    {copied ? "Copied" : `Copy ${pageUrl}`}
                  </button>
                </div>
              ) : (
                <DailyChart daily={full.daily} />
              )}
            </section>

            <Breakdown title="Sources" rows={lists.sources} empty="Where visitors come from will show here." />
            <Breakdown title="Countries" rows={lists.countries} empty="Countries show for new visits." />
            <Breakdown title="Devices" rows={lists.devices} empty="No visits yet." />
            <Breakdown title="Links clicked" rows={lists.links} empty="No link clicks yet." />

            <p className={`${s.muted} ${s.wide}`}>
              Your own visits and bots aren&apos;t counted. Visitors are counted once a day, without cookies.
            </p>
          </div>
        )}
      </main>
      {upgradeDialog}
    </div>
  );
}
