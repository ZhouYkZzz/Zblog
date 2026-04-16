import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, cookieStore] = await Promise.all([searchParams, cookies()]);
  const isAdmin = await verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (isAdmin) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <section className="card w-full max-w-md p-8">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-rust">Admin</p>
        <h1 className="mt-3 text-3xl font-black text-ink">管理端登录</h1>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          展示端可以公开访问，写博客、改论文笔记和使用 AI 小助手需要先进入管理端。
        </p>
        {error ? <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm font-bold text-rust">密码不正确。</p> : null}
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next || "/dashboard"} />
          <label className="grid gap-2 text-sm font-bold text-ink">
            管理密码
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="rounded-[8px] border border-line bg-white px-3 py-3 font-normal outline-none focus:border-pine"
              required
            />
          </label>
          <button type="submit" className="button-link button-primary w-full">
            进入工作台
          </button>
        </form>
      </section>
    </main>
  );
}
