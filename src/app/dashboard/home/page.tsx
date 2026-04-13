import Link from "next/link";
import { HomeFocusEditor } from "@/components/home-focus-editor";
import { SectionHeading } from "@/components/section-heading";
import { getHomeFocusBlocks } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const blocks = await getHomeFocusBlocks();

  return (
    <main className="page-shell space-y-10 pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Home"
          title="首页内容管理"
          description="修改首页右侧的本周阅读、工程实践和长期资产三块提示内容。"
        />
        <Link href="/dashboard" className="button-link button-secondary">
          返回工作台
        </Link>
      </div>
      <HomeFocusEditor initialBlocks={blocks} />
    </main>
  );
}
