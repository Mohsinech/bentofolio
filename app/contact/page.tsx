import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Globe,
  LifeBuoy,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import styles from "./contact.module.css";

const contactCards = [
  {
    icon: LifeBuoy,
    title: "Product support",
    text: "Account, billing, Pro access, or custom domain help.",
    href: "mailto:hello@bentofolio.dev?subject=BentoFolio support",
    label: "Email support",
  },
  {
    icon: Sparkles,
    title: "Creator feedback",
    text: "Tell us which blocks, templates, or workflows should exist next.",
    href: "mailto:hello@bentofolio.dev?subject=BentoFolio feedback",
    label: "Share feedback",
  },
  {
    icon: Bug,
    title: "Bug report",
    text: "Send screenshots, browser details, and what you expected to happen.",
    href: "mailto:hello@bentofolio.dev?subject=BentoFolio bug report",
    label: "Report issue",
  },
];

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={17} />
          BentoFolio
        </Link>
        <div>
          <Link href="/pricing">Pricing</Link>
          <Link href="/auth/login">Log in</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            <MessageSquare size={15} />
            Contact
          </span>
          <h1>Need help with your BentoFolio?</h1>
          <p>
            Reach out for product support, custom domain setup, billing, bugs,
            or ideas for the next creator/dev block.
          </p>
          <div className={styles.heroActions}>
            <a href="mailto:hello@bentofolio.dev" className={styles.primary}>
              <Mail size={17} />
              hello@bentofolio.dev
            </a>
            <Link href="/editor" className={styles.secondary}>
              Open editor
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <aside className={styles.domainHelp}>
          <Globe size={24} />
          <h2>Custom domain help</h2>
          <p>
            BentoFolio is hosted on Vercel. For root domains use
            <code>A 76.76.21.21</code>; for subdomains use Vercel&apos;s CNAME
            value in your registrar DNS.
          </p>
          <Link href="/pricing">Custom domains are Pro</Link>
        </aside>
      </section>

      <section className={styles.cards}>
        {contactCards.map((card) => {
          const Icon = card.icon;
          return (
            <a key={card.title} href={card.href} className={styles.card}>
              <Icon size={22} />
              <strong>{card.title}</strong>
              <span>{card.text}</span>
              <em>
                {card.label}
                <ArrowRight size={14} />
              </em>
            </a>
          );
        })}
      </section>
    </main>
  );
}
