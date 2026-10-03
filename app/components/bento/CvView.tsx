"use client";

import { BadgeCheck } from "lucide-react";
import type { BlockContent, BlockLayout } from "@/app/lib/types";
import { getTechIconUrl } from "@/app/lib/tech-icons";
import { Logo, companyLogo, formatMoney, periodOf } from "./BentoBlocks";
import styles from "./cv.module.css";

// The same blocks as the grid, read as a one-column CV: who, about, roles,
// projects, education, skills, proof, contact. Media blocks (Spotify,
// YouTube, Instagram, gallery, map) stay in the grid.

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type Of<T extends BlockContent["type"]> = Extract<BlockContent, { type: T }>["data"];

const PLATFORM: Record<string, string> = {
  twitter: "X",
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
  youtube: "YouTube",
  instagram: "Instagram",
  dribbble: "Dribbble",
  behance: "Behance",
  tiktok: "TikTok",
  facebook: "Facebook",
  threads: "Threads",
  website: "Website",
  email: "Email",
};

function cleanUrl(url: string): string {
  return url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function href(url: string): string | undefined {
  const value = text(url);
  if (!value) return undefined;
  if (/^(https?:|mailto:)/.test(value)) return value;
  if (value.includes("@") && !value.includes("/")) return `mailto:${value}`;
  return `https://${value}`;
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.when}>{label}</span>
      <div className={styles.what}>{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function ExternalTitle({ url, children }: { url?: string; children: React.ReactNode }) {
  const link = url ? href(url) : undefined;
  if (!link) return <span className={styles.title}>{children}</span>;
  return (
    <a className={styles.title} href={link} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

export function hasCvContent(layout: BlockLayout[], content: Record<string, BlockContent>): boolean {
  return layout.some((item) =>
    ["experience", "work", "projects", "education", "techstack", "tools", "saas"].includes(content[item.id]?.type ?? "")
  );
}

// Everything the CV shows, read from the page's visible blocks in reading
// order. Shared by the web CV and the ATS-friendly PDF.
export function readCv(
  username: string,
  layout: BlockLayout[],
  content: Record<string, BlockContent>,
  avatarUrl?: string | null
) {
  // Visible blocks only (Pro-gated and empty ones are already filtered out),
  // in reading order.
  const blocks = [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => content[item.id])
    .filter((block): block is BlockContent => Boolean(block));
  const all = <T extends BlockContent["type"]>(type: T) =>
    blocks.filter((block) => block.type === type).map((block) => block.data as Of<T>);

  const identity = all("identity")[0];
  const name = text(identity?.name) && identity?.name !== "Your Name" ? text(identity?.name) : `@${username}`;
  const title = text(identity?.headline) || text(identity?.title);
  const location = text(identity?.location) || text(all("map")[0]?.location);
  const portrait = identity?.portraitType === "none" ? null : text(identity?.avatar) || avatarUrl || null;
  const bio = text(identity?.bio);
  const availability = all("availability")[0];

  const roles = all("experience").flatMap((block) => block.items ?? []).filter((item) => text(item.role) || text(item.company));
  const work = all("work").flatMap((block) => block.items ?? []).filter((item) => text(item.title));
  const repos = all("projects").flatMap((block) => block.items ?? []).filter((item) => text(item.name));
  const products = all("saas").filter((item) => text(item.name));
  const schools = all("education").flatMap((block) => block.items ?? []).filter((item) => text(item.school) || text(item.institution) || text(item.degree));
  const skills = [...all("techstack"), ...all("tools")].flatMap((block) => block.items ?? []).filter((item) => text(item.name));
  const uniqueSkills = skills.filter((item, index) => skills.findIndex((other) => other.name === item.name) === index);
  const services = all("services").flatMap((block) => (block.items ?? []).map((item) => text(item))).filter(Boolean);
  const stats = all("stats").flatMap((block) => block.items ?? []).filter((item) => text(item.value) && text(item.label));
  const quotes = all("quote").filter((item) => text(item.quote));
  const github = all("github")[0];

  const contacts: { label: string; url: string; display: string }[] = [];
  const email = text(identity?.email);
  if (email) contacts.push({ label: "Email", url: `mailto:${email}`, display: email });
  for (const block of all("social")) {
    for (const item of block.items ?? []) {
      if (!text(item.url)) continue;
      contacts.push({
        label: PLATFORM[item.platform] ?? "Link",
        url: item.url,
        display: text(item.username) || cleanUrl(item.url),
      });
    }
  }
  if (github?.username && !contacts.some((c) => c.label === "GitHub")) {
    contacts.push({ label: "GitHub", url: `https://github.com/${github.username}`, display: `github.com/${github.username}` });
  }
  for (const link of all("link")) {
    if (!text(link.url)) continue;
    contacts.push({ label: text(link.title) || "Link", url: link.url, display: cleanUrl(link.url) });
  }
  const resume = all("resume").find((item) => text(item.fileUrl));
  const website = text(identity?.website);
  if (website) contacts.push({ label: "Website", url: website, display: cleanUrl(website) });

  return {
    name, title, location, portrait, bio, availability, roles, work, repos, products, schools,
    skills: uniqueSkills, services, stats, quotes, contacts, resume, email, website,
  };
}

export function CvView({
  username,
  layout,
  content,
  avatarUrl,
}: {
  username: string;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  avatarUrl?: string | null;
}) {
  const {
    name, title, location, portrait, bio, availability, roles, work, repos, products, schools,
    skills: uniqueSkills, services, stats, quotes, contacts, resume,
  } = readCv(username, layout, content, avatarUrl);

  return (
    <article className={styles.cv} aria-label={`${name}, CV`}>
      <header className={styles.hero}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.portrait} src={portrait} alt="" />
        ) : (
          <span className={styles.portrait} aria-hidden="true">
            {name
              .replace("@", "")
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </span>
        )}
        <div className={styles.heroText}>
          <h1 className={styles.name}>{name}</h1>
          {title && <span className={styles.headline}>{title}</span>}
          {location && <span className={styles.when}>{location}</span>}
        </div>
      </header>

      {(bio || availability) && (
        <Section title="About">
          {bio && <p className={styles.body}>{bio}</p>}
          {availability && text(availability.message) && (
            <span className={`${styles.status} ${availability.status !== "available" ? styles.statusOff : ""}`}>
              <span aria-hidden="true" />
              {text(availability.message)}
              {text(availability.responseTime) && ` · ${text(availability.responseTime)}`}
            </span>
          )}
        </Section>
      )}

      {roles.length > 0 && (
        <Section title="Work experience">
          {roles.map((role, index) => (
            <Row key={`${role.company}-${index}`} label={periodOf(role)}>
              <div className={styles.withLogo}>
                <Logo src={companyLogo(role.logo, role.company)} name={text(role.company) || text(role.role)} size={30} />
                <div className={styles.stack}>
                  <ExternalTitle url={role.companyUrl}>{text(role.role) || text(role.company)}</ExternalTitle>
                  {text(role.role) && text(role.company) && <span className={styles.sub}>{role.company}</span>}
                  {text(role.description) && <p className={styles.small}>{role.description}</p>}
                </div>
              </div>
            </Row>
          ))}
        </Section>
      )}

      {(work.length > 0 || products.length > 0 || repos.length > 0) && (
        <Section title="Projects">
          {products.map((product, index) => (
            <Row key={`saas-${index}`} label={product.verified ? "Live" : undefined}>
              <div className={styles.withLogo}>
                <Logo src={companyLogo(product.logo, product.url)} name={product.name} size={30} />
                <div className={styles.stack}>
                  <ExternalTitle url={product.url}>{product.name}</ExternalTitle>
                  {text(product.tagline) && <span className={styles.sub}>{product.tagline}</span>}
                  {(product.mrr > 0 || (product.totalRevenue ?? 0) > 0) && (
                    <span className={styles.metric}>
                      {product.mrr > 0
                        ? `${formatMoney(product.mrr, product.currency)} MRR`
                        : `${formatMoney(product.totalRevenue ?? 0, product.currency)} revenue`}
                      {product.verified ? (
                        <span className={styles.verified}>
                          <BadgeCheck size={12} aria-hidden="true" /> Verified ·{" "}
                          {product.verified.provider === "stripe" ? "Stripe" : "Lemon Squeezy"}
                        </span>
                      ) : (
                        <span className={styles.selfReported}>Self-reported</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </Row>
          ))}
          {work.map((item, index) => (
            <Row key={`work-${index}`} label={text(item.year)}>
              <div className={styles.stack}>
                <ExternalTitle url={item.url}>{item.title}</ExternalTitle>
                {(text(item.category) || text(item.client)) && (
                  <span className={styles.sub}>{[item.client, item.category].map(text).filter(Boolean).join(" · ")}</span>
                )}
                {text(item.image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.shot} src={item.image} alt={`${item.title} preview`} loading="lazy" />
                )}
              </div>
            </Row>
          ))}
          {repos.map((repo, index) => (
            <Row key={`repo-${index}`} label={text(repo.language) || undefined}>
              <div className={styles.stack}>
                <ExternalTitle url={repo.url}>{repo.name}</ExternalTitle>
                {text(repo.description) && <span className={styles.sub}>{repo.description}</span>}
              </div>
            </Row>
          ))}
        </Section>
      )}

      {schools.length > 0 && (
        <Section title="Education">
          {schools.map((school, index) => (
            <Row key={`edu-${index}`} label={periodOf(school)}>
              <div className={styles.withLogo}>
                <Logo src={companyLogo(school.logo, school.institution || school.school)} name={text(school.school) || text(school.institution)} size={30} />
                <div className={styles.stack}>
                  <ExternalTitle url={school.institutionUrl}>
                    {[school.degree, school.field].map(text).filter(Boolean).join(", ") || text(school.school)}
                  </ExternalTitle>
                  <span className={styles.sub}>{text(school.school) || text(school.institution)}</span>
                </div>
              </div>
            </Row>
          ))}
        </Section>
      )}

      {uniqueSkills.length > 0 && (
        <Section title="Skills">
          <Row label="Tools">
            <div className={styles.skills}>
              {uniqueSkills.map((skill) => {
                const icon = text(skill.icon).startsWith("http") ? text(skill.icon) : getTechIconUrl(skill.name);
                return (
                  <span key={skill.name} className={styles.skill}>
                    {icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={icon} alt="" aria-hidden="true" loading="lazy" />
                    )}
                    {skill.name}
                  </span>
                );
              })}
            </div>
          </Row>
        </Section>
      )}

      {services.length > 0 && (
        <Section title="Services">
          <Row>
            <ul className={styles.services}>
              {services.map((service, index) => (
                <li key={`svc-${index}`}>{service}</li>
              ))}
            </ul>
          </Row>
        </Section>
      )}

      {stats.length > 0 && (
        <Section title="Numbers">
          {stats.map((stat, index) => (
            <Row key={`stat-${index}`} label={stat.label}>
              <span className={styles.title}>
                {text(stat.prefix)}
                {stat.value}
                {text(stat.suffix)}
              </span>
            </Row>
          ))}
        </Section>
      )}

      {quotes.length > 0 && (
        <Section title="Kind words">
          {quotes.map((quote, index) => (
            <Row key={`q-${index}`} label={text(quote.author)}>
              <blockquote className={styles.quote}>“{quote.quote.replace(/^[“"]|[”"]$/g, "")}”</blockquote>
            </Row>
          ))}
        </Section>
      )}

      {(contacts.length > 0 || resume) && (
        <Section title="Contact">
          {contacts.map((contact, index) => (
            <Row key={`c-${index}`} label={contact.label}>
              <a className={styles.link} href={href(contact.url)} target={contact.url.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                {contact.display} <span aria-hidden="true">↗</span>
              </a>
            </Row>
          ))}
          {resume && (
            <Row label="Resume">
              <a className={styles.link} href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                {text(resume.fileName) || text(resume.title) || "Download PDF"} <span aria-hidden="true">↗</span>
              </a>
            </Row>
          )}
        </Section>
      )}

      <footer className={styles.foot}>
        <span className={styles.when}>bentofolio.dev/{username}</span>
      </footer>
    </article>
  );
}

// The PDF version, built for applicant tracking systems: one column, plain
// text in reading order, standard headings (Summary, Experience, Projects,
// Education, Skills), job title before dates, links written out in full,
// no images, icons, badges or testimonials. Hidden on screen; it's what
// prints.
function lines(value: unknown): string[] {
  return text(value)
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function plainUrl(url: string): string {
  return cleanUrl(text(url));
}

export function CvPrint({
  username,
  layout,
  content,
}: {
  username: string;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
}) {
  const cv = readCv(username, layout, content);
  const name = cv.name.replace(/^@/, "");

  // Contact line: location, email, then every profile link as plain text.
  const links = [
    ...cv.contacts.filter((c) => !c.url.startsWith("mailto:")).map((c) => plainUrl(c.url)),
    `bentofolio.dev/${username}`,
  ];
  const contact = [cv.location, cv.email, ...links].filter(Boolean);
  const uniqueContact = contact.filter((item, index) => contact.indexOf(item) === index);

  const sentence = (value: string) => (value && !/[.!?]$/.test(value) ? `${value}.` : value);
  const summary = [cv.bio, cv.availability?.status === "available" ? text(cv.availability.message) : ""]
    .filter(Boolean)
    .map(sentence)
    .join(" ");

  return (
    <article className={styles.ats} aria-label={`${name}, CV`}>
      <header className={styles.atsHead}>
        <h1>{name}</h1>
        {cv.title && <p className={styles.atsHeadline}>{cv.title}</p>}
        {uniqueContact.length > 0 && <p className={styles.atsContact}>{uniqueContact.join("  |  ")}</p>}
      </header>

      {summary && (
        <section>
          <h2>Summary</h2>
          <p>{summary}</p>
        </section>
      )}

      {cv.roles.length > 0 && (
        <section>
          <h2>Experience</h2>
          {cv.roles.map((role, index) => (
            <div key={`r-${index}`} className={styles.atsItem}>
              <p className={styles.atsTitle}>
                <strong>{text(role.role) || text(role.company)}</strong>
                {text(role.role) && text(role.company) ? `, ${text(role.company)}` : ""}
              </p>
              {(periodOf(role) || text(role.location)) && (
                <p className={styles.atsMeta}>{[periodOf(role), text(role.location)].filter(Boolean).join("  |  ")}</p>
              )}
              {lines(role.description).length > 0 && (
                <ul>
                  {lines(role.description).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {(cv.products.length > 0 || cv.work.length > 0 || cv.repos.length > 0) && (
        <section>
          <h2>Projects</h2>
          {cv.products.map((product, index) => {
            const revenue =
              product.mrr > 0
                ? `${formatMoney(product.mrr, product.currency)} monthly recurring revenue`
                : (product.totalRevenue ?? 0) > 0
                  ? `${formatMoney(product.totalRevenue ?? 0, product.currency)} total revenue`
                  : "";
            const proof = revenue
              ? `${revenue}${product.verified ? ` (verified via ${product.verified.provider === "stripe" ? "Stripe" : "Lemon Squeezy"})` : ""}`
              : "";
            return (
              <div key={`p-${index}`} className={styles.atsItem}>
                <p className={styles.atsTitle}>
                  <strong>{product.name}</strong>
                  {text(product.tagline) ? `, ${text(product.tagline)}` : ""}
                </p>
                {(text(product.url) || proof) && (
                  <p className={styles.atsMeta}>{[plainUrl(product.url), proof].filter(Boolean).join("  |  ")}</p>
                )}
              </div>
            );
          })}
          {cv.work.map((item, index) => (
            <div key={`w-${index}`} className={styles.atsItem}>
              <p className={styles.atsTitle}>
                <strong>{item.title}</strong>
                {[text(item.client), text(item.category)].filter(Boolean).length > 0
                  ? `, ${[text(item.client), text(item.category)].filter(Boolean).join(", ")}`
                  : ""}
              </p>
              {(text(item.year) || text(item.url)) && (
                <p className={styles.atsMeta}>{[text(item.year), plainUrl(item.url ?? "")].filter(Boolean).join("  |  ")}</p>
              )}
            </div>
          ))}
          {cv.repos.map((repo, index) => (
            <div key={`g-${index}`} className={styles.atsItem}>
              <p className={styles.atsTitle}>
                <strong>{repo.name}</strong>
                {text(repo.language) ? `, ${text(repo.language)}` : ""}
              </p>
              {text(repo.description) && <p>{repo.description}</p>}
              {text(repo.url) && <p className={styles.atsMeta}>{plainUrl(repo.url)}</p>}
            </div>
          ))}
        </section>
      )}

      {cv.schools.length > 0 && (
        <section>
          <h2>Education</h2>
          {cv.schools.map((school, index) => (
            <div key={`e-${index}`} className={styles.atsItem}>
              <p className={styles.atsTitle}>
                <strong>{[text(school.degree), text(school.field)].filter(Boolean).join(", ") || text(school.school)}</strong>
                {text(school.school) || text(school.institution)
                  ? `, ${text(school.school) || text(school.institution)}`
                  : ""}
              </p>
              {(periodOf(school) || text(school.location)) && (
                <p className={styles.atsMeta}>{[periodOf(school), text(school.location)].filter(Boolean).join("  |  ")}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {(cv.skills.length > 0 || cv.services.length > 0) && (
        <section>
          <h2>Skills</h2>
          {cv.skills.length > 0 && <p>{cv.skills.map((skill) => skill.name).join(", ")}</p>}
          {cv.services.length > 0 && <p>Services: {cv.services.join(", ")}</p>}
        </section>
      )}
    </article>
  );
}
