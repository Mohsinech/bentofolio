"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  Globe,
  Images,
  Instagram,
  Layers3,
  Lock,
  Music2,
  Sparkles,
  Youtube,
} from "lucide-react";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { createClient } from "@/app/lib/supabase/client";

const templates = [
  {
    name: "Designer",
    helper: "Free",
    image: "/prebuilt/designer/work1.jpeg",
  },
  {
    name: "Developer",
    helper: "Pro",
    image: "/prebuilt/dev/profile.png",
  },
  {
    name: "Influencer",
    helper: "Free",
    image: "/prebuilt/inf/inf.jpg",
  },
];

const proBlocks = [
  { label: "Custom domain", icon: Globe },
  { label: "Analytics", icon: BarChart3 },
  { label: "Spotify", icon: Music2 },
  { label: "YouTube", icon: Youtube },
  { label: "Gallery", icon: Images },
  { label: "Instagram", icon: Instagram },
];

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080809] text-[#f7f3eb]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(215,255,95,0.16),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(255,255,255,0.10),transparent_22%),linear-gradient(120deg,transparent_0%,transparent_46%,rgba(255,255,255,0.055)_47%,transparent_64%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[url('/ph.jpeg')] bg-cover bg-center opacity-[0.025]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur md:px-5">
          <Link
            href="/"
            className="text-lg text-white"
            style={{ fontFamily: "var(--font-achiko), sans-serif" }}
          >
            Bento<span className="text-white/45">Folio</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {[
              "Discover",
              "Invite",
              "Pricing",
              "Contact",
              isSignedIn ? "Dashboard" : "Log in",
            ].map((item) => (
              <Link
                key={item}
                href={
                  item === "Dashboard"
                    ? "/editor"
                    : item === "Log in"
                      ? "/auth/login"
                      : `/${item.toLowerCase()}`
                }
                className="rounded-full px-4 py-2 text-sm text-white/55 transition hover:bg-white/[0.055] hover:text-white"
              >
                {item}
              </Link>
            ))}
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-full bg-[#d7ff5f] px-4 py-2 text-sm font-bold text-[#080809] transition hover:bg-[#edff9c]"
            >
              {isSignedIn ? "Dashboard" : "Start building"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              href="/pricing"
              className="rounded-full px-2.5 py-2 text-xs text-white/58"
            >
              Pricing
            </Link>
            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff5f] px-3 py-2 text-xs font-bold text-[#080809]"
            >
              {isSignedIn ? "Dashboard" : "Start"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <div
              style={{ fontFamily: "var(--font-saans), sans-serif" }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d7ff5f]/16 bg-[#d7ff5f]/8 px-3 py-2 text-xs  uppercase tracking-[0.05rem] text-[#e9ff99]"
            >
              <Layers3 className="h-3.5 w-3.5" />
              Bento portfolios for creatives and devs
            </div>
            <h1
              className="text-5xl leading-[1.1] tracking-tighter text-white sm:text-7xl lg:text-8xl"
              style={{ fontFamily: "var(--font-saans), sans-serif" }}
            >
              Build your public proof in blocks.
            </h1>
            <p
              className="mt-6 max-w-xl text-base leading-7 text-white/58 sm:text-lg"
              style={{ fontFamily: "var(--font-saans), sans-serif" }}
            >
              Launch a polished bento profile for projects, socials, media,
              creator proof, SaaS metrics, and a custom domain when you go Pro.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d7ff5f] px-5 py-3 text-sm font-bold text-[#080809] transition hover:bg-[#edff9c]"
              >
                {isSignedIn ? "Open dashboard" : "Create my BentoFolio"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Pro is ${PREMIUM_PRICE} lifetime
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl gap-2 text-sm text-white/58 sm:grid-cols-3">
              {["Free templates", "No-code editing", "Desktop studio"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-3"
                  >
                    <Check className="h-4 w-4 text-[#d7ff5f]" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-[34px] border border-white/10 bg-[#111112]/95 p-2 shadow-[0_42px_130px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="grid gap-2 rounded-[28px] border border-white/[0.055] bg-[#171718] p-2 sm:grid-cols-6">
              <article className="min-h-44 rounded-[22px] border border-white/[0.07] bg-[#1d1d20] p-5 sm:col-span-4">
                <div className="mb-7 flex items-center justify-between">
                  <span className="rounded-full bg-[#d7ff5f] px-3 py-1 text-xs font-bold text-[#080809]">
                    Live profile
                  </span>
                  <span className="text-sm text-white/42">
                    bentofolio.dev/you
                  </span>
                </div>
                <h2 className="max-w-sm text-3xl leading-none text-white">
                  Work, links, socials, media, and launch metrics in one grid.
                </h2>
              </article>

              <article className="relative min-h-44 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#202023] sm:col-span-2">
                <Image
                  src="/prebuilt/inf/ig-profile.jpg"
                  alt="Creator profile preview"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </article>

              {templates.map((template) => (
                <article
                  key={template.name}
                  className="relative min-h-44 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#1b1b1d] sm:col-span-2"
                >
                  <Image
                    src={template.image}
                    alt={`${template.name} template`}
                    fill
                    className="object-cover opacity-75"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-lg font-semibold text-white">
                      {template.name}
                    </p>
                    <span className="text-xs text-white/52">
                      {template.helper} template
                    </span>
                  </div>
                </article>
              ))}

              <article className="rounded-[22px] border border-[#d7ff5f]/14 bg-[#d7ff5f]/[0.06] p-5 sm:col-span-3">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#e9ff99]">
                  <Lock className="h-4 w-4" />
                  Pro launch blocks
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {proBlocks.map((block) => {
                    const Icon = block.icon;
                    return (
                      <span
                        key={block.label}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.045] px-3 py-3 text-sm text-white/68"
                      >
                        <Icon className="h-4 w-4 text-[#d7ff5f]" />
                        {block.label}
                      </span>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-[22px] border border-white/[0.07] bg-[#1b1b1d] p-5 sm:col-span-3">
                <div className="mb-4 flex items-center gap-2 text-sm text-white/45">
                  <Code2 className="h-4 w-4" />
                  Developer-ready
                </div>
                <p className="text-2xl leading-tight text-white">
                  GitHub, projects, tech stack, experience, and custom domain.
                </p>
                <Link
                  href="/discover"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm text-white transition hover:bg-white/[0.12]"
                >
                  See discover
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
