// Admin configuration
// Add your email or GitHub username here to get admin access

export const ADMIN_EMAILS: string[] = [
  // Add admin emails here
  "chedganemouhssine@gmail.com",
];

export const ADMIN_GITHUB_USERNAMES: string[] = [
  // Add admin GitHub usernames here
  "Mohsinec",
];

// Check if a user is an admin
export function isAdmin(
  email?: string | null,
  githubUsername?: string | null
): boolean {
  if (email && ADMIN_EMAILS.includes(email)) {
    return true;
  }
  if (githubUsername && ADMIN_GITHUB_USERNAMES.includes(githubUsername)) {
    return true;
  }
  return false;
}

// Premium features config
export const PREMIUM_PRICE = 29; // USD, one-time
export const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID || "";
export const LEMON_SQUEEZY_PRODUCT_ID =
  process.env.LEMON_SQUEEZY_PRODUCT_ID || "";
export const LEMON_SQUEEZY_VARIANT_ID =
  process.env.LEMON_SQUEEZY_VARIANT_ID || "";

// App config
export const APP_NAME = "BentoFolio";
export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev";
