import { NextResponse } from "next/server";
import { getPaperPreferences, updatePaperPreferences } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const preferences = await getPaperPreferences();
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const input = await request.json();
  const preferences = await updatePaperPreferences(input);
  return NextResponse.json({ preferences });
}
