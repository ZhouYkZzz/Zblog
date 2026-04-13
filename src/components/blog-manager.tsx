"use client";

import { useMemo, useState } from "react";
import type { BlogPost } from "@/lib/types";
import { blogCategories } from "@/lib/data";
import { Tag } from "./tag";

type BlogFormState = {
  slug?: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tagsText: string;
  featured: boolean;
  publishedAt: string;
};

const emptyForm: BlogFormState = {
  title: "",
  summary: "",
  content: "",
  coverImage: "",
  category: "读研记录",
  tagsText: "",
  featured: false,
  publishedAt: new Date().toISOString().slice(0, 10)
};

function formFromPost(post: BlogPost): BlogFormState {
  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    content: post.content,
    coverImage: post.coverImage,
    category: post.category,
    tagsText: post.tags.join(", "),
    featured: post.featured,
    publishedAt: post.publishedAt
  };
}

function payloadFromForm(form: BlogFormState) {
  return {
    title: form.title,
    summary: form.summary,
    content: form.content,
    coverImage: form.coverImage,
    category: form.category,
    tags: form.tagsText
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    featured: form.featured,
    publishedAt: form.publishedAt
  };
}

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [status, setStatus] = useState("准备写一篇新文章。");
  const editing = Boolean(form.slug);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [posts]
  );

  function updateField<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function savePost() {
    if (!form.title.trim()) {
      setStatus("标题不能为空。");
      return;
    }

    const response = await fetch(form.slug ? `/api/blog/${form.slug}` : "/api/blog", {
      method: form.slug ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromForm(form))
    });

    if (!response.ok) {
      setStatus("保存失败，请稍后再试。");
      return;
    }

    const data = (await response.json()) as { post: BlogPost };
    setPosts((current) =>
      form.slug
        ? current.map((post) => (post.slug === form.slug ? data.post : post))
        : [data.post, ...current]
    );
    setForm(emptyForm);
    setStatus(editing ? "文章已更新。" : "文章已发布。");
  }

  async function removePost(slug: string) {
    const target = posts.find((post) => post.slug === slug);
    const confirmed = window.confirm(`确定删除《${target?.title ?? slug}》吗？`);

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/blog/${slug}`, { method: "DELETE" });

    if (!response.ok) {
      setStatus("删除失败，请稍后再试。");
      return;
    }

    setPosts((current) => current.filter((post) => post.slug !== slug));
    if (form.slug === slug) {
      setForm(emptyForm);
    }
    setStatus("文章已删除。");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">{editing ? "编辑文章" : "写一篇新文章"}</h2>
            <p className="mt-1 text-sm text-ink/60">{status}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setStatus("准备写一篇新文章。");
            }}
            className="button-link button-secondary"
          >
            新文章
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            标题
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              placeholder="例如：第一次组会前，我应该准备什么"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            摘要
            <textarea
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              className="min-h-20 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-6 outline-none focus:border-pine"
              placeholder="用两三句话说明这篇文章解决什么问题。"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            正文
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              className="min-h-64 rounded-[8px] border border-line bg-white px-3 py-2 font-normal leading-7 outline-none focus:border-pine"
              placeholder="从这里开始写你的博客。"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink">
              分类
              <select
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
                className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              >
                {blogCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink">
              发布日期
              <input
                type="date"
                value={form.publishedAt}
                onChange={(event) => updateField("publishedAt", event.target.value)}
                className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-ink">
            标签
            <input
              value={form.tagsText}
              onChange={(event) => updateField("tagsText", event.target.value)}
              className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              placeholder="RAG, 组会, 论文笔记"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            封面图 URL
            <input
              value={form.coverImage}
              onChange={(event) => updateField("coverImage", event.target.value)}
              className="rounded-[8px] border border-line bg-white px-3 py-2 font-normal outline-none focus:border-pine"
              placeholder="留空会使用默认图片"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => updateField("featured", event.target.checked)}
              className="h-4 w-4 accent-pine"
            />
            放到首页精选
          </label>
          <button type="button" onClick={savePost} className="button-link button-primary w-full">
            {editing ? "保存修改" : "发布文章"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-ink">已有文章</h2>
        {sortedPosts.map((post) => (
          <article key={post.slug} className="card p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Tag tone="green">{post.category}</Tag>
                  {post.featured ? <Tag tone="red">首页精选</Tag> : null}
                </div>
                <h3 className="text-lg font-black leading-tight text-ink">{post.title}</h3>
                <p className="line-clamp-2 text-sm leading-6 text-ink/66">{post.summary}</p>
                <p className="text-xs font-bold text-ink/48">{post.publishedAt}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(formFromPost(post));
                    setStatus(`正在编辑《${post.title}》。`);
                  }}
                  className="button-link button-secondary"
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => removePost(post.slug)}
                  className="button-link border border-coral/30 bg-coral/10 text-coral"
                >
                  删除
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
