import { NextResponse } from "next/server";
import { fetchRadarSummary } from "@/lib/radar";

export async function GET() {
  const summary = await fetchRadarSummary();

  return NextResponse.json(summary);
}
