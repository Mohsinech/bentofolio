import { NextResponse } from "next/server";
import { activateBetaFreeProCode } from "@/app/lib/beta-codes";
import { createClient } from "@/app/lib/supabase/server";

function normalizeTheme(theme: unknown) {
  return theme === "light" ? "light" : "dark";
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

  return NextResponse.json(data);
}

// PUT: Update current user's profile
export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { layout, content, theme, username, customDomain, avatarUrl } = body;

  // Build update object (only include fields that were provided)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (layout !== undefined) updates.layout = layout;
  if (content !== undefined) updates.content = content;
  if (theme !== undefined) updates.theme = normalizeTheme(theme);
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
    // Validate username
    if (!/^[a-zA-Z0-9_-]+$/.test(username) || username.length < 3) {
      return NextResponse.json(
        { error: "Invalid username format" },
        { status: 400 }
      );
    }
    updates.username = username;
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

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    // Handle unique constraint violation (username taken)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
