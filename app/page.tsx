"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Play,
  Code2,
  Sparkles,
  Zap,
} from "lucide-react";

// Floating animation variants with different durations
const floatVariants: Variants = {
  float1: {
    y: [-8, 8, -8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  float2: {
    y: [-12, 12, -12],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  float3: {
    y: [-6, 6, -6],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  float4: {
    y: [-10, 10, -10],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
  float5: {
    y: [-7, 7, -7],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Tech stack icons as simple SVG components
const ReactIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#61DAFB">
    <path d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    <path
      fill="none"
      stroke="#61DAFB"
      strokeWidth="1"
      d="M12 21c4.97-2.87 9-5.87 9-9s-4.03-6.13-9-9c-4.97 2.87-9 5.87-9 9s4.03 6.13 9 9Z"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="9"
      ry="4"
      fill="none"
      stroke="#61DAFB"
      strokeWidth="1"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="9"
      ry="4"
      fill="none"
      stroke="#61DAFB"
      strokeWidth="1"
      transform="rotate(60 12 12)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="9"
      ry="4"
      fill="none"
      stroke="#61DAFB"
      strokeWidth="1"
      transform="rotate(-60 12 12)"
    />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0Zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054Z" />
  </svg>
);

const SupabaseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <path
      fill="#3ECF8E"
      d="M13.176 21.424c-.458.574-1.393.26-1.407-.47l-.182-9.503h9.128c1.036 0 1.61 1.2.965 2.018l-8.504 7.955Z"
    />
    <path
      fill="#3ECF8E"
      fillOpacity=".5"
      d="M13.176 21.424c-.458.574-1.393.26-1.407-.47l-.182-9.503h9.128c1.036 0 1.61 1.2.965 2.018l-8.504 7.955Z"
    />
    <path
      fill="#3ECF8E"
      d="M10.824 2.576c.458-.574 1.393-.26 1.407.47l.086 9.503H3.19c-1.036 0-1.61-1.2-.965-2.018l8.6-7.955Z"
    />
  </svg>
);

const TailwindIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#38BDF8">
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8Zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12Z" />
  </svg>
);

// Profile Block Component
const ProfileBlock = () => (
  <motion.div
    variants={floatVariants}
    animate="float1"
    className="absolute top-8 left-0 w-72 p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
    style={{
      boxShadow:
        "0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <div className="flex items-center gap-4">
      <div
        className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl"
        style={{ fontFamily: "var(--font-montreal), sans-serif" }}
      >
        S
      </div>
      <div>
        <h3
          className="text-white font-semibold text-lg"
          style={{ fontFamily: "var(--font-montreal), sans-serif" }}
        >
          Sarah Dev
        </h3>
        <p
          className="text-zinc-400 text-sm"
          style={{ fontFamily: "var(--font-mori), sans-serif" }}
        >
          Senior Engineer @ Vercel
        </p>
      </div>
    </div>
    <div className="mt-4 flex gap-2">
      <span
        className="px-2.5 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30"
        style={{ fontFamily: "var(--font-mori), sans-serif" }}
      >
        Open to Work
      </span>
      <span
        className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        style={{ fontFamily: "var(--font-mori), sans-serif" }}
      >
        Remote
      </span>
    </div>
  </motion.div>
);

// Metric Block Component
const MetricBlock = () => (
  <motion.div
    variants={floatVariants}
    animate="float2"
    className="absolute top-4 left-80 w-52 p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
    style={{
      boxShadow:
        "0 0 40px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <p
      className="text-zinc-400 text-xs uppercase tracking-wider mb-1"
      style={{ fontFamily: "var(--font-mori), sans-serif" }}
    >
      Monthly Revenue
    </p>
    <div className="flex items-baseline gap-2">
      <span
        className="text-3xl font-bold text-emerald-400"
        style={{ fontFamily: "var(--font-montreal), sans-serif" }}
      >
        $10k
      </span>
      <span
        className="text-emerald-400 text-sm flex items-center gap-0.5"
        style={{ fontFamily: "var(--font-mori), sans-serif" }}
      >
        <TrendingUp className="w-3 h-3" />
        +23%
      </span>
    </div>
    <div className="mt-3 h-12 flex items-end gap-1">
      {[40, 55, 45, 70, 65, 85, 90, 95].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400/80 rounded-sm"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </motion.div>
);

// Tech Stack Block Component
const TechStackBlock = () => (
  <motion.div
    variants={floatVariants}
    animate="float3"
    className="absolute top-48 left-12 w-64 p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
    style={{
      boxShadow:
        "0 0 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <p
      className="text-zinc-400 text-xs uppercase tracking-wider mb-3"
      style={{ fontFamily: "var(--font-mori), sans-serif" }}
    >
      Tech Stack
    </p>
    <div className="grid grid-cols-4 gap-3">
      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
        <ReactIcon />
      </div>
      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
        <NextIcon />
      </div>
      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
        <SupabaseIcon />
      </div>
      <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
        <TailwindIcon />
      </div>
    </div>
  </motion.div>
);

// Music Block Component
const MusicBlock = () => (
  <motion.div
    variants={floatVariants}
    animate="float4"
    className="absolute top-36 left-72 w-56 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
    style={{
      boxShadow:
        "0 0 40px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-white text-sm font-medium truncate"
          style={{ fontFamily: "var(--font-montreal), sans-serif" }}
        >
          Shipping Mode
        </p>
        <p
          className="text-zinc-500 text-xs truncate"
          style={{ fontFamily: "var(--font-mori), sans-serif" }}
        >
          Focus Playlist • 42 tracks
        </p>
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-gradient-to-r from-pink-500 to-orange-500 rounded-full" />
      </div>
      <span className="text-zinc-500 text-xs">2:34</span>
    </div>
    <div className="mt-2 flex gap-1">
      {[3, 5, 4, 6, 3, 7, 4, 5, 6, 3, 4, 5, 7, 4, 3, 5, 6, 4, 3, 5].map(
        (h, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-pink-500/60 to-orange-400/80 rounded-full"
            animate={{
              height: [h * 2, h * 4, h * 2],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ height: h * 3 }}
          />
        ),
      )}
    </div>
  </motion.div>
);

// Code Block Component
const CodeBlock = () => (
  <motion.div
    variants={floatVariants}
    animate="float5"
    className="absolute top-72 left-40 w-80 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl font-mono text-sm"
    style={{
      boxShadow:
        "0 0 40px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
    }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Code2 className="w-4 h-4 text-indigo-400" />
      <span
        className="text-zinc-400 text-xs"
        style={{ fontFamily: "var(--font-mori), sans-serif" }}
      >
        api/deploy.ts
      </span>
    </div>
    <pre className="text-xs leading-relaxed overflow-hidden">
      <code>
        <span className="text-pink-400">export async function</span>{" "}
        <span className="text-blue-400">deploy</span>
        <span className="text-zinc-300">(</span>
        <span className="text-orange-300">config</span>
        <span className="text-zinc-300">) {"{"}</span>
        {"\n  "}
        <span className="text-pink-400">const</span>{" "}
        <span className="text-zinc-300">result =</span>{" "}
        <span className="text-pink-400">await</span>{" "}
        <span className="text-blue-400">vercel</span>
        <span className="text-zinc-300">.deploy({"{"}</span>
        {"\n    "}
        <span className="text-zinc-300">project:</span>{" "}
        <span className="text-emerald-400">&apos;bentofolio&apos;</span>
        <span className="text-zinc-300">,</span>
        {"\n    "}
        <span className="text-zinc-300">env:</span>{" "}
        <span className="text-emerald-400">&apos;production&apos;</span>
        {"\n  "}
        <span className="text-zinc-300">{"})"}</span>
        {"\n  "}
        <span className="text-pink-400">return</span>{" "}
        <span className="text-zinc-300">result.url</span>
        {"\n"}
        <span className="text-zinc-300">{"}"}</span>
      </code>
    </pre>
  </motion.div>
);

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-[#09090b] relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/2 w-[600px] h-[600px] bg-fuchsia-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-1">
          <h1
            className="text-xl sm:text-2xl text-white"
            style={{ fontFamily: "var(--font-achiko), sans-serif" }}
          >
            Bento<span className="text-violet-400">Folio</span>
          </h1>
        </Link>
        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Link
            href="/editor"
            className="relative px-4 py-2 rounded-lg bg-violet-600/10 border border-violet-600/30 text-white text-sm font-medium transition-all duration-300 hover:bg-violet-600/20 hover:border-violet-600/50 overflow-hidden group"
            style={{ fontFamily: "var(--font-montreal), sans-serif" }}
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-[-2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[border-rotate_3s_linear_infinite] -z-10 rounded-lg" />
          </Link>
        </div>
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          <Link
            href="/discover"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-mori), sans-serif" }}
          >
            Discover
          </Link>
          <Link
            href="/themes"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-mori), sans-serif" }}
          >
            Themes
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-mori), sans-serif" }}
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-mori), sans-serif" }}
          >
            Login
          </Link>
          <Link
            href="/editor"
            className="relative px-4 py-2 rounded-lg bg-violet-600/10 border border-violet-600/30 text-white text-sm font-medium transition-all duration-300 hover:bg-violet-600/20 hover:border-violet-600/50 overflow-hidden group"
            style={{ fontFamily: "var(--font-montreal), sans-serif" }}
          >
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-[-2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[border-rotate_3s_linear_infinite] -z-10 rounded-lg" />
          </Link>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <div className="relative z-10 h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-4 lg:gap-8 items-center">
          {/* Left Side - Text Content (60%) */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-5 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center lg:justify-start"
            >
              <span
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8"
                style={{ fontFamily: "var(--font-mori), sans-serif" }}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                v1.0 Now Public
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-[0.9] mb-4 sm:mb-6"
              style={{ fontFamily: "var(--font-montreal), sans-serif" }}
            >
              Kill the
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                PDF.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0"
              style={{ fontFamily: "var(--font-mori), sans-serif" }}
            >
              Static resumes are boring, outdated, and don&apos;t show your
              code. Send a live BentoFolio that proves you&apos;re a{" "}
              <span className="text-white font-medium">builder</span>, not just
              a writer.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-6 sm:mb-8"
            >
              <Link
                href="/editor"
                className="relative group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-violet-600/10 border border-violet-600/30 text-white font-semibold text-base sm:text-lg transition-all duration-300 hover:bg-violet-600/20 hover:border-violet-600/50 hover:-translate-y-0.5 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/30 overflow-hidden"
                style={{ fontFamily: "var(--font-montreal), sans-serif" }}
              >
                <span
                  className="absolute inset-[-2px] bg-gradient-to-r from-transparent via-violet-500/60 via-50% to-transparent opacity-0 group-hover:opacity-100 animate-[border-move_3s_ease-in-out_infinite] -z-10 rounded-xl"
                  style={{ backgroundSize: "200% 100%" }}
                />
                <span className="absolute inset-[1px] bg-[#09090b] -z-10 rounded-[10px]" />
                <span className="relative z-10">Create My Profile</span>
                <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Micro-copy */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-zinc-500"
              style={{ fontFamily: "var(--font-mori), sans-serif" }}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
              Optimized for mobile & dark mode.
            </motion.p>
          </div>

          {/* Right Side - Floating Bento Grid (40-50%) with overflow */}
          <div className="hidden lg:block col-span-12 lg:col-span-6 xl:col-span-7 relative h-[600px]">
            {/* 3D Perspective Container */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute inset-0"
              style={{
                perspective: "2000px",
                transform: "translateX(15%)",
              }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transform: "rotateY(-12deg) rotateX(5deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Floating Grid Blocks */}
                <ProfileBlock />
                <MetricBlock />
                <TechStackBlock />
                <MusicBlock />
                <CodeBlock />

                {/* Additional decorative elements */}
                <motion.div
                  variants={floatVariants}
                  animate="float2"
                  className="absolute -top-4 left-64 w-20 h-20 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10"
                  style={{
                    boxShadow: "0 0 60px rgba(139, 92, 246, 0.3)",
                  }}
                />
                <motion.div
                  variants={floatVariants}
                  animate="float3"
                  className="absolute top-96 left-0 w-16 h-16 rounded-xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10"
                  style={{
                    boxShadow: "0 0 40px rgba(16, 185, 129, 0.3)",
                  }}
                />
                <motion.div
                  variants={floatVariants}
                  animate="float1"
                  className="absolute top-80 left-96 w-12 h-12 rounded-lg backdrop-blur-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-white/10"
                  style={{
                    boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
    </div>
  );
}
