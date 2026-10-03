// Email service using Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "noreply@bentofolio.dev";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return { error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return { error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error };
  }
}

// Email Templates
export const emailTemplates = {
  referralReward: ({
    username,
    code,
    count,
  }: {
    username: string;
    code: string;
    count: number;
  }) => ({
    subject: "You earned BentoFolio Pro for free",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You earned BentoFolio Pro</title>
</head>
<body style="margin:0;padding:0;background:#070708;color:#f7f3eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:36px 18px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:10px 14px;border-radius:999px;background:rgba(215,255,95,0.1);border:1px solid rgba(215,255,95,0.2);color:#e8ff9a;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Invite & Earn</div>
      <h1 style="margin:18px 0 0;font-size:34px;line-height:1;color:#ffffff;">You did it, ${username}.</h1>
      <p style="margin:12px auto 0;max-width:420px;color:rgba(255,255,255,.62);line-height:1.6;">${count} friends created BentoFolio accounts from your link. That means your Pro coupon has officially escaped the lab.</p>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.025)),#121213;border:1px solid rgba(215,255,95,.22);border-radius:28px;padding:28px;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,.35);">
      <p style="margin:0;color:rgba(255,255,255,.52);font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;">Your 100% Pro code</p>
      <div style="margin:18px 0;padding:18px;border-radius:18px;background:#d7ff5f;color:#080809;font-size:22px;font-weight:900;letter-spacing:.04em;word-break:break-word;">${code}</div>
      <p style="margin:0;color:rgba(255,255,255,.58);font-size:14px;line-height:1.6;">Paste this on the BentoFolio pricing page and hit <strong style="color:#fff;">Get Pro for free</strong>. No wallet gymnastics required.</p>
      <div style="margin-top:28px;">
        <a href="https://bentofolio.dev/pricing" style="display:inline-block;background:#ffffff;color:#080809;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:800;">Claim Pro</a>
      </div>
    </div>

    <p style="margin:24px 0 0;text-align:center;color:rgba(255,255,255,.42);font-size:13px;line-height:1.6;">Made with tiny blocks and questionable amounts of coffee by BentoFolio.</p>
  </div>
</body>
</html>
    `,
  }),

  // Sent once when Pro turns on after a payment. Lemon Squeezy also sends
  // its own invoice; this one says what's unlocked and where to start.
  proReceipt: ({
    username,
    orderNumber,
    total,
    date,
  }: {
    username: string;
    orderNumber: string | null;
    total: string | null;
    date: string | null;
  }) => {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev").replace(/\/$/, "");
    const safe = (value: string) =>
      value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
    const day = date ? new Date(date) : new Date();
    const when = Number.isNaN(day.getTime())
      ? ""
      : day.toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
    const rows: [string, string][] = [
      ["Plan", "Pro · lifetime"],
      ...(total ? ([["Paid", total]] as [string, string][]) : []),
      ...(orderNumber ? ([["Order", `#${orderNumber}`]] as [string, string][]) : []),
      ...(when ? ([["Date", when]] as [string, string][]) : []),
      ["Renews", "Never"],
    ];
    const unlocked = [
      "Analytics: visitors, sources, countries, clicks",
      "Your own domain",
      "Spotify, YouTube and Instagram blocks",
      "Verified badge next to your name",
      "Download your CV as a PDF",
      "No “Made with bentofolio” tag",
    ];
    const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    const mono = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
    return {
      subject: "You're on bentofolio Pro",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>You're on bentofolio Pro</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:${font};">
<div style="display:none;max-height:0;overflow:hidden;">Pro is on for bentofolio.dev/${safe(username)}. Here's your receipt and where to start.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="padding:0 4px 20px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="width:9px;height:9px;background:#111110;border-radius:2px;"></td><td style="width:2px;"></td>
    <td style="width:9px;height:9px;background:#2b44ff;border-radius:2px;"></td>
    <td style="padding-left:10px;font-size:16px;font-weight:600;color:#111110;" rowspan="3">bentofolio</td>
  </tr><tr><td colspan="3" style="height:2px;"></td></tr>
  <tr><td colspan="3" style="height:9px;background:#111110;border-radius:2px;"></td></tr></table>
</td></tr>
<tr><td style="background:#ffffff;border:1px solid #ecebe8;border-radius:16px;padding:32px 32px 28px;">
  <p style="margin:0 0 10px;font:500 12px/1 ${mono};color:#2b44ff;">PRO · LIFETIME</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">You're on Pro, ${safe(username)}.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Thanks for supporting bentofolio. Everything below is already unlocked on your account, for good.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ecebe8;margin:0 0 24px;">
    ${rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:11px 0;border-bottom:1px solid #ecebe8;font:500 13px/1.4 ${mono};color:#6f6e69;">${label}</td><td align="right" style="padding:11px 0;border-bottom:1px solid #ecebe8;font-size:14px;font-weight:500;color:#111110;">${safe(value)}</td></tr>`
      )
      .join("")}
  </table>
  <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#111110;">What's unlocked</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    ${unlocked
      .map(
        (item) =>
          `<tr><td style="padding:4px 10px 4px 0;vertical-align:top;color:#2b44ff;font-size:14px;">✓</td><td style="padding:4px 0;font-size:14px;line-height:1.45;color:#55544f;">${item}</td></tr>`
      )
      .join("")}
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="${appUrl}/editor" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Open the editor</a></td>
    <td style="width:10px;"></td>
    <td style="border:1px solid #deddd8;border-radius:10px;"><a href="${appUrl}/settings#domain" style="display:inline-block;padding:12px 18px;font-size:15px;font-weight:500;color:#111110;text-decoration:none;">Connect a domain</a></td>
  </tr></table>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  Your official invoice comes from Lemon Squeezy, our payment provider. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    };
  },

  passwordChanged: (username: string) => ({
    subject: "🔒 Your BentoFolio password was changed",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #222;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 24px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px 32px; border-radius: 12px; margin-bottom: 24px;">
                <span style="font-size: 48px;">🔒</span>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                Password Changed
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 48px 32px;">
              <p style="font-size: 18px; line-height: 1.6; color: #d1d5db; margin: 0 0 24px;">
                Hey <strong style="color: #ffffff;">${username}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin: 0 0 24px;">
                This is a confirmation that your BentoFolio password was successfully changed.
              </p>

              <!-- Info Box -->
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #10b981; margin-right: 12px; font-size: 24px;">✓</span>
                  <div>
                    <strong style="color: #10b981; font-size: 16px; display: block; margin-bottom: 8px;">Password Updated Successfully</strong>
                    <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                      Your password has been changed. If you made this change, you can safely ignore this email.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Warning Box -->
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="color: #ef4444; margin-right: 12px; font-size: 24px;">⚠️</span>
                  <div>
                    <strong style="color: #ef4444; font-size: 16px; display: block; margin-bottom: 8px;">Didn't make this change?</strong>
                    <p style="margin: 0 0 16px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                      If you did not change your password, your account may have been compromised. Please secure your account immediately.
                    </p>
                    <a href="https://bentofolio.dev/auth/reset-password" style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Reset Password Now →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Security Tips -->
              <div style="margin: 32px 0;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">🛡️ Security Tips</h3>
                <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                  <li>Use a strong, unique password for BentoFolio</li>
                  <li>Never share your password with anyone</li>
                  <li>Enable two-factor authentication if available</li>
                  <li>Be cautious of phishing emails</li>
                </ul>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 24px 0 0; text-align: center;">
                Questions? Contact us at support@bentofolio.dev
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 48px 48px; text-align: center; border-top: 1px solid #222;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                <strong style="color: #8b5cf6;">Bento</strong><span style="color: #ffffff;">Folio</span>
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">
                © 2026 BentoFolio. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">
                This is an automated security notification.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
};
