"use client";

import { useMemo, useState } from "react";
import type { Paper, PaperNote, PaperPreferences } from "@/lib/types";
import { paperCategories } from "@/lib/data";
import { PaperCard } from "./paper-card";

export function PaperLibrary({
  initialPapers,
  initialPreferences,
  activeCategory
}: {
  initialPapers: Paper[];
  initialPreferences: PaperPreferences;
  activeCategory: string;
}) {
  const [papers, setPapers] = useState(initialPapers);
  const [status, setStatus] = useState("点击论文卡片上的按钮即可收藏或取消收藏。");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<PaperNote>({
    researchQuestion: "",
    method: "",
    result: "",
    reproducibleCode: "",
    takeaway: ""
  });

  const editingPaper = useMemo(
    () => papers.find((paper) => paper.id === editingId) ?? null,
    [editingId, papers]
  );

  const filteredPapers = useMemo(() => {
    const categoryFiltered =
      activeCategory === "全部" ? papers : papers.filter((paper) => paper.category === activeCategory);
    const preferred = categoryFiltered.filter(
      (paper) =>
        initialPreferences.categories.includes(paper.category) ||
        paper.tags.some((tag) => initialPreferences.keywords.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())))
    );
    const others = categoryFiltered.filter((paper) => !preferred.includes(paper));

    return [...preferred, ...others];
  }, [activeCategory, initialPreferences.categories, initialPreferences.keywords, papers]);

  async function toggleFavorite(paper: Paper) {
    const response = await fetch(`/api/papers/library/${encodeURIComponent(paper.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !paper.isFavorite })
    });

    if (!response.ok) {
      setStatus("收藏状态保存失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { paper: Paper };
    setPapers((current) => current.map((item) => (item.id === data.paper.id ? data.paper : item)));
    setStatus(data.paper.isFavorite ? "已加入论文收藏。" : "已取消收藏。");
  }

  function startEditNote(paper: Paper) {
    setEditingId(paper.id);
    setNoteDraft(
      paper.note ?? {
        researchQuestion: "",
        method: "",
        result: "",
        reproducibleCode: "",
        takeaway: ""
      }
    );
    setStatus(`正在编辑《${paper.title}》的论文笔记。`);
  }

  function updateNoteField<K extends keyof PaperNote>(key: K, value: PaperNote[K]) {
    setNoteDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveNote(paper: Paper) {
    const response = await fetch(`/api/papers/library/${encodeURIComponent(paper.id)}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: noteDraft })
    });

    if (!response.ok) {
      setStatus("论文笔记保存失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { paper: Paper };
    setPapers((current) => current.map((item) => (item.id === data.paper.id ? data.paper : item)));
    setEditingId(null);
    setStatus("论文笔记已保存。");
  }

  async function generateNote(paper: Paper) {
    setStatus("正在生成论文笔记初稿...");
    const response = await fetch("/api/papers/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paper)
    });
    const data = (await response.json()) as { note?: PaperNote; message?: string };

    if (!response.ok) {
      setStatus(data.message ?? "AI 生成失败，请检查 API Key 或稍后再试。");
      return;
    }

    if (data.note) {
      setNoteDraft(data.note);
      setEditingId(paper.id);
      setStatus("AI 初稿已生成，检查后保存即可。");
      return;
    }

    setStatus(data.message ?? "AI 生成失败，请稍后再试。");
  }

  return (
    <section className="space-y-5">
      <div className="card flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
        <p className="text-sm font-bold text-ink/68">{status}</p>
        <p className="text-sm font-bold text-pine">
          当前偏好：{initialPreferences.categories.join(" / ")}
        </p>
      </div>
      <div className="grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPapers.map((paper) => (
          <PaperCard
            key={paper.id}
            paper={paper}
            action={
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(paper)}
                  className={`button-link w-full ${
                    paper.isFavorite ? "border border-coral/30 bg-coral/10 text-coral" : "button-primary"
                  }`}
                >
                  {paper.isFavorite ? "取消收藏" : "收藏论文"}
                </button>
                <button type="button" onClick={() => startEditNote(paper)} className="button-link button-secondary w-full">
                  编辑论文笔记
                </button>
              </div>
            }
          />
        ))}
      </div>
      {editingPaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-4xl overflow-y-auto rounded-[8px] border border-line bg-cloud shadow-soft">
            <div className="sticky top-0 flex flex-col justify-between gap-4 border-b border-line bg-cloud p-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-black uppercase text-coral">Paper Note</p>
                <h3 className="mt-1 text-2xl font-black leading-tight text-ink">编辑论文笔记</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/64">{editingPaper.title}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => generateNote(editingPaper)} className="button-link button-secondary">
                  AI 生成初稿
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="button-link button-secondary">
                  关闭
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-ink">
                研究问题
                <textarea
                  value={noteDraft.researchQuestion}
                  onChange={(event) => updateNoteField("researchQuestion", event.target.value)}
                  className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                核心方法
                <textarea
                  value={noteDraft.method}
                  onChange={(event) => updateNoteField("method", event.target.value)}
                  className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                实验结论
                <textarea
                  value={noteDraft.result}
                  onChange={(event) => updateNoteField("result", event.target.value)}
                  className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink">
                可复现代码
                <textarea
                  value={noteDraft.reproducibleCode}
                  onChange={(event) => updateNoteField("reproducibleCode", event.target.value)}
                  className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-ink md:col-span-2">
                我能借鉴
                <textarea
                  value={noteDraft.takeaway}
                  onChange={(event) => updateNoteField("takeaway", event.target.value)}
                  className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
                />
              </label>
              <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
                <button type="button" onClick={() => saveNote(editingPaper)} className="button-link button-primary">
                  保存笔记
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="button-link button-secondary">
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {filteredPapers.length === 0 ? (
        <div className="card p-6 text-sm leading-6 text-ink/70">
          当前分类暂无论文。可以先切回“全部”，或者在工作台调整论文偏好。
        </div>
      ) : null}
    </section>
  );
}

export function PaperPreferenceEditor({ initialPreferences }: { initialPreferences: PaperPreferences }) {
  const [categories, setCategories] = useState(initialPreferences.categories);
  const [keywordsText, setKeywordsText] = useState(initialPreferences.keywords.join(", "));
  const [status, setStatus] = useState("这些偏好会影响论文库排序和后续雷达抓取关键词。");

  function toggleCategory(category: string) {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  }

  async function savePreferences() {
    const response = await fetch("/api/paper-preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories,
        keywords: keywordsText
          .split(/[,，]/)
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      })
    });

    if (!response.ok) {
      setStatus("偏好保存失败，请稍后再试。");
      return;
    }

    setStatus("论文偏好已保存。");
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-black text-ink">论文偏好</h2>
      <p className="mt-1 text-sm text-ink/60">{status}</p>
      <div className="mt-5 space-y-5">
        <div>
          <p className="text-sm font-black text-ink">关注分类</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {paperCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-[8px] border px-3 py-2 text-sm font-black ${
                  categories.includes(category)
                    ? "border-pine bg-pine text-white"
                    : "border-line bg-white text-ink/70"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <label className="grid gap-2 text-sm font-bold text-ink">
          关注关键词
          <textarea
            value={keywordsText}
            onChange={(event) => setKeywordsText(event.target.value)}
            className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
            placeholder="RAG, Agent, vector database, evaluation"
          />
        </label>
        <button type="button" onClick={savePreferences} className="button-link button-primary w-full">
          保存论文偏好
        </button>
      </div>
    </section>
  );
}
