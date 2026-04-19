"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLink = { href: string; label: string; icon?: string };

interface SidebarProps {
  title: string;
  subtitle?: string;
  links: SidebarLink[];
}

const ICONS: Record<string, string> = {
  Home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  Projects: "M3 3h18v18H3zM3 9h18M9 21V9",
  Tasks: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  Updates: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  Files: "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7",
  Dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  Users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
};

function SvgIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {path.split(' M').map((p, i) => (
        <path key={i} d={i === 0 ? p : 'M' + p} />
      ))}
    </svg>
  );
}

export default function Sidebar({ title, subtitle, links }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>TaskFlow</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 500 }}>{title} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.875rem 0.875rem', overflowY: 'auto' }}>
        {subtitle && (
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 0.25rem', marginBottom: '0.5rem' }}>
            {subtitle}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + '/'));
            const iconPath = ICONS[link.label] || ICONS.Dashboard;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link${isActive ? ' active' : ''}`}
              >
                <SvgIcon path={iconPath} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.875rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center' }}>
          TaskFlow
        </p>
      </div>
    </aside>
  );
}
