import { requireRole } from "@/lib/auth";
import { updateUserProfile } from "@/lib/actions";
import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { getInitials } from "@/lib/format";

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { profile, auth } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const params = await searchParams;

  const name = userProfile.name || "";
  const email = auth.email || userProfile.email || "";
  const initials = getInitials(name || null, email || null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 700, width: "100%" }}>
          <div style={{ marginBottom: "2rem" }} className="animate-fade-up">
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>My Profile</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Manage your account details and preferences
            </p>
          </div>

          {params.error && <div className="alert alert-error" style={{ marginBottom: "1.25rem" }}>{params.error}</div>}
          {params.success && <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>{params.success}</div>}

          {/* Avatar section */}
          <div className="card animate-fade-up" style={{ padding: "1.75rem", marginBottom: "1.5rem", animationDelay: "0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--purple-soft)", color: "var(--purple)",
                fontSize: "1.25rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                border: "3px solid var(--purple-soft)",
                boxShadow: "0 0 0 4px rgba(124,58,237,0.1)",
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.125rem" }}>{name || "No name set"}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{email}</p>
                <span style={{ display: "inline-block", marginTop: "0.375rem", fontSize: "0.7rem", fontWeight: 700, background: "var(--purple-soft)", color: "var(--purple)", borderRadius: 999, padding: "0.15rem 0.625rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card animate-fade-up" style={{ padding: "1.75rem", animationDelay: "0.1s" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Edit Profile</h2>
            <form action={updateUserProfile} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <input type="hidden" name="redirect_to" value="/admin/profile" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Name</label>
                  <input type="text" name="name" defaultValue={name} placeholder="Your full name" className="input" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email Address</label>
                  <input type="email" name="email" defaultValue={email} placeholder="your@email.com" className="input" required />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone (optional)</label>
                <input type="tel" name="phone" placeholder="+1 (555) 000-0000" className="input" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bio (optional)</label>
                <textarea name="bio" rows={3} placeholder="Tell us a bit about yourself..." className="input" style={{ resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                <button type="submit" className="btn btn-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
