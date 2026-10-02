import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { loadConnection, syncConnection } from "@/app/lib/revenue/service";

const MIN_INTERVAL_MS = 10 * 60 * 1000;

// POST { blockId }: refresh numbers now (at most every 10 minutes).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockId } = (await request.json().catch(() => ({}))) as { blockId?: unknown };
  if (typeof blockId !== "string" || !blockId) {
    return NextResponse.json({ error: "Missing block" }, { status: 400 });
  }

  const connection = await loadConnection(user.id, blockId).catch(() => null);
  if (!connection) return NextResponse.json({ error: "Not connected" }, { status: 404 });

  if (connection.synced_at && Date.now() - new Date(connection.synced_at).getTime() < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: "Updated a few minutes ago. Try again shortly." }, { status: 429 });
  }

  const result = await syncConnection(connection);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 502 });
  return NextResponse.json({ connection: result.data });
}
