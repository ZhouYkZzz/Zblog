"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { AssistantAvatar } from "./assistant-avatar";

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

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${token}-${match.index}`} className="font-black text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`${token}-${match.index}`} className="rounded-[6px] bg-cloud px-1.5 py-0.5 font-mono text-[0.92em] text-pine">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);

      if (linkMatch) {
        nodes.push(
          <a
            key={`${token}-${match.index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-pine underline underline-offset-4"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}

function renderList(lines: string[], ordered: boolean, key: string) {
  if (ordered) {
    const start = Number(lines[0]?.match(/^(\d+)\.\s+/)?.[1] ?? 1);

    return (
      <ol key={key} start={start} className="list-decimal space-y-1 pl-5">
        {lines.map((line, index) => {
          const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
          const content = orderedMatch?.[1] ?? line;

          return <li key={`${key}-${index}`}>{renderInlineMarkdown(content)}</li>;
        })}
      </ol>
    );
  }

  return (
    <ul key={key} className="list-disc space-y-1 pl-5">
      {lines.map((line, index) => {
        const checklistMatch = line.match(/^[-*]\s+\[( |x|X)\]\s+(.+)$/);
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        const content = checklistMatch?.[2] ?? bulletMatch?.[1] ?? line;

        return (
          <li key={`${key}-${index}`} className={checklistMatch ? "list-none" : undefined}>
            {checklistMatch ? (
              <span className="flex gap-2">
                <input type="checkbox" checked={checklistMatch[1].toLowerCase() === "x"} readOnly className="mt-1" />
                <span>{renderInlineMarkdown(content)}</span>
              </span>
            ) : (
              renderInlineMarkdown(content)
            )}
          </li>
        );
      })}
    </ul>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-[8px] bg-ink p-3 text-xs leading-5 text-white">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} className="border-line" />);
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const className =
        level === 1
          ? "text-lg font-black text-ink"
          : level === 2
            ? "text-base font-black text-ink"
            : "text-sm font-black text-ink";

      blocks.push(
        <div key={`heading-${index}`} className={className}>
          {renderInlineMarkdown(headingMatch[2])}
        </div>
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-pine/40 pl-3 text-ink/68">
          {quoteLines.map((quote, quoteIndex) => (
            <p key={`quote-line-${quoteIndex}`}>{renderInlineMarkdown(quote)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+(\[[ xX]\]\s+)?/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const listLines: string[] = [];
      const ordered = /^\d+\.\s+/.test(trimmed);

      while (
        index < lines.length &&
        (/^[-*]\s+(\[[ xX]\]\s+)?/.test(lines[index].trim()) || (ordered && /^\d+\.\s+/.test(lines[index].trim())))
      ) {
        listLines.push(lines[index].trim());
        index += 1;
      }

      blocks.push(renderList(listLines, ordered, `list-${index}`));
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("```") &&
      !/^---+$/.test(lines[index].trim()) &&
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith(">") &&
      !/^[-*]\s+(\[[ xX]\]\s+)?/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="whitespace-pre-wrap">
        {renderInlineMarkdown(paragraphLines.join("\n"))}
      </p>
    );
  }

  return <div className="space-y-3">{blocks}</div>;
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState("可以开始对话。");
  const [todoDrafts, setTodoDrafts] = useState<TodoDraft[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);
  const avatarState = streaming ? "talking" : busy ? "thinking" : "idle";

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
    setStreaming(true);
    setStatus(mode === "radar-papers" ? "正在读取信息雷达并流式生成中文介绍..." : "正在流式回复...");
    stoppedRef.current = false;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        signal: abortController.signal,
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
      if (stoppedRef.current || (error instanceof DOMException && error.name === "AbortError")) {
        setStatus("已停止输出。");
        return;
      }

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
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }

      setBusy(false);
      setStreaming(false);
      stoppedRef.current = false;
    }
  }

  function stopGeneration() {
    stoppedRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setBusy(false);
    setStreaming(false);
    setStatus("已停止输出。");
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
            <div className="flex items-start gap-3">
              <AssistantAvatar state={avatarState} size="sm" showBubble />
              <div>
                <p className="text-xs font-black uppercase text-coral">AI Assistant</p>
                <h2 className="mt-1 text-xl font-black text-ink">ZBlog 小助手</h2>
                <p className="mt-1 text-xs leading-5 text-ink/58">{status}</p>
              </div>
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
            {streaming ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="button-link min-h-9 border border-coral bg-white px-3 text-sm text-coral"
              >
                停止输出
              </button>
            ) : null}
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
                  {message.role === "assistant" ? (
                    message.content ? <MarkdownMessage content={message.content} /> : "正在生成..."
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {todoDrafts.length > 0 ? (
              <div className="rounded-[8px] border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-ink">Todo 草稿</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTodoDrafts([])}
                      disabled={busy}
                      className="button-link button-secondary min-h-9 px-3 text-sm"
                    >
                      关闭
                    </button>
                    <button
                      type="button"
                      onClick={writeTodosToReminders}
                      disabled={busy}
                      className="button-link button-primary min-h-9 px-3 text-sm"
                    >
                      写入 todo
                    </button>
                  </div>
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
        className="flex items-center gap-2 rounded-[8px] border border-pine bg-pine py-2 pl-2 pr-4 text-sm font-black text-white shadow-[0_12px_35px_rgba(24,33,31,0.18)]"
      >
        <span className="rounded-[8px] bg-white/94 p-0.5">
          <AssistantAvatar state={avatarState} size="sm" />
        </span>
        <span>AI 小助手</span>
      </button>
    </div>
  );
}
