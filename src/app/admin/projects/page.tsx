import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import ProgressBar from "@/components/progress-bar";
import { fetchProjectsForAdmin } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProject, deleteProject } from "@/lib/actions";
import type { ProjectWithClient } from "@/types/models";
import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { getInitials } from "@/lib/format";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

type ClientOption = { id: string; name: string | null; email: string | null };

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { profile } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const params = await searchParams;

  const [projectsResponse, clientsResponse] = await Promise.all([
    fetchProjectsForAdmin(),
    (await createSupabaseServerClient() as any).from("users").select("id, name, email").eq("role", "client").order("name", { ascending: true }),
  ]);

  const projects = (projectsResponse.data ?? []) as ProjectWithClient[];
  const clients = (clientsResponse.data ?? []) as ClientOption[];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 1200, width: "100%" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }} className="animate-fade-up">
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Projects</h1>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.125rem" }}>
                {projects.length} project{projects.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>

          {params.error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{params.error}</div>}
          {params.success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{params.success}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>
            {/* Projects grid */}
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {projects.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", color: "var(--muted)" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }}>
                    <path d="M3 3h18v18H3zM3 9h18M9 21V9"/>
                  </svg>
                  <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text)" }}>No projects yet</p>
                  <p style={{ marginTop: "0.25rem" }}>Create your first project using the form.</p>
                </div>
              ) : (
                projects.map((project, i) => {
                  const taskStatuses = project.tasks ?? [];
                  const completed = taskStatuses.filter(t => t.status === "Completed").length;
                  const progress = taskStatuses.length ? Math.round((completed / taskStatuses.length) * 100) : 0;
                  return (
                    <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "1.375rem", boxShadow: "var(--shadow-sm)", height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.875rem" }}>
                          <Link href={`/admin/projects/${project.id}`} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "0.2rem" }}>{project.name}</p>
                            <p style={{ fontSize: "0.8rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {project.description || "No description"}
                            </p>
                          </Link>
                          <StatusBadge status={project.status} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.875rem" }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {getInitials(project.users?.name || null, project.users?.email || null)}
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            {project.users?.name || project.users?.email || "No client"}
                          </span>
                        </div>

                        <div style={{ marginTop: "auto" }}>
                          <ProgressBar value={progress} size="sm" />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.875rem" }}>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                {taskStatuses.length} task{taskStatuses.length !== 1 ? "s" : ""}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                              <form action={deleteProject}>
                                <input type="hidden" name="id" value={project.id} />
                                <input type="hidden" name="project_id" value={project.id} />
                                <input type="hidden" name="redirect_to" value="/admin/projects" />
                                <ConfirmSubmitButton confirmMessage={"Delete this project?"} title="Delete" className="" >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                  </svg>
                                </ConfirmSubmitButton>
                              </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Create project form */}
            <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "80px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Project
              </h2>
              <form action={createProject} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {[
                  { name: "name", label: "Project Name *", type: "text", placeholder: "e.g. Website Redesign" },
                ].map(field => (
                  <div key={field.name}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{field.label}</label>
                    <input name={field.name} type={field.type} placeholder={field.placeholder} required className="input" />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Client *</label>
                  <select name="client_id" required defaultValue="" className="input">
                    <option value="" disabled>Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email || c.id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
                  <select name="status" defaultValue="In Progress" className="input">
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Delayed</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Start Date *</label>
                    <input name="start_date" type="date" required className="input" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline *</label>
                    <input name="deadline" type="date" required className="input" />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                  <textarea name="description" placeholder="Project overview..." rows={3} className="input" style={{ resize: "vertical" }} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "0.25rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create Project
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
