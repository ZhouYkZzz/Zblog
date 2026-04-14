import type { HackerNewsStory } from "./types";

const HN_BASE_URL = "https://hacker-news.firebaseio.com/v0";

type HackerNewsItem = {
  id?: number;
  deleted?: boolean;
  type?: string;
  by?: string;
  time?: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
};

function storyUrl(item: HackerNewsItem) {
  return item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
}

function normalizeStory(item: HackerNewsItem): HackerNewsStory | null {
  if (!item.id || !item.title || item.deleted || item.type !== "story") {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    url: storyUrl(item),
    score: item.score ?? 0,
    by: item.by ?? "unknown",
    descendants: item.descendants ?? 0,
    time: item.time ?? 0
  };
}

export async function fetchHackerNewsStories(options?: { maxResults?: number }) {
  const maxResults = options?.maxResults ?? 10;
  const idsResponse = await fetch(`${HN_BASE_URL}/topstories.json`, {
    next: { revalidate: 60 * 15 },
    headers: {
      "User-Agent": "zblog-research-radar/0.1"
    }
  });

  if (!idsResponse.ok) {
    throw new Error(`Hacker News topstories request failed: ${idsResponse.status}`);
  }

  const ids = ((await idsResponse.json()) as number[]).slice(0, Math.max(maxResults * 3, maxResults));
  const items = await Promise.allSettled(
    ids.map(async (id) => {
      const response = await fetch(`${HN_BASE_URL}/item/${id}.json`, {
        next: { revalidate: 60 * 15 },
        headers: {
          "User-Agent": "zblog-research-radar/0.1"
        }
      });

      if (!response.ok) {
        throw new Error(`Hacker News item request failed: ${response.status}`);
      }

      return response.json() as Promise<HackerNewsItem>;
    })
  );

  return items
    .filter((item): item is PromiseFulfilledResult<HackerNewsItem> => item.status === "fulfilled")
    .map((item) => normalizeStory(item.value))
    .filter((item): item is HackerNewsStory => Boolean(item))
    .slice(0, maxResults);
}
