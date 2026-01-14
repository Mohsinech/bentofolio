# Email Templates

This document describes the email notifications used in BentoFolio.

## Setup

Make sure `RESEND_API_KEY` is set in your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
```

## Available Templates

### 1. Welcome Pro Email

**Trigger:** Sent automatically when a user upgrades to Pro (LemonSqueezy webhook)  
**File:** `app/lib/email.ts` → `emailTemplates.welcomePro()`  
**Features:**

- 🎉 Celebratory design with gradient accents
- ✨ Lists all Pro features (Custom Domain, Analytics, Premium Blocks, Themes)
- 🔗 CTA button to start building
- 📧 Responsive HTML email template

**Sent when:** LemonSqueezy order webhook receives `order_created` event with status `paid`

**Implementation:**

```typescript
// In app/api/webhooks/lemonsqueezy/route.ts
const emailTemplate = emailTemplates.welcomePro(profile.username);
await sendEmail({
  to: customerEmail,
  subject: emailTemplate.subject,
  html: emailTemplate.html,
});
```

---

### 2. Password Changed Notification

**Trigger:** Sent when user updates their password  
**File:** `app/lib/email.ts` → `emailTemplates.passwordChanged()`  
**Features:**

- 🔒 Security-focused design
- ✓ Confirmation of password change
- ⚠️ Warning section if user didn't make the change
- 🛡️ Security tips and best practices
- 🔗 Quick action button to reset password if compromised

**Sent when:** User updates password via `/auth/update-password` page

**Implementation:**

```typescript
// In app/auth/update-password/page.tsx
await fetch("/api/auth/password-notification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: user.id }),
});
```

**API Route:** `/api/auth/password-notification`

---

## Email Service

The email service uses Resend API and is located in `app/lib/email.ts`.

### Send Email Function

```typescript
import { sendEmail, emailTemplates } from "@/app/lib/email";

// Example usage
const result = await sendEmail({
  to: "user@example.com",
  subject: "Your subject",
  html: "<html>...</html>",
});

if (result.error) {
  console.error("Failed to send email:", result.error);
}
```

### Configuration

- **From Email:** `noreply@bentofolio.dev`
- **API:** Resend (https://resend.com)
- **Authentication:** Bearer token via `RESEND_API_KEY`

---

## Creating New Templates

To add a new email template:

1. Add template function to `emailTemplates` object in `app/lib/email.ts`:

```typescript
export const emailTemplates = {
  // ... existing templates

  yourNewTemplate: (username: string, customData: any) => ({
    subject: "Your Subject Line",
    html: `
      <!DOCTYPE html>
      <html>
      <!-- Your email HTML here -->
      </html>
    `,
  }),
};
```

2. Use the template:

```typescript
const template = emailTemplates.yourNewTemplate(username, data);
await sendEmail({
  to: email,
  subject: template.subject,
  html: template.html,
});
```

---

## Template Design Guidelines

All templates follow these design principles:

- **Dark Theme:** Black/dark gray background (`#0a0a0a`, `#1a1a1a`)
- **Purple Accents:** Primary brand color (`#8b5cf6`, `#6366f1`)
- **Responsive:** Works on all email clients and devices
- **Readable:** Clear hierarchy, sufficient contrast, readable fonts
- **Mobile-First:** Tested on mobile and desktop email clients
- **Accessible:** Proper HTML structure with semantic tags

### Color Palette

```css
--bg-primary: #0a0a0a
--bg-secondary: #1a1a1a
--bg-tertiary: #0f0f0f
--brand-purple: #8b5cf6
--brand-indigo: #6366f1
--success-green: #10b981
--error-red: #ef4444
--text-primary: #ffffff
--text-secondary: #d1d5db
--text-muted: #9ca3af
--border: #222
```

---

## Testing Emails

To test emails locally:

1. Use Resend's test mode or send to your own email
2. Check rendering in multiple clients:

   - Gmail
   - Outlook
   - Apple Mail
   - Mobile devices

3. Test all links and CTAs
4. Verify responsive design

---

## Troubleshooting

### Email not sending

- Check `RESEND_API_KEY` is set correctly
- Verify Resend account is active
- Check console logs for error messages

### Email goes to spam

- Verify domain authentication in Resend
- Check SPF/DKIM records
- Avoid spam trigger words

### Template broken

- Test HTML in email testing tool
- Check for unclosed tags
- Verify inline CSS (email clients don't support all CSS)

---

## Future Templates

Potential templates to add:

- Account verification email
- Weekly analytics digest
- Custom domain setup confirmation
- Subscription renewal reminder
- Feature announcement
- Support ticket responses

---

## Documentation

- Resend Docs: https://resend.com/docs
- Email HTML Best Practices: https://www.campaignmonitor.com/css/
- Responsive Email Guide: https://www.emailonacid.com/blog/article/email-development/responsive-email-design/
