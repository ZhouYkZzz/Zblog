"use client";

import { useState } from "react";
import type { WeeklyDraft } from "@/lib/types";

export function WeeklyDraftEditor({ initialDraft }: { initialDraft: WeeklyDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState("可以直接修改本周组会材料。");

  function updateField<K extends keyof WeeklyDraft>(key: K, value: WeeklyDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveDraft() {
    const response = await fetch("/api/weekly-draft", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });

    if (!response.ok) {
      setStatus("保存失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { draft: WeeklyDraft };
    setDraft(data.draft);
    setStatus("组会草稿已保存。");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <div className="card p-6">
        <h2 className="text-2xl font-black text-ink">编辑组会草稿</h2>
        <p className="mt-1 text-sm text-ink/60">{status}</p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            主题
            <input
              value={draft.topic}
              onChange={(event) => updateField("topic", event.target.value)}
              className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            论文
            <textarea
              value={draft.papers}
              onChange={(event) => updateField("papers", event.target.value)}
              className="min-h-24 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            项目
            <textarea
              value={draft.projects}
              onChange={(event) => updateField("projects", event.target.value)}
              className="min-h-24 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            待验证
            <textarea
              value={draft.todos}
              onChange={(event) => updateField("todos", event.target.value)}
              className="min-h-28 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            备注
            <textarea
              value={draft.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="min-h-32 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
            />
          </label>
          <button type="button" onClick={saveDraft} className="button-link button-primary w-full">
            保存组会草稿
          </button>
        </div>
      </div>

      <aside className="card p-6">
        <h2 className="text-2xl font-black text-ink">预览</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-ink/72">
          <p>
            <strong className="text-ink">主题：</strong>
            {draft.topic}
          </p>
          <p>
            <strong className="text-ink">论文：</strong>
            {draft.papers}
          </p>
          <p>
            <strong className="text-ink">项目：</strong>
            {draft.projects}
          </p>
          <p>
            <strong className="text-ink">待验证：</strong>
            {draft.todos}
          </p>
          <p>
            <strong className="text-ink">备注：</strong>
            {draft.notes}
          </p>
        </div>
      </aside>
    </section>
  );
}
