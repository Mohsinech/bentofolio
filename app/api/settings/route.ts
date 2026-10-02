import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// GET: everything the Settings page shows. PUT: display options.

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Couldn't load your settings." }, { status: 500 });

  const providers = (user.identities ?? []).map((identity) => identity.provider);
  const github = user.identities?.find((identity) => identity.provider === "github");

  return NextResponse.json({
    username: data.username,
    email: user.email ?? null,
    hasPassword: providers.includes("email"),
    githubUsername: (github?.identity_data?.user_name as string | undefined) ?? null,
    isPro: Boolean(data.is_pro),
    upgradedAt: data.upgraded_at ?? null,
    customDomain: data.custom_domain ?? null,
    // Columns from migration 016; defaults until it has run.
    ready: "default_view" in data,
    defaultView: data.default_view === "cv" ? "cv" : "grid",
    discoverable: data.discoverable !== false,
    showMadeWith: Boolean(data.show_made_with),
  });
}

export async function PUT(request: Request) {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (body.defaultView !== undefined) {
    if (body.defaultView !== "grid" && body.defaultView !== "cv") {
      return NextResponse.json({ error: "Default view must be grid or cv." }, { status: 400 });
    }
    updates.default_view = body.defaultView;
  }
  if (body.discoverable !== undefined) updates.discoverable = Boolean(body.discoverable);
  if (body.showMadeWith !== undefined) updates.show_made_with = Boolean(body.showMadeWith);
  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) {
    const missing = /column|schema cache/i.test(error.message);
    return NextResponse.json(
      { error: missing ? "Settings aren't ready yet: run migration 016 in Supabase." : "Couldn't save. Try again." },
      { status: missing ? 503 : 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
