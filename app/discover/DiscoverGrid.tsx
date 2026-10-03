"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Search, X } from "lucide-react";
import type { DiscoverProfile, DiscoverRole } from "@/app/lib/discover";
import s from "./discover.module.css";

type Filter = "all" | DiscoverRole | "verified" | "open";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "developer", label: "Developers" },
  { value: "designer", label: "Designers" },
  { value: "founder", label: "Founders" },
  { value: "creator", label: "Creators" },
  { value: "verified", label: "Verified revenue" },
  { value: "open", label: "Open to work" },
];

function initials(name: string) {
  const words = name.replace(/^@/, "").split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] || "") + (words.length > 1 ? words[words.length - 1][0] : words[0]?.[1] || "")).toUpperCase();
}

function matches(profile: DiscoverProfile, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "verified") return profile.verifiedRevenue;
  if (filter === "open") return profile.openToWork;
  return profile.roles.includes(filter);
}

export function DiscoverGrid({ profiles }: { profiles: DiscoverProfile[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const map = new Map<Filter, number>();
    for (const option of FILTERS) map.set(option.value, profiles.filter((p) => matches(p, option.value)).length);
    return map;
  }, [profiles]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter(
      (profile) =>
        matches(profile, filter) &&
        (!q || [profile.name, profile.username, profile.headline, profile.location].some((field) => field.toLowerCase().includes(q)))
    );
  }, [profiles, filter, query]);

  if (profiles.length === 0) {
    return (
      <div className={s.empty}>
        <p>No pages are listed yet.</p>
        <Link href="/auth/signup">Be the first →</Link>
      </div>
    );
  }

  return (
    <section className={s.browser} aria-label="Pages">
      <div className={s.controls}>
        <label className={s.search}>
          <Search size={15} aria-hidden="true" />
          <span className={s.srOnly}>Search pages</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, role or city"
            type="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </label>
        <div className={s.filters} role="radiogroup" aria-label="Filter">
          {FILTERS.filter((option) => option.value === "all" || (counts.get(option.value) ?? 0) > 0).map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={filter === option.value}
              className={`${s.chip} ${filter === option.value ? s.chipOn : ""}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              <span className={s.chipCount}>{counts.get(option.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={s.empty}>
          <p>No pages match that.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Show all pages
          </button>
        </div>
      ) : (
        <ul className={s.grid}>
          {shown.map((profile) => (
            <li key={profile.username}>
              <Link href={`/${profile.username}`} className={s.card}>
                <div className={s.cardTop}>
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={s.avatar} src={profile.avatar} alt="" loading="lazy" />
                  ) : (
                    <span className={s.avatar} aria-hidden="true">
                      {initials(profile.name)}
                    </span>
                  )}
                  {profile.openToWork && (
                    <span className={s.open}>
                      <span className={s.openDot} aria-hidden="true" />
                      Open to work
                    </span>
                  )}
                </div>

                <div className={s.cardBody}>
                  <h3 className={s.name}>
                    {profile.name}
                    {profile.isPro && (
                      <span className={s.badge} title="Verified page" aria-label="Verified page">
                        <Check size={9} strokeWidth={3.4} aria-hidden="true" />
                      </span>
                    )}
                  </h3>
                  <p className={s.headline}>{profile.headline}</p>
                  {profile.location && <p className={s.location}>{profile.location}</p>}
                </div>

                {profile.proof && (
                  <div className={`${s.proof} ${profile.proof.verified ? s.proofVerified : ""}`}>
                    <span className={s.proofLabel}>
                      {profile.proof.label}
                      {profile.proof.verified && (
                        <span className={s.proofCheck} aria-label="verified">
                          <Check size={8} strokeWidth={3.4} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className={s.proofValue}>{profile.proof.value}</span>
                  </div>
                )}

                <span className={s.url}>
                  bentofolio.dev/{profile.username}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
