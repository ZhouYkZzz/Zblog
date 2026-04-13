import { NextResponse } from "next/server";
import { fallbackRadarSummary } from "@/lib/data";
import { fetchArxivPapers } from "@/lib/arxiv";

export async function GET() {
  try {
    const papers = await fetchArxivPapers({ maxResults: 12 });

    return NextResponse.json({
      source: "arXiv",
      status: "live",
      papers
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "arXiv",
        status: "fallback",
        message: error instanceof Error ? error.message : "Unknown arXiv error",
        papers: fallbackRadarSummary.papers
      },
      { status: 200 }
    );
  }
}
