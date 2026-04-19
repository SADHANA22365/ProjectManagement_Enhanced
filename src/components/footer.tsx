export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[var(--muted)]">
            Copyright 2026 Client Project Tracker. Built with Next.js and Supabase.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
