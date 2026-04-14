import { fallbackRadarSummary } from "./data";
import { fetchArxivPapers } from "./arxiv";
import { getPaperPreferences } from "./content-store";
import { fallbackGitHubProjects, fetchGitHubProjects } from "./github";
import { fetchHackerNewsStories } from "./hacker-news";
import { enrichPapersWithSemanticScholar } from "./semantic-scholar";
import type { RadarSummary } from "./types";

export async function fetchRadarSummary(): Promise<RadarSummary> {
  const preferences = await getPaperPreferences();
  const [papersResult, projectsResult, hackerNewsResult] = await Promise.allSettled([
    fetchArxivPapers({ maxResults: 8, keywords: preferences.keywords }),
    fetchGitHubProjects({ maxResults: 8, keywords: preferences.keywords }),
    fetchHackerNewsStories({ maxResults: 10 })
  ]);

  const basePapers =
    papersResult.status === "fulfilled" ? papersResult.value : fallbackRadarSummary.papers;
  const semanticResult = await enrichPapersWithSemanticScholar(basePapers);
  const papers = semanticResult.papers;
  const projects =
    projectsResult.status === "fulfilled" && projectsResult.value.length > 0
      ? projectsResult.value
      : fallbackGitHubProjects();
  const hackerNews = hackerNewsResult.status === "fulfilled" ? hackerNewsResult.value : [];

  return {
    generatedAt: new Date().toISOString(),
    papers,
    projects,
    signals: [
      papersResult.status === "fulfilled"
        ? "arXiv 已拉取最新论文，优先浏览摘要中出现 evaluation、agent、retrieval 的条目。"
        : "arXiv 暂时不可用，已切换到本地论文清单。",
      projectsResult.status === "fulfilled"
        ? "GitHub 项目按最近一年仍活跃且 star 较高的仓库排序。"
        : "GitHub 暂时不可用，已切换到本地项目清单。",
      semanticResult.status === "live"
        ? "Semantic Scholar 已补充论文引用量、TLDR 和 venue 信息，小助手推荐论文时会优先使用这些信号。"
        : semanticResult.status === "limited"
          ? "Semantic Scholar 当前限流，论文仍来自 arXiv；配置 SEMANTIC_SCHOLAR_API_KEY 后可补充引用信息。"
          : "Semantic Scholar 暂时不可用，论文推荐会先基于 arXiv 标题和摘要。",
      hackerNewsResult.status === "fulfilled"
        ? "Hacker News 已接入，可向小助手询问“技术圈正在关注什么”。"
        : "Hacker News 暂时不可用，技术热点问答会提示稍后重试。",
      "本周适合把 RAG 评估、Agent 工具调用和向量检索工程作为三条并行阅读线。"
    ],
    hackerNews,
    sourceHealth: {
      arxiv: papersResult.status === "fulfilled" ? "live" : "fallback",
      github: projectsResult.status === "fulfilled" ? "live" : "fallback",
      semanticScholar: semanticResult.status,
      hackerNews: hackerNewsResult.status === "fulfilled" ? "live" : "fallback"
    }
  };
}
