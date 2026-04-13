import { fallbackProjects } from "./data";
import type { TechProject } from "./types";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
};

type GitHubSearchResponse = {
  items?: GitHubRepo[];
};

function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

function fromRepo(repo: GitHubRepo): TechProject {
  return {
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? "No description yet.",
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language ?? "Mixed",
    topics: repo.topics ?? [],
    updatedAt: repo.updated_at,
    source: "GitHub"
  };
}

export async function fetchGitHubProjects(options?: { maxResults?: number; keywords?: string[] }) {
  const maxResults = options?.maxResults ?? 8;
  const keywords = (options?.keywords ?? ["llm", "rag", "ai-agents", "vector-database", "multimodal"]).map((keyword) =>
    keyword.trim().toLowerCase().replace(/\s+/g, "-")
  );
  const pushedAfter = monthsAgo(12);

  const responses = await Promise.all(
    keywords.map(async (keyword) => {
      const query = `topic:${keyword} stars:>100 pushed:>${pushedAfter}`;
      const params = new URLSearchParams({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: "5"
      });

      const response = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, {
        next: { revalidate: 60 * 60 },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "zblog-research-radar/0.1"
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub request failed: ${response.status}`);
      }

      return (await response.json()) as GitHubSearchResponse;
    })
  );

  const deduped = new Map<string, TechProject>();
  responses
    .flatMap((response) => response.items ?? [])
    .map(fromRepo)
    .forEach((project) => {
      if (!deduped.has(project.fullName)) {
        deduped.set(project.fullName, project);
      }
    });

  return Array.from(deduped.values())
    .sort((a, b) => b.stars - a.stars)
    .slice(0, maxResults);
}

export function fallbackGitHubProjects() {
  return fallbackProjects;
}
