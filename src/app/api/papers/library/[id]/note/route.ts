import { NextResponse } from "next/server";
import { updatePaperNote } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const input = await request.json();
  const paper = await updatePaperNote(id, input.note);

  if (!paper) {
    return NextResponse.json({ message: "Paper not found" }, { status: 404 });
  }

  return NextResponse.json({ paper });
}
