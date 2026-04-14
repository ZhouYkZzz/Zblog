import { NextResponse } from "next/server";
import { completeQwenText, type QwenChatMessage } from "@/lib/qwen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExtractTodosRequest = {
  messages?: QwenChatMessage[];
};

type TodoDraft = {
  title: string;
  dueAt?: string;
  location?: string;
  notes?: string;
};

function sanitizeMessages(messages: QwenChatMessage[] = []) {
  return messages
    .filter((message) => ["user", "assistant"].includes(message.role))
    .filter((message) => message.content.trim().length > 0)
    .slice(-16)
    .map((message) => `${message.role === "user" ? "用户" : "助手"}：${message.content.slice(0, 3000)}`)
    .join("\n\n");
}

function parseTodos(text: string): TodoDraft[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const raw = jsonMatch ? jsonMatch[0] : text;
  const parsed = JSON.parse(raw) as Partial<TodoDraft>[];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((todo) => ({
      title: todo.title?.trim() ?? "",
      dueAt: todo.dueAt?.trim() || undefined,
      location: todo.location?.trim() || undefined,
      notes: todo.notes?.trim() || undefined
    }))
    .filter((todo) => todo.title.length > 0)
    .slice(0, 12);
}

export async function POST(request: Request) {
  const input = (await request.json()) as ExtractTodosRequest;
  const conversation = sanitizeMessages(input.messages);

  if (!conversation) {
    return NextResponse.json({ todos: [] });
  }

  try {
    const text = await completeQwenText(
      [
        {
          role: "system",
          content: [
            "你是一个待办事项抽取器。请只输出 JSON 数组，不要输出 Markdown。",
            "数组元素字段为 title, dueAt, location, notes。",
            "默认只生成 title。除非用户明确给出日期或具体时间，否则 dueAt 必须为空。",
            "除非用户明确给出地点，否则 location 必须为空。",
            "dueAt 如需填写，请使用 ISO 8601 字符串，并按 Asia/Shanghai 理解用户的中文时间表达。",
            "不要把闲聊、解释或论文介绍强行写成 todo。"
          ].join("\n")
        },
        {
          role: "user",
          content: `请从下面这段对话中抽取用户真正想执行的待办事项：\n\n${conversation}`
        }
      ],
      0.1
    );

    return NextResponse.json({ todos: parseTodos(text) });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Todo 草稿生成失败。"
      },
      { status: 400 }
    );
  }
}
