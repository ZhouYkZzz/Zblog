import Link from "next/link";
import { PaperLibrary, PaperPreferenceEditor } from "@/components/paper-library";
import { SectionHeading } from "@/components/section-heading";
import { getPaperPreferences, getPapers } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function DashboardPapersPage() {
  const [papers, preferences] = await Promise.all([getPapers(), getPaperPreferences()]);

  return (
    <main className="page-shell space-y-10 pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Paper Desk"
          title="论文收藏与偏好"
          description="收藏值得反复阅读的论文，并选择你当前重点关注的研究方向和关键词。"
        />
        <Link href="/dashboard" className="button-link button-secondary">
          返回工作台
        </Link>
      </div>

      <PaperPreferenceEditor initialPreferences={preferences} />
      <PaperLibrary initialPapers={papers} initialPreferences={preferences} activeCategory="全部" />
    </main>
  );
}
