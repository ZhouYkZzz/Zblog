import { NextResponse } from "next/server";
import { fallbackGitHubProjects, fetchGitHubProjects } from "@/lib/github";

export async function GET() {
  try {
    const projects = await fetchGitHubProjects({ maxResults: 12 });

    return NextResponse.json({
      source: "GitHub",
      status: "live",
      projects
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "GitHub",
        status: "fallback",
        message: error instanceof Error ? error.message : "Unknown GitHub error",
        projects: fallbackGitHubProjects()
      },
      { status: 200 }
    );
  }
}
