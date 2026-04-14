export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readingMinutes: number;
};

export type PaperNote = {
  researchQuestion: string;
  method: string;
  result: string;
  reproducibleCode: string;
  takeaway: string;
};

export type Paper = {
  id: string;
  externalId?: string;
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  pdfUrl?: string;
  source: string;
  category: string;
  tags: string[];
  year?: number;
  publishedAt?: string;
  isFavorite?: boolean;
  note?: PaperNote;
  semanticScholar?: {
    paperId?: string;
    citationCount?: number;
    influentialCitationCount?: number;
    venue?: string;
    url?: string;
    tldr?: string;
    openAccessPdf?: string;
  };
};

export type HackerNewsStory = {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  descendants: number;
  time: number;
};

export type SourceStatus = "live" | "fallback" | "limited";

export type TechProject = {
  id: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  updatedAt: string;
  source: string;
};

export type RadarSummary = {
  generatedAt: string;
  papers: Paper[];
  projects: TechProject[];
  signals: string[];
  hackerNews: HackerNewsStory[];
  sourceHealth: {
    arxiv: SourceStatus;
    github: SourceStatus;
    semanticScholar: SourceStatus;
    hackerNews: SourceStatus;
  };
};

export type WeeklyDraft = {
  topic: string;
  papers: string;
  projects: string;
  todos: string;
  notes: string;
};

export type PaperPreferences = {
  categories: string[];
  keywords: string[];
};

export type HomeFocusBlock = {
  title: string;
  text: string;
};
