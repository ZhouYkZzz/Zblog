import type { Metadata } from "next";
import { AiAssistant } from "@/components/ai-assistant";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZBlog | 研究生博客与信息工作台",
  description: "杭州电子科技大学计算机技术研究生的个人博客、论文库和技术趋势雷达。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        {children}
        <AiAssistant />
        <SiteFooter />
      </body>
    </html>
  );
}
