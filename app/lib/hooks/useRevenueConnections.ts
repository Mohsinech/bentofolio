"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { VerifiedRevenue } from "@/app/lib/revenue/overlay";

// Revenue connections for the signed-in person, shared by the editor's
// sidebar and canvas so connecting in one updates the other.

export interface RevenueConnection extends VerifiedRevenue {
  key_hint: string;
  status: "ok" | "error";
  last_error: string | null;
}

type Result = { ok: true } | { ok: false; message: string };

let connections: RevenueConnection[] = [];
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setConnections(next: RevenueConnection[]) {
  connections = next;
  emit();
}

function upsert(connection: RevenueConnection) {
  setConnections([...connections.filter((c) => c.block_id !== connection.block_id), connection]);
}

async function errorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data && typeof data.error === "string" ? data.error : fallback;
}

export function loadRevenueConnections(force = false): Promise<void> {
  if (loaded && !force) return Promise.resolve();
  if (loading) return loading;
  loading = fetch("/api/revenue")
    .then((r) => (r.ok ? r.json() : { connections: [] }))
    .then((data) => {
      loaded = true;
      setConnections(Array.isArray(data.connections) ? data.connections : []);
    })
    .catch(() => {
      loaded = true;
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export async function connectRevenue(
  blockId: string,
  provider: "stripe" | "lemonsqueezy",
  apiKey: string
): Promise<Result> {
  try {
    const response = await fetch("/api/revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, provider, apiKey }),
    });
    if (!response.ok) return { ok: false, message: await errorMessage(response, "Couldn't connect. Try again.") };
    const data = await response.json();
    upsert(data.connection);
    return { ok: true };
  } catch {
    return { ok: false, message: "You seem to be offline. Try again." };
  }
}

export async function refreshRevenue(blockId: string): Promise<Result> {
  try {
    const response = await fetch("/api/revenue/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId }),
    });
    if (!response.ok) {
      const message = await errorMessage(response, "Couldn't refresh. Try again later.");
      if (response.status === 502) await loadRevenueConnections(true);
      return { ok: false, message };
    }
    const data = await response.json();
    upsert(data.connection);
    return { ok: true };
  } catch {
    return { ok: false, message: "You seem to be offline. Try again." };
  }
}

export async function disconnectRevenue(blockId: string): Promise<Result> {
  try {
    const response = await fetch(`/api/revenue?blockId=${encodeURIComponent(blockId)}`, { method: "DELETE" });
    if (!response.ok) return { ok: false, message: await errorMessage(response, "Couldn't disconnect. Try again.") };
    setConnections(connections.filter((c) => c.block_id !== blockId));
    return { ok: true };
  } catch {
    return { ok: false, message: "You seem to be offline. Try again." };
  }
}

export function useRevenueConnections(): RevenueConnection[] {
  useEffect(() => {
    loadRevenueConnections();
  }, []);
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => connections,
    () => connections
  );
}
