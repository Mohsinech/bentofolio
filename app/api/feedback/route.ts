import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email";
import { createClient } from "@/app/lib/supabase/server";

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = cleanText(body.message, 2000);
  const pageUrl = cleanText(body.pageUrl, 500);

  if (message.length < 6) {
    return NextResponse.json(
      { error: "Tell me a little more about the problem." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sender = user?.email || "Anonymous visitor";
  const to = process.env.FEEDBACK_TO_EMAIL || "hello@bentofolio.dev";
  const result = await sendEmail({
    to,
    subject: "New BentoFolio feedback",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:620px;margin:0 auto;padding:28px;background:#070708;color:#f7f3eb;">
        <h1 style="margin:0 0 12px;font-size:26px;">New BentoFolio feedback</h1>
        <p style="margin:0 0 22px;color:rgba(255,255,255,.6);">Someone used the tiny help button.</p>
        <div style="padding:18px;border:1px solid rgba(215,255,95,.22);border-radius:18px;background:rgba(255,255,255,.045);">
          <p style="margin:0 0 10px;color:#d7ff5f;font-weight:800;">Message</p>
          <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
        </div>
        <p style="margin:22px 0 0;color:rgba(255,255,255,.58);line-height:1.6;">
          <strong style="color:#fff;">From:</strong> ${escapeHtml(sender)}<br />
          <strong style="color:#fff;">Page:</strong> ${escapeHtml(pageUrl || "Unknown")}
        </p>
      </div>
    `,
  });

  if (result.error) {
    return NextResponse.json(
      { error: "Could not send feedback right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
