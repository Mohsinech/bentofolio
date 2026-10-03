import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import { isAdmin } from "@/app/lib/config";
import { aggregate, isBot, parsePeriod, type AnalyticsRow } from "@/app/lib/analytics";

// Service-role client, created on first use (creating it at module load
// would fail builds that don't have the Supabase variables).
let adminClient: ReturnType<typeof createAdminClient> | null = null;
function getAdmin() {
  adminClient ??= createAdminClient();
  return adminClient;
}

function appHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev").hostname.replace(/^www\./, "");
  } catch {
    return "bentofolio.dev";
  }
}

// Anonymous daily visitor id: can't be reversed, changes every day.
function visitorHash(ip: string, userAgent: string, day: string) {
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "bentofolio";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 32);
}

function clip(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

// POST: record a view or a link click. Every page is tracked (the numbers
// are shown to Pro owners); bots and the owner's own visits are skipped.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const username = clip(body.username, 64);
    const event = body.event;
    if (!username || (event !== "view" && event !== "link_click")) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || clip(body.userAgent, 400) || "";
    if (isBot(userAgent)) return NextResponse.json({ tracked: false, reason: "bot" });

    const { data: profile } = await getAdmin().from("profiles").select("id").eq("username", username).maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Don't count owners looking at their own page.
    try {
      const {
        data: { user },
      } = await (await createClient()).auth.getUser();
      if (user?.id === profile.id) return NextResponse.json({ tracked: false, reason: "owner" });
    } catch {
      // Not signed in.
    }

    const now = new Date();
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "";
    const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
    // Columns every version of the table has.
    const base = {
      profile_id: profile.id,
      event_type: event,
      referrer: clip(body.referrer, 500),
      user_agent: userAgent.slice(0, 400),
      created_at: now.toISOString(),
    };
    const detail = {
      clicked_url: event === "link_click" ? clip(body.clicked_url, 500) : null,
      country: /^[A-Z]{2}$/.test(country) ? country : null,
      visitor_hash: ip ? visitorHash(ip, userAgent, now.toISOString().slice(0, 10)) : null,
      block: event === "link_click" ? clip(body.block, 32) : null,
    };

    let { error } = await getAdmin().from("profile_analytics").insert({ ...base, ...detail });
    // Before migration 017 the detail columns (and on some databases
    // clicked_url) don't exist yet.
    if (error && /column|schema cache/i.test(error.message)) {
      ({ error } = await getAdmin().from("profile_analytics").insert(base));
    }
    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
    }
    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET ?username=&period=7d|30d|90d: the dashboard. Pro owners get
// everything; free owners get the headline numbers only.
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const period = parsePeriod(searchParams.get("period"));
    if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

    const { data: profile } = await getAdmin().from("profiles").select("id, is_pro").eq("username", username).maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const github = user.identities?.find((identity) => identity.provider === "github");
    const githubUsername = (github?.identity_data?.user_name as string | undefined) ?? null;
    if (profile.id !== user.id && !isAdmin(user.email, githubUsername)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Current period plus the one before it, for the comparison.
    const since = new Date(Date.now() - (period * 2 + 1) * 86_400_000).toISOString();
    const full = "event_type, created_at, referrer, user_agent, clicked_url, country, visitor_hash, block";
    // Typed loosely: the fallback query below returns fewer columns.
    let result: { data: AnalyticsRow[] | null; error: { message: string } | null } = await getAdmin()
      .from("profile_analytics")
      .select(full)
      .eq("profile_id", profile.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100_000);
    if (result.error && /column|schema cache/i.test(result.error.message)) {
      // Whatever columns this database has (see migration 017).
      result = await getAdmin()
        .from("profile_analytics")
        .select("*")
        .eq("profile_id", profile.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100_000);
    }
    if (result.error) {
      console.error("Analytics fetch error:", result.error);
      // Owner-only endpoint, so the database's reason is safe to show.
      return NextResponse.json({ error: `Couldn't load analytics: ${result.error.message}` }, { status: 500 });
    }

    const dashboard = aggregate(result.data ?? [], period, new Date(), appHost());
    if (!profile.is_pro) {
      return NextResponse.json({
        locked: true,
        period,
        totals: { views: dashboard.totals.views, visitors: dashboard.totals.visitors },
      });
    }
    return NextResponse.json({ locked: false, ...dashboard });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
