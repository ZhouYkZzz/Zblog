import { NextResponse } from "next/server";
import type { Paper, PaperNote } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractOutputText(data: unknown) {
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };

  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function parseNote(text: string): PaperNote {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const raw = jsonMatch ? jsonMatch[0] : text;
  const parsed = JSON.parse(raw) as Partial<PaperNote>;

  return {
    researchQuestion: parsed.researchQuestion?.trim() || "",
    method: parsed.method?.trim() || "",
    result: parsed.result?.trim() || "",
    reproducibleCode: parsed.reproducibleCode?.trim() || "",
    takeaway: parsed.takeaway?.trim() || ""
  };
}

function fallbackNote(paper: Paper): PaperNote {
  return {
    researchQuestion: `这篇论文主要讨论：${paper.title}`,
    method: "请结合论文全文补充核心方法；当前仅基于标题和摘要生成初稿。",
    result: "请阅读实验部分后补充关键指标、数据集和对比方法。",
    reproducibleCode: paper.pdfUrl ? `先阅读 PDF：${paper.pdfUrl}` : "暂未发现代码链接，可从论文页面继续查找。",
    takeaway: paper.abstract.slice(0, 120) || "这篇论文可能与当前研究方向相关，建议补充个人判断。"
  };
}

export async function POST(request: Request) {
  const paper = (await request.json()) as Paper;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        message: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。",
        note: fallbackNote(paper)
      },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "你是计算机研究生的论文阅读助手。只输出 JSON，不要输出 Markdown。字段必须是 researchQuestion, method, result, reproducibleCode, takeaway。"
        },
        {
          role: "user",
          content: `请基于以下论文信息，为研究生论文库生成中文结构化阅读笔记初稿。\n\n标题：${paper.title}\n作者：${paper.authors.join(", ")}\n分类：${paper.category}\n标签：${paper.tags.join(", ")}\n摘要：${paper.abstract}\n链接：${paper.url}`
        }
      ]
    })
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        message: `OpenAI API request failed: ${response.status}`,
        note: fallbackNote(paper)
      },
      { status: 502 }
    );
  }

  try {
    const data = await response.json();
    const note = parseNote(extractOutputText(data));
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json(
      {
        message: "AI 返回内容解析失败，已提供本地初稿。",
        note: fallbackNote(paper)
      },
      { status: 200 }
    );
  }
}
