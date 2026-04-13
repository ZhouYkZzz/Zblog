"use client";

import { useState } from "react";
import type { HomeFocusBlock } from "@/lib/types";

export function HomeFocusEditor({ initialBlocks }: { initialBlocks: HomeFocusBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [status, setStatus] = useState("这三块会显示在首页右侧。");

  function updateBlock(index: number, key: keyof HomeFocusBlock, value: string) {
    setBlocks((current) =>
      current.map((block, blockIndex) => (blockIndex === index ? { ...block, [key]: value } : block))
    );
  }

  async function saveBlocks() {
    const response = await fetch("/api/home-focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks })
    });

    if (!response.ok) {
      setStatus("保存失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { blocks: HomeFocusBlock[] };
    setBlocks(data.blocks);
    setStatus("首页三块内容已保存。");
  }

  return (
    <section className="card p-6">
      <h2 className="text-2xl font-black text-ink">首页三块内容</h2>
      <p className="mt-1 text-sm text-ink/60">{status}</p>
      <div className="mt-6 grid gap-5">
        {blocks.map((block, index) => (
          <div key={index} className="rounded-[8px] border border-line bg-white p-4">
            <label className="grid gap-2 text-sm font-bold text-ink">
              标题
              <input
                value={block.title}
                onChange={(event) => updateBlock(index, "title", event.target.value)}
                className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              />
            </label>
            <label className="mt-3 grid gap-2 text-sm font-bold text-ink">
              内容
              <textarea
                value={block.text}
                onChange={(event) => updateBlock(index, "text", event.target.value)}
                className="min-h-24 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={saveBlocks} className="button-link button-primary w-full">
          保存首页内容
        </button>
      </div>
    </section>
  );
}
