import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { origin } = new URL(request.url);

  // Get the current user to check if they're logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in, redirect to login
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  // User is already logged in with email, now link GitHub account
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=/editor`,
    },
  });

  if (error) {
    console.error("GitHub linking error:", error);
    return NextResponse.redirect(`${origin}/editor?error=github_link_failed`);
  }

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(`${origin}/editor`);
}
