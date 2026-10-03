import { NextResponse } from "next/server";
import { getProfileByUsername } from "@/app/lib/supabase/profiles";
import { summarizeProfile } from "@/app/lib/profile-summary";

// A page's profile picture as an image file. Pictures uploaded in the editor
// are stored inside the page data; this serves them by URL so lists like
// Discover don't have to inline them. Cached for an hour.
export const revalidate = 3600;

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return new NextResponse(null, { status: 404 });

  const avatar = summarizeProfile(profile.username, Object.values(profile.content || {}), profile.avatarUrl).avatar;
  if (!avatar) return new NextResponse(null, { status: 404 });

  const match = avatar.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif|svg\+xml));base64,(.+)$/);
  if (match) {
    return new NextResponse(Buffer.from(match[2], "base64"), {
      headers: {
        "Content-Type": match[1],
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        // An uploaded SVG can't run scripts when opened on its own.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (/^https?:\/\//i.test(avatar) || avatar.startsWith("/")) {
    return NextResponse.redirect(new URL(avatar, request.url), 307);
  }
  return new NextResponse(null, { status: 404 });
}
