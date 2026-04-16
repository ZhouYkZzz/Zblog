import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/papers", label: "论文库" },
  { href: "/radar", label: "信息雷达" },
  { href: "/about", label: "关于" }
];

export function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cloud/88 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 font-black text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-pine text-white">
            Z
          </span>
          <span>ZBlog</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold text-ink/72">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[8px] px-3 py-2 transition hover:bg-white hover:text-pine"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin ? (
            <>
              <Link href="/dashboard" className="rounded-[8px] px-3 py-2 transition hover:bg-white hover:text-pine">
                工作台
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="rounded-[8px] px-3 py-2 transition hover:bg-white hover:text-pine">
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-[8px] px-3 py-2 transition hover:bg-white hover:text-pine">
              管理登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
