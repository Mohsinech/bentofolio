import styles from "./marketing.module.css";

// Every block, alive: small looping animations that show what each one does.
// Pure CSS; reduced-motion users get the still frame.

const gh = Array.from({ length: 104 }, (_, i) => `${(((i * 37) % 53) / 10).toFixed(1)}s`);
const revenue = [18, 24, 22, 31, 36, 34, 45, 52, 58, 64, 71, 82];

function Name({ title, hint, pro }: { title: string; hint: string; pro?: boolean }) {
  return (
    <div className={styles.nm}>
      <b>
        {title}
        {pro && (
          <>
            {" "}
            <span className={`${styles.pill} ${styles.pillSoft}`}>PRO</span>
          </>
        )}
      </b>
      <span>{hint}</span>
    </div>
  );
}

export function BlockShowcase() {
  return (
    <div className={styles.blocks}>
      <div className={`${styles.bt} ${styles.span2} ${styles.tall}`}>
        <div className={`${styles.stage} ${styles.col} ${styles.between}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <span className={styles.face} />
            <span className={styles.status}>
              <span className={styles.dot} />
              Available for work
            </span>
          </div>
          <span className={styles.bigName}>
            Mira Chen <span className={styles.ser} style={{ color: "var(--body)" }}>designs</span>
            <br />
            <span className={styles.typed}>launch systems.</span>
            <span className={styles.caret} />
          </span>
        </div>
        <Name title="Profile" hint="Name, headline, photo, status" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={styles.stage}>
          <div className={styles.gh}>
            {gh.map((delay, i) => (
              <span key={i} style={{ animationDelay: delay }} />
            ))}
          </div>
        </div>
        <Name title="GitHub" hint="Live contributions" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={`${styles.stage} ${styles.revenue}`}>
          <span className={styles.revNumber}>
            $8.2k
            <span className={styles.verified}>✓ Verified · Stripe</span>
          </span>
          <div className={styles.revBars}>
            {revenue.map((h, i) => (
              <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
        </div>
        <Name title="SaaS revenue" hint="Stripe or Lemon Squeezy, verified" />
      </div>

      <div className={`${styles.bt} ${styles.span2} ${styles.tall}`}>
        <div className={`${styles.stage} ${styles.col} ${styles.center}`}>
          <div className={styles.row2} style={{ animationDelay: "0s" }}>
            <span className={styles.lbl}>2024 — Now</span>
            <span>Independent product designer</span>
          </div>
          <div className={styles.row2} style={{ animationDelay: ".25s" }}>
            <span className={styles.lbl}>2022 — 2024</span>
            <span>Frontend systems, SaaS teams</span>
          </div>
          <div className={styles.row2} style={{ animationDelay: ".5s" }}>
            <span className={styles.lbl}>2020 — 2022</span>
            <span>Brand sites and client portals</span>
          </div>
          <div className={styles.row2} style={{ animationDelay: ".75s" }}>
            <span className={styles.lbl}>2019</span>
            <span>BSc Interaction Design</span>
          </div>
        </div>
        <Name title="Experience" hint="Roles with dates, CV-style" />
      </div>

      <div className={styles.bt}>
        <div className={`${styles.stage} ${styles.col} ${styles.center}`} style={{ gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 500 }}>
            <span className={styles.dot} style={{ width: 9, height: 9 }} />
            Open for February
          </span>
          <span className={styles.lbl} style={{ fontSize: 11 }}>
            2 spots · 48h reply
          </span>
        </div>
        <Name title="Availability" hint="Spots and CTA" />
      </div>

      <div className={styles.bt}>
        <div className={`${styles.stage} ${styles.map}`}>
          <span className={styles.ripple} />
          <span className={styles.pin} />
        </div>
        <Name title="Location" hint="City and local time" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={`${styles.stage} ${styles.slides}`}>
          <div className={styles.slideTrack}>
            <div className={styles.slide} style={{ background: "#E7E5DF" }}>
              <span>VocaFlow · 2026</span>
            </div>
            <div className={styles.slide} style={{ background: "#E9EEF1" }}>
              <span>Northstar · 2025</span>
            </div>
            <div className={styles.slide} style={{ background: "#E3E1DB" }}>
              <span>Ops kit · 2026</span>
            </div>
          </div>
        </div>
        <Name title="Projects" hint="Case studies, type, year" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={`${styles.stage} ${styles.marquee}`}>
          <div className={styles.marqueeRow}>
            {["Next.js", "Figma", "Supabase", "Framer", "Next.js", "Figma", "Supabase", "Framer"].map((s, i) => (
              <span key={i} className={styles.chip}>
                {s}
              </span>
            ))}
          </div>
          <div className={styles.marqueeRow}>
            {["TypeScript", "Webflow", "React", "Tailwind", "TypeScript", "Webflow", "React", "Tailwind"].map((s, i) => (
              <span key={i} className={styles.chip}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <Name title="Skills" hint="Your stack" />
      </div>

      <div className={`${styles.bt} ${styles.btDark}`}>
        <div className={styles.stage} style={{ alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "#fff" }}>Email me</span>
          <span className={styles.ctaArrow}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </span>
        </div>
        <Name title="Call to action" hint="Email, link, download" />
      </div>

      <div className={styles.bt}>
        <div className={`${styles.stage} ${styles.col} ${styles.between}`}>
          <span className={styles.lbl} style={{ fontSize: 11 }}>
            Now playing
          </span>
          <div className={styles.eqWrap}>
            {[0, 0.2, 0.4, 0.1, 0.3, 0.5].map((d, i) => (
              <span key={i} className={styles.eq} style={{ animationDelay: `${d}s` }} />
            ))}
          </div>
        </div>
        <Name title="Embeds" hint="Spotify, YouTube" pro />
      </div>

      <div className={`${styles.bt} ${styles.span2} ${styles.btWarm}`}>
        <div className={styles.stage} style={{ alignItems: "center" }}>
          <blockquote className={styles.quote}>“Made the portfolio feel like a product, not a pile of case studies.”</blockquote>
          <blockquote className={styles.quote}>“Our leads finally understood what we do.”</blockquote>
        </div>
        <Name title="Testimonial" hint="Kind words, rotating" />
      </div>

      <div className={styles.bt}>
        <div className={`${styles.stage} ${styles.col} ${styles.center}`}>
          <span className={styles.soc} style={{ animationDelay: "0s" }}>
            GitHub<em>↗</em>
          </span>
          <span className={styles.soc} style={{ animationDelay: "1s" }}>
            Instagram<em>↗</em>
          </span>
          <span className={styles.soc} style={{ animationDelay: "2s" }}>
            LinkedIn<em>↗</em>
          </span>
        </div>
        <Name title="Social links" hint="One tidy list" />
      </div>

      <div className={styles.bt}>
        <div className={styles.stage} style={{ alignItems: "center", justifyContent: "center" }}>
          <div className={styles.doc}>
            <span className={styles.bar} style={{ width: "70%" }} />
            <span className={styles.bar} />
            <span className={styles.bar} style={{ width: "55%" }} />
            <span className={styles.docBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4v14M6 12l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
        <Name title="Resume" hint="PDF, one click" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={`${styles.stage} ${styles.col} ${styles.center}`}>
          <div className={styles.row2} style={{ animationDelay: "0s" }}>
            <span>Portfolio sprint</span>
            <span className={styles.lbl}>2 weeks</span>
          </div>
          <div className={styles.row2} style={{ animationDelay: ".25s" }}>
            <span>Launch landing page</span>
            <span className={styles.lbl}>1 week</span>
          </div>
        </div>
        <Name title="Services" hint="What you offer" />
      </div>

      <div className={`${styles.bt} ${styles.span2}`}>
        <div className={styles.stage} style={{ alignItems: "center" }}>
          <div className={styles.timeline}>
            <span className={styles.tlTrack} />
            <span className={styles.tlFill} />
            <span className={styles.tl} style={{ left: 0 }}>
              <i />
              <b>2015</b>High school
            </span>
            <span className={styles.tl} style={{ left: "36%" }}>
              <i />
              <b>2019</b>BSc Design
            </span>
            <span className={styles.tl} style={{ left: "72%" }}>
              <i />
              <b>2021</b>MA Interaction
            </span>
          </div>
        </div>
        <Name title="Education" hint="Schools on a timeline" />
      </div>
    </div>
  );
}
