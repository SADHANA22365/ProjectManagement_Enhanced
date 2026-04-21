import Link from "next/link";
import AdminTopbar from "@/components/admin-topbar";
import Sidebar from "@/components/sidebar";
import StatusBadge from "@/components/status-badge";
import ProgressBar from "@/components/progress-bar";
import { fetchDashboardCounts, fetchProjectsForAdmin } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import type { ProjectWithClient } from "@/types/models";

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

export default async function AdminPage() {
  const { profile } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const [projectsResponse, counts] = await Promise.all([
    fetchProjectsForAdmin(),
    fetchDashboardCounts(),
  ]);
  const projects = (projectsResponse.data ?? []) as ProjectWithClient[];

  const statCards = [
    { label: "Total Projects", value: counts.total, icon: "M3 3h18v18H3zM3 9h18M9 21V9", color: "var(--accent)", bg: "var(--accent-soft)" },
    { label: "In Progress", value: counts.active, icon: "M5 3v18l15-9-15-9z", color: "var(--warning)", bg: "var(--warning-soft)" },
    { label: "Completed", value: counts.completed, icon: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3", color: "var(--success)", bg: "var(--success-soft)" },
    { label: "Delayed", value: counts.total - counts.active - counts.completed, icon: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01", color: "var(--danger)", bg: "var(--danger-soft)" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />

        <main style={{ flex: 1, padding: "2rem", maxWidth: 1200, width: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }} className="animate-fade-up">
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
              Dashboard
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Welcome back, {userProfile.name?.split(" ")[0] || "Admin"} — here's your overview.
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {statCards.map((stat, i) => (
              <div key={stat.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)", padding: "1.375rem",
                  boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--muted)" }}>{stat.label}</p>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="2">
                        <path d={stat.icon} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects list */}
          <div className="card animate-fade-up" style={{ animationDelay: "0.28s", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Recent Projects</h2>
              <Link href="/admin/projects" style={{ fontSize: "0.8125rem", color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}>
                  <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
                </svg>
                <p style={{ fontWeight: 600 }}>No projects yet</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Create your first project to get started.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {projects.slice(0, 8).map((project) => {
                  const taskStatuses = project.tasks ?? [];
                  const completed = taskStatuses.filter((t) => t.status === "Completed").length;
                  const progress = taskStatuses.length ? Math.round((completed / taskStatuses.length) * 100) : 0;
                  return (
                    <Link key={project.id} href={`/admin/projects/${project.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)", padding: "1rem 1.125rem",
                        transition: "all 0.15s", cursor: "pointer",
                      }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{project.name}</p>
                            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {project.users?.name || project.users?.email || "No client"} · {taskStatuses.length} task{taskStatuses.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>
                        <ProgressBar value={progress} showLabel={false} size="sm" />
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.375rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{completed}/{taskStatuses.length} tasks done</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: progress === 100 ? "var(--success)" : "var(--muted)" }}>{progress}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
