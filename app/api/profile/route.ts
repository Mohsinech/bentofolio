import { NextResponse } from "next/server";
import { activateBetaFreeProCode } from "@/app/lib/beta-codes";
import { createClient } from "@/app/lib/supabase/server";
import {
  checkUsernameFormat,
  normalizeUsername,
  statusFromDatabaseError,
  usernameMessage,
} from "@/app/lib/usernames";

function normalizeTheme(theme: unknown) {
  return theme === "light" ? "light" : "dark";
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// Postgres "undefined_table": migration 011 has not been run.
const UNDEFINED_TABLE = "42P01";
// Postgres "undefined_column": migration 013 has not been run.
const UNDEFINED_COLUMN = "42703";

function isLayoutVersion(value: unknown): value is number {
  return value === 1 || value === 2;
}

async function saveDraft(
  supabase: ServerClient,
  userId: string,
  fields: { layout?: unknown; content?: unknown; theme?: unknown; layoutVersion?: unknown }
): Promise<"ok" | "no_draft_table" | { error: string }> {
  // Fill any field that wasn't sent from the current draft, or from the live
  // page when there is no draft yet, so a partial save never blanks the rest.
  const { data: existing, error: draftReadError } = await supabase
    .from("profile_drafts")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (draftReadError) {
    if (draftReadError.code === UNDEFINED_TABLE) return "no_draft_table";
    return { error: draftReadError.message };
  }

  let base = existing;
  if (!base) {
    const { data: live, error: liveError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (liveError) return { error: liveError.message };
    base = live;
  }

  const row: Record<string, unknown> = {
    profile_id: userId,
    layout: fields.layout !== undefined ? fields.layout : base?.layout ?? [],
    content: fields.content !== undefined ? fields.content : base?.content ?? {},
    theme: normalizeTheme(fields.theme !== undefined ? fields.theme : base?.theme),
    updated_at: new Date().toISOString(),
  };
  const version = isLayoutVersion(fields.layoutVersion) ? fields.layoutVersion : base?.layout_version;
  if (isLayoutVersion(version)) row.layout_version = version;

  let { error } = await supabase.from("profile_drafts").upsert(row, { onConflict: "profile_id" });

  // Migration 013 not applied yet: save without the version.
  if (error?.code === UNDEFINED_COLUMN && "layout_version" in row) {
    delete row.layout_version;
    ({ error } = await supabase.from("profile_drafts").upsert(row, { onConflict: "profile_id" }));
  }

  return error ? { error: error.message } : "ok";
}

// GET: Fetch current user's profile (or create one if it doesn't exist)
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try to get existing profile
  const { data: existingProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  let data = existingProfile;

  // If profile doesn't exist, create one
  if (error && error.code === "PGRST116") {
    const username =
      user.user_metadata?.username ||
      user.user_metadata?.preferred_username ||
      user.user_metadata?.user_name ||
      `user_${user.id.slice(0, 8)}`;

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username,
        theme: "dark",
        layout: [],
        content: {},
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const fallbackUsername = `user_${user.id.slice(0, 8)}`;
        const { data: fallbackProfile, error: fallbackError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username: fallbackUsername,
            theme: "dark",
            layout: [],
            content: {},
          })
          .select()
          .single();

        if (fallbackError) {
          return NextResponse.json(
            { error: fallbackError.message },
            { status: 500 }
          );
        }

        data = fallbackProfile;
      } else {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    } else {
      data = newProfile;
    }
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const betaCouponCode = user.user_metadata?.beta_coupon_code;
  if (data && !data.is_pro && betaCouponCode) {
    const activation = await activateBetaFreeProCode({
      userId: user.id,
      code: betaCouponCode,
      username:
        user.user_metadata?.username ||
        user.user_metadata?.preferred_username ||
        user.user_metadata?.user_name ||
        data.username,
    });

    if (activation.activated) {
      const { data: upgradedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (upgradedProfile) {
        data = upgradedProfile;
      }
    }
  }

  // The unpublished draft, if any. Missing table (migration 011 not applied
  // yet) or no draft both mean "the editor starts from the live page".
  const { data: draft } = await supabase
    .from("profile_drafts")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return NextResponse.json({ ...data, draft: draft ?? null });
}

// PUT: Update current user's profile.
// layout / content / theme are saved to the private draft; the live page only
// changes on POST /api/profile/publish. Everything else (username, custom
// domain, avatar) is a setting and applies immediately.
export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { layout, content, theme, layoutVersion, username, customDomain, avatarUrl } = body as {
    layout?: unknown;
    content?: unknown;
    theme?: unknown;
    layoutVersion?: unknown;
    username?: string;
    customDomain?: string | null;
    avatarUrl?: string | null;
  };

  // Build update object (only include fields that were provided)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const touchesDraft =
    layout !== undefined || content !== undefined || theme !== undefined;

  if (touchesDraft) {
    const draftResult = await saveDraft(supabase, user.id, { layout, content, theme, layoutVersion });

    if (draftResult === "no_draft_table") {
      // Migration 011 not applied yet: keep the old behaviour and save live.
      if (layout !== undefined) updates.layout = layout;
      if (content !== undefined) updates.content = content;
      if (theme !== undefined) updates.theme = normalizeTheme(theme);
      if (isLayoutVersion(layoutVersion)) updates.layout_version = layoutVersion;
    } else if (draftResult !== "ok") {
      return NextResponse.json({ error: draftResult.error }, { status: 500 });
    }
  }
  if (avatarUrl !== undefined) {
    if (
      avatarUrl !== null &&
      avatarUrl !== "" &&
      typeof avatarUrl === "string" &&
      avatarUrl.length > 8_000_000
    ) {
      return NextResponse.json(
        { error: "Avatar image is too large" },
        { status: 400 }
      );
    }
    updates.avatar_url = avatarUrl || null;
  }
  if (username !== undefined) {
    // Format is checked here for a quick answer; reserved, taken and held
    // names are rejected by the database trigger (mapped below).
    const name = normalizeUsername(username);
    const formatStatus = checkUsernameFormat(name);
    if (formatStatus !== "ok") {
      return NextResponse.json(
        { error: usernameMessage(formatStatus), usernameStatus: formatStatus },
        { status: 400 }
      );
    }
    updates.username = name;
  }
  if (customDomain !== undefined) {
    const { data: profileAccess, error: accessError } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    if (accessError) {
      return NextResponse.json(
        { error: accessError.message },
        { status: 500 }
      );
    }

    const hasCustomDomainAccess = Boolean(profileAccess?.is_pro);
    const isAddingCustomDomain = customDomain !== null && customDomain !== "";

    if (isAddingCustomDomain && !hasCustomDomainAccess) {
      return NextResponse.json(
        { error: "Custom domains require Pro" },
        { status: 403 }
      );
    }

    // Validate custom domain format (allow null to remove)
    if (isAddingCustomDomain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        return NextResponse.json(
          { error: "Invalid domain format (e.g., john.dev)" },
          { status: 400 }
        );
      }
    }
    updates.custom_domain = customDomain || null;
  }

  // Only touch the live profile row when a setting (or the pre-migration
  // fallback) actually changed something.
  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    const usernameStatus = statusFromDatabaseError(error.message);
    if (usernameStatus) {
      return NextResponse.json(
        { error: usernameMessage(usernameStatus), usernameStatus },
        { status: usernameStatus === "limit" ? 429 : 409 }
      );
    }
    // Unique constraint violation (username taken in a race)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: usernameMessage("taken"), usernameStatus: "taken" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
