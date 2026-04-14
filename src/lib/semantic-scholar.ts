import type { Paper, SourceStatus } from "./types";

const SEMANTIC_SCHOLAR_BATCH_ENDPOINT = "https://api.semanticscholar.org/graph/v1/paper/batch";

type SemanticScholarPaper = {
  paperId?: string;
  title?: string;
  url?: string;
  year?: number;
  venue?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  tldr?: {
    text?: string;
  } | null;
  openAccessPdf?: {
    url?: string;
  } | null;
};

export type SemanticScholarEnrichment = {
  papers: Paper[];
  status: SourceStatus;
  message?: string;
};

function arxivSemanticId(paper: Paper) {
  const rawId = paper.externalId ?? paper.id;
  const cleanedId = rawId.replace(/^arxiv:/i, "").replace(/^https?:\/\/arxiv\.org\/abs\//i, "");

  return cleanedId ? `ARXIV:${cleanedId}` : undefined;
}

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "zblog-research-radar/0.1"
  };
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return headers;
}

export async function enrichPapersWithSemanticScholar(papers: Paper[]): Promise<SemanticScholarEnrichment> {
  const ids = papers.map(arxivSemanticId).filter((id): id is string => Boolean(id));

  if (ids.length === 0) {
    return { papers, status: "fallback", message: "没有可用于 Semantic Scholar 查询的 arXiv ID。" };
  }

  const params = new URLSearchParams({
    fields: "title,url,year,venue,citationCount,influentialCitationCount,tldr,openAccessPdf"
  });
  const response = await fetch(`${SEMANTIC_SCHOLAR_BATCH_ENDPOINT}?${params.toString()}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ ids }),
    next: { revalidate: 60 * 60 * 6 }
  });

  if (response.status === 429) {
    return {
      papers,
      status: "limited",
      message: "Semantic Scholar 当前触发匿名限流；配置 SEMANTIC_SCHOLAR_API_KEY 后可提升额度。"
    };
  }

  if (!response.ok) {
    return {
      papers,
      status: "fallback",
      message: `Semantic Scholar request failed: ${response.status}`
    };
  }

  const items = (await response.json()) as Array<SemanticScholarPaper | null>;
  const metadataById = new Map<string, SemanticScholarPaper>();

  items.forEach((item, index) => {
    if (item) {
      metadataById.set(ids[index], item);
    }
  });

  const enrichedPapers = papers.map((paper) => {
    const id = arxivSemanticId(paper);
    const metadata = id ? metadataById.get(id) : undefined;

    if (!metadata) {
      return paper;
    }

    return {
      ...paper,
      semanticScholar: {
        paperId: metadata.paperId,
        citationCount: metadata.citationCount,
        influentialCitationCount: metadata.influentialCitationCount,
        venue: metadata.venue,
        url: metadata.url,
        tldr: metadata.tldr?.text,
        openAccessPdf: metadata.openAccessPdf?.url
      }
    };
  });

  return { papers: enrichedPapers, status: "live" };
}
