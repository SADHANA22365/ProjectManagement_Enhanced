import Link from "next/link";
import StatusBadge from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTask, deleteTask, updateTask } from "@/lib/actions";
import type { TaskRow } from "@/types/models";
import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { getInitials } from "@/lib/format";

type TaskListItem = TaskRow & {
  projects?: { name: string } | null;
  assignee?: { name: string | null; email: string | null } | null;
};
type ProjectOption = { id: string; name: string };
type UserOption = { id: string; name: string | null; email: string | null };

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

function AssigneeAvatar({ name, email }: { name: string | null; email: string | null }) {
  const label = name || email || "?";
  const initials = getInitials(name, email);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {initials}
      </div>
      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{label}</span>
    </div>
  );
}

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; filter?: string }>;
}) {
  const { profile } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const params = await searchParams;
  const filter = params.filter || "all";

  const supabase = await createSupabaseServerClient();
  const [tasksRes, projectsRes, usersRes] = await Promise.all([
    (supabase as any).from("tasks").select("*, projects(name)").order("deadline", { ascending: true }),
    (supabase as any).from("projects").select("id, name").order("name", { ascending: true }),
    (supabase as any).from("users").select("id, name, email").order("name", { ascending: true }),
  ]);

  let tasks = (tasksRes.data ?? []) as TaskListItem[];
  const projects = (projectsRes.data ?? []) as ProjectOption[];
  const users = (usersRes.data ?? []) as UserOption[];

  if (filter === "completed") tasks = tasks.filter(t => t.status === "Completed");
  else if (filter === "active") tasks = tasks.filter(t => t.status === "In Progress");
  else if (filter === "todo") tasks = tasks.filter(t => t.status === "To Do");

  const counts = {
    all: (tasksRes.data ?? []).length,
    completed: (tasksRes.data ?? []).filter((t: TaskListItem) => t.status === "Completed").length,
    active: (tasksRes.data ?? []).filter((t: TaskListItem) => t.status === "In Progress").length,
    todo: (tasksRes.data ?? []).filter((t: TaskListItem) => t.status === "To Do").length,
  };

  const filterTabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "todo", label: "To Do", count: counts.todo },
    { key: "active", label: "In Progress", count: counts.active },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 1200, width: "100%" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }} className="animate-fade-up">
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Tasks</h1>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.125rem" }}>
                Manage and assign tasks across all projects
              </p>
            </div>
          </div>

          {params.error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{params.error}</div>}
          {params.success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{params.success}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
            {/* Left — task list */}
            <div>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.25rem", marginBottom: "1.25rem" }}>
                {filterTabs.map(tab => (
                  <Link key={tab.key} href={`/admin/tasks?filter=${tab.key}`} style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.4rem 0.875rem", borderRadius: "calc(var(--radius) - 2px)",
                    fontSize: "0.8125rem", fontWeight: filter === tab.key ? 700 : 500,
                    color: filter === tab.key ? "var(--text)" : "var(--muted)",
                    background: filter === tab.key ? "var(--surface-2)" : "transparent",
                    textDecoration: "none", transition: "all 0.15s",
                    boxShadow: filter === tab.key ? "var(--shadow-sm)" : "none",
                  }}>
                    {tab.label}
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, background: filter === tab.key ? "var(--accent-soft)" : "var(--surface-3)", color: filter === tab.key ? "var(--accent)" : "var(--muted)", borderRadius: 999, padding: "0 0.4rem", minWidth: 18, textAlign: "center" }}>
                      {tab.count}
                    </span>
                  </Link>
                ))}
              </div>

              {tasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
                  <p style={{ fontWeight: 600 }}>No tasks found</p>
                  <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>Create a task using the form on the right.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {tasks.map((task, i) => {
                    const assignee = users.find(u => u.id === task.assigned_to);
                    return (
                      <div key={task.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem 1.125rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{task.title}</p>
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                                {task.projects?.name || "Unknown project"}
                                {task.deadline && ` · Due ${new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                              </p>
                              {task.description && (
                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                              <StatusBadge status={task.status} />
                              <form action={deleteTask}>
                                <input type="hidden" name="id" value={task.id} />
                                <input type="hidden" name="project_id" value={task.project_id} />
                                <button type="submit" title="Delete task" className="icon-btn icon-btn-danger" style={{ display: "flex", alignItems: "center" }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                  </svg>
                                </button>
                              </form>
                            </div>
                          </div>
                          {assignee && (
                            <div style={{ marginTop: "0.625rem", paddingTop: "0.625rem", borderTop: "1px solid var(--border)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                </svg>
                                <AssigneeAvatar name={assignee.name} email={assignee.email} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right — create task form */}
            <div className="card" style={{ padding: "1.5rem", position: "sticky", top: "80px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Task
              </h2>
              <form action={createTask} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project *</label>
                  <select name="project_id" required defaultValue="" className="input">
                    <option value="" disabled>Select project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Title *</label>
                  <input name="title" placeholder="e.g. Design mockups" required className="input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assign To</label>
                  <select name="assigned_to" defaultValue="" className="input">
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email || u.id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
                  <select name="status" defaultValue="To Do" className="input">
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</label>
                  <input name="deadline" type="date" className="input" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                  <textarea name="description" placeholder="Task details..." rows={3} className="input" style={{ resize: "vertical", minHeight: 80 }} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "0.25rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create Task
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
