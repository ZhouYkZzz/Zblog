import { NextResponse } from "next/server";
import { createBlogPost, getBlogPosts } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const input = await request.json();
  const post = await createBlogPost(input);

  return NextResponse.json({ post }, { status: 201 });
}
