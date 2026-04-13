import { fallbackRadarSummary } from "./data";
import { fetchArxivPapers } from "./arxiv";
import { getPaperPreferences } from "./content-store";
import { fallbackGitHubProjects, fetchGitHubProjects } from "./github";
import type { RadarSummary } from "./types";

export async function fetchRadarSummary(): Promise<RadarSummary> {
  const preferences = await getPaperPreferences();
  const [papersResult, projectsResult] = await Promise.allSettled([
    fetchArxivPapers({ maxResults: 8, keywords: preferences.keywords }),
    fetchGitHubProjects({ maxResults: 8, keywords: preferences.keywords })
  ]);

  const papers =
    papersResult.status === "fulfilled" ? papersResult.value : fallbackRadarSummary.papers;
  const projects =
    projectsResult.status === "fulfilled" && projectsResult.value.length > 0
      ? projectsResult.value
      : fallbackGitHubProjects();

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
      "本周适合把 RAG 评估、Agent 工具调用和向量检索工程作为三条并行阅读线。"
    ],
    sourceHealth: {
      arxiv: papersResult.status === "fulfilled" ? "live" : "fallback",
      github: projectsResult.status === "fulfilled" ? "live" : "fallback"
    }
  };
}
