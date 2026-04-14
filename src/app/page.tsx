import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { PaperCard } from "@/components/paper-card";
import { ProjectCard } from "@/components/project-card";
import { Tag } from "@/components/tag";
import { getBlogPosts, getFavoritePapersFromStore } from "@/lib/content-store";
import { fallbackProjects } from "@/lib/data";

export default async function Home() {
  const [blogPosts, favoritePapers] = await Promise.all([
    getBlogPosts(),
    getFavoritePapersFromStore()
  ]);
  const latestPosts = blogPosts.slice(0, 2);

  return (
    <main className="page-shell space-y-16 pt-10">
      <section>
        <div className="card overflow-hidden">
          <div className="grid min-h-[430px] gap-0 md:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-between gap-8 p-7 md:p-9">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Tag tone="green">HDU CS</Tag>
                  <Tag tone="gold">研究生工作台</Tag>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">
                    整合论文，项目和组会灵感的个人博客。
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-ink/70">
                    面向杭州电子科技大学计算机技术研究生阶段，把论文阅读、项目实践和组会材料沉淀到同一个长期工作台里。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/radar" className="button-link button-primary">
                  查看今日雷达
                </Link>
                <Link href="/papers" className="button-link button-secondary">
                  打开论文库
                </Link>
              </div>
            </div>
            <div className="min-h-[260px] border-t border-line md:border-l md:border-t-0">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-coral">Blog</p>
            <h2 className="mt-2 text-3xl font-black text-ink">近期文章</h2>
          </div>
          <Link href="/blog" className="button-link button-secondary">
            全部文章
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {latestPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-black uppercase text-coral">Papers</p>
            <h2 className="mt-2 text-3xl font-black text-ink">重点论文</h2>
          </div>
          <div className="grid gap-5">
            {favoritePapers.slice(0, 3).map((paper) => (
              <PaperCard key={paper.id} paper={paper} compact />
            ))}
            {favoritePapers.length === 0 ? (
              <div className="card p-5 text-sm leading-6 text-ink/68">
                还没有收藏论文。去论文库点“收藏论文”，这里会自动更新。
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-black uppercase text-coral">Projects</p>
            <h2 className="mt-2 text-3xl font-black text-ink">技术项目</h2>
          </div>
          <div className="grid gap-5">
            {fallbackProjects.slice(0, 2).map((project) => (
              <ProjectCard key={project.id} project={project} showTopics={false} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
