import { NextResponse } from "next/server";
import { deleteBlogPost, updateBlogPost } from "@/lib/content-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const input = await request.json();
  const post = await updateBlogPost(slug, input);

  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const deleted = await deleteBlogPost(slug);

  if (!deleted) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
