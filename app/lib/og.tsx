// Shared pieces for link preview images (opengraph-image / twitter-image).
// Rendered by next/og, which supports a subset of CSS: flexbox only, and
// every element with more than one child needs display: flex.

export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  ink: "#111110",
  body: "#55544f",
  muted: "#6f6e69",
  line: "#ecebe8",
  soft: "#f6f6f4",
  card: "#ffffff",
  accent: "#2b44ff",
  accentWash: "#eef0ff",
  good: "#127a3b",
};

type FontWeight = 400 | 500 | 600;
type Font = { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" | "italic" };

const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

async function withTimeout<T>(work: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await work(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

// One weight of a Google font, cut down to the characters used.
function googleFont(family: string, axis: string, text: string): Promise<ArrayBuffer | null> {
  const chars = [...new Set(text)].sort().join("");
  const key = `${family}|${axis}|${chars}`;
  let pending = fontCache.get(key);
  if (!pending) {
    pending = withTimeout(async (signal) => {
      const url = `https://fonts.googleapis.com/css2?family=${family}:${axis}&text=${encodeURIComponent(chars)}`;
      const css = await (await fetch(url, { signal })).text();
      const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
      if (!src) return null;
      const response = await fetch(src, { signal });
      return response.ok ? await response.arrayBuffer() : null;
    }, 3000).catch(() => null);
    fontCache.set(key, pending);
    // Don't keep failures around.
    pending.then((data) => data || fontCache.delete(key));
  }
  return pending;
}

// Geist for text, Geist Mono for labels, Instrument Serif for the accent word.
// If Google Fonts can't be reached the image still renders in the default font.
export async function loadOgFonts(text: string, serifText = ""): Promise<Font[]> {
  const sans = `${text}…·$%0123456789`;
  const wanted: [string, string, string, FontWeight, "normal" | "italic", string][] = [
    ["Geist", "Geist", "wght@400", 400, "normal", sans],
    ["Geist", "Geist", "wght@500", 500, "normal", sans],
    ["Geist", "Geist", "wght@600", 600, "normal", sans],
    ["Geist Mono", "Geist+Mono", "wght@500", 500, "normal", sans],
  ];
  if (serifText) wanted.push(["Instrument Serif", "Instrument+Serif", "ital@1", 400, "italic", serifText]);
  const loaded = await Promise.all(wanted.map(([, family, axis, , , chars]) => googleFont(family, axis, chars)));
  return wanted.flatMap(([name, , , weight, style], i) => {
    const data = loaded[i];
    return data ? [{ name, data, weight, style }] : [];
  });
}

const IMAGE_TYPES = /^image\/(png|jpe?g|gif|svg\+xml)$/;

// A remote picture as a data URL, or null when it can't be used (too slow,
// too big, or a format the renderer doesn't read, such as WebP).
export async function imageDataUrl(src: string | null | undefined, base: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:image/")) return IMAGE_TYPES.test(src.slice(5, src.indexOf(";"))) ? src : null;
  let url: URL;
  try {
    url = new URL(src, base);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  try {
    return await withTimeout(async (signal) => {
      const response = await fetch(url, { signal });
      const type = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!response.ok || !IMAGE_TYPES.test(type)) return null;
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > 4_000_000) return null;
      return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
    }, 3000);
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  const words = name.replace(/^@/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

// The bentofolio mark: two squares over a bar.
export function OgMark({ size = 28, ink = OG.ink, accent = OG.accent }: { size?: number; ink?: string; accent?: string }) {
  const gap = Math.round(size / 9);
  const cell = (size - gap) / 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, width: size, height: size }}>
      <div style={{ display: "flex", gap }}>
        <div style={{ width: cell, height: cell, borderRadius: size / 9, background: ink }} />
        <div style={{ width: cell, height: cell, borderRadius: size / 9, background: accent }} />
      </div>
      <div style={{ width: size, height: cell, borderRadius: size / 9, background: ink }} />
    </div>
  );
}

export function OgCheck({ size = 28, color = OG.accent }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size,
        background: color,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
