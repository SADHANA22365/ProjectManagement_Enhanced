import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { getInitials } from "@/lib/format";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UpdateWithMeta } from "@/types/models";

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

export default async function AdminUpdatesPage() {
  const { profile } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as any)
    .from("updates")
    .select("*, users(name, role, email), projects(name, status), comments(*, users(name, role, email))")
    .order("timestamp", { ascending: false })
    .limit(50);

  const updates = (data ?? []) as UpdateWithMeta[];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 900, width: "100%" }}>
          <div style={{ marginBottom: "2rem" }} className="animate-fade-up">
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Updates</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Activity across all projects</p>
          </div>

          {updates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>No updates yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {updates.map((update, i) => {
                const initials = getInitials(update.users?.name || null, update.users?.email || null);
                const isAdmin = update.users?.role === "admin";
                return (
                  <div key={update.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.125rem 1.25rem", boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isAdmin ? "var(--purple-soft)" : "var(--accent-soft)", color: isAdmin ? "var(--purple)" : "var(--accent)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.375rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{update.users?.name || "Unknown"}</span>
                              <span style={{ fontSize: "0.7rem", fontWeight: 600, background: isAdmin ? "var(--purple-soft)" : "var(--accent-soft)", color: isAdmin ? "var(--purple)" : "var(--accent)", borderRadius: 999, padding: "0.1rem 0.45rem", textTransform: "capitalize" }}>
                                {update.users?.role || "user"}
                              </span>
                              {update.projects && (
                                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                  in <strong style={{ color: "var(--text-secondary)" }}>{update.projects.name}</strong>
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}>
                              {new Date(update.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "var(--text)" }}>{update.content}</p>
                          {(update.comments?.length ?? 0) > 0 && (
                            <div style={{ marginTop: "0.75rem", paddingLeft: "0.75rem", borderLeft: "2px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                              {update.comments?.map(c => (
                                <div key={c.id} style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>{c.users?.name || "User"}:</span>
                                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{c.comment}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
