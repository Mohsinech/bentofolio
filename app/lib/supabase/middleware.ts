import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const appHost = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
  const isAppHost =
    !host ||
    host === appHost ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".vercel.app");

  if (!isAppHost && request.nextUrl.pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("custom_domain", host.replace(/^www\./, ""))
      .eq("is_pro", true)
      .single();

    if (profile?.username) {
      const url = request.nextUrl.clone();
      url.pathname = `/${profile.username}`;
      return NextResponse.rewrite(url);
    }
  }

  // Only the app needs the session checked here. Public pages (profiles,
  // landing, pricing, link previews) skip the round trip to Supabase, which
  // makes them faster; the browser keeps its own session fresh.
  const path = request.nextUrl.pathname;
  const needsSession = ["/auth", "/editor", "/settings", "/onboarding", "/api", "/invite", "/admin"].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
  if (!needsSession) {
    return supabaseResponse;
  }

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes check
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPasswordUpdatePage =
    request.nextUrl.pathname === "/auth/update-password";
  // Pages that need a signed-in account.
  const isEditorPage = ["/editor", "/settings", "/onboarding", "/upgrade"].some((path) => request.nextUrl.pathname.startsWith(path));

  // Redirect to login if accessing editor without auth
  if (isEditorPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect to editor if logged in and accessing auth pages
  if (isAuthPage && user && !isPasswordUpdatePage) {
    const url = request.nextUrl.clone();
    url.pathname = "/editor";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
