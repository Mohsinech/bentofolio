import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { origin, searchParams } = new URL(request.url);

  // Get the current user to check if they're logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in, redirect to login
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  try {
    // User is already logged in with email, now link GitHub account
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback?next=/editor`,
        scopes: "read:user user:email",
      },
    });

    if (error) {
      console.error("GitHub linking error:", error.message, error);

      // More specific error messages
      if (error.message?.includes("already linked")) {
        return NextResponse.redirect(
          `${origin}/editor?error=github_already_linked`
        );
      }
      if (error.message?.includes("not enabled")) {
        return NextResponse.redirect(
          `${origin}/editor?error=github_not_enabled`
        );
      }

      return NextResponse.redirect(
        `${origin}/editor?error=github_link_failed&message=${encodeURIComponent(
          error.message
        )}`
      );
    }

    if (data?.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.redirect(`${origin}/editor`);
  } catch (error: any) {
    console.error("GitHub linking exception:", error);
    return NextResponse.redirect(
      `${origin}/editor?error=github_link_exception&message=${encodeURIComponent(
        error.message || "Unknown error"
      )}`
    );
  }
}
