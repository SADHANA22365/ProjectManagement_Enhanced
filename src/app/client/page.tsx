import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import ProgressBar from "@/components/progress-bar";
import { requireRole } from "@/lib/auth";
import { fetchProjectsForClient } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import type { ProjectRow } from "@/types/models";

const clientLinks = [
  { href: "/client", label: "Dashboard" },
];

export default async function ClientPage() {
  const { profile } = await requireRole("client");
  const userProfile = profile ?? { name: null, email: null, role: "client" as const };
  const projectsRes = await fetchProjectsForClient(profile!.id);
  const projects = (projectsRes.data ?? []) as ProjectRow[];

  // Fetch task counts
  const supabase = await createSupabaseServerClient();
  const projectIds = projects.map(p => p.id);
  let tasksByProject: Record<string, { total: number; completed: number }> = {};
  if (projectIds.length > 0) {
    const { data: tasks } = await (supabase as any).from("tasks").select("project_id, status").in("project_id", projectIds);
    (tasks || []).forEach((t: any) => {
      if (!tasksByProject[t.project_id]) tasksByProject[t.project_id] = { total: 0, completed: 0 };
      tasksByProject[t.project_id].total++;
      if (t.status === "Completed") tasksByProject[t.project_id].completed++;
    });
  }

  const totalTasks = Object.values(tasksByProject).reduce((s, t) => s + t.total, 0);
  const totalDone = Object.values(tasksByProject).reduce((s, t) => s + t.completed, 0);
  const activeProjects = projects.filter(p => p.status === "In Progress").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Client" subtitle="Navigation" links={clientLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <Topbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 1100, width: "100%" }}>

          <div style={{ marginBottom: "2rem" }} className="animate-fade-up">
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Welcome, {userProfile.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Here&apos;s an overview of your projects.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { label: "My Projects", value: projects.length, icon: "M3 3h18v18H3zM3 9h18M9 21V9", color: "var(--accent)", bg: "var(--accent-soft)" },
              { label: "Active", value: activeProjects, icon: "M5 3v18l15-9-15-9z", color: "var(--warning)", bg: "var(--warning-soft)" },
              { label: "Tasks Done", value: `${totalDone}/${totalTasks}`, icon: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3", color: "var(--success)", bg: "var(--success-soft)" },
            ].map((s, i) => (
              <div key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)" }}>{s.label}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">
                        <path d={s.icon} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {projects.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", color: "var(--muted)" }}>
                <p style={{ fontWeight: 600, color: "var(--text)" }}>No projects assigned yet</p>
                <p style={{ marginTop: "0.25rem", fontSize: "0.875rem" }}>Contact your admin to get started.</p>
              </div>
            ) : (
              projects.map((project, i) => {
                const t = tasksByProject[project.id] ?? { total: 0, completed: 0 };
                const progress = t.total ? Math.round((t.completed / t.total) * 100) : 0;
                return (
                 <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                  <Link href={`/client/projects/${project.id}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "1.375rem", boxShadow: "var(--shadow-sm)", height: "100%", transition: "all 0.15s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
                          <p style={{ fontWeight: 700, color: "var(--text)" }}>{project.name}</p>
                          <StatusBadge status={project.status} />
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
                          Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <ProgressBar value={progress} size="sm" />
                        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.375rem" }}>
                          {t.completed}/{t.total} tasks
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
