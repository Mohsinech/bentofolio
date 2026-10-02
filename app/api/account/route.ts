import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { removeDomain, vercelConfigFromEnv } from "@/app/lib/domains";

// DELETE { confirm: "<username>" }: deletes the account. The profile, draft,
// revenue connections, analytics and referrals go with it (ON DELETE CASCADE).
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { confirm?: unknown };
  const { data: profile } = await supabase.from("profiles").select("username, custom_domain").eq("id", user.id).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const typed = typeof body.confirm === "string" ? body.confirm.trim().toLowerCase() : "";
  if (typed !== String(profile.username).toLowerCase()) {
    return NextResponse.json({ error: "Type your username exactly to confirm." }, { status: 400 });
  }

  // Free the custom domain on Vercel so it can be used elsewhere.
  const config = vercelConfigFromEnv();
  if (config && profile.custom_domain) await removeDomain(config, profile.custom_domain).catch(() => null);

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json({ error: "Couldn't delete the account. Try again or contact us." }, { status: 500 });
  }

  await supabase.auth.signOut().catch(() => null);
  return NextResponse.json({ deleted: true });
}
