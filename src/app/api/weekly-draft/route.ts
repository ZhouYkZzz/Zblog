import { NextResponse } from "next/server";
import { getWeeklyDraft, updateWeeklyDraft } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const draft = await getWeeklyDraft();
  return NextResponse.json({ draft });
}

export async function PUT(request: Request) {
  const input = await request.json();
  const draft = await updateWeeklyDraft(input);

  return NextResponse.json({ draft });
}
