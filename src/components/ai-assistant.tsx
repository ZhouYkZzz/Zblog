"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type TodoDraft = {
  id: string;
  title: string;
  dueAt: string;
  location: string;
  notes: string;
  selected: boolean;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "你好，我是 ZBlog 小助手。你可以让我解释论文、整理组会思路、陪你正常对话，也可以让我从对话里生成 Todo 草稿，审核后写入 macOS 提醒事项的 todo 列表。"
  }
];

function normalizeDatetimeInput(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("可以开始对话。");
  const [todoDrafts, setTodoDrafts] = useState<TodoDraft[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, todoDrafts, open]);

  async function readStreamingResponse(response: Response, assistantIndex: number) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("没有收到可读取的流式输出。");
    }

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      setMessages((current) =>
        current.map((message, index) =>
          index === assistantIndex ? { ...message, content: message.content + chunk } : message
        )
      );
    }
  }

  async function sendMessage(text: string, mode: "chat" | "radar-papers" = "chat") {
    const trimmed = text.trim();

    if (busy || (mode === "chat" && !trimmed)) {
      return;
    }

    const visibleUserText =
      mode === "radar-papers"
        ? "请阅读信息雷达里的 8 篇最新论文，并给我中文介绍。"
        : trimmed;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: visibleUserText }, { role: "assistant", content: "" }];
    const assistantIndex = nextMessages.length - 1;

    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setStatus(mode === "radar-papers" ? "正在读取信息雷达并流式生成中文介绍..." : "正在流式回复...");

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: nextMessages.slice(0, -1)
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "AI 小助手请求失败。");
      }

      await readStreamingResponse(response, assistantIndex);
      setStatus("回复完成。");
    } catch (error) {
      setMessages((current) =>
        current.map((message, index) =>
          index === assistantIndex
            ? {
                ...message,
                content: error instanceof Error ? error.message : "AI 小助手暂时不可用。"
              }
            : message
        )
      );
      setStatus("请求失败，请检查 API_KEY 或稍后重试。");
    } finally {
      setBusy(false);
    }
  }

  async function extractTodos() {
    if (busy) {
      return;
    }

    setBusy(true);
    setStatus("正在从当前对话生成 Todo 草稿...");

    try {
      const response = await fetch("/api/assistant/todos/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Todo 草稿生成失败。");
      }

      const data = (await response.json()) as {
        todos: Array<{ title: string; dueAt?: string; location?: string; notes?: string }>;
      };
      const drafts = data.todos.map((todo, index) => ({
        id: `${Date.now()}-${index}`,
        title: todo.title,
        dueAt: normalizeDatetimeInput(todo.dueAt),
        location: todo.location ?? "",
        notes: todo.notes ?? "",
        selected: true
      }));

      setTodoDrafts(drafts);
      setStatus(drafts.length > 0 ? "Todo 草稿已生成，请先审核再写入提醒事项。" : "当前对话里没有抽取到明确 todo。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Todo 草稿生成失败。");
    } finally {
      setBusy(false);
    }
  }

  async function writeTodosToReminders() {
    const todos = todoDrafts
      .filter((todo) => todo.selected && todo.title.trim().length > 0)
      .map((todo) => ({
        title: todo.title.trim(),
        dueAt: todo.dueAt ? new Date(todo.dueAt).toISOString() : undefined,
        location: todo.location.trim() || undefined,
        notes: todo.notes.trim() || undefined
      }));

    if (todos.length === 0 || busy) {
      setStatus("请至少保留一个要写入的 todo。");
      return;
    }

    setBusy(true);
    setStatus("正在写入 macOS 提醒事项的 todo 列表...");

    try {
      const response = await fetch("/api/assistant/todos/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos })
      });

      const data = (await response.json().catch(() => null)) as { message?: string; count?: number } | null;

      if (!response.ok) {
        throw new Error(data?.message || "写入提醒事项失败。");
      }

      setStatus(`已写入 ${data?.count ?? todos.length} 条提醒事项。`);
      setTodoDrafts([]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "写入提醒事项失败。");
    } finally {
      setBusy(false);
    }
  }

  function updateTodo(id: string, field: keyof TodoDraft, value: string | boolean) {
    setTodoDrafts((current) =>
      current.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              [field]: value
            }
          : todo
      )
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] flex-col items-end gap-3">
      {open ? (
        <section className="card flex h-[min(680px,calc(100vh-96px))] w-[min(430px,calc(100vw-40px))] flex-col overflow-hidden bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-line p-4">
            <div>
              <p className="text-xs font-black uppercase text-coral">AI Assistant</p>
              <h2 className="mt-1 text-xl font-black text-ink">ZBlog 小助手</h2>
              <p className="mt-1 text-xs leading-5 text-ink/58">{status}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-[8px] border border-line px-3 py-2 text-sm font-black text-ink/64 transition hover:text-pine"
            >
              收起
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-line p-3">
            <button
              type="button"
              onClick={() => sendMessage("", "radar-papers")}
              disabled={busy}
              className="button-link button-secondary min-h-9 px-3 text-sm"
            >
              阅读今日 8 篇论文
            </button>
            <button
              type="button"
              onClick={extractTodos}
              disabled={busy}
              className="button-link button-secondary min-h-9 px-3 text-sm"
            >
              生成 Todo 草稿
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-cloud/40 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] whitespace-pre-wrap rounded-[8px] border px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-pine bg-pine text-white"
                      : "border-line bg-white text-ink/78"
                  }`}
                >
                  {message.content || "正在生成..."}
                </div>
              </div>
            ))}

            {todoDrafts.length > 0 ? (
              <div className="rounded-[8px] border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-ink">Todo 草稿</p>
                  <button
                    type="button"
                    onClick={writeTodosToReminders}
                    disabled={busy}
                    className="button-link button-primary min-h-9 px-3 text-sm"
                  >
                    写入 todo
                  </button>
                </div>
                <p className="mt-2 text-xs leading-5 text-ink/58">
                  默认只写入事件名称。需要时间或地点时，可以先在这里补充。
                </p>
                <div className="mt-3 space-y-3">
                  {todoDrafts.map((todo) => (
                    <div key={todo.id} className="space-y-2 rounded-[8px] border border-line p-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-ink">
                        <input
                          type="checkbox"
                          checked={todo.selected}
                          onChange={(event) => updateTodo(todo.id, "selected", event.target.checked)}
                        />
                        写入这条
                      </label>
                      <input
                        value={todo.title}
                        onChange={(event) => updateTodo(todo.id, "title", event.target.value)}
                        className="w-full rounded-[8px] border border-line px-3 py-2 text-sm outline-none focus:border-pine"
                        placeholder="Todo 名称"
                      />
                      <input
                        type="datetime-local"
                        value={todo.dueAt}
                        onChange={(event) => updateTodo(todo.id, "dueAt", event.target.value)}
                        className="w-full rounded-[8px] border border-line px-3 py-2 text-sm outline-none focus:border-pine"
                      />
                      <input
                        value={todo.location}
                        onChange={(event) => updateTodo(todo.id, "location", event.target.value)}
                        className="w-full rounded-[8px] border border-line px-3 py-2 text-sm outline-none focus:border-pine"
                        placeholder="地点，可留空"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              rows={3}
              className="w-full resize-none rounded-[8px] border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-pine"
              placeholder="和小助手对话，Shift + Enter 换行"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-ink/52">写入提醒事项前一定会先让你审核。</p>
              <button type="submit" disabled={busy || input.trim().length === 0} className="button-link button-primary min-h-9 px-4 text-sm">
                发送
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-[8px] border border-pine bg-pine px-4 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(24,33,31,0.18)]"
      >
        AI 小助手
      </button>
    </div>
  );
}
