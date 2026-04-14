import { NextResponse } from "next/server";
import { fetchRadarSummary } from "@/lib/radar";
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
    "默认不要主动编造具体时间、地点；用户明确说明时间地点时再写入。"
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
        `摘要：${paper.abstract}`,
        `链接：${paper.url}`
      ].join("\n")
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
  const messages =
    input.mode === "radar-papers"
      ? await buildRadarMessages()
      : [
          {
            role: "system" as const,
            content: buildSystemPrompt()
          },
          ...sanitizeMessages(input.messages)
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
