// Username rules shared by the browser and the server. The database enforces
// the same rules (supabase/migrations/012_usernames.sql); this file only
// gives fast feedback and friendly messages.

export type UsernameStatus =
  | "ok"
  | "invalid"
  | "reserved"
  | "taken"
  | "held"
  | "limit"
  | "too_short"
  | "too_long";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

const FORMAT = /^[a-z0-9]([a-z0-9_-]{1,28})[a-z0-9]$/;

// Placeholder given at signup when the chosen name couldn't be used.
const PLACEHOLDER = /^user_[0-9a-f]{8,16}$/;

export function normalizeUsername(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isPlaceholderUsername(value: unknown): boolean {
  return PLACEHOLDER.test(normalizeUsername(value));
}

// Format only. Reserved / taken / held need the database.
export function checkUsernameFormat(value: unknown): UsernameStatus {
  const name = normalizeUsername(value);
  if (name.length < USERNAME_MIN) return "too_short";
  if (name.length > USERNAME_MAX) return "too_long";
  return FORMAT.test(name) ? "ok" : "invalid";
}

export function usernameMessage(status: UsernameStatus): string {
  switch (status) {
    case "ok":
      return "Available";
    case "too_short":
      return `At least ${USERNAME_MIN} characters`;
    case "too_long":
      return `At most ${USERNAME_MAX} characters`;
    case "invalid":
      return "Letters, numbers, - and _ only, starting and ending with a letter or number";
    case "reserved":
      return "Reserved by BentoFolio";
    case "taken":
      return "Taken, try another";
    case "held":
      return "Recently used by someone else, try another";
    case "limit":
      return "You've changed your name a lot recently. Try again later.";
  }
}

// Maps a database error raised by enforce_username_rules() to a status.
export function statusFromDatabaseError(message: unknown): UsernameStatus | null {
  if (typeof message !== "string") return null;
  const match = message.match(/username_unavailable:(\w+)/);
  return match ? (match[1] as UsernameStatus) : null;
}
