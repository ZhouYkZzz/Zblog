import { NextResponse } from "next/server";
import type { HomeFocusBlock } from "@/lib/types";
import { getHomeFocusBlocks, updateHomeFocusBlocks } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const blocks = await getHomeFocusBlocks();
  return NextResponse.json({ blocks });
}

export async function PUT(request: Request) {
  const input = (await request.json()) as { blocks?: unknown };

  if (!Array.isArray(input.blocks)) {
    return NextResponse.json({ message: "blocks must be an array" }, { status: 400 });
  }

  const normalizedBlocks = input.blocks.map((block) => {
    const candidate = block as Partial<HomeFocusBlock>;
    return {
      title: typeof candidate.title === "string" ? candidate.title : "",
      text: typeof candidate.text === "string" ? candidate.text : ""
    };
  });
  const blocks = await updateHomeFocusBlocks(normalizedBlocks);

  return NextResponse.json({ blocks });
}
