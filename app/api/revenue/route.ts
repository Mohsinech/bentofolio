import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { RevenueError } from "@/app/lib/revenue/common";
import { isEncryptionConfigured } from "@/app/lib/revenue/crypto";
import {
  connectRevenue,
  disconnectRevenue,
  isProvider,
  listConnections,
  ownsSaasBlock,
} from "@/app/lib/revenue/service";

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET: your connections (numbers and status only, never keys).
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ connections: await listConnections(user.id) });
  } catch {
    // Table missing (migration 014 not run) or admin client not configured.
    return NextResponse.json({ connections: [] });
  }
}

// POST { blockId, provider, apiKey }: connect a payment provider to a SaaS block.
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: "Revenue connections aren't set up on this site yet." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { blockId, provider, apiKey, storeId } = body as {
    blockId?: unknown;
    provider?: unknown;
    apiKey?: unknown;
    storeId?: unknown;
  };

  if (typeof blockId !== "string" || !blockId || !isProvider(provider) || typeof apiKey !== "string" || !apiKey.trim()) {
    return NextResponse.json({ error: "Choose a provider and paste your API key." }, { status: 400 });
  }
  if (!(await ownsSaasBlock(user.id, blockId))) {
    return NextResponse.json(
      { error: "Save your draft first, then connect." },
      { status: 409 }
    );
  }

  try {
    const connection = await connectRevenue(
      user.id,
      blockId,
      provider,
      apiKey,
      typeof storeId === "string" && storeId ? storeId : null
    );
    return NextResponse.json({ connection });
  } catch (error) {
    if (error instanceof RevenueError) {
      const status = error.code === "network" || error.code === "provider" ? 502 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code, stores: error.details?.stores },
        { status: error.code === "choose_store" ? 409 : status }
      );
    }
    console.error("Revenue connect failed:", error);
    return NextResponse.json({ error: "Couldn't connect. Try again." }, { status: 500 });
  }
}

// DELETE ?blockId=…: disconnect and delete the stored key.
export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blockId = new URL(request.url).searchParams.get("blockId");
  if (!blockId) return NextResponse.json({ error: "Missing block" }, { status: 400 });
  try {
    await disconnectRevenue(user.id, blockId);
  } catch {
    // Nothing stored, nothing to delete.
  }
  return NextResponse.json({ disconnected: true });
}
