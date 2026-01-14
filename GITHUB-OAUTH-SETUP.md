# GitHub OAuth Setup Guide

## How to Enable GitHub Import Feature

The GitHub Import feature allows users to automatically import their GitHub profile data into BentoFolio blocks. This requires setting up GitHub OAuth in Supabase.

---

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name:** BentoFolio
   - **Homepage URL:** `https://bentofolio.dev` (or your domain)
   - **Authorization callback URL:** `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - Get this from Supabase Dashboard → Authentication → URL Configuration
4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate and copy the **Client Secret**

---

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** in the list
4. Enable GitHub provider
5. Paste your GitHub OAuth credentials:
   - **Client ID:** (from GitHub)
   - **Client Secret:** (from GitHub)
6. Click **Save**

---

## Step 3: Test the Connection

1. Go to your BentoFolio editor at `/editor`
2. Look for the **"Connect GitHub"** button in the left sidebar
3. Click it to start the OAuth flow
4. Authorize BentoFolio to access your GitHub account
5. You'll be redirected back to the editor
6. The button should now show **"Import from GitHub"** with your username

---

## How It Works

### For Users with Email Accounts

When a user signs up with email/password, they don't have a GitHub account linked. The flow works like this:

1. User clicks **"Connect GitHub"** button
2. Redirected to `/api/auth/github`
3. API checks if user is logged in
4. Uses `supabase.auth.linkIdentity()` to link GitHub to existing account
5. Redirects to GitHub OAuth consent page
6. User authorizes
7. GitHub account is linked to existing email account
8. User redirected back to editor
9. Button changes to **"Import from GitHub"**
10. User can now import their GitHub profile data

### For Users Who Sign Up with GitHub

If a user signs up directly with GitHub OAuth, they automatically get:

- GitHub username in user metadata
- Ability to import without extra steps

---

## Code Implementation

### API Route: `/api/auth/github/route.ts`

```typescript
export async function GET(request: Request) {
  const supabase = await createClient();
  const { origin } = new URL(request.url);

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  // Link GitHub to existing account
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=/editor`,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/editor?error=github_link_failed`);
  }

  return NextResponse.redirect(data.url);
}
```

### Sidebar Button: `EditorSidebar.tsx`

```typescript
{
  githubUsername ? (
    // Show import button if GitHub is connected
    <button onClick={handleGitHubImport}>Import from GitHub</button>
  ) : (
    // Show connect button if no GitHub
    <Link href="/api/auth/github">Connect GitHub</Link>
  );
}
```

---

## Troubleshooting

### "Failed to connect GitHub" Error

**Possible causes:**

1. GitHub OAuth not enabled in Supabase
2. Wrong callback URL in GitHub OAuth app
3. Client ID/Secret mismatch

**Solution:**

- Double-check Supabase Auth settings
- Verify GitHub OAuth app callback URL matches Supabase
- Make sure GitHub provider is enabled in Supabase

### "Connect GitHub" button doesn't appear

**Cause:** User signed up with GitHub OAuth initially

**Solution:** No action needed - they can already import!

### Import button doesn't work

**Possible causes:**

1. GitHub username not in user metadata
2. GitHub API rate limit
3. Invalid GitHub username

**Solution:**

- Check user metadata in Supabase Auth
- Wait for rate limit to reset
- Try reconnecting GitHub

---

## Security Considerations

1. **OAuth Scopes:** By default, GitHub OAuth only requests public profile access
2. **Token Storage:** Supabase handles token storage securely
3. **User Consent:** Users must explicitly authorize the connection
4. **Revocation:** Users can revoke access anytime in GitHub settings

---

## Feature Checklist

✅ GitHub OAuth app created  
✅ Supabase provider configured  
✅ Callback URL matches  
✅ Connect button appears for email users  
✅ Import button appears after connection  
✅ Error handling implemented  
✅ User can import profile data

---

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [linkIdentity API Reference](https://supabase.com/docs/reference/javascript/auth-linkidentity)
