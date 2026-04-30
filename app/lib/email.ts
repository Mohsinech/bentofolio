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
  welcomePro: (username: string) => ({
    subject: "🎉 Welcome to BentoFolio Pro!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BentoFolio Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #222;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 24px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 16px 32px; border-radius: 12px; margin-bottom: 24px;">
                <span style="font-size: 48px;">🎉</span>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Welcome to Pro!
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
                Thank you for upgrading to BentoFolio Pro! Your account can now use a custom domain for your portfolio.
              </p>

              <!-- Features List -->
              <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 24px; margin: 32px 0;">
                <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #ffffff;">✨ Your Pro Feature</h2>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                    <span style="color: #8b5cf6; margin-right: 12px; font-size: 20px;">🌐</span>
                    <div>
                      <strong style="color: #ffffff; font-size: 16px;">Custom Domain</strong>
                      <p style="margin: 4px 0 0; color: #9ca3af; font-size: 14px;">Use your own domain instead of bentofolio.dev subdomain</p>
                    </div>
                  </div>
                </div>

                <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">All blocks, themes, and the Creative tab are available on the free plan while the product evolves. Pro is intentionally simple: connect your own domain.</p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="https://bentofolio.dev/editor" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                  Start Building →
                </a>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 24px 0 0; text-align: center;">
                Questions? Reply to this email or visit our support page.
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
