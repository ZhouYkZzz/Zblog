import { NextResponse } from "next/server";
import { updatePaperFavorite } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const input = (await request.json()) as { isFavorite?: boolean };
  const paper = await updatePaperFavorite(id, Boolean(input.isFavorite));

  if (!paper) {
    return NextResponse.json({ message: "Paper not found" }, { status: 404 });
  }

  return NextResponse.json({ paper });
}
