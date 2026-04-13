import { NextResponse } from "next/server";
import { addPaperToLibrary, getPapers } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const papers = await getPapers();
  return NextResponse.json({ papers });
}

export async function POST(request: Request) {
  const input = await request.json();
  const result = await addPaperToLibrary(input);
  return NextResponse.json(result, { status: result.created ? 201 : 200 });
}
