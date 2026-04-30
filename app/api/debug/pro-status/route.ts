import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { isAdmin } from "@/app/lib/config";

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

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_pro, theme")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    user_id: user.id,
    profile,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { is_pro } = body;
  const githubUsername = getGithubUsername(user) as string | null;

  if (!isAdmin(user.email, githubUsername)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (typeof is_pro !== "boolean") {
    return NextResponse.json(
      { error: "is_pro must be a boolean" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_pro })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, is_pro });
}
