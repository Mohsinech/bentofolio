# bentofolio — Supabase email templates

Quiet proof style: light page, white card, ink button, blue accent. Matches the Pro welcome email sent from `app/lib/email.ts`.

Paste each **Subject** and **Body** into Supabase → Authentication → Emails. The first six are under **Templates**; "Password changed" is under **Security notifications** (turn it on there).

- Keep every `{{ .Variable }}` exactly as written. Supabase reference: <https://supabase.com/docs/guides/auth/auth-email-templates>
- Magic link and Reauthentication show `{{ .Token }}` (the 6-digit code). Remove that block if you only use links.
- Emails use the system font: custom fonts aren't reliable in Gmail and Outlook.
- Set the sender name to `bentofolio` under Authentication → Emails → SMTP settings so the inbox shows the brand, not "Supabase Auth".

---

## Confirm sign up

### Subject

```text
Confirm your email
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Confirm your email</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Confirm your email to open your bentofolio editor.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">CONFIRM EMAIL</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">One click and your page is yours.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Confirm {{ .Email }} and you'll go straight to the editor to set up your page. The link works once and expires in 24 hours.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Confirm my email</a></td>
  </tr></table>
  <p style="margin:0 0 6px;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6f6e69;">Or paste this link into your browser:</p>
  <p style="margin:0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2b44ff;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone used {{ .Email }} on bentofolio.dev. If it wasn't you, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Invite user

### Subject

```text
You're invited to bentofolio
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>You're invited to bentofolio</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Someone invited you to make a page on bentofolio.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">INVITATION</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">You're invited to bentofolio.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Accept the invite to make your account and build your page: your work, your numbers, your links, arranged on one page at bentofolio.dev.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Accept the invite</a></td>
  </tr></table>
  <p style="margin:0 0 6px;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6f6e69;">Or paste this link into your browser:</p>
  <p style="margin:0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2b44ff;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone invited {{ .Email }} to bentofolio.dev. If you weren't expecting it, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Magic link

### Subject

```text
Your bentofolio sign-in link
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Your bentofolio sign-in link</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Your link to sign in to bentofolio.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">SIGN IN</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">Here's your sign-in link.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Use the button to sign in as {{ .Email }}. It works once and expires in an hour. You can also enter this code:</p>
  <div style="margin:0 0 24px;padding:18px 20px;border:1px solid #ecebe8;border-radius:12px;background:#f6f6f4;font:600 28px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:6px;color:#111110;text-align:center;">{{ .Token }}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Sign in to bentofolio</a></td>
  </tr></table>
  <p style="margin:0 0 6px;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6f6e69;">Or paste this link into your browser:</p>
  <p style="margin:0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2b44ff;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone used {{ .Email }} on bentofolio.dev. If it wasn't you, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Change email address

### Subject

```text
Confirm your new email
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Confirm your new email</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Confirm the new email address for your bentofolio account.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">CHANGE EMAIL</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">Confirm your new email.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">You asked to change your sign-in email from {{ .Email }} to {{ .NewEmail }}. Confirm to make the switch; until then, nothing changes.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Confirm new email</a></td>
  </tr></table>
  <p style="margin:0 0 6px;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6f6e69;">Or paste this link into your browser:</p>
  <p style="margin:0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2b44ff;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone used {{ .Email }} on bentofolio.dev. If it wasn't you, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Reset password

### Subject

```text
Reset your bentofolio password
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Reset your bentofolio password</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">A link to choose a new bentofolio password.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">RESET PASSWORD</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">Choose a new password.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Someone (hopefully you) asked to reset the password for {{ .Email }}. The link works once and expires in an hour.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Choose a new password</a></td>
  </tr></table>
  <p style="margin:0 0 6px;font:500 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#6f6e69;">Or paste this link into your browser:</p>
  <p style="margin:0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#2b44ff;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone used {{ .Email }} on bentofolio.dev. If it wasn't you, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Reauthentication

### Subject

```text
Your bentofolio confirmation code
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Your bentofolio confirmation code</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">Your code to confirm it's you.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">CONFIRM IT'S YOU</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">Your confirmation code.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">Enter this code in bentofolio to confirm it's you. It expires in a few minutes.</p>
  <div style="margin:0 0 24px;padding:18px 20px;border:1px solid #ecebe8;border-radius:12px;background:#f6f6f4;font:600 28px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:6px;color:#111110;text-align:center;">{{ .Token }}</div>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  You're getting this because someone used {{ .Email }} on bentofolio.dev. If it wasn't you, you can ignore this email. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```

---

## Password changed

### Subject

```text
Your bentofolio password was changed
```

### Body

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Your bentofolio password was changed</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f4;color:#111110;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">The password for your bentofolio account was just changed.</div>
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
  <p style="margin:0 0 10px;font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2b44ff;">SECURITY</p>
  <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;font-weight:500;letter-spacing:-0.8px;color:#111110;">Your password was changed.</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#55544f;">The password for {{ .Email }} was just changed. If that was you, there's nothing to do.</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#55544f;">If it wasn't you, reset your password right away and write to us.</p>
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:#111110;border-radius:10px;"><a href="{{ .SiteURL }}/auth/reset-password" style="display:inline-block;padding:13px 20px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Reset my password</a></td>
  </tr></table>
</td></tr>
<tr><td style="padding:20px 4px 0;font-size:12px;line-height:1.6;color:#6f6e69;">
  This is a security notice for {{ .Email }} on bentofolio.dev. Questions? Write to <a href="mailto:hello@bentofolio.dev" style="color:#6f6e69;">hello@bentofolio.dev</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
```
