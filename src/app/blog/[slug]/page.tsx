import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tag } from "@/components/tag";
import { getPostBySlugFromStore } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugFromStore(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | ZBlog`,
    description: post.summary
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlugFromStore(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-shell pt-10">
      <article className="mx-auto max-w-4xl space-y-8">
        <Link href="/blog" className="text-sm font-bold text-pine">
          返回博客
        </Link>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Tag tone="green">{post.category}</Tag>
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <h1 className="text-4xl font-black leading-tight text-ink md:text-5xl">{post.title}</h1>
          <p className="text-base leading-8 text-ink/68">{post.summary}</p>
          <p className="text-sm font-semibold text-ink/50">
            {post.publishedAt} · {post.readingMinutes} min
          </p>
        </div>
        <img src={post.coverImage} alt="" className="max-h-[420px] w-full rounded-[8px] object-cover" />
        <div className="card space-y-5 p-7 text-base leading-8 text-ink/78">
          <p>{post.content}</p>
          <p>
            下一步会把这篇记录连接到论文库、实验日志和组会材料，形成从阅读到产出的闭环。
          </p>
        </div>
      </article>
    </main>
  );
}
