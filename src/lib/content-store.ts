import { promises as fs } from "node:fs";
import path from "node:path";
import { blogPosts as fallbackPosts, paperCategories, researchKeywords, savedPapers } from "./data";
import type { BlogPost, HomeFocusBlock, Paper, PaperPreferences, WeeklyDraft } from "./types";

const dataDir = path.join(process.cwd(), "data");
const blogFile = path.join(dataDir, "blog-posts.json");
const weeklyDraftFile = path.join(dataDir, "weekly-draft.json");
const papersFile = path.join(dataDir, "papers.json");
const paperPreferencesFile = path.join(dataDir, "paper-preferences.json");
const homeFocusFile = path.join(dataDir, "home-focus.json");

const defaultDraft: WeeklyDraft = {
  topic: "RAG 系统从检索增强走向质量评估",
  papers: "RAG、Self-RAG、RAGAS",
  projects: "LlamaIndex、Milvus、Ragas",
  todos: "用一个小型中文知识库跑 hybrid search + rerank，并记录失败样例。",
  notes: "组会时重点讲清楚：为什么只看生成答案不够，还要评估检索、引用和失败样例。"
};

const defaultPaperPreferences: PaperPreferences = {
  categories: ["RAG", "Agent", "Evaluation"],
  keywords: ["RAG", "LLM agent", "rerank", "vector database", "evaluation"]
};

const defaultHomeFocusBlocks: HomeFocusBlock[] = [
  {
    title: "本周阅读",
    text: "先看 RAG 评估和 Agent 工具调用，给后续组会准备 3 篇可讲论文。"
  },
  {
    title: "工程实践",
    text: "搭一个可复现的论文雷达，把检索、摘要、收藏和笔记连接起来。"
  },
  {
    title: "长期资产",
    text: "所有博客、论文和实验记录都围绕开题、投稿和作品集沉淀。"
  }
];

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await ensureDataDir();
    await fs.writeFile(file, `${JSON.stringify(fallback, null, 2)}\n`, "utf8");
    return fallback;
  }
}

async function writeJsonFile<T>(file: string, data: T) {
  await ensureDataDir();
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `post-${Date.now()}`;
}

function uniqueSlug(title: string, posts: BlogPost[], currentSlug?: string) {
  const base = slugify(title);
  let next = base;
  let index = 2;
  const existing = new Set(posts.filter((post) => post.slug !== currentSlug).map((post) => post.slug));

  while (existing.has(next)) {
    next = `${base}-${index}`;
    index += 1;
  }

  return next;
}

function normalizePost(input: Partial<BlogPost>, posts: BlogPost[], currentSlug?: string): BlogPost {
  const title = input.title?.trim() || "未命名文章";
  const content = input.content?.trim() || "这里开始写正文。";
  const words = content.replace(/\s+/g, "").length;

  return {
    slug: currentSlug ?? uniqueSlug(title, posts),
    title,
    summary: input.summary?.trim() || content.slice(0, 90),
    content,
    coverImage:
      input.coverImage?.trim() ||
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    category: input.category?.trim() || "读研记录",
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    featured: Boolean(input.featured),
    publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
    readingMinutes: input.readingMinutes || Math.max(1, Math.ceil(words / 500))
  };
}

