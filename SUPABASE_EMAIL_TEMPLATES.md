# BentoFolio Supabase Email Templates

Copy each **Subject** and **Body** into:

`Supabase Dashboard -> Authentication -> Emails -> Templates`

Notes:
- Keep every `{{ ... }}` Supabase variable exactly as written.
- These templates use BentoFolio colors: `#080809` background, `#f7f3eb` text, and `#d7ff5f` accent.
- Custom fonts in email are not reliable across Gmail, Outlook, Apple Mail, etc. Use the system font stack here for the cleanest result.
- Supabase variables reference: <https://supabase.com/docs/guides/auth/auth-email-templates>

---

## Confirm Sign Up

### Subject

```text
Your BentoFolio is waiting at the door
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        EMAIL CONFIRMATION
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">Knock knock, portfolio delivery.</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Your BentoFolio account is almost ready. It is currently standing politely outside the internet, holding a tiny clipboard.
      </p>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Confirm your email and you can start arranging your work into clean little rectangles like a person with excellent taste.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(215,255,95,0.24);">
          Confirm My Email
        </a>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        Tiny security ritual: this proves the email is yours and not someone trying to build a portfolio in your name. Bold move, honestly.
      </p>

      <p style="color:rgba(247,243,235,0.44);font-size:13px;margin:24px 0 0;line-height:1.6;">
        Button not vibing? Copy and paste this URL:<br />
        <span style="color:#d7ff5f;word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">If this was not you, ignore this email. The bento will wait.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```

---

## Invite User

### Subject

```text
You have been invited to BentoFolio
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        INVITE
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">You got an invite. Very exclusive. Very rectangles.</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Someone invited you to BentoFolio, which means they respect your work or want you to stop sending giant portfolio PDFs.
      </p>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Accept the invite and start building a sharp public profile for projects, links, proof-of-work, and tasteful flexing.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(215,255,95,0.24);">
          Accept Invite
        </a>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        This invite link is your backstage pass. Keep it away from suspicious browser tabs with too much confidence.
      </p>

      <p style="color:rgba(247,243,235,0.44);font-size:13px;margin:24px 0 0;line-height:1.6;">
        Button acting mysterious? Copy and paste this URL:<br />
        <span style="color:#d7ff5f;word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">Welcome to the bento side. We have grids.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```

---

## Magic Link Or OTP

### Subject

```text
Your BentoFolio magic link has entered the chat
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        MAGIC LINK
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">Password-free entrance? Fancy.</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Click the button below to sign in to BentoFolio. No password gymnastics required today.
      </p>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        If your email app is suspicious of buttons, use the one-time code below.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(215,255,95,0.24);">
          Sign Me In
        </a>
      </div>

      <div style="text-align:center;margin:24px 0;">
        <p style="color:rgba(247,243,235,0.58);font-size:14px;margin:0 0 10px;">Your one-time code:</p>
        <div style="display:inline-block;background:#d7ff5f;color:#080809;padding:14px 20px;border-radius:16px;font-size:26px;font-weight:900;letter-spacing:0.18em;">
          {{ .Token }}
        </div>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        If you did not ask for this, ignore it. Your account is still sitting calmly.
      </p>

      <p style="color:rgba(247,243,235,0.44);font-size:13px;margin:24px 0 0;line-height:1.6;">
        Link not linking? Copy and paste this URL:<br />
        <span style="color:#d7ff5f;word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">Magic responsibly.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```

---

## Change Email Address

### Subject

```text
Confirm your new BentoFolio email
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        EMAIL CHANGE
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">New inbox, who dis?</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        You asked to change the email on your BentoFolio account to:
      </p>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:14px 16px;border-radius:14px;color:#d7ff5f;font-size:15px;margin:16px 0;word-break:break-all;">
        {{ .NewEmail }}
      </p>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Confirm it below and we will update the address. Smooth. Administrative. Slightly glamorous.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(215,255,95,0.24);">
          Confirm New Email
        </a>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        If you did not request this, ignore this email. Your current email will stay exactly where it is.
      </p>

      <p style="color:rgba(247,243,235,0.44);font-size:13px;margin:24px 0 0;line-height:1.6;">
        Button not cooperating? Copy and paste this URL:<br />
        <span style="color:#d7ff5f;word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">Inbox migration department has left the chat.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```

---

## Reset Password

### Subject

```text
Password troubles? BentoFolio has the button
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        PASSWORD RESET
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">Password troubles? Classic plot twist.</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        It happens. Was it the clever password, the extra clever password, or the one with a mysterious capital letter?
      </p>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        Click below to reset your password and get back to building a portfolio that looks like it has its life together.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(215,255,95,0.24);">
          Reset My Password
        </a>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        This link expires soon. If you did not request this reset, ignore this email and carry on being secure.
      </p>

      <p style="color:rgba(247,243,235,0.44);font-size:13px;margin:24px 0 0;line-height:1.6;">
        Button not behaving? Copy and paste this URL:<br />
        <span style="color:#d7ff5f;word-break:break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">Pro tip: a password manager is just autocomplete with ambition.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```

---

## Reauthentication

### Subject

```text
BentoFolio needs one quick identity check
```

### Body

```html
<div style="margin:0;padding:0;background:#080809;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#f7f3eb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:32px;font-weight:900;margin:0;color:#f7f3eb;letter-spacing:-0.02em;">
        Bento<span style="color:#d7ff5f;">Folio</span>
      </h1>
    </div>

    <div style="background:linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025));border:1px solid rgba(215,255,95,0.20);border-radius:24px;padding:32px;box-shadow:0 28px 80px rgba(0,0,0,0.38);">
      <div style="display:inline-block;margin-bottom:18px;padding:8px 12px;border:1px solid rgba(215,255,95,0.24);border-radius:999px;background:rgba(215,255,95,0.10);color:#d7ff5f;font-size:12px;font-weight:800;">
        SECURITY CHECK
      </div>

      <h2 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.12;">One quick “yep, it’s me” moment.</h2>

      <p style="color:rgba(247,243,235,0.72);line-height:1.6;margin:16px 0;">
        You are doing something sensitive in BentoFolio, so we need a quick verification code before we let the important buttons do important button things.
      </p>

      <div style="text-align:center;margin:32px 0;">
        <p style="color:rgba(247,243,235,0.58);font-size:14px;margin:0 0 10px;">Your verification code:</p>
        <div style="display:inline-block;background:#d7ff5f;color:#080809;padding:16px 22px;border-radius:16px;font-size:28px;font-weight:900;letter-spacing:0.18em;">
          {{ .Token }}
        </div>
      </div>

      <p style="background:rgba(215,255,95,0.10);border:1px solid rgba(215,255,95,0.18);padding:16px;border-radius:14px;color:#d7ff5f;font-size:14px;margin:24px 0 0;line-height:1.6;">
        If this was not you, do not use the code. Your account is safer when mystery clicks are left alone.
      </p>
    </div>

    <div style="text-align:center;margin-top:26px;color:rgba(247,243,235,0.42);font-size:13px;">
      <p style="margin:0;">Security, but make it tidy.</p>
      <p style="margin:14px 0 0;">Made with taste by BentoFolio.</p>
    </div>
  </div>
</div>
```
