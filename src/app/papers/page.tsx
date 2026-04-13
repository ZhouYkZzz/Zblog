import Link from "next/link";
import { PaperLibrary } from "@/components/paper-library";
import { SectionHeading } from "@/components/section-heading";
import { getPaperPreferences, getPapers } from "@/lib/content-store";
import { paperCategories } from "@/lib/data";

type SearchParams = Promise<{ category?: string }>;

export const dynamic = "force-dynamic";

export default async function PapersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const activeCategory = params.category ?? "全部";
  const [papers, preferences] = await Promise.all([getPapers(), getPaperPreferences()]);

  return (
    <main className="page-shell space-y-10 pt-10">
      <SectionHeading
        eyebrow="Papers"
        title="论文库"
        description="每篇论文都按研究问题、核心方法、实验结论、复现代码和可借鉴点记录，方便开题、组会和项目复盘时直接调用。"
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/papers"
          className={`rounded-[8px] border px-3 py-2 text-sm font-black ${
            activeCategory === "全部" ? "border-pine bg-pine text-white" : "border-line bg-white text-ink/70"
          }`}
        >
          全部
        </Link>
        {paperCategories.map((category) => (
          <Link
            key={category}
            href={`/papers?category=${encodeURIComponent(category)}`}
            className={`rounded-[8px] border px-3 py-2 text-sm font-black ${
              activeCategory === category ? "border-pine bg-pine text-white" : "border-line bg-white text-ink/70"
            }`}
          >
            {category}
          </Link>
        ))}
      </div>

      <PaperLibrary initialPapers={papers} initialPreferences={preferences} activeCategory={activeCategory} />
    </main>
  );
}
