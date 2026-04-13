import { ProjectCard } from "@/components/project-card";
import { RadarPaperList } from "@/components/radar-paper-list";
import { SectionHeading } from "@/components/section-heading";
import { Tag } from "@/components/tag";
import { getPapers } from "@/lib/content-store";
import { fetchRadarSummary } from "@/lib/radar";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const [summary, libraryPapers] = await Promise.all([fetchRadarSummary(), getPapers()]);
  const libraryIds = libraryPapers.flatMap((paper) => [paper.id, paper.externalId].filter(Boolean) as string[]);
  const generatedAt = new Date(summary.generatedAt).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false
  });

  return (
    <main className="page-shell space-y-10 pt-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Radar"
          title="信息雷达"
          description="实时聚合 arXiv 论文和 GitHub 技术项目，用于每天快速判断哪些内容值得阅读、复现或放进组会材料。"
        />
        <div className="card min-w-[240px] p-4 text-sm leading-6 text-ink/70">
          <p className="font-black text-ink">更新时间</p>
          <p>{generatedAt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag tone={summary.sourceHealth.arxiv === "live" ? "green" : "gold"}>
              arXiv {summary.sourceHealth.arxiv}
            </Tag>
            <Tag tone={summary.sourceHealth.github === "live" ? "green" : "gold"}>
              GitHub {summary.sourceHealth.github}
            </Tag>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {summary.signals.map((signal) => (
          <div key={signal} className="card p-5 text-sm leading-6 text-ink/72">
            {signal}
          </div>
        ))}
      </section>

      <RadarPaperList papers={summary.papers} initialLibraryIds={libraryIds} />

      <section className="space-y-6">
        <h2 className="text-3xl font-black text-ink">热门项目</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {summary.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
