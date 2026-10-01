import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import {
  checkUsernameFormat,
  normalizeUsername,
  usernameMessage,
  type UsernameStatus,
} from "@/app/lib/usernames";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function checkInDatabase(
  supabase: ServerClient,
  name: string,
  profileId: string | null
): Promise<UsernameStatus | null> {
  const { data, error } = await supabase.rpc("check_username", {
    p_username: name,
    p_profile_id: profileId,
  });
  if (error) {
    console.error("Username check failed:", error);
    return null;
  }
  return data as UsernameStatus;
}

// GET /api/username/check?u=mira
// Works signed in or out. Signed in, your own current and old names count as
// available to you.
export async function GET(request: Request) {
  const name = normalizeUsername(new URL(request.url).searchParams.get("u"));

  const formatStatus = checkUsernameFormat(name);
  if (formatStatus !== "ok") {
    return NextResponse.json({
      username: name,
      status: formatStatus,
      available: false,
      message: usernameMessage(formatStatus),
      suggestions: [],
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profileId = user?.id ?? null;

  const status = await checkInDatabase(supabase, name, profileId);
  if (!status) {
    return NextResponse.json(
      { error: "Couldn't check that name right now" },
      { status: 503 }
    );
  }

  // Offer a few free alternatives when the name isn't available.
  const suggestions: string[] = [];
  if (status === "taken" || status === "held" || status === "reserved") {
    const base = name.replace(/[-_]+$/, "").slice(0, 24);
    const candidates = [`${base}-studio`, `${base}-dev`, `${base}${new Date().getFullYear() % 100}`];
    for (const candidate of candidates) {
      if (checkUsernameFormat(candidate) !== "ok") continue;
      if ((await checkInDatabase(supabase, candidate, profileId)) === "ok") {
        suggestions.push(candidate);
      }
    }
  }

  return NextResponse.json({
    username: name,
    status,
    available: status === "ok",
    message: usernameMessage(status),
    suggestions,
  });
}
