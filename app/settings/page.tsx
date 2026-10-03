"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Copy, Loader2 } from "lucide-react";
import { bentoFontClasses } from "@/app/components/bento/fonts";
import m from "@/app/components/marketing/marketing.module.css";
import { createClient } from "@/app/lib/supabase/client";
import { PREMIUM_PRICE } from "@/app/lib/config";
import type { DomainStatus } from "@/app/lib/domains";
import { checkUsernameFormat, normalizeUsername, usernameMessage } from "@/app/lib/usernames";
import { useUpgrade } from "@/app/components/upgrade/UpgradeDialog";
import s from "./settings.module.css";
import { SectionsSkeleton } from "@/app/components/skeleton/Skeleton";

interface Settings {
  username: string;
  email: string | null;
  hasPassword: boolean;
  githubUsername: string | null;
  isPro: boolean;
  upgradedAt: string | null;
  customDomain: string | null;
  ready: boolean;
  defaultView: "grid" | "cv";
  discoverable: boolean;
  showMadeWith: boolean;
}

interface DomainState {
  domain: string | null;
  configured: boolean;
  status?: DomainStatus | null;
  error?: string;
}

function ago(iso: string | undefined): string {
  if (!iso) return "";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

function Switch({ on, label, disabled, onChange }: { on: boolean; label: string; disabled?: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`${s.switch} ${on ? s.switchOn : ""}`}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={s.copy}
      onClick={async () => {
        await navigator.clipboard?.writeText(value).catch(() => null);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const { openUpgrade, upgradeDialog } = useUpgrade();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  // Page address
  const [username, setUsername] = useState("");
  const [nameCheck, setNameCheck] = useState<{ name: string; ok: boolean; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);

  // Domain
  const [domain, setDomain] = useState<DomainState | null>(null);
  const [domainInput, setDomainInput] = useState("");
  const [domainBusy, setDomainBusy] = useState<null | "connect" | "check" | "remove">(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // Account
  const [emailOpen, setEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const say = useCallback((ok: boolean, text: string) => {
    setToast({ ok, text });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Couldn't load your settings.");
        setSettings(data);
        setUsername(data.username);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Couldn't load your settings."));
    fetch("/api/domain")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setDomain(data))
      .catch(() => null);
    // Load once; typing and toggles shouldn't be overwritten by a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live check while editing the username.
  const typed = normalizeUsername(username);
  const format = typed ? checkUsernameFormat(typed) : null;
  const unchanged = settings ? typed === settings.username : true;
  useEffect(() => {
    if (!typed || format !== "ok" || unchanged) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/username/check?u=${encodeURIComponent(typed)}`, { signal: controller.signal });
        const data = await response.json();
        setNameCheck({ name: typed, ok: Boolean(data.available), text: data.available ? "Available" : data.message });
      } catch {
        // Saving checks again.
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [typed, format, unchanged]);
  const nameHint = unchanged
    ? null
    : format !== "ok"
      ? typed
        ? { ok: false, text: usernameMessage(format!) }
        : null
      : nameCheck && nameCheck.name === typed
        ? nameCheck
        : null;

  async function saveUsername() {
    if (!settings || unchanged || format !== "ok") return;
    setSavingName(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: typed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Couldn't change your username.");
      setSettings({ ...settings, username: typed });
      say(true, `Your page is now bentofolio.dev/${typed}`);
    } catch (error) {
      say(false, error instanceof Error ? error.message : "Couldn't change your username.");
    } finally {
      setSavingName(false);
    }
  }

  async function saveDisplay(patch: Partial<Pick<Settings, "defaultView" | "discoverable" | "showMadeWith">>) {
    if (!settings) return;
    const before = settings;
    setSettings({ ...settings, ...patch });
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => null);
    if (!response?.ok) {
      setSettings(before);
      const data = await response?.json().catch(() => null);
      say(false, data?.error || "Couldn't save. Try again.");
    } else {
      say(true, "Saved");
    }
  }

  async function domainRequest(method: "POST" | "GET" | "DELETE", body?: unknown) {
    const response = await fetch("/api/domain", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Something went wrong. Try again.");
    return data as DomainState;
  }

  async function connectDomain(event: React.FormEvent) {
    event.preventDefault();
    setDomainError(null);
    setDomainBusy("connect");
    try {
      const data = await domainRequest("POST", { domain: domainInput });
      setDomain(data);
      setDomainInput("");
      if (settings) setSettings({ ...settings, customDomain: data.domain });
    } catch (error) {
      setDomainError(error instanceof Error ? error.message : "Couldn't connect the domain.");
    } finally {
      setDomainBusy(null);
    }
  }

  async function checkAgain() {
    setDomainError(null);
    setDomainBusy("check");
    try {
      setDomain(await domainRequest("GET"));
    } catch (error) {
      setDomainError(error instanceof Error ? error.message : "Couldn't check the domain.");
    } finally {
      setDomainBusy(null);
    }
  }

  async function removeConnectedDomain() {
    if (!window.confirm("Remove this domain? Your page stays on bentofolio.dev.")) return;
    setDomainError(null);
    setDomainBusy("remove");
    try {
      await domainRequest("DELETE");
      setDomain({ domain: null, configured: domain?.configured ?? true });
      if (settings) setSettings({ ...settings, customDomain: null });
    } catch (error) {
      setDomainError(error instanceof Error ? error.message : "Couldn't remove the domain.");
    } finally {
      setDomainBusy(null);
    }
  }

  async function changeEmail(event: React.FormEvent) {
    event.preventDefault();
    setEmailBusy(true);
    const { error } = await createClient().auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${window.location.origin}/settings` }
    );
    setEmailBusy(false);
    if (error) {
      say(false, error.message);
      return;
    }
    setEmailOpen(false);
    setNewEmail("");
    say(true, "Check both inboxes: confirm the change from your old and new address.");
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    setDeleting(true);
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: deleteConfirm }),
    }).catch(() => null);
    if (response?.ok) {
      window.location.replace("/");
      return;
    }
    const data = await response?.json().catch(() => null);
    setDeleting(false);
    say(false, data?.error || "Couldn't delete the account.");
  }

  const status = domain?.status ?? null;
  const steps = status
    ? [
        { label: "Domain added", state: status.added ? "done" : "todo" },
        { label: status.dnsOk ? "DNS connected" : "Waiting for DNS", state: status.dnsOk ? "done" : "wait" },
        { label: "Secure & live", state: status.live ? "done" : "todo" },
      ]
    : [];

  return (
    <div className={`${bentoFontClasses} ${m.page} ${s.page}`}>
      <header className={s.bar}>
        <Link href="/" className={s.mark} aria-label="bentofolio home">
          <i />
          <i />
          <i />
        </Link>
        <span className={s.barTitle}>Settings</span>
        <Link href="/editor" className={`${m.btn} ${m.btnGhost} ${s.small}`}>
          Back to editor
        </Link>
      </header>

      <div className={s.layout}>
        <nav className={s.side} aria-label="Settings sections">
          <a href="#address">Page address</a>
          <a href="#domain">Custom domain</a>
          <a href="#display">Display</a>
          <a href="#plan">Plan</a>
          <a href="#account">Account</a>
          <a href="#delete" className={s.sideDanger}>
            Delete account
          </a>
        </nav>

        <main className={s.main}>
          <h1 className={s.title}>Settings</h1>

          {loadError && (
            <p className={s.error} role="alert">
              {loadError}
            </p>
          )}
          {!settings && !loadError && <SectionsSkeleton sections={4} label="Loading settings" />}

          {settings && (
            <>
              {!settings.ready && (
                <p className={s.notice}>
                  <AlertTriangle size={14} aria-hidden="true" /> Display options need migration 016 in Supabase before they can be saved.
                </p>
              )}

              <section className={s.card} id="address" aria-labelledby="address-title">
                <div className={s.head}>
                  <h2 id="address-title">Page address</h2>
                  <p>Your public link. Letters, numbers and dashes.</p>
                </div>
                <div className={s.body}>
                  <label className={s.field}>
                    <span className={m.lbl}>Username</span>
                    <span className={`${s.username} ${nameHint ? (nameHint.ok ? s.usernameOk : s.usernameBad) : ""}`}>
                      bentofolio.dev/
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoCapitalize="none"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={30}
                        aria-describedby="username-hint"
                      />
                      {nameHint && (
                        <span id="username-hint" className={nameHint.ok ? s.ok : s.bad} aria-live="polite">
                          {nameHint.text}
                        </span>
                      )}
                    </span>
                  </label>
                  {!unchanged && (
                    <p className={s.warn}>
                      <AlertTriangle size={14} aria-hidden="true" />
                      <span>
                        Links to bentofolio.dev/{settings.username} keep working for 30 days, then the old name is
                        released.
                      </span>
                    </p>
                  )}
                </div>
                <div className={s.foot}>
                  <span className={m.lbl}>Current: bentofolio.dev/{settings.username}</span>
                  <button
                    type="button"
                    className={`${m.btn} ${m.btnDark} ${s.small}`}
                    onClick={saveUsername}
                    disabled={unchanged || format !== "ok" || nameHint?.ok === false || savingName}
                  >
                    {savingName && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                    Change username
                  </button>
                </div>
              </section>

              <section className={s.card} id="domain" aria-labelledby="domain-title">
                <div className={s.head}>
                  <div className={s.headRow}>
                    <h2 id="domain-title">Custom domain</h2>
                    <span className={s.pro}>PRO</span>
                  </div>
                  <p>Show your page on a domain you own, like mira.design or cv.mira.design.</p>
                </div>

                {!settings.isPro ? (
                  <div className={s.foot}>
                    <span className={s.muted}>Custom domains come with Pro, ${PREMIUM_PRICE} once.</span>
                    <button type="button" onClick={() => openUpgrade("domain")} className={`${m.btn} ${m.btnAccent} ${s.small}`}>
                      Get Pro
                    </button>
                  </div>
                ) : !domain?.domain ? (
                  <form className={s.body} onSubmit={connectDomain}>
                    {domain && !domain.configured && (
                      <p className={s.notice}>
                        <AlertTriangle size={14} aria-hidden="true" /> Custom domains aren&apos;t switched on for this site yet.
                      </p>
                    )}
                    <div className={s.inline}>
                      <input
                        className={s.input}
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="mira.design"
                        aria-label="Domain"
                        autoCapitalize="none"
                        spellCheck={false}
                      />
                      <button
                        type="submit"
                        className={`${m.btn} ${m.btnDark} ${s.small}`}
                        disabled={!domainInput.trim() || domainBusy !== null || domain?.configured === false}
                      >
                        {domainBusy === "connect" && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                        Connect
                      </button>
                    </div>
                    {domainError && (
                      <p className={s.error} role="alert">
                        {domainError}
                      </p>
                    )}
                    <span className={s.muted}>Buy a domain anywhere (Namecheap, Cloudflare, GoDaddy…), then connect it here.</span>
                  </form>
                ) : (
                  <>
                    <div className={s.body}>
                      <div className={s.domainRow}>
                        <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer" className={s.domainName}>
                          {domain.domain} ↗
                        </a>
                        {status?.live && <span className={s.liveBadge}>Live</span>}
                      </div>

                      {status && (
                        <ol className={s.steps} aria-label="Domain setup">
                          {steps.map((step) => (
                            <li key={step.label} className={s[`step_${step.state}`]}>
                              {step.state === "done" ? <Check size={14} aria-hidden="true" /> : <span className={s.stepDot} aria-hidden="true" />}
                              {step.label}
                            </li>
                          ))}
                        </ol>
                      )}

                      {status && !status.live && (
                        <div className={s.dnsBlock}>
                          <span className={s.strong}>Add these records where you bought your domain</span>
                          <div className={s.table} role="table" aria-label="DNS records">
                            <div className={`${s.row} ${s.rowHead}`} role="row">
                              <span role="columnheader">Type</span>
                              <span role="columnheader">Name</span>
                              <span role="columnheader">Value</span>
                              <span role="columnheader">Status</span>
                            </div>
                            {status.records.map((record) => (
                              <div key={`${record.type}-${record.name}`} className={s.row} role="row">
                                <span role="cell">{record.type}</span>
                                <span role="cell">{record.name}</span>
                                <span role="cell" className={s.value}>
                                  <code>{record.value}</code>
                                  <CopyButton value={record.value} />
                                </span>
                                <span role="cell" className={record.ok ? s.ok : record.ok === false ? s.waiting : s.muted}>
                                  {record.ok ? "Found" : record.ok === false ? "Not found yet" : "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                          <span className={s.muted}>
                            DNS changes take a few minutes to a few hours. Using Cloudflare? Set the records to “DNS only”
                            (grey cloud).
                          </span>
                        </div>
                      )}

                      {domain.error && <p className={s.notice}>{domain.error}</p>}
                      {domainError && (
                        <p className={s.error} role="alert">
                          {domainError}
                        </p>
                      )}
                    </div>
                    <div className={s.foot}>
                      <span className={m.lbl}>{status ? `Last checked ${ago(status.checkedAt)}` : ""}</span>
                      <div className={s.actions}>
                        <button type="button" className={s.dangerLink} onClick={removeConnectedDomain} disabled={domainBusy !== null}>
                          {domainBusy === "remove" ? "Removing…" : "Remove domain"}
                        </button>
                        <button type="button" className={`${m.btn} ${m.btnDark} ${s.small}`} onClick={checkAgain} disabled={domainBusy !== null}>
                          {domainBusy === "check" && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                          Check again
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>

              <section className={s.card} id="display" aria-labelledby="display-title">
                <div className={s.head}>
                  <h2 id="display-title">Display</h2>
                  <p>How visitors first see your page. Changes apply right away.</p>
                </div>
                <div className={s.body}>
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b id="view-label">Default view</b>
                      <span>Visitors can still switch between Grid and CV.</span>
                    </span>
                    <div className={s.segment} role="radiogroup" aria-labelledby="view-label">
                      {(["grid", "cv"] as const).map((view) => (
                        <button
                          key={view}
                          type="button"
                          role="radio"
                          aria-checked={settings.defaultView === view}
                          className={settings.defaultView === view ? s.segmentOn : undefined}
                          onClick={() => settings.defaultView !== view && saveDisplay({ defaultView: view })}
                        >
                          {view === "grid" ? "Grid" : "CV"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b>
                        “Made with bentofolio” tag <span className={s.pro}>PRO</span>
                      </b>
                      <span>{settings.isPro ? "Shown at the bottom of your page." : "Always shown on free pages."}</span>
                    </span>
                    <Switch
                      on={settings.isPro ? settings.showMadeWith : true}
                      label="Show Made with bentofolio tag"
                      disabled={!settings.isPro}
                      onChange={(on) => saveDisplay({ showMadeWith: on })}
                    />
                  </div>
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b>List me on Discover</b>
                      <span>Let people find your page in the community gallery and on the home page.</span>
                    </span>
                    <Switch
                      on={settings.discoverable}
                      label="List on Discover"
                      onChange={(on) => saveDisplay({ discoverable: on })}
                    />
                  </div>
                  <span className={s.muted}>Light or dark theme is set in the editor, with your draft.</span>
                </div>
              </section>

              <section className={s.card} id="plan" aria-labelledby="plan-title">
                <div className={s.head}>
                  <h2 id="plan-title">Plan</h2>
                </div>
                <div className={`${s.body} ${s.planRow}`}>
                  <div className={s.planInfo}>
                    <span className={`${s.planIcon} ${settings.isPro ? "" : s.planIconFree}`}>{settings.isPro ? "PRO" : "FREE"}</span>
                    <span className={s.optionText}>
                      <b>{settings.isPro ? "Pro · lifetime" : "Free"}</b>
                      <span>
                        {settings.isPro
                          ? settings.upgradedAt
                            ? `Since ${new Date(settings.upgradedAt).toLocaleDateString("en", { dateStyle: "medium" })}. Nothing to renew.`
                            : "Nothing to renew."
                          : "Every core block, free forever."}
                      </span>
                      {!settings.isPro && (
                        <Link href="/invite" className={s.inviteLink}>
                          Or invite 5 friends and get Pro free →
                        </Link>
                      )}
                    </span>
                  </div>
                  {settings.isPro ? (
                    <Link href="/editor/analytics" className={`${m.btn} ${m.btnGhost} ${s.small}`}>
                      Analytics
                    </Link>
                  ) : (
                    <button type="button" onClick={() => openUpgrade()} className={`${m.btn} ${m.btnAccent} ${s.small}`}>
                      Get Pro — ${PREMIUM_PRICE}
                    </button>
                  )}
                </div>
              </section>

              <section className={s.card} id="account" aria-labelledby="account-title">
                <div className={s.head}>
                  <h2 id="account-title">Account</h2>
                </div>
                <div className={s.body}>
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b>Email</b>
                      <span>{settings.email ?? "No email"}</span>
                    </span>
                    {!emailOpen && (
                      <button type="button" className={`${m.btn} ${m.btnGhost} ${s.small}`} onClick={() => setEmailOpen(true)}>
                        Change
                      </button>
                    )}
                  </div>
                  {emailOpen && (
                    <form className={s.inline} onSubmit={changeEmail}>
                      <input
                        className={s.input}
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@example.com"
                        aria-label="New email"
                        autoFocus
                      />
                      <button type="submit" className={`${m.btn} ${m.btnDark} ${s.small}`} disabled={emailBusy}>
                        {emailBusy && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                        Send link
                      </button>
                      <button type="button" className={s.textButton} onClick={() => setEmailOpen(false)}>
                        Cancel
                      </button>
                    </form>
                  )}
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b>Password</b>
                      <span>{settings.hasPassword ? "Used to log in with your email." : "You log in with GitHub. Add a password to log in with email too."}</span>
                    </span>
                    <Link href="/auth/update-password" className={`${m.btn} ${m.btnGhost} ${s.small}`}>
                      {settings.hasPassword ? "Change" : "Set password"}
                    </Link>
                  </div>
                  <div className={s.option}>
                    <span className={s.optionText}>
                      <b>GitHub</b>
                      <span>
                        {settings.githubUsername ? `Connected as @${settings.githubUsername}` : "Not connected"}
                      </span>
                    </span>
                  </div>
                </div>
              </section>

              <section className={`${s.card} ${s.danger}`} id="delete" aria-labelledby="delete-title">
                <div className={s.head}>
                  <h2 id="delete-title">Delete account</h2>
                  <p>Removes your page, blocks, uploads, revenue connections and analytics. This can&apos;t be undone.</p>
                </div>
                {!deleteOpen ? (
                  <div className={s.foot}>
                    <span className={s.muted}>You&apos;ll type your username to confirm.</span>
                    <button type="button" className={`${m.btn} ${s.deleteButton} ${s.small}`} onClick={() => setDeleteOpen(true)}>
                      Delete account
                    </button>
                  </div>
                ) : (
                  <form className={s.body} onSubmit={deleteAccount}>
                    <label className={s.field}>
                      <span className={m.lbl}>Type {settings.username} to confirm</span>
                      <input
                        className={s.input}
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        autoCapitalize="none"
                        autoComplete="off"
                        spellCheck={false}
                        autoFocus
                      />
                    </label>
                    <div className={s.actions}>
                      <button type="button" className={s.textButton} onClick={() => setDeleteOpen(false)}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`${m.btn} ${s.deleteButton} ${s.small}`}
                        disabled={deleting || deleteConfirm.trim().toLowerCase() !== settings.username.toLowerCase()}
                      >
                        {deleting && <Loader2 size={14} className={s.spin} aria-hidden="true" />}
                        Delete forever
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className={`${s.toast} ${toast.ok ? "" : s.toastBad}`} role="status">
          {toast.ok ? <Check size={14} aria-hidden="true" /> : <AlertTriangle size={14} aria-hidden="true" />}
          {toast.text}
        </div>
      )}
      {upgradeDialog}
    </div>
  );
}
