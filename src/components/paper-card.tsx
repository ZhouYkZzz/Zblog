import type { Paper } from "@/lib/types";
import { Tag } from "./tag";

export function PaperCard({
  paper,
  compact = false,
  fill = true,
  action
}: {
  paper: Paper;
  compact?: boolean;
  fill?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <article className={`card flex flex-col gap-4 p-5 ${fill ? "h-full" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={paper.isFavorite ? "red" : "green"}>{paper.category}</Tag>
        <Tag>{paper.source}</Tag>
        {paper.year ? <span className="text-xs font-bold text-ink/50">{paper.year}</span> : null}
      </div>
      <div className="space-y-2">
        <a href={paper.url} target="_blank" rel="noreferrer" className="block text-lg font-black leading-tight text-ink hover:text-pine">
          {paper.title}
        </a>
        <p className="text-sm font-semibold text-ink/56">{paper.authors.slice(0, 4).join(", ")}</p>
        <p className={`${compact ? "line-clamp-2" : "line-clamp-3"} text-sm leading-6 text-ink/68`}>
          {paper.abstract}
        </p>
      </div>
      {paper.note && !compact ? (
        <div className="space-y-2 border-t border-line pt-4 text-sm leading-6 text-ink/70">
          <p>
            <strong className="text-ink">研究问题：</strong>
            {paper.note.researchQuestion}
          </p>
          <p>
            <strong className="text-ink">我能借鉴：</strong>
            {paper.note.takeaway}
          </p>
        </div>
      ) : null}
      <div className="mt-auto space-y-4">
        <div className="flex flex-wrap gap-2">
          {paper.tags.slice(0, 4).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        {action ? <div className="border-t border-line pt-4">{action}</div> : null}
      </div>
    </article>
  );
}
