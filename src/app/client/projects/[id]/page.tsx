import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import ProgressBar from "@/components/progress-bar";
import TaskFilterList from "@/components/task-filter-list";
import TasksRealtime from "@/components/tasks-realtime";
import UpdateTimelineRealtime from "@/components/update-timeline";
import FileUploader from "@/components/file-uploader";
import { fetchProjectDetails } from "@/lib/queries";
import { requireRole } from "@/lib/auth";
import { createClientNote, createComment, createUpdate } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientNoteWithUser, FileWithMeta, TaskRow, UpdateWithMeta } from "@/types/models";
import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";

const clientLinks = [
  { href: "/client", label: "Dashboard" },
];

export default async function ClientProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile, auth } = await requireRole("client");
  const userProfile = profile ?? { name: null, email: null, role: "client" as const };
  const { id } = await params;
  const details = await fetchProjectDetails(id);

  const project = details.project.data;
  if (!project) notFound();
  if (project.client_id !== auth.id) redirect("/client");

  const tasks = (details.tasks.data ?? []) as TaskRow[];
  const updates = (details.updates.data ?? []) as UpdateWithMeta[];
  const files = (details.files.data ?? []) as FileWithMeta[];
  const clientNotes = (details.clientNotes.data ?? []) as ClientNoteWithUser[];

  const completed = tasks.filter(t => t.status === "Completed").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  // Fetch users for assignee display
  const supabase = await createSupabaseServerClient();
  const { data: usersData } = await (supabase as any).from("users").select("id, name, email");
  const usersMap: Record<string, string> = {};
  (usersData || []).forEach((u: any) => { usersMap[u.id] = u.name || u.email || "Unknown"; });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Client" subtitle="Navigation" links={clientLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 1200, width: "100%" }}>

          {/* Header */}
          <div className="animate-fade-up" style={{ marginBottom: "2rem" }}>
            <Link href="/client" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8125rem", color: "var(--muted)", textDecoration: "none", marginBottom: "0.5rem", fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              My Projects
            </Link>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{project.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <StatusBadge status={project.status} />
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress card */}
          <div className="card animate-fade-up" style={{ padding: "1.5rem", marginBottom: "1.5rem", animationDelay: "0.05s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.75rem" }}>
                  Overall Progress
                </p>
                <ProgressBar value={progress} size="lg" color={progress === 100 ? "green" : "blue"} />
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                  {completed} of {tasks.length} tasks completed
                </p>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                {[
                  { label: "To Do", count: tasks.filter(t => t.status === "To Do").length, color: "var(--muted)" },
                  { label: "Active", count: tasks.filter(t => t.status === "In Progress").length, color: "var(--accent)" },
                  { label: "Done", count: completed, color: "var(--success)" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.count}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {project.description && (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                {project.description}
              </p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Tasks */}
              <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "0.1s" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Tasks</h2>
                <TasksRealtime projectId={project.id}>
                  <TaskFilterList tasks={tasks} projectId={project.id} usersMap={usersMap} />
                </TasksRealtime>
              </div>

              {/* Updates */}
              <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "0.15s" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Updates</h2>
                <form action={createUpdate} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <input name="content" placeholder="Share an update with the team..." required className="input" style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Post</button>
                </form>
                <UpdateTimelineRealtime projectId={project.id}>
                  {updates.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>No updates yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {updates.map(update => (
                        <div key={update.id} style={{ paddingLeft: "0.875rem", borderLeft: "2px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>{update.users?.name || "Unknown"}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{new Date(update.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "var(--text)" }}>{update.content}</p>
                          {(update.comments?.length ?? 0) > 0 && (
                            <div style={{ marginTop: "0.5rem", paddingLeft: "0.75rem", borderLeft: "1px solid var(--border)" }}>
                              {update.comments?.map(c => (
                                <p key={c.id} style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.2rem" }}>
                                  <strong style={{ color: "var(--text-secondary)" }}>{c.users?.name || "User"}:</strong> {c.comment}
                                </p>
                              ))}
                            </div>
                          )}
                          <form action={createComment} style={{ display: "flex", gap: "0.375rem", marginTop: "0.5rem" }}>
                            <input type="hidden" name="update_id" value={update.id} />
                            <input type="hidden" name="project_id" value={project.id} />
                            <input name="comment" placeholder="Reply..." className="input" style={{ flex: 1, fontSize: "0.8rem", padding: "0.3rem 0.625rem" }} />
                            <button type="submit" className="btn btn-secondary btn-sm">Reply</button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
                </UpdateTimelineRealtime>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Files */}
              <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "0.2s" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Files</h2>
                <FileUploader projectId={project.id} />
                {files.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                    {files.map(file => (
                      <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <span style={{ fontSize: "0.8rem", color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Notes */}
              <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "0.25s" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Notes to Team</h2>
                <form action={createClientNote} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <textarea name="note" rows={3} required placeholder="Message for your project team..." className="input" style={{ resize: "vertical" }} />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>Send Note</button>
                </form>
                {clientNotes.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {clientNotes.map(note => (
                      <div key={note.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "0.75rem 0.875rem" }}>
                        <p style={{ fontSize: "0.8125rem", color: "var(--text)" }}>{note.note}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project details */}
              <div className="card animate-fade-up" style={{ padding: "1.5rem", animationDelay: "0.3s" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Details</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {[
                    { label: "Start Date", value: new Date(project.start_date).toLocaleDateString() },
                    { label: "Deadline", value: new Date(project.deadline).toLocaleDateString() },
                    { label: "Status", value: project.status },
                    { label: "Tasks", value: `${completed}/${tasks.length} completed` },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{item.label}</span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
