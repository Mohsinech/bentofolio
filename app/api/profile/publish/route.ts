import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// POST: publish the current user's draft to their live page.
// Copies profile_drafts (layout, content, theme) into profiles, then removes
// the draft so the editor and the live page agree again.
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: draft, error: draftError } = await supabase
    .from("profile_drafts")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (draftError) {
    // Migration 011 not applied: saves already go straight to the live page.
    if (draftError.code === "42P01") {
      return NextResponse.json({ published: false, publishedAt: null });
    }
    return NextResponse.json({ error: draftError.message }, { status: 500 });
  }

  const publishedAt = new Date().toISOString();

  if (!draft) {
    // Nothing to publish: the live page already matches.
    return NextResponse.json({ published: false, publishedAt: null });
  }

  const live: Record<string, unknown> = {
    layout: draft.layout,
    content: draft.content,
    theme: draft.theme,
    updated_at: publishedAt,
    published_at: publishedAt,
  };
  if (typeof draft.layout_version === "number") live.layout_version = draft.layout_version;

  const { error: publishError } = await supabase
    .from("profiles")
    .update(live)
    .eq("id", user.id);

  if (publishError) {
    return NextResponse.json({ error: publishError.message }, { status: 500 });
  }

  // Only remove the draft if nobody saved a newer one while publishing
  // (another tab, for example). A leftover draft is harmless: it matches the
  // live page or holds newer edits.
  const { error: cleanupError } = await supabase
    .from("profile_drafts")
    .delete()
    .eq("profile_id", user.id)
    .eq("updated_at", draft.updated_at);

  if (cleanupError) {
    console.error("Publish: draft cleanup failed:", cleanupError);
  }

  return NextResponse.json({ published: true, publishedAt });
}
