import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    identities: user.identities,
    app_metadata: user.app_metadata,
  });
}
