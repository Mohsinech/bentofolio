"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import m from "@/app/components/marketing/marketing.module.css";
import { useAuth, useProfile } from "@/app/lib/hooks";
import { importFromGitHub } from "@/app/lib/github";
import { DEFAULT_MEMOJI_AVATAR } from "@/app/lib/memoji";
import { GRID_LAYOUT_VERSION } from "@/app/components/bento/grid-layout";
import { STARTERS, buildStarter, isFreshPage, type StarterGitHub, type StarterId } from "@/app/lib/starters";
import { checkUsernameFormat, isPlaceholderUsername, normalizeUsername, usernameMessage } from "@/app/lib/usernames";
import s from "./onboarding.module.css";

type Step = 1 | 2 | 3;
type Picture = "photo" | "memoji" | "none";

const TONES: Record<string, string> = {
  card: "#FFFFFF",
  soft: "#F3F2EF",
  map: "#E9EEF1",
  dark: "#111110",
  accent: "#C9D0FF",
  warm: "#E7E5DF",
};

function slug(value: string): string {
  return normalizeUsername(
    value
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

// Shrinks an uploaded photo so the saved page stays small.
function resizeImage(file: File, size = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't an image we can use."));
      img.onload = () => {
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, githubUsername } = useAuth();
  const { profile, loading: profileLoading, updateUsername, saveProfile } = useProfile();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const metaText = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string).trim() : "");
  const githubAvatar = metaText("avatar_url") || null;

  const [step, setStep] = useState<Step | null>(null);
  const [username, setUsername] = useState("");
  const [check, setCheck] = useState<{ name: string; ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [starter, setStarter] = useState<StarterId>("designer");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [picture, setPicture] = useState<Picture>("memoji");
  const [photo, setPhoto] = useState<string | null>(null);
  const [githubName, setGithubName] = useState("");
  const [openToWork, setOpenToWork] = useState(true);
  const [busy, setBusy] = useState<null | "username" | "finish" | "skip">(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  // Where to start: signed out → login; page already set up → editor;
  // otherwise claim the name first (or skip it if it's already chosen).
  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!profile || started.current) return;
    if (!isFreshPage(profile)) {
      router.replace("/editor");
      return;
    }
    started.current = true;
    const placeholder = isPlaceholderUsername(profile.username);
    // A name claimed on the landing page (?username=) that couldn't be set at
    // signup, e.g. a GitHub signup: offer it again.
    const claimed = normalizeUsername(new URLSearchParams(window.location.search).get("username") ?? "");
    setUsername(placeholder ? (claimed && checkUsernameFormat(claimed) === "ok" ? claimed : "") : profile.username);
    setStep(placeholder ? 1 : 2);
    setStarter(githubUsername ? "developer" : "designer");
    setName(metaText("full_name") || metaText("name"));
    setGithubName(githubUsername ?? "");
    if (githubAvatar) {
      setPicture("photo");
      setPhoto(githubAvatar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, profileLoading, user, profile]);

  // Live availability while typing a name.
  const typed = normalizeUsername(username);
  const format = typed ? checkUsernameFormat(typed) : null;
  useEffect(() => {
    if (!typed || format !== "ok") {
      setChecking(false);
      return;
    }
    if (profile && typed === profile.username) {
      setCheck({ name: typed, ok: true, text: "This is your current name" });
      return;
    }
    setChecking(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/username/check?u=${encodeURIComponent(typed)}`, { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          setCheck({ name: typed, ok: Boolean(data.available), text: data.available ? "Available" : data.message });
        }
      } catch {
        // Offline or aborted; saving checks again.
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [typed, format, profile]);

  const hint = !typed
    ? null
    : format !== "ok"
      ? { ok: false, text: usernameMessage(format!) }
      : checking
        ? null
        : check && check.name === typed
          ? check
          : null;

  const suggestions = useMemo(() => {
    const emailName = (user?.email ?? "").split("@")[0] ?? "";
    const fullName = metaText("full_name") || metaText("name");
    const first = fullName.split(/\s+/)[0] ?? "";
    const options = [githubUsername ?? "", slug(fullName), slug(fullName).replace(/-/g, ""), slug(first), slug(emailName)];
    return [...new Set(options.map((o) => normalizeUsername(o)).filter((o) => o && checkUsernameFormat(o) === "ok" && !isPlaceholderUsername(o)))].slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, githubUsername]);

  async function submitUsername(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    if (!typed || format !== "ok") {
      setError(typed ? usernameMessage(format!) : "Pick a name for your page.");
      return;
    }
    if (profile && typed === profile.username) {
      setStep(2);
      return;
    }
    setBusy("username");
    const result = await updateUsername(typed);
    setBusy(null);
    if (result.ok) setStep(2);
    else setError(result.message || "That name didn't work. Try another.");
  }

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      setPhoto(await resizeImage(file));
      setPicture("photo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't use that image.");
    }
  }

  async function finish(skip = false) {
    setError(null);
    setBusy(skip ? "skip" : "finish");
    let github: StarterGitHub | undefined;
    const gh = githubName.trim().replace(/^@/, "");
    if (!skip && starter === "developer" && gh) {
      const data = await withTimeout(importFromGitHub(gh).catch(() => null), 6000);
      if (data) {
        github = {
          githubContent: data.githubContent,
          repos: data.projectsContent.items,
          languages: data.techStackContent.items.map((item: { name: string }) => item.name),
          profileUrl: data.user.html_url,
        };
      }
    }
    const { layout, content } = buildStarter(
      starter,
      skip
        ? { name: "", headline: "", location: "", picture: "memoji", openToWork: false, githubUsername: null }
        : {
            name,
            headline,
            location,
            picture,
            photo: picture === "photo" ? photo : null,
            openToWork,
            githubUsername: gh || null,
          },
      github
    );
    try {
      await saveProfile({ layout, content, layoutVersion: GRID_LAYOUT_VERSION });
      router.push("/editor");
    } catch (e) {
      setBusy(null);
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
    }
  }

  const selected = STARTERS.find((item) => item.id === starter) ?? STARTERS[0];
  const pageName = typed && format === "ok" ? typed : profile && !isPlaceholderUsername(profile.username) ? profile.username : "yourname";
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const previewPicture = picture === "photo" ? photo : picture === "memoji" ? DEFAULT_MEMOJI_AVATAR : null;

  if (step === null) {
    return (
      <div className={`${bentoFontClasses} ${m.page} ${s.loading}`}>
        <Loader2 size={20} className={s.spin} aria-label="Loading" />
      </div>
    );
  }

  const steps: { n: Step; title: string; sub: string }[] = [
    { n: 1, title: "Claim your name", sub: step > 1 ? `bentofolio.dev/${pageName}` : "Your public link" },
    { n: 2, title: "Pick a layout", sub: step > 2 ? selected.name : "Designer, Developer, Founder or blank" },
    { n: 3, title: "Add the basics", sub: "Name, headline, photo" },
  ];

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.shell}`}>
      <aside className={s.rail}>
        <div className={s.railTop}>
          <Link href="/" className={m.brand}>
            <span className={m.mark} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            bentofolio
          </Link>
          <ol className={s.steps} aria-label="Setup steps">
            {steps.map((item) => (
              <li key={item.n} className={s.step} aria-current={item.n === step ? "step" : undefined}>
                <span className={`${s.dot} ${item.n < step ? s.dotDone : item.n === step ? s.dotNow : ""}`}>
                  {item.n < step ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : item.n}
                </span>
                <span className={s.stepText}>
                  <b className={item.n > step ? s.later : undefined}>{item.title}</b>
                  <span className={item.n < step ? m.lbl : undefined}>{item.sub}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <span className={m.lbl}>
          Signed in {githubUsername ? `with GitHub as @${githubUsername}` : `as ${user?.email ?? ""}`}
        </span>
      </aside>

      <main className={s.main}>
        <div className={s.topBrand}>
          <Link href="/" className={m.brand}>
            <span className={m.mark} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            bentofolio
          </Link>
        </div>
        {step === 1 && (
          <form className={s.narrow} onSubmit={submitUsername}>
            <span className={m.lbl}>Step 1 of 3</span>
            <h1 className={s.title}>
              Claim your <span className={m.ser}>name.</span>
            </h1>
            <p className={m.p}>This is your public link. You can change it later in settings.</p>

            <label className={s.field}>
              <span className={m.lbl}>Username</span>
              <span className={`${s.username} ${hint ? (hint.ok ? s.usernameOk : s.usernameBad) : ""}`}>
                bentofolio.dev/
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="yourname"
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={30}
                  aria-describedby="username-hint"
                />
                {checking && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
              </span>
              <span id="username-hint" className={`${s.hint} ${hint ? (hint.ok ? s.ok : s.bad) : ""}`} aria-live="polite">
                {hint?.ok && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                {hint?.text ?? "Letters, numbers and dashes."}
              </span>
            </label>

            {suggestions.length > 0 && (
              <div className={s.field}>
                <span className={m.lbl}>Suggestions</span>
                <div className={s.suggestions}>
                  {suggestions.map((option) => (
                    <button key={option} type="button" className={s.suggestion} onClick={() => setUsername(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}

            <div className={s.actions}>
              <button type="submit" className={`${m.btn} ${m.btnDark} ${s.big}`} disabled={busy !== null || hint?.ok === false}>
                {busy === "username" && <Loader2 size={15} className={s.spin} aria-hidden="true" />}
                Continue
              </button>
              <span className={m.lbl}>Next: pick a layout</span>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className={s.wide}>
            <div className={s.head}>
              <span className={m.lbl}>Step 2 of 3</span>
              <h1 className={s.title}>
                Pick a <span className={m.ser}>layout.</span>
              </h1>
              <p className={m.p}>A starting point, not a cage. Every block can be moved, resized or removed later.</p>
            </div>

            <div className={s.cards} role="radiogroup" aria-label="Layouts">
              {STARTERS.map((item) => {
                const on = item.id === starter;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`${s.card} ${on ? s.cardOn : ""}`}
                    onClick={() => setStarter(item.id)}
                  >
                    <span className={s.mini} aria-hidden="true">
                      {item.preview.map(([w, h, tone], index) => (
                        <span
                          key={index}
                          style={{ gridColumn: `span ${w}`, gridRow: `span ${h}`, background: TONES[tone] }}
                        />
                      ))}
                    </span>
                    <span className={s.cardName}>
                      {item.name}
                      <span className={s.free}>FREE</span>
                    </span>
                    <span className={s.cardDesc}>{item.description}</span>
                    {on && (
                      <span className={s.check} aria-hidden="true">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={s.includes}>
              <span className={m.lbl}>{selected.name} includes</span>
              <div className={s.pills}>
                {selected.includes.map((label) => (
                  <span key={label} className={s.pill}>
                    {label}
                  </span>
                ))}
              </div>
              <span className={s.muted}>
                Your name and photo go in now. The rest start empty, so nothing made-up shows on your page.
              </span>
            </div>

            <div className={s.footer}>
              <button type="button" className={`${m.btn} ${m.btnGhost} ${s.big}`} onClick={() => setStep(1)}>
                Back
              </button>
              <div className={s.footerRight}>
                <span className={`${m.lbl} ${s.hideSm}`}>Next: add the basics</span>
                <button type="button" className={`${m.btn} ${m.btnDark} ${s.big}`} onClick={() => setStep(3)}>
                  Use {selected.name} layout
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={s.wide}>
            <div className={s.head}>
              <span className={m.lbl}>Step 3 of 3</span>
              <h1 className={s.title}>
                Add the <span className={m.ser}>basics.</span>
              </h1>
              <p className={m.p}>This fills your Profile block. Everything else can wait.</p>
            </div>

            <div className={s.split}>
              <form
                className={s.form}
                aria-label="Profile basics"
                onSubmit={(event) => {
                  event.preventDefault();
                  finish();
                }}
              >
                <label className={s.field}>
                  <span className={m.lbl}>Name</span>
                  <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <label className={s.field}>
                  <span className={m.lbl}>Headline</span>
                  <input
                    className={s.input}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={60}
                    placeholder="Product designer and creative developer"
                  />
                  <span className={`${m.lbl} ${s.count}`}>{headline.length} / 60</span>
                </label>
                <label className={s.field}>
                  <span className={m.lbl}>Location</span>
                  <input
                    className={s.input}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Casablanca / Remote"
                  />
                </label>
                {starter === "developer" && (
                  <label className={s.field}>
                    <span className={m.lbl}>GitHub username</span>
                    <input
                      className={s.input}
                      value={githubName}
                      onChange={(e) => setGithubName(e.target.value)}
                      placeholder="octocat"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                    <span className={s.muted}>We’ll fill GitHub, your top repos and languages.</span>
                  </label>
                )}
                <div className={s.field}>
                  <span className={m.lbl} id="picture-label">
                    Picture
                  </span>
                  <div className={s.segment} role="radiogroup" aria-labelledby="picture-label">
                    {(["photo", "memoji", "none"] as Picture[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={picture === option}
                        className={picture === option ? s.segmentOn : undefined}
                        onClick={() => {
                          setPicture(option);
                          if (option === "photo" && !photo) fileRef.current?.click();
                        }}
                      >
                        {option === "photo" ? "Photo" : option === "memoji" ? "Memoji" : "None"}
                      </button>
                    ))}
                  </div>
                  {picture === "photo" && (
                    <span className={s.muted}>
                      {photo ? (photo === githubAvatar ? "Using your GitHub avatar. " : "Photo added. ") : "No photo yet. "}
                      <button type="button" className={s.linkButton} onClick={() => fileRef.current?.click()}>
                        <Upload size={12} aria-hidden="true" /> {photo ? "Upload another" : "Upload one"}
                      </button>
                    </span>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      choosePhoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className={s.toggleRow}>
                  <span className={s.toggleText}>
                    <b>Open to work</b>
                    <span>Shows a green status on your profile</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={openToWork}
                    aria-label="Open to work"
                    className={`${s.switch} ${openToWork ? s.switchOn : ""}`}
                    onClick={() => setOpenToWork((v) => !v)}
                  >
                    <span />
                  </button>
                </div>
                <button type="submit" hidden />
              </form>

              <div className={s.previewCol}>
                <div className={s.previewHead}>
                  <span className={m.lbl}>Live preview</span>
                  <span className={m.lbl}>bentofolio.dev/{pageName}</span>
                </div>
                <div className={s.previewFrame}>
                  <div className={s.previewCard}>
                    <div className={s.previewTop}>
                      {picture !== "none" ? (
                        previewPicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className={s.portrait} src={previewPicture} alt="" />
                        ) : (
                          <span className={s.portrait}>{initials}</span>
                        )
                      ) : (
                        <span />
                      )}
                      {openToWork && (
                        <span className={s.status}>
                          <span aria-hidden="true" />
                          Open to work
                        </span>
                      )}
                    </div>
                    <div className={s.previewText}>
                      <span className={s.previewName}>{name || "Your name"}</span>
                      <span className={s.previewHeadline}>{headline || "Your headline"}</span>
                      {location && <span className={m.lbl}>{location}</span>}
                    </div>
                  </div>
                </div>
                <span className={s.muted}>Nothing is public until you press Publish in the editor.</span>
              </div>
            </div>

            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}

            <div className={s.footer}>
              <button type="button" className={`${m.btn} ${m.btnGhost} ${s.big}`} onClick={() => setStep(2)} disabled={busy !== null}>
                Back
              </button>
              <div className={s.footerRight}>
                <button type="button" className={s.skip} onClick={() => finish(true)} disabled={busy !== null}>
                  {busy === "skip" ? "Opening…" : "Skip for now"}
                </button>
                <button type="button" className={`${m.btn} ${m.btnDark} ${s.big}`} onClick={() => finish()} disabled={busy !== null}>
                  {busy === "finish" && <Loader2 size={15} className={s.spin} aria-hidden="true" />}
                  Open the editor
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
