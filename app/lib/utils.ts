import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes intelligently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID for blocks
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Format large numbers (e.g., 1000 -> 1K)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}
