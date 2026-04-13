import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { Tag } from "./tag";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="card overflow-hidden">
      <img src={post.coverImage} alt="" className="h-44 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="green">{post.category}</Tag>
          <span className="text-xs font-semibold text-ink/55">{post.readingMinutes} min</span>
        </div>
        <div className="space-y-2">
          <Link href={`/blog/${post.slug}`} className="block text-xl font-black leading-tight text-ink hover:text-pine">
            {post.title}
          </Link>
          <p className="line-clamp-3 text-sm leading-6 text-ink/68">{post.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}
