"use client";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import ThemeToggle from "@/components/theme-toggle";
import { getInitials } from "@/lib/format";

interface AdminTopbarProps {
  name: string | null;
  email: string | null;
  role: string;
}

export default function AdminTopbar({ name, email, role }: AdminTopbarProps) {
  const initials = getInitials(name, email);
  const isAdmin = role === "admin";
  const profilePath = isAdmin ? "/admin/profile" : "/client/profile";

  return (
    <header className="topbar">
      {/* Breadcrumb / page context — left side spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <ThemeToggle />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "var(--border)" }} />

        {/* User avatar + name */}
        <Link href={profilePath} style={{
          display: "flex", alignItems: "center", gap: "0.625rem",
          textDecoration: "none", padding: "0.3rem 0.5rem",
          borderRadius: "var(--radius)", transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: isAdmin ? "var(--purple-soft)" : "var(--accent-soft)",
            color: isAdmin ? "var(--purple)" : "var(--accent)",
            fontSize: "0.7rem", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            border: `2px solid ${isAdmin ? "rgba(124,58,237,0.2)" : "rgba(37,99,235,0.2)"}`,
          }}>
            {initials}
          </div>
          <div style={{ lineHeight: 1 }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.15rem" }}>
              {name || email || "User"}
            </p>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700,
              background: isAdmin ? "var(--purple-soft)" : "var(--accent-soft)",
              color: isAdmin ? "var(--purple)" : "var(--accent)",
              borderRadius: 999, padding: "0 0.4rem",
              letterSpacing: "0.06em", textTransform: "capitalize",
            }}>
              {role}
            </span>
          </div>
        </Link>

        {/* Sign out */}
        <form action={signOut}>
          <button type="submit" title="Sign out" style={{
            width: 32, height: 32,
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            color: "var(--muted)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--danger-soft)"; (e.currentTarget as HTMLElement).style.color = "var(--danger)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
