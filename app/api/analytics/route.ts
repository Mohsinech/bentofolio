import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import { isAdmin } from "@/app/lib/config";

// Service-role client, created on first use. Creating it when the module
// loads would run at build time and fail the whole build whenever the
// Supabase variables are missing (for example in Preview deployments).
let adminClient: ReturnType<typeof createAdminClient> | null = null;
function getAdmin() {
  adminClient ??= createAdminClient();
  return adminClient;
}

function getAppHostname() {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev"
    ).hostname.replace(/^www\./, "");
  } catch {
    return "bentofolio.dev";
  }
}

function normalizeReferrer(referrer?: string | null) {
  if (!referrer) return "Direct";

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace(/^www\./, "");
    const appHostname = getAppHostname();

    if (hostname === appHostname || hostname.endsWith(`.${appHostname}`)) {
      return "Direct";
    }

    return hostname;
  } catch {
    return referrer.length > 42 ? `${referrer.slice(0, 42)}...` : referrer;
  }
}

function getGithubUsername(user: {
  identities?: Array<{
    provider?: string;
    identity_data?: Record<string, unknown>;
  }>;
  user_metadata?: Record<string, unknown>;
}) {
  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === "github"
  );

  return (
    githubIdentity?.identity_data?.user_name ||
    githubIdentity?.identity_data?.preferred_username ||
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const { username, event, referrer, userAgent } = await request.json();

    if (!username || !event) {
      return NextResponse.json(
        { error: "Username and event are required" },
        { status: 400 }
      );
    }

    if (!["view", "link_click"].includes(event)) {
      return NextResponse.json(
        { error: "Unsupported analytics event" },
        { status: 400 }
      );
    }

    // Get the profile to verify it exists
    const { data: profile } = await getAdmin()
      .from("profiles")
      .select("id, is_pro")
      .eq("username", username)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Analytics remains tied to upgraded profiles while the product is simplified.
    if (!profile.is_pro) {
      return NextResponse.json({ tracked: false, reason: "free_user" });
    }

    // Insert analytics event
    const { error } = await getAdmin().from("profile_analytics").insert({
      profile_id: profile.id,
      event_type: event,
      referrer: referrer || null,
      user_agent: userAgent || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json(
        { error: "Failed to track event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d, all

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Get the profile
    const { data: profile } = await getAdmin()
      .from("profiles")
      .select("id, is_pro")
      .eq("username", username)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const githubUsername = getGithubUsername(user) as string | null;
    const canReadAnalytics =
      profile.id === user.id || isAdmin(user.email, githubUsername);

    if (!canReadAnalytics) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!profile.is_pro) {
      return NextResponse.json(
        { error: "Analytics is a Pro feature" },
        { status: 403 }
      );
    }

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get analytics data
    const { data: analytics, error } = await getAdmin()
      .from("profile_analytics")
      .select("event_type, referrer, created_at")
      .eq("profile_id", profile.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Analytics fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // Aggregate data
    const totalViews = analytics.filter((a) => a.event_type === "view").length;
    const totalClicks = analytics.filter(
      (a) => a.event_type === "link_click"
    ).length;
    const uniqueReferrers = [
      ...new Set(analytics.map((a) => normalizeReferrer(a.referrer))),
    ];

    // Group by date for charts
    const viewsByDate: Record<string, number> = {};
    const clicksByDate: Record<string, number> = {};
    analytics
      .filter((a) => a.event_type === "view")
      .forEach((a) => {
        const date = new Date(a.created_at).toISOString().split("T")[0];
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });
    analytics
      .filter((a) => a.event_type === "link_click")
      .forEach((a) => {
        const date = new Date(a.created_at).toISOString().split("T")[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });

    const dates: string[] = [];
    if (period === "all") {
      const uniqueDates = new Set([
        ...Object.keys(viewsByDate),
        ...Object.keys(clicksByDate),
      ]);
      dates.push(...Array.from(uniqueDates).sort());
    } else {
      const dayCount = period === "30d" ? 30 : 7;
      for (let index = dayCount - 1; index >= 0; index -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - index);
        dates.push(date.toISOString().split("T")[0]);
      }
    }

    // Referrer breakdown
    const referrerCounts: Record<string, number> = {};
    analytics.forEach((a) => {
      const ref = normalizeReferrer(a.referrer);
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    return NextResponse.json({
      totalViews,
      totalClicks,
      uniqueReferrers,
      viewsByDate,
      clicksByDate,
      recentViews: dates.map((date) => ({ date, count: viewsByDate[date] || 0 })),
      recentClicks: dates.map((date) => ({
        date,
        count: clicksByDate[date] || 0,
      })),
      referrerBreakdown: Object.entries(referrerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topReferrers: Object.entries(referrerCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
