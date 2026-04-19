import Link from "next/link";
import { signIn } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>TaskFlow</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: -1 }}>Project Manager</p>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>
            Sign in to continue to your workspace.
          </p>

          {params.error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {params.error}
            </div>
          )}

          <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input type="email" name="email" required placeholder="john@example.com" className="input" autoComplete="email" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
              </div>
              <input type="password" name="password" required placeholder="Enter your password" className="input" autoComplete="current-password" />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
