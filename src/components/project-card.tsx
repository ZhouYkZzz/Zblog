import type { TechProject } from "@/lib/types";
import { Tag } from "./tag";

const formatter = new Intl.NumberFormat("en", { notation: "compact" });

export function ProjectCard({ project, showTopics = true }: { project: TechProject; showTopics?: boolean }) {
  return (
    <article className="card flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <a href={project.url} target="_blank" rel="noreferrer" className="text-lg font-black text-ink hover:text-pine">
            {project.fullName}
          </a>
          <p className="mt-1 text-sm font-semibold text-ink/56">{project.language}</p>
        </div>
        <span className="rounded-[8px] bg-gold/12 px-2.5 py-1 text-xs font-black text-gold">
          {formatter.format(project.stars)} stars
        </span>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-ink/68">{project.description}</p>
      {showTopics ? (
        <div className="mt-auto flex flex-wrap gap-2">
          {project.topics.slice(0, 4).map((topic) => (
            <Tag key={topic}>{topic}</Tag>
          ))}
        </div>
      ) : null}
    </article>
  );
}
