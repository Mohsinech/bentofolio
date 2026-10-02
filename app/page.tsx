import Link from "next/link";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { BlockShowcase } from "@/app/components/marketing/BlockShowcase";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import { ClaimForm } from "@/app/components/marketing/ClaimForm";
import styles from "@/app/components/marketing/marketing.module.css";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { getFeaturedProfiles } from "@/app/lib/supabase/featured";

// Featured pages refresh every 10 minutes; everything else is static.
export const revalidate = 600;

const shades = ["#ECEBE8", "#C9D0FF", "#8A9BFF", "#2B44FF"];
const contrib = Array.from({ length: 18 }, (_, i) => shades[(i * 7 + (i % 4)) % 4]);

const cvRows = [
  { y: "2024 — Now", t: "Independent product designer" },
  { y: "2022 — 2024", t: "Frontend systems, SaaS teams" },
  { y: "2026", t: "VocaFlow launch system" },
  { y: "Email", t: "hello@example.com" },
];

const steps = [
  { n: "01", t: "Claim your name", d: "Pick bentofolio.dev/yourname. We check it’s free as you type." },
  { n: "02", t: "Drop in blocks", d: "Profile, projects, experience, GitHub, revenue. Drag, resize, fill in." },
  { n: "03", t: "Publish when ready", d: "Edits stay in a draft until you hit Publish. Share the link anywhere." },
];

