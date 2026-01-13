import { GitHubUser, GitHubRepo } from "./types";

const GITHUB_API = "https://api.github.com";

// Language colors from GitHub
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
};

export async function fetchGitHubUser(
  username: string
): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`${GITHUB_API}/users/${username}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error("GitHub user fetch failed:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    return null;
  }
}

export async function fetchGitHubRepos(
  username: string,
  limit = 6
): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/users/${username}/repos?sort=stars&per_page=${limit}&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.error("GitHub repos fetch failed:", response.status);
      return [];
    }

    const repos: GitHubRepo[] = await response.json();

    // Sort by stars and filter out forks
    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    return [];
  }
}

export function getLanguageColor(language: string): string {
  return languageColors[language] || "#8b8b8b";
}

// Calculate total stars from repos
export function calculateTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

// Extract unique languages from repos
export function extractLanguages(
  repos: GitHubRepo[]
): { name: string; icon: string }[] {
  const languages = new Map<string, number>();

  repos.forEach((repo) => {
    if (repo.language) {
      languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
    }
  });

  // Sort by frequency and map to tech stack format
  return Array.from(languages.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => ({
      name,
      icon: getLanguageEmoji(name),
    }));
}

function getLanguageEmoji(language: string): string {
  const emojiMap: Record<string, string> = {
    JavaScript: "🟨",
    TypeScript: "🔷",
    Python: "🐍",
    Java: "☕",
    Go: "🐹",
    Rust: "🦀",
    Ruby: "💎",
    PHP: "🐘",
    "C++": "⚡",
    C: "©️",
    "C#": "🎯",
    Swift: "🍎",
    Kotlin: "🟣",
    Dart: "🎯",
    Vue: "💚",
    HTML: "🌐",
    CSS: "🎨",
    Shell: "🐚",
  };
  return emojiMap[language] || "💻";
}

// Full import: fetch user data and generate blocks
export async function importFromGitHub(username: string) {
  const [user, repos] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username, 6),
  ]);

  if (!user) {
    throw new Error("GitHub user not found");
  }

  const totalStars = calculateTotalStars(repos);
  const languages = extractLanguages(repos);

  return {
    user,
    repos,
    totalStars,
    languages,
    // Pre-built content for blocks
    identityContent: {
      name: user.name || user.login,
      title: user.bio || "Developer",
      avatar: user.avatar_url,
      bio: user.bio,
    },
    githubContent: {
      username: user.login,
      avatarUrl: user.avatar_url,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
    },
    projectsContent: {
      items: repos.map((repo) => ({
        name: repo.name,
        description: repo.description || "",
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || "Unknown",
        languageColor: getLanguageColor(repo.language),
      })),
    },
    techStackContent: {
      items: languages,
    },
    mapContent: user.location
      ? {
          location: user.location,
          lat: 0,
          lng: 0,
        }
      : null,
    socialContent: {
      items: [
        {
          platform: "github" as const,
          url: user.html_url,
          username: user.login,
        },
      ],
    },
  };
}