export async function getBlogPosts() {
  const posts = await readJsonFile<BlogPost[]>(blogFile, fallbackPosts);
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlugFromStore(slug: string) {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function createBlogPost(input: Partial<BlogPost>) {
  const posts = await getBlogPosts();
  const post = normalizePost(input, posts);
  await writeJsonFile(blogFile, [post, ...posts]);
  return post;
}

export async function updateBlogPost(slug: string, input: Partial<BlogPost>) {
  const posts = await getBlogPosts();
  const target = posts.find((post) => post.slug === slug);

  if (!target) {
    return null;
  }

  const updated = normalizePost({ ...target, ...input }, posts, slug);
  const nextPosts = posts.map((post) => (post.slug === slug ? updated : post));
  await writeJsonFile(blogFile, nextPosts);
  return updated;
}

export async function deleteBlogPost(slug: string) {
  const posts = await getBlogPosts();
  const nextPosts = posts.filter((post) => post.slug !== slug);

  if (nextPosts.length === posts.length) {
    return false;
  }

  await writeJsonFile(blogFile, nextPosts);
  return true;
}

export async function getWeeklyDraft() {
  return readJsonFile<WeeklyDraft>(weeklyDraftFile, defaultDraft);
}

export async function updateWeeklyDraft(input: Partial<WeeklyDraft>) {
  const draft: WeeklyDraft = {
    topic: input.topic?.trim() || defaultDraft.topic,
    papers: input.papers?.trim() || "",
    projects: input.projects?.trim() || "",
    todos: input.todos?.trim() || "",
    notes: input.notes?.trim() || ""
  };

  await writeJsonFile(weeklyDraftFile, draft);
  return draft;
}

export async function getPapers() {
  const papers = await readJsonFile<Paper[]>(papersFile, savedPapers);
  return papers.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export async function getFavoritePapersFromStore() {
  const papers = await getPapers();
  return papers.filter((paper) => paper.isFavorite);
}

export async function updatePaperFavorite(id: string, isFavorite: boolean) {
  const papers = await getPapers();
  const target = papers.find((paper) => paper.id === id);

  if (!target) {
    return null;
  }

  const nextPaper = { ...target, isFavorite };
  const nextPapers = papers.map((paper) => (paper.id === id ? nextPaper : paper));
  await writeJsonFile(papersFile, nextPapers);
  return nextPaper;
}

function normalizePaper(input: Partial<Paper>): Paper {
  const title = input.title?.trim() || "Untitled Paper";
  const id = input.id?.trim() || input.externalId?.trim() || slugify(title);
  const category = input.category?.trim() || "LLM Application";
  const tags = input.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [category];
  const publishedAt = input.publishedAt;

  return {
    id,
    externalId: input.externalId?.trim() || id,
    title,
    authors: input.authors?.map((author) => author.trim()).filter(Boolean) ?? [],
    abstract: input.abstract?.trim() || "No abstract yet.",
    url: input.url?.trim() || "#",
    pdfUrl: input.pdfUrl?.trim() || undefined,
    source: input.source?.trim() || "Manual",
    category,
    tags,
    year: input.year ?? (publishedAt ? new Date(publishedAt).getFullYear() : undefined),
    publishedAt,
    isFavorite: Boolean(input.isFavorite),
    note: input.note
  };
}

export async function addPaperToLibrary(input: Partial<Paper>) {
  const papers = await getPapers();
  const paper = normalizePaper(input);
  const existing = papers.find(
    (item) =>
      item.id === paper.id ||
      Boolean(item.externalId && paper.externalId && item.externalId === paper.externalId) ||
      item.url === paper.url
  );

  if (existing) {
    return { paper: existing, created: false };
  }

  await writeJsonFile(papersFile, [paper, ...papers]);
  return { paper, created: true };
}

export async function getPaperPreferences() {
  return readJsonFile<PaperPreferences>(paperPreferencesFile, defaultPaperPreferences);
}

export async function updatePaperPreferences(input: Partial<PaperPreferences>) {
  const categories = (input.categories ?? [])
    .filter((category) => paperCategories.includes(category))
    .slice(0, paperCategories.length);
  const keywords = (input.keywords ?? [])
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 12);

  const preferences: PaperPreferences = {
    categories: categories.length > 0 ? categories : defaultPaperPreferences.categories,
    keywords: keywords.length > 0 ? keywords : researchKeywords.slice(0, 5)
  };

  await writeJsonFile(paperPreferencesFile, preferences);
  return preferences;
}

export async function getHomeFocusBlocks() {
  return readJsonFile<HomeFocusBlock[]>(homeFocusFile, defaultHomeFocusBlocks);
}

export async function updateHomeFocusBlocks(input: HomeFocusBlock[]) {
  const blocks = input.slice(0, 3).map((block, index) => ({
    title: block.title?.trim() || defaultHomeFocusBlocks[index]?.title || "自定义模块",
    text: block.text?.trim() || defaultHomeFocusBlocks[index]?.text || "写下这一块要提醒自己的内容。"
  }));

  while (blocks.length < 3) {
    blocks.push(defaultHomeFocusBlocks[blocks.length]);
  }

  await writeJsonFile(homeFocusFile, blocks);
  return blocks;
}
