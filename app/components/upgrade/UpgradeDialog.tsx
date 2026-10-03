"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Loader2, X } from "lucide-react";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { startCheckout } from "@/app/lib/checkout-client";
import { PRO_FEATURES, proItems, type ProFeature } from "@/app/lib/pro-features";
import s from "./upgrade.module.css";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  // The locked thing that was clicked; it leads the dialog.
  feature?: ProFeature | null;
}

// "Get Pro" in place: what you get, the price, an optional code, then
// Lemon Squeezy's checkout on top of the page.
export function UpgradeDialog({ open, onClose, feature }: UpgradeDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      dialog.showModal();
      // Focus the heading, so no button looks pre-selected.
      dialog.querySelector<HTMLElement>("h2")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function checkout() {
    setBusy(true);
    setError(null);
    const message = await startCheckout(code.trim().toUpperCase());
    // The overlay is open (or the page is leaving): this dialog is done.
    if (!message) {
      onClose();
      setBusy(false);
      return;
    }
    setError(message);
    setBusy(false);
  }

  const lead = feature ? PRO_FEATURES[feature] : null;

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby="upgrade-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop (outside the panel) closes it.
        if (event.target === ref.current && !busy) onClose();
      }}
    >
      <div className={s.panel}>
        <button type="button" className={s.close} onClick={onClose} aria-label="Close" disabled={busy}>
          <X size={16} aria-hidden="true" />
        </button>

        <p className={s.eyebrow}>Pro · lifetime beta</p>
        <h2 id="upgrade-title" className={s.title} tabIndex={-1}>
          {lead ? lead.title : "Everything, once."}
        </h2>
        <p className={s.line}>{lead ? lead.line : "Your domain, your numbers, richer media. Pay once, keep it."}</p>

        <div className={s.price}>
          <strong>${PREMIUM_PRICE}</strong>
          <span>once · no subscription</span>
        </div>

        <ul className={s.list}>
          {proItems(feature).map(({ key, item }) => (
            <li key={key} className={key === feature ? s.lead : undefined}>
              <Check size={15} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        {showCode ? (
          <label className={s.code}>
            <span>Code</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="BETA-…"
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
          </label>
        ) : (
          <button type="button" className={s.codeToggle} onClick={() => setShowCode(true)}>
            Have a code?
          </button>
        )}

        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}

        <div className={s.actions}>
          <button type="button" className={s.primary} onClick={checkout} disabled={busy}>
            {busy ? <Loader2 size={16} className={s.spin} aria-label="Opening checkout" /> : null}
            {busy ? "Opening checkout" : code.trim() ? "Apply code" : `Get Pro — $${PREMIUM_PRICE}`}
          </button>
          <button type="button" className={s.secondary} onClick={onClose} disabled={busy}>
            Not now
          </button>
        </div>
        <p className={s.foot}>Paid securely through Lemon Squeezy. Pro turns on as soon as it goes through.</p>
      </div>
    </dialog>
  );
}

// For pages with a locked feature or two:
//   const { openUpgrade, upgradeDialog } = useUpgrade();
//   <button onClick={() => openUpgrade("analytics")}>…</button>
//   {upgradeDialog}
export function useUpgrade(): { openUpgrade: (feature?: ProFeature) => void; upgradeDialog: ReactNode } {
  const [state, setState] = useState<{ open: boolean; feature: ProFeature | null }>({ open: false, feature: null });
  const openUpgrade = useCallback((feature?: ProFeature) => setState({ open: true, feature: feature ?? null }), []);
  const close = useCallback(() => setState((current) => ({ ...current, open: false })), []);
  return {
    openUpgrade,
    upgradeDialog: <UpgradeDialog open={state.open} onClose={close} feature={state.feature} />,
  };
}
