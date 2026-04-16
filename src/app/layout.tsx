import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AiAssistant } from "@/components/ai-assistant";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZBlog | 研究生博客与信息工作台",
  description: "杭州电子科技大学计算机技术研究生的个人博客、论文库和技术趋势雷达。"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAdmin = await verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader isAdmin={isAdmin} />
        {children}
        {isAdmin ? <AiAssistant /> : null}
        <SiteFooter />
      </body>
    </html>
  );
}
