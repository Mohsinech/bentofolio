import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get public profiles that have content
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .not("content", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract identity info from content
    const profiles = (data || [])
      // Owners can opt out in Settings (migration 016).
      .filter((profile) => profile.discoverable !== false)
      .map((profile) => {
        const content = profile.content as Record<
          string,
          { type: string; data: Record<string, unknown> }
        >;

        // Find identity block
        const identityBlock = Object.values(content || {}).find(
          (block) => block.type === "identity"
        );

        if (!identityBlock) return null;

        const identityData = identityBlock.data as {
          name?: string;
          title?: string;
          avatar?: string;
        };

        return {
          username: profile.username,
          name: identityData.name || profile.username,
          title: identityData.title || "BentoFolio User",
          avatar:
            identityData.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
          theme: profile.theme || "dark",
          isPro: profile.is_pro || false,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}
