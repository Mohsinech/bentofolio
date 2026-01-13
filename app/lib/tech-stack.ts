// Comprehensive list of technologies with icons for the Tech Stack block

export interface TechItem {
  name: string;
  icon: string;
  category:
    | "language"
    | "frontend"
    | "backend"
    | "database"
    | "devops"
    | "mobile"
    | "tool"
    | "other";
}

// Import data from separate file to avoid exposure in dev tools
import { techStack, techCategories } from "./tech-stack.data";

// Re-export for external use
export { techStack, techCategories };

// Get suggestions based on search query
export function getTechSuggestions(query: string): TechItem[] {
  if (!query) return techStack.slice(0, 10);

  const lower = query.toLowerCase();
  return techStack
    .filter(
      (tech) =>
        tech.name.toLowerCase().includes(lower) ||
        tech.category.toLowerCase().includes(lower)
    )
    .slice(0, 10);
}

// Get tech by name (exact or fuzzy match)
export function getTechByName(name: string): TechItem | undefined {
  const lower = name.toLowerCase();
  return techStack.find((tech) => tech.name.toLowerCase() === lower);
}

// Get techs by category
export function getTechsByCategory(category: TechItem["category"]): TechItem[] {
  return techStack.filter((tech) => tech.category === category);
}