const faq = [
  {
    q: "Is the free plan really free?",
    a: "Yes. Build and publish a full page on bentofolio.dev with every core block, including GitHub, projects and verified revenue, without paying.",
  },
  {
    q: `What does $${PREMIUM_PRICE} lifetime include?`,
    a: "Pro, forever: your own domain, the analytics dashboard, Spotify, YouTube and Instagram blocks, the verified badge and no “Made with” tag. One payment while we’re in beta.",
  },
  {
    q: "How does verified revenue work?",
    a: "Connect Stripe with a read-only key, or Lemon Squeezy, and your SaaS block shows real MRR with a Verified badge. It refreshes every day. Typed-in numbers are labelled Self-reported.",
  },
  {
    q: "Can I use my own domain?",
    a: "With Pro. Point a DNS record at us and your page lives on your domain.",
  },
  {
    q: "Does it work on phones?",
    a: "Yes. Every block reflows into a two-column grid on small screens.",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function Home() {
  const featured = await getFeaturedProfiles(4);

  return (
    <div className={`${bentoFontClasses} ${styles.page}`}>
      <div className={styles.top}>
        <MarketingHeader />

        <section className={`${styles.sec} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <span className={styles.lbl}>Bento portfolios and CVs for creatives and devs</span>
            <h1 className={styles.h1}>
              Your proof of work, <span className={styles.ser}>arranged.</span>
            </h1>
            <p className={`${styles.p} ${styles.lead}`}>
              Drag your projects, roles, links and metrics into one grid. Connect Stripe or Lemon Squeezy and your
              revenue shows as verified.
            </p>
            <ClaimForm id="claim-top" note={`Free forever · No card · Pro is $${PREMIUM_PRICE} once`} />
          </div>

          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewGrid}>
              <div className={styles.mini} style={{ gridColumn: "span 2", gridRow: "span 2", padding: 16 }}>
                <span style={{ display: "block", width: 34, height: 34, minHeight: 34, aspectRatio: "1", flexShrink: 0, borderRadius: 99, background: "#E3E1DB" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
                    Mira Chen <span className={styles.ser} style={{ color: "var(--body)" }}>designs</span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Product designer + creative dev</span>
                </div>
              </div>
              <div className={styles.mini} style={{ gridRow: "span 2", background: "#E3E1DB", borderColor: "#E3E1DB", justifyContent: "flex-end" }}>
                <span className={styles.chipTag}>Studio</span>
              </div>
              <div className={styles.mini} style={{ background: "#E9EEF1", borderColor: "#E9EEF1", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 10, height: 10, borderRadius: 99, background: "var(--accent)", border: "2px solid #fff" }} />
              </div>
              <div className={styles.mini}>
                <span className={styles.lbl} style={{ fontSize: 10 }}>
                  Open
                </span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>February</span>
              </div>
              <div className={styles.mini} style={{ gridColumn: "span 2", gridRow: "span 2", gap: 6, justifyContent: "flex-start" }}>
                <span className={styles.lbl} style={{ fontSize: 10 }}>
                  Work experience
                </span>
                {["70%", "55%", "62%"].map((w) => (
                  <div key={w} style={{ display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                    <span className={styles.bar} style={{ width: 40 }} />
                    <span className={styles.bar} style={{ width: w }} />
                  </div>
                ))}
              </div>
              <div className={styles.mini} style={{ gridColumn: "span 2", background: "#E7E5DF", borderColor: "#E7E5DF", justifyContent: "flex-end" }}>
                <span className={styles.chipTag}>VocaFlow · 2026</span>
              </div>
              <div className={styles.mini} style={{ background: "var(--ink)", borderColor: "var(--ink)", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Email me</span>
              </div>
              <div className={styles.mini} style={{ justifyContent: "flex-end" }}>
                <div className={styles.contrib}>
                  {contrib.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className={`${styles.main} ${styles.afterHero}`}>
        <section className={`${styles.sec} ${styles.secStack}`} style={{ gap: 48 }}>
          <div className={styles.secHead}>
            <h2 className={styles.h2} style={{ maxWidth: 560 }}>
              One profile. <span className={styles.ser}>Two ways</span> to read it.
            </h2>
            <p className={styles.p} style={{ maxWidth: 400 }}>
              Grid for first impressions. CV for recruiters who want dates and roles in order. Visitors switch with one
              tap; you edit once.
            </p>
          </div>
          <div className={styles.two}>
            <div className={`${styles.card} ${styles.viewCard} ${styles.viewCardSoft}`}>
              <div className={styles.viewHead}>
                <span>Grid</span>
                <span className={styles.lbl}>bentofolio.dev/mira</span>
              </div>
              <div className={styles.viewGrid} aria-hidden="true">
                <div className={styles.mini} style={{ gridColumn: "span 2", gridRow: "span 2" }}>
                  <span className={styles.bar} style={{ width: "30%" }} />
                  <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>Mira Chen</span>
                </div>
                <div className={styles.mini} style={{ background: "#E3E1DB", borderColor: "#E3E1DB" }} />
                <div className={styles.mini} style={{ background: "var(--ink)", borderColor: "var(--ink)" }} />
                <div className={styles.mini}>
                  <span className={styles.bar} style={{ width: "60%" }} />
                </div>
                <div className={styles.mini} style={{ gridColumn: "span 2", background: "#E7E5DF", borderColor: "#E7E5DF" }} />
              </div>
            </div>
            <div className={`${styles.card} ${styles.viewCard}`}>
              <div className={styles.viewHead}>
                <span>CV</span>
                <span className={styles.lbl}>same blocks, one column</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "block", width: 30, height: 30, minHeight: 30, aspectRatio: "1", flexShrink: 0, borderRadius: 99, background: "#E3E1DB" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Mira Chen</span>
                    <span className={styles.lbl} style={{ fontSize: 11 }}>
                      Casablanca / Remote
                    </span>
                  </div>
                </div>
                {cvRows.map((row) => (
                  <div key={row.y} className={styles.cvRow}>
                    <span className={styles.lbl} style={{ fontSize: 11 }}>
                      {row.y}
                    </span>
                    <span>{row.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.secStack}`}>
          <div className={styles.secHead}>
            <h2 className={styles.h2} style={{ maxWidth: 600 }}>
              Blocks for everything <span className={styles.ser}>you’ve shipped.</span>
            </h2>
            <span className={styles.lbl}>Every block resizes</span>
          </div>
          <BlockShowcase />
        </section>

        <section className={`${styles.sec} ${styles.secStack}`}>
          <h2 className={styles.h2}>
            Live in <span className={styles.ser}>three minutes.</span>
          </h2>
          <ol className={styles.three} style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((step) => (
              <li key={step.n} className={styles.step}>
                <span className={styles.lbl}>{step.n}</span>
                <span className={styles.stepTitle}>{step.t}</span>
                <p className={styles.p} style={{ fontSize: 15 }}>
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {featured.length >= 2 && (
          <section className={`${styles.sec} ${styles.secStack}`} style={{ gap: 32 }}>
            <div className={styles.secHead}>
              <h2 className={styles.h2}>
                Made on <span className={styles.ser}>bentofolio.</span>
              </h2>
              <Link href="/discover" className={styles.linkArrow}>
                Browse Discover →
              </Link>
            </div>
            <div className={styles.featured}>
              {featured.map((profile) => (
                <Link key={profile.username} href={`/${profile.username}`} className={`${styles.card} ${styles.featuredCard}`}>
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.avatar} src={profile.avatar} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.avatar} aria-hidden="true">
                      {initials(profile.name)}
                    </span>
                  )}
                  <span className={styles.featuredName}>{profile.name}</span>
                  <span className={styles.featuredTitle}>{profile.title}</span>
                  <span className={`${styles.lbl} ${styles.featuredUrl}`}>bentofolio.dev/{profile.username}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={`${styles.sec} ${styles.secStack}`} style={{ gap: 32 }}>
          <h2 className={styles.h2}>
            Free to publish. <span className={styles.ser}>${PREMIUM_PRICE} to own it.</span>
          </h2>
          <div className={styles.two}>
            <div className={`${styles.card} ${styles.plan}`}>
              <div className={styles.planTop}>
                <span className={styles.planName}>Free</span>
                <span className={styles.planPrice}>$0</span>
              </div>
              <p className={styles.p} style={{ fontSize: 15 }}>
                Every core block (GitHub, projects, verified revenue), light and dark, your bentofolio.dev link.
              </p>
              <Link href="/auth/signup" className={`${styles.btn} ${styles.btnGhost}`}>
                Start free
              </Link>
            </div>
            <div className={`${styles.card} ${styles.plan} ${styles.planDark}`}>
              <div className={styles.planTop}>
                <span className={styles.planName}>
                  Pro <span className={styles.pill} style={{ marginLeft: 6 }}>LIFETIME BETA</span>
                </span>
                <span className={styles.planPrice}>${PREMIUM_PRICE}</span>
              </div>
              <p className={styles.planNote}>
                Custom domain, analytics, Spotify / YouTube / Instagram blocks, verified badge, no “Made with” tag.
              </p>
              <Link href="/pricing" className={`${styles.btn} ${styles.btnAccent}`}>
                See Pro
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.faq}`} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.h2}>
            Questions
          </h2>
          <div>
            {faq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p className={styles.p}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <section className={styles.closing}>
        <div className={`${styles.sec} ${styles.closingInner}`}>
          <h2 className={styles.h2}>
            Claim your name <span className={styles.ser}>before someone else does.</span>
          </h2>
          <ClaimForm id="claim-bottom" dark />
        </div>
        <FooterLinks />
      </section>
    </div>
  );
}
