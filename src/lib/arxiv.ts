import { XMLParser } from "fast-xml-parser";
import { fallbackRadarSummary, researchKeywords } from "./data";
import type { Paper } from "./types";

const ARXIV_ENDPOINT = "https://export.arxiv.org/api/query";

type ArxivAuthor = { name?: string } | string;

type ArxivEntry = {
  id?: string;
  title?: string;
  summary?: string;
  published?: string;
  updated?: string;
  author?: ArxivAuthor | ArxivAuthor[];
  category?: { "@_term"?: string } | Array<{ "@_term"?: string }>;
  link?: Array<{ "@_href"?: string; "@_title"?: string; "@_type"?: string }> | { "@_href"?: string; "@_title"?: string; "@_type"?: string };
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function text(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function authors(entry: ArxivEntry) {
  return asArray(entry.author)
    .map((author) => (typeof author === "string" ? author : author.name))
    .filter((name): name is string => Boolean(name));
}

function categoryFor(entry: ArxivEntry) {
  const terms = asArray(entry.category)
    .map((item) => item["@_term"])
    .filter(Boolean)
    .join(" ");

  if (/cs\.ir|retrieval|rag/i.test(`${terms} ${entry.title}`)) return "RAG";
  if (/cs\.ai|agent|reason/i.test(`${terms} ${entry.title}`)) return "Agent";
  if (/cs\.cv|multi|modal|vision/i.test(`${terms} ${entry.title}`)) return "Multimodal";
  if (/database|embedding|vector/i.test(`${terms} ${entry.title}`)) return "Vector DB";
  return "LLM Application";
}

function paperFromEntry(entry: ArxivEntry): Paper | null {
  if (!entry.id || !entry.title) {
    return null;
  }

  const id = entry.id.split("/abs/").at(-1) ?? entry.id;
  const links = asArray(entry.link);
  const pdfUrl =
    links.find((link) => link["@_title"] === "pdf" || link["@_type"] === "application/pdf")?.["@_href"] ??
    entry.id.replace("/abs/", "/pdf/");
  const publishedAt = entry.published ?? entry.updated;

  return {
    id,
    externalId: id,
    title: text(entry.title),
    authors: authors(entry),
    abstract: text(entry.summary),
    url: entry.id,
    pdfUrl,
    source: "arXiv",
    category: categoryFor(entry),
    tags: [categoryFor(entry), "live"],
    year: publishedAt ? new Date(publishedAt).getFullYear() : undefined,
    publishedAt,
    isFavorite: false
  };
}

export async function fetchArxivPapers(options?: { maxResults?: number; keywords?: string[] }) {
  const keywords = options?.keywords ?? researchKeywords;
  const maxResults = options?.maxResults ?? 8;
  const keywordQuery = keywords
    .filter((keyword) => keyword !== "AI application")
    .map((keyword) => `all:"${keyword}"`)
    .join(" OR ");
  const categoryQuery = "cat:cs.AI OR cat:cs.CL OR cat:cs.IR OR cat:cs.CV OR cat:cs.LG";
  const searchQuery = `(${keywordQuery}) AND (${categoryQuery})`;
  const params = new URLSearchParams({
    search_query: searchQuery,
    start: "0",
    max_results: String(maxResults),
    sortBy: "submittedDate",
    sortOrder: "descending"
  });

  const response = await fetch(`${ARXIV_ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 60 * 60 },
    headers: {
      "User-Agent": "zblog-research-radar/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`arXiv request failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml) as { feed?: { entry?: ArxivEntry | ArxivEntry[] } };
  const entries = asArray(parsed.feed?.entry);
  const papers = entries.map(paperFromEntry).filter((paper): paper is Paper => Boolean(paper));

  return papers.length > 0 ? papers : fallbackRadarSummary.papers;
}
