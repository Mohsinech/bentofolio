"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Circle,
  Github,
  Instagram,
  Mail,
  Moon,
  Play,
  Send,
  Sun,
} from "lucide-react";
import { useState } from "react";
import styles from "./v2-preview.module.css";

const projects = [
  {
    title: "VocaFlow launch system",
    type: "SaaS interface",
    year: "2026",
    image: "/prebuilt/dev/work3.png",
  },
  {
    title: "Northstar mobile studio",
    type: "Product design",
    year: "2025",
    image: "/prebuilt/designer/work2.jpeg",
  },
  {
    title: "Portfolio operations kit",
    type: "No-code builder",
    year: "2026",
    image: "/prebuilt/dev/work2.png",
  },
];

const tools = ["Next.js", "Figma", "Framer", "Supabase", "TypeScript", "Webflow"];

const experience = [
  ["2024 - Now", "Independent product designer and creative developer"],
  ["2022 - 2024", "Frontend systems for early-stage SaaS teams"],
  ["2020 - 2022", "Brand sites, launch pages, and client portals"],
];

function AnimatedCard({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      id={id}
      className={`${styles.card} ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay,
        ease: [0.2, 0, 0, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      {children}
    </motion.article>
  );
}

export default function V2PreviewPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const reduceMotion = useReducedMotion();

  return (
    <main className={styles.page} data-theme={theme}>
      <div className={styles.frame}>
        <div className={styles.floatingControls} aria-label="Portfolio controls">
          <nav className={styles.navLinks} aria-label="Preview sections">
            <a href="#work">Work</a>
            <a href="#experience">Experience</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className={styles.themeToggle} aria-label="Preview theme">
            <button
              type="button"
              className={theme === "light" ? styles.activeToggle : ""}
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
            >
              <Sun size={14} />
              <span className={styles.srOnly}>Light theme</span>
            </button>
            <button
              type="button"
              className={theme === "dark" ? styles.activeToggle : ""}
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
            >
              <Moon size={14} />
              <span className={styles.srOnly}>Dark theme</span>
            </button>
          </div>
        </div>

        <section className={styles.grid} aria-label="BentoFolio V2 portfolio preview">
          <AnimatedCard className={styles.identity} delay={0.02}>
            <div className={styles.identityTop}>
              <div className={styles.personalMark} aria-label="Mira Chen">
                <span>MC</span>
                <strong>Mira Chen</strong>
              </div>
              <div className={styles.socials} aria-label="Social links">
                <a href="https://github.com" aria-label="GitHub">
                  <Github size={16} />
                </a>
                <a href="https://instagram.com" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
                <a href="mailto:hello@example.com" aria-label="Email">
                  <Mail size={16} />
                </a>
              </div>
            </div>
            <div>
              <p className={styles.intro}>Available for 2 builds</p>
              <h1>Designing sharp portfolios and launch systems for builders.</h1>
              <p className={styles.bodyCopy}>
                Product designer and front-end developer helping founders turn
                scattered proof into compact, memorable web presence.
              </p>
            </div>
            <div className={styles.metaStrip}>
              <span>Casablanca / Remote</span>
              <span>Design + React</span>
              <span>48h response</span>
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.portrait} delay={0.05}>
            <Image
              src="/prebuilt/designer/varnika.jpeg"
              alt="Portrait of Mira Chen"
              fill
              sizes="(max-width: 900px) 100vw, 28vw"
              priority
            />
            <span className={styles.portraitBadge}>Independent studio</span>
          </AnimatedCard>

          <AnimatedCard className={styles.experience} delay={0.08} id="experience">
            <span className={styles.kicker}>Experience</span>
            <div className={styles.timeline}>
              {experience.map(([date, role]) => (
                <div className={styles.timelineItem} key={date}>
                  <span>{date}</span>
                  <p>{role}</p>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.about} delay={0.11}>
            <span className={styles.kicker}>Profile</span>
            <p>
              I work best where visual taste meets shipped product: launch pages,
              portfolio systems, dashboards, content tools, and brand moments
              that need to feel useful on day one.
            </p>
          </AnimatedCard>

          <AnimatedCard className={styles.contact} delay={0.14} id="contact">
            <span className={styles.kicker}>Start here</span>
            <a href="mailto:hello@example.com" className={styles.contactLink}>
              Email me
              <ArrowUpRight size={22} />
            </a>
          </AnimatedCard>

          <AnimatedCard className={styles.featuredLabel} delay={0.17}>
            <span>Selected projects</span>
            <strong>03</strong>
          </AnimatedCard>

          <AnimatedCard className={styles.projectLarge} delay={0.2} id="work">
            <motion.div
              className={styles.imageWrap}
              initial={reduceMotion ? false : { clipPath: "inset(0 0 16% 0)" }}
              animate={reduceMotion ? undefined : { clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 0.7, delay: 0.26, ease: [0.2, 0, 0, 1] }}
            >
              <Image
                src={projects[0].image}
                alt={`${projects[0].title} preview`}
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
              />
            </motion.div>
            <div className={styles.projectCaption}>
              <div>
                <span className={styles.kicker}>{projects[0].type}</span>
                <h2>{projects[0].title}</h2>
              </div>
              <span>{projects[0].year}</span>
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.projectMediumOne} delay={0.23}>
            <Image
              src={projects[1].image}
              alt={`${projects[1].title} preview`}
              fill
              sizes="(max-width: 900px) 100vw, 26vw"
            />
            <div className={styles.imageOverlay}>
              <span>{projects[1].type}</span>
              <strong>{projects[1].title}</strong>
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.projectMediumTwo} delay={0.26}>
            <Image
              src={projects[2].image}
              alt={`${projects[2].title} preview`}
              fill
              sizes="(max-width: 900px) 100vw, 32vw"
            />
            <div className={styles.imageOverlay}>
              <span>{projects[2].type}</span>
              <strong>{projects[2].title}</strong>
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.tools} delay={0.29}>
            <span className={styles.kicker}>Tools</span>
            <div className={styles.toolList}>
              {tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.availability} delay={0.32}>
            <div className={styles.availabilityTop}>
              <span className={styles.statusDot} />
              <span>Open for February</span>
            </div>
            <p>Portfolio sprint, product story, or conversion-focused landing page.</p>
            <button type="button">
              <Send size={14} />
              Send brief
            </button>
          </AnimatedCard>

          <AnimatedCard className={styles.playful} delay={0.35}>
            <span className={styles.kicker}>Live idea</span>
            <motion.button
              type="button"
              className={styles.playButton}
              whileTap={reduceMotion ? undefined : { scale: 0.94, rotate: -6 }}
              whileHover={reduceMotion ? undefined : { rotate: 2 }}
            >
              <Play size={16} fill="currentColor" />
              Preview motion
            </motion.button>
            <div className={styles.orbit} aria-hidden="true">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              />
              <Circle size={12} />
            </div>
          </AnimatedCard>

          <AnimatedCard className={styles.testimonial} delay={0.38}>
            <span className={styles.kicker}>Proof</span>
            <blockquote>
              Mira made the portfolio feel like a product, not a pile of case
              studies. Our leads finally understood what we do.
            </blockquote>
            <cite>Amal R. / Studio founder</cite>
          </AnimatedCard>
        </section>

        <Link href="/" className={styles.madeWith}>
          Made with BentoFolio
          <span>Free preview</span>
        </Link>
      </div>
    </main>
  );
}
