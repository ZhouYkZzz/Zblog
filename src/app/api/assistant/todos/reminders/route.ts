import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

type ReminderTodo = {
  title: string;
  dueAt?: string;
  location?: string;
  notes?: string;
};

type ReminderRequest = {
  todos?: ReminderTodo[];
};

function normalizeTodos(todos: ReminderTodo[] = []) {
  return todos
    .map((todo) => ({
      title: todo.title?.trim() ?? "",
      dueAt: todo.dueAt?.trim() || undefined,
      location: todo.location?.trim() || undefined,
      notes: todo.notes?.trim() || undefined
    }))
    .filter((todo) => todo.title.length > 0)
    .slice(0, 12);
}

function buildReminderScript(todos: ReminderTodo[]) {
  const payload = JSON.stringify(todos);

  return `
const Reminders = Application("Reminders");
const todos = ${payload};
let targetList = Reminders.lists.byName("todo");

if (!targetList.exists()) {
  targetList = Reminders.List({ name: "todo" });
  Reminders.lists.push(targetList);
}

todos.forEach((todo) => {
  const props = { name: todo.title };
  const bodyParts = [];

  if (todo.location) {
    bodyParts.push("地点：" + todo.location);
  }

  if (todo.notes) {
    bodyParts.push(todo.notes);
  }

  if (bodyParts.length > 0) {
    props.body = bodyParts.join("\\n");
  }

  if (todo.dueAt) {
    const dueDate = new Date(todo.dueAt);

    if (!Number.isNaN(dueDate.getTime())) {
      props.dueDate = dueDate;
    }
  }

  const reminder = Reminders.Reminder(props);
  targetList.reminders.push(reminder);
});
`;
}

export async function POST(request: Request) {
  const input = (await request.json()) as ReminderRequest;
  const todos = normalizeTodos(input.todos);

  if (todos.length === 0) {
    return NextResponse.json(
      {
        message: "没有可写入的 todo。"
      },
      { status: 400 }
    );
  }

  try {
    await execFileAsync("osascript", ["-l", "JavaScript", "-e", buildReminderScript(todos)], {
      timeout: 15000
    });

    return NextResponse.json({ ok: true, count: todos.length });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? `写入提醒事项失败：${error.message}`
            : "写入提醒事项失败。请确认已授权终端或 Node.js 访问提醒事项。"
      },
      { status: 500 }
    );
  }
}
