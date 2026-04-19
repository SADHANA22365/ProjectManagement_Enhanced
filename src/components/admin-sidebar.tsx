import Link from "next/link";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-[var(--border)] bg-[var(--surface)] px-6 py-8 lg:block">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Menu
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--text)]">
            Admin
          </h2>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
