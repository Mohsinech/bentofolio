# Supabase Email Template - Password Changed Notification

## How to Add This Template to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **"Change Email Address"** or create a custom template
4. Paste the HTML below into the template editor
5. Save the template

---

## Password Changed Notification Template

**Subject Line:**

```
🔒 Your BentoFolio password was changed
```

**HTML Body:**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Changed</title>
  </head>
  <body
    style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;"
  >
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table
            role="presentation"
            style="width: 600px; max-width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; border: 1px solid #222;"
          >
            <!-- Header -->
            <tr>
              <td style="padding: 48px 48px 24px; text-align: center;">
                <div
                  style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 16px 32px; border-radius: 12px; margin-bottom: 24px;"
                >
                  <span style="font-size: 48px;">🔒</span>
                </div>
                <h1
                  style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;"
                >
                  Password Changed
                </h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 0 48px 32px;">
                <p
                  style="font-size: 18px; line-height: 1.6; color: #d1d5db; margin: 0 0 24px;"
                >
                  Hello,
                </p>
                <p
                  style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin: 0 0 24px;"
                >
                  This is a confirmation that the password for your BentoFolio
                  account
                  <strong style="color: #ffffff;">{{ .Email }}</strong> was
                  successfully changed.
                </p>

                <!-- Info Box -->
                <div
                  style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0;"
                >
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="width: 40px; vertical-align: top;">
                        <span style="color: #10b981; font-size: 24px;">✓</span>
                      </td>
                      <td>
                        <strong
                          style="color: #10b981; font-size: 16px; display: block; margin-bottom: 8px;"
                          >Password Updated Successfully</strong
                        >
                        <p
                          style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;"
                        >
                          Your password has been changed. If you made this
                          change, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Warning Box -->
                <div
                  style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 24px; margin: 24px 0;"
                >
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="width: 40px; vertical-align: top;">
                        <span style="color: #ef4444; font-size: 24px;">⚠️</span>
                      </td>
                      <td>
                        <strong
                          style="color: #ef4444; font-size: 16px; display: block; margin-bottom: 8px;"
                          >Didn't make this change?</strong
                        >
                        <p
                          style="margin: 0 0 16px; color: #d1d5db; font-size: 14px; line-height: 1.6;"
                        >
                          If you did not change your password, your account may
                          have been compromised. Please secure your account
                          immediately.
                        </p>
                        <a
                          href="https://bentofolio.dev/auth/reset-password"
                          style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;"
                        >
                          Reset Password Now →
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Security Tips -->
                <div style="margin: 32px 0;">
                  <h3
                    style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;"
                  >
                    🛡️ Security Tips
                  </h3>
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td
                        style="color: #9ca3af; font-size: 14px; line-height: 1.8; padding-left: 20px;"
                      >
                        • Use a strong, unique password for BentoFolio<br />
                        • Never share your password with anyone<br />
                        • Enable two-factor authentication if available<br />
                        • Be cautious of phishing emails
                      </td>
                    </tr>
                  </table>
                </div>

                <p
                  style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin: 24px 0 0; text-align: center;"
                >
                  Questions? Contact us at support@bentofolio.dev
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="padding: 24px 48px 48px; text-align: center; border-top: 1px solid #222;"
              >
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong style="color: #8b5cf6;">Bento</strong
                  ><span style="color: #ffffff;">Folio</span>
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
```

---

## Available Supabase Template Variables

You can use these variables in your template:

- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL
- `{{ .ConfirmationURL }}` - Full confirmation URL with token
- `{{ .RedirectTo }}` - Redirect URL after confirmation

---

## Notes

- Supabase automatically sends this email when a password is changed
- The template uses inline CSS for maximum email client compatibility
- Make sure to test the email in different email clients (Gmail, Outlook, etc.)
- You can customize colors, text, and branding to match your needs

<!--
 -->

KHASNI NKML DEV PORTFOLIO DB
