import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { WeeklyDraftEditor } from "@/components/weekly-draft-editor";
import { getWeeklyDraft } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function DashboardMeetingPage() {
  const draft = await getWeeklyDraft();

  return (
    <main className="page-shell space-y-10 pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Meeting"
          title="本周组会草稿"
          description="把本周阅读的论文、值得复现的项目和待验证实验整理成组会材料。"
        />
        <Link href="/dashboard" className="button-link button-secondary">
          返回工作台
        </Link>
      </div>
      <WeeklyDraftEditor initialDraft={draft} />
    </main>
  );
}
