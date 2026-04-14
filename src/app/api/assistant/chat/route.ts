import { NextResponse } from "next/server";
import { fetchRadarSummary } from "@/lib/radar";
import { fetchHackerNewsStories } from "@/lib/hacker-news";
import { createQwenChatResponse, type QwenChatMessage } from "@/lib/qwen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssistantRequest = {
  mode?: "chat" | "radar-papers";
  messages?: QwenChatMessage[];
};

type ChatStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
};

function sanitizeMessages(messages: QwenChatMessage[] = []) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message.role))
    .filter((message) => message.content.trim().length > 0)
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 4000)
    }));
}

function latestUserMessage(messages: QwenChatMessage[] = []) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function asksForTechTrends(message: string) {
  return /技术圈|正在关注|热点|热门讨论|Hacker News|\bHN\b/i.test(message);
}

function buildSystemPrompt() {
  const today = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long"
  }).format(new Date());

  return [
    "你是 ZBlog 的研究生 AI 小助手，服务对象是杭州电子科技大学计算机技术专业研究生。",
    `当前日期是 ${today}，时区是 Asia/Shanghai。`,
    "你需要用中文回答，表达清晰，适合快速进入论文阅读、项目实践和组会准备。",
    "你可以帮助用户规划阅读、解释论文、生成博客思路、整理组会材料和拆解 todo。",
    "当用户说“帮我加入我的提醒事项”“加入提醒事项”“写入 todo”等类似请求时，只输出一份精简的 Markdown Todo 草稿。",
    "提醒事项草稿格式只保留：三级标题、列表名称 `todo`、任务清单、每项必要的简短提示。",
    "不要输出 macOS 操作说明、免责声明、复制步骤、无法直接写入系统之类的解释。",
    "默认不要主动编造具体时间、地点；用户明确说明时间地点时再写入。",
    "当系统提供 Hacker News 热点上下文时，回答必须基于这些条目，并用中文总结技术圈关注点。"
  ].join("\n");
}

async function buildRadarMessages(): Promise<QwenChatMessage[]> {
  const summary = await fetchRadarSummary();
  const papers = summary.papers.slice(0, 8);
  const paperText = papers
    .map((paper, index) =>
      [
        `${index + 1}. ${paper.title}`,
        `作者：${paper.authors.join(", ") || "未知"}`,
        `分类：${paper.category}`,
        `标签：${paper.tags.join(", ")}`,
        paper.semanticScholar?.citationCount !== undefined
          ? `Semantic Scholar 引用：${paper.semanticScholar.citationCount}，高影响引用：${paper.semanticScholar.influentialCitationCount ?? 0}`
          : "",
        paper.semanticScholar?.venue ? `发表场所：${paper.semanticScholar.venue}` : "",
        paper.semanticScholar?.tldr ? `Semantic Scholar TLDR：${paper.semanticScholar.tldr}` : "",
        `摘要：${paper.abstract}`,
        `链接：${paper.url}`
      ]
        .filter(Boolean)
        .join("\n")
    )
    .join("\n\n");

  return [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    {
      role: "user",
      content: [
        "请你先阅读我信息雷达中抓取到的 8 篇论文，用中文为我做快速介绍。",
        "输出要求：",
        "1. 按论文编号逐篇介绍。",
        "2. 每篇包含：这篇论文想解决什么问题、核心方法是什么、对我读研/做项目有什么参考价值。",
        "3. 不要翻译全部摘要，要帮我提炼。",
        "4. 最后给出一个建议阅读顺序。",
        "",
        paperText
      ].join("\n")
    }
  ];
}

async function buildHackerNewsContext(): Promise<QwenChatMessage | null> {
  try {
    const stories = await fetchHackerNewsStories({ maxResults: 10 });

    if (stories.length === 0) {
      return null;
    }

    return {
      role: "user",
      content: [
        "下面是当前 Hacker News Top Stories 的实时条目。请基于它们回答用户“技术圈正在关注什么”。",
        "输出要求：",
        "1. 用中文总结 4-6 个关注点。",
        "2. 每个关注点说明为什么值得关注。",
        "3. 最后列出 5 条值得点开的原始链接。",
        "",
        stories
          .map((story, index) =>
            [
              `${index + 1}. ${story.title}`,
              `分数：${story.score}，评论：${story.descendants}，作者：${story.by}`,
              `链接：${story.url}`
            ].join("\n")
          )
          .join("\n\n")
      ].join("\n")
    };
  } catch {
    return {
      role: "user",
      content: "Hacker News 当前暂时无法访问。请简短告诉用户稍后重试，不要编造实时热点。"
    };
  }
}

function streamTextFromQwen(upstream: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body?.getReader();

      if (!reader) {
        controller.enqueue(encoder.encode("通义千问没有返回可读取的流。"));
        controller.close();
        return;
      }

      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line.startsWith("data:")) {
              continue;
            }

            const data = line.replace(/^data:\s*/, "");

            if (data === "[DONE]") {
              continue;
            }

            try {
              const chunk = JSON.parse(data) as ChatStreamChunk;
              const content = chunk.choices?.[0]?.delta?.content;

              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              continue;
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n流式输出中断，请稍后重试。"));
      } finally {
        controller.close();
      }
    }
  });
}

export async function POST(request: Request) {
  const input = (await request.json()) as AssistantRequest;
  const cleanedMessages = sanitizeMessages(input.messages);
  const trendContext =
    input.mode !== "radar-papers" && asksForTechTrends(latestUserMessage(cleanedMessages))
      ? await buildHackerNewsContext()
      : null;
  const messages =
    input.mode === "radar-papers"
      ? await buildRadarMessages()
      : [
          {
            role: "system" as const,
            content: buildSystemPrompt()
          },
          ...(trendContext ? [trendContext] : []),
          ...cleanedMessages
        ];

  try {
    const upstream = await createQwenChatResponse({
      messages,
      stream: true,
      temperature: input.mode === "radar-papers" ? 0.25 : 0.45
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          message: `通义千问 API request failed: ${upstream.status}`
        },
        { status: 502 }
      );
    }

    return new Response(streamTextFromQwen(upstream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "AI 小助手暂时不可用。"
      },
      { status: 400 }
    );
  }
}
