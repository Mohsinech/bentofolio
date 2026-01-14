import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { sendEmail, emailTemplates } from "@/app/lib/email";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user email
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send password changed notification
    const emailTemplate = emailTemplates.passwordChanged(profile.username);
    const result = await sendEmail({
      to: user.email!,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (result.error) {
      console.error("Error sending email:", result.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    console.log(`Password change notification sent to ${user.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in password notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
