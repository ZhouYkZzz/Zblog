import { NextResponse } from "next/server";
import { fetchHackerNewsStories } from "@/lib/hacker-news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = await fetchHackerNewsStories({ maxResults: 12 });

    return NextResponse.json({
      stories,
      source: "Hacker News",
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Hacker News 暂时不可用。"
      },
      { status: 502 }
    );
  }
}
