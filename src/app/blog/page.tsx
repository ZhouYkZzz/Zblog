import { BlogCard } from "@/components/blog-card";
import { SectionHeading } from "@/components/section-heading";
import { Tag } from "@/components/tag";
import { getBlogPosts } from "@/lib/content-store";
import { blogCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <main className="page-shell space-y-10 pt-10">
      <SectionHeading
        eyebrow="Blog"
        title="把读研过程写成可复用的记录"
        description="文章按读研记录、论文笔记、技术实践、项目复盘、课程与实验组织，公开内容用于展示，内部笔记继续沉淀。"
      />

      <div className="flex flex-wrap gap-2">
        {blogCategories.map((category) => (
          <Tag key={category} tone="green">
            {category}
          </Tag>
        ))}
      </div>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
