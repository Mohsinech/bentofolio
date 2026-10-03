"use client";

// Last resort, when the root layout itself fails: no app styles or fonts
// are loaded, so everything is inline.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#fcfcfb",
          color: "#111110",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <main style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, font: "500 13px/1 ui-monospace, monospace", color: "#6f6e69" }}>Error</p>
          <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.04em" }}>
            bentofolio is having a moment.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "#55544f" }}>
            Your page and your data are fine. Try again in a few seconds.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 46,
                padding: "0 20px",
                border: 0,
                borderRadius: 11,
                background: "#111110",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A full reload on purpose: client navigation may be what broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: 46,
                padding: "0 20px",
                borderRadius: 11,
                border: "1px solid #deddd8",
                color: "#111110",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Go home
            </a>
          </div>
          {error.digest && (
            <p style={{ margin: "8px 0 0", font: "500 12px/1.4 ui-monospace, monospace", color: "#a3a29c" }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
