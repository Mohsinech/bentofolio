import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bug, Globe, LifeBuoy, Mail, Sparkles } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import { FooterLinks, MarketingHeader } from "@/app/components/marketing/Chrome";
import m from "@/app/components/marketing/marketing.module.css";
import { CopyEmail } from "./CopyEmail";
import s from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions, feedback or a bug on bentofolio? Write to hello@bentofolio.dev.",
  alternates: { canonical: "/contact" },
};

const EMAIL = "hello@bentofolio.dev";

const topics = [
  {
    icon: LifeBuoy,
    title: "Help with your account",
    text: "Signing in, your page address, Pro, billing or a refund.",
    subject: "Help with my account",
  },
  {
    icon: Bug,
    title: "Something's broken",
    text: "Tell us what you did, what you expected, and add a screenshot and your browser if you can.",
    subject: "Bug report",
  },
  {
    icon: Sparkles,
    title: "An idea",
    text: "A block you're missing, a layout, or anything that would make your page better.",
    subject: "Idea for bentofolio",
  },
];

export default function ContactPage() {
  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <MarketingHeader />

      <main className={`${m.sec} ${s.main}`}>
        <section className={s.hero}>
          <p className={m.lbl}>Contact</p>
          <h1 className={s.title}>
            Write to a <span className={m.ser}>person.</span>
          </h1>
          <p className={s.lead}>
            Questions, bugs or ideas: your email goes straight to the person who builds bentofolio.
          </p>
          <div className={s.actions}>
            <a href={`mailto:${EMAIL}`} className={`${m.btn} ${m.btnDark}`}>
              <Mail size={16} aria-hidden="true" />
              {EMAIL}
            </a>
            <CopyEmail email={EMAIL} />
          </div>
          <p className={s.alt}>
            Or on X:{" "}
            <a href="https://x.com/muhsench" target="_blank" rel="noopener noreferrer">
              @muhsench
            </a>
          </p>
        </section>

        <section className={s.topics} aria-label="What it's about">
          {topics.map(({ icon: Icon, title, text, subject }) => (
            <a key={title} href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`} className={s.topic}>
              <span className={s.topicIcon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <strong>{title}</strong>
              <span className={s.topicText}>{text}</span>
              <span className={s.topicLink}>
                Write about this <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </a>
          ))}
        </section>

        <section className={s.note}>
          <span className={s.topicIcon}>
            <Globe size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Setting up your own domain?</strong>
            <p>
              Settings shows the exact DNS records for your domain and checks them for you. If it still won&apos;t
              connect after an hour, write with the domain name and we&apos;ll look.
            </p>
          </div>
          <Link href="/settings#domain" className={`${m.btn} ${m.btnGhost}`}>
            Open Settings
          </Link>
        </section>
      </main>

      <FooterLinks light />
    </div>
  );
}
