import Link from "next/link";
import { signUp } from "@/lib/actions";

export default async function RegisterPage({
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
            Create your account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.75rem' }}>
            Join TaskFlow and start managing your projects efficiently.
          </p>

          {params.error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {params.error}
            </div>
          )}

          <form action={signUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input type="text" name="name" required placeholder="John Doe" className="input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input type="email" name="email" required placeholder="john@example.com" className="input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input type="password" name="password" required minLength={6} placeholder="Min. 6 characters" className="input" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Account Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'client', label: 'User', desc: 'View projects & tasks', icon: '👤', color: 'var(--accent)' },
                  { value: 'admin', label: 'Admin', desc: 'Full access & management', icon: '⚡', color: 'var(--purple)' },
                ].map((role) => (
                  <label key={role.value} style={{ cursor: 'pointer' }}>
                    <input type="radio" name="role" value={role.value} defaultChecked={role.value === 'client'} style={{ position: 'absolute', opacity: 0 }} className="role-radio" />
                    <div className="role-card" data-value={role.value} style={{
                      border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '0.875rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: 'var(--surface-2)',
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{role.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{role.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.125rem' }}>{role.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.5rem', padding: '0.75rem' }}>
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .role-radio:checked + .role-card {
          border-color: var(--accent) !important;
          background: var(--accent-soft) !important;
        }
        .role-card:hover { border-color: var(--border-strong) !important; }
        input[name="role"][value="admin"]:checked + .role-card {
          border-color: var(--purple) !important;
          background: var(--purple-soft) !important;
        }
      `}</style>
    </div>
  );
}
