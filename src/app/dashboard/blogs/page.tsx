import Link from "next/link";
import { BlogManager } from "@/components/blog-manager";
import { SectionHeading } from "@/components/section-heading";
import { getBlogPosts } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function DashboardBlogsPage() {
  const posts = await getBlogPosts();

  return (
    <main className="page-shell space-y-10 pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Writing"
          title="博客写作与管理"
          description="直接在网页里写文章、修改已有文章、删除不再需要的文章。保存后会写入服务器持久化数据。"
        />
        <Link href="/dashboard" className="button-link button-secondary">
          返回工作台
        </Link>
      </div>
      <BlogManager initialPosts={posts} />
    </main>
  );
}
