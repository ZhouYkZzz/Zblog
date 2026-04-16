import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isWriteMethod, verifyAdminSession } from "@/lib/auth";

const adminOnlyPrefixes = ["/dashboard", "/api/assistant", "/api/papers/summarize"];
const authPrefixes = ["/api/auth"];

function isProtectedPath(pathname: string) {
  return adminOnlyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isWriteApi(pathname: string, method: string) {
  return pathname.startsWith("/api/") && !authPrefixes.some((prefix) => pathname.startsWith(prefix)) && isWriteMethod(method);
}

function externalUrl(request: NextRequest, pathname: string) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
  const url = new URL(`${protocol}://${host}`);
  url.pathname = pathname;
  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);

  if (pathname === "/login" && isAdmin) {
    const url = externalUrl(request, "/dashboard");
    return NextResponse.redirect(url);
  }

  if (!isAdmin && (isProtectedPath(pathname) || isWriteApi(pathname, request.method))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "需要管理员登录后才能执行这个操作。" }, { status: 401 });
    }

    const url = externalUrl(request, "/login");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/:path*"]
};
