"use client";

import ThemeToggle from "@/components/theme-toggle";
import { signOut } from "@/lib/actions";

interface TopbarProps {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function Topbar({ name, email, role }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
                {role === "admin" ? "Admin" : "Client"}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">
                {name || "Welcome back"}
              </h1>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              {role?.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{email}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--text)] transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
