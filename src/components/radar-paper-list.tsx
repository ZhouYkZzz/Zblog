"use client";

import { useMemo, useState } from "react";
import type { Paper } from "@/lib/types";
import { PaperCard } from "./paper-card";

export function RadarPaperList({
  papers,
  initialLibraryIds
}: {
  papers: Paper[];
  initialLibraryIds: string[];
}) {
  const [libraryIds, setLibraryIds] = useState(initialLibraryIds);
  const [status, setStatus] = useState("看到值得长期阅读的论文，可以加入论文库。");
  const librarySet = useMemo(() => new Set(libraryIds), [libraryIds]);

  function isInLibrary(paper: Paper) {
    return librarySet.has(paper.id) || Boolean(paper.externalId && librarySet.has(paper.externalId));
  }

  async function addToLibrary(paper: Paper) {
    const response = await fetch("/api/papers/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...paper,
        isFavorite: false
      })
    });

    if (!response.ok) {
      setStatus("加入论文库失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { paper: Paper; created: boolean };
    setLibraryIds((current) => Array.from(new Set([...current, data.paper.id, data.paper.externalId ?? data.paper.id])));
    setStatus(data.created ? "已加入论文库，可以去论文库收藏或补笔记。" : "这篇论文已经在论文库中。");
  }

  return (
    <section className="space-y-5">
      <div className="card flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
        <h2 className="text-3xl font-black text-ink">最新论文</h2>
        <p className="text-sm font-bold text-ink/64">{status}</p>
      </div>
      <div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-4">
        {papers.map((paper) => {
          const saved = isInLibrary(paper);

          return (
            <PaperCard
              key={`${paper.source}-${paper.id}`}
              paper={paper}
              compact
              action={
                <button
                  type="button"
                  onClick={() => addToLibrary(paper)}
                  disabled={saved}
                  className={`button-link w-full ${
                    saved ? "border border-line bg-white text-ink/45" : "button-primary"
                  }`}
                >
                  {saved ? "已加入论文库" : "加入论文库"}
                </button>
              }
            />
          );
        })}
      </div>
    </section>
  );
}
