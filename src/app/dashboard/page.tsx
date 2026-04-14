import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { PaperCard } from "@/components/paper-card";
import { SectionHeading } from "@/components/section-heading";
import { Tag } from "@/components/tag";
import { getBlogPosts, getFavoritePapersFromStore, getPaperPreferences, getWeeklyDraft } from "@/lib/content-store";
import { researchKeywords } from "@/lib/data";

const sources = [
  { name: "arXiv AI/RAG", kind: "Paper API", status: "enabled" },
  { name: "GitHub Search", kind: "Repository API", status: "enabled" },
  { name: "Semantic Scholar", kind: "Metadata API", status: "reserved" },
  { name: "Hacker News", kind: "Tech Feed", status: "reserved" }
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [blogPosts, weeklyDraft, favorites, preferences] = await Promise.all([
    getBlogPosts(),
    getWeeklyDraft(),
    getFavoritePapersFromStore(),
    getPaperPreferences()
  ]);

  return (
    <main className="page-shell space-y-10 pt-10">
      <SectionHeading
        eyebrow="Dashboard"
        title="个人工作台"
        description="本地优先的管理入口，先服务文章、论文收藏、订阅源和每周组会材料整理。"
      />

      <section className="grid gap-5 md:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm font-black text-coral">文章</p>
          <p className="mt-2 text-4xl font-black text-ink">{blogPosts.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-black text-coral">收藏论文</p>
          <p className="mt-2 text-4xl font-black text-ink">{favorites.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-black text-coral">关键词</p>
          <p className="mt-2 text-4xl font-black text-ink">{researchKeywords.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-black text-coral">组会素材</p>
            <Link href="/dashboard/meeting" className="text-xs font-black text-pine">
              编辑草稿
            </Link>
          </div>
          <p className="mt-2 text-4xl font-black text-ink">1</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-ink">文章管理</h2>
            <Link href="/dashboard/blogs" className="text-sm font-black text-pine">
              写作/编辑
            </Link>
          </div>
          <div className="grid gap-5">
            {blogPosts.slice(0, 2).map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-ink">论文收藏</h2>
            <Link href="/dashboard/papers" className="text-sm font-black text-pine">
              管理收藏/偏好
            </Link>
          </div>
          <div className="grid gap-5">
            {favorites.map((paper) => (
              <PaperCard key={paper.id} paper={paper} compact />
            ))}
            {favorites.length === 0 ? (
              <div className="card p-5 text-sm leading-6 text-ink/68">
                还没有收藏论文。当前偏好：{preferences.categories.join(" / ")}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <h2 className="text-2xl font-black text-ink">订阅源</h2>
          <div className="mt-5 grid gap-3">
            {sources.map((source) => (
              <div key={source.name} className="rounded-[8px] border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{source.name}</p>
                    <p className="mt-1 text-sm text-ink/60">{source.kind}</p>
                  </div>
                  <Tag tone={source.status === "enabled" ? "green" : "gold"}>{source.status}</Tag>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 className="text-2xl font-black text-ink">本周组会草稿</h2>
            <Link href="/dashboard/meeting" className="button-link button-secondary">
              编辑草稿
            </Link>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-ink/72">
            <p>
              <strong className="text-ink">主题：</strong>
              {weeklyDraft.topic}
            </p>
            <p>
              <strong className="text-ink">论文：</strong>
              {weeklyDraft.papers}
            </p>
            <p>
              <strong className="text-ink">项目：</strong>
              {weeklyDraft.projects}
            </p>
            <p>
              <strong className="text-ink">待验证：</strong>
              {weeklyDraft.todos}
            </p>
            <p>
              <strong className="text-ink">备注：</strong>
              {weeklyDraft.notes}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
