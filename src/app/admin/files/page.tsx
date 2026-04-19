import Sidebar from "@/components/sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteFile } from "@/lib/actions";
import { getInitials } from "@/lib/format";
import type { FileWithMeta } from "@/types/models";

const adminLinks = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/files", label: "Files" },
];

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return { icon: "🖼️", color: "var(--purple)" };
  if (["pdf"].includes(ext)) return { icon: "📄", color: "var(--danger)" };
  if (["doc","docx"].includes(ext)) return { icon: "📝", color: "var(--accent)" };
  if (["xls","xlsx","csv"].includes(ext)) return { icon: "📊", color: "var(--success)" };
  if (["zip","tar","gz"].includes(ext)) return { icon: "🗜️", color: "var(--warning)" };
  return { icon: "📎", color: "var(--muted)" };
}

export default async function AdminFilesPage() {
  const { profile } = await requireRole("admin");
  const userProfile = profile ?? { name: null, email: null, role: "admin" as const };
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as any)
    .from("files")
    .select("*, users(name, role), projects(name)")
    .order("created_at", { ascending: false });

  const files = (data ?? []) as FileWithMeta[];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar title="Admin" subtitle="Navigation" links={adminLinks} />
      <div style={{ flex: 1, marginLeft: "var(--sidebar-width)", display: "flex", flexDirection: "column" }}>
        <AdminTopbar name={userProfile.name} email={userProfile.email} role={userProfile.role} />
        <main style={{ flex: 1, padding: "2rem", maxWidth: 1100, width: "100%" }}>
          <div style={{ marginBottom: "2rem" }} className="animate-fade-up">
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Files</h1>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {files.length} file{files.length !== 1 ? "s" : ""} across all projects
            </p>
          </div>

          {files.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", color: "var(--muted)" }}>
              <p style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text)" }}>No files uploaded yet</p>
              <p style={{ marginTop: "0.25rem" }}>Files shared in projects will appear here.</p>
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface-2)" }}>
                    {["File", "Project", "Uploaded By", "Date", ""].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => {
                    const { icon } = getFileIcon(file.file_name);
                    return (
                      <tr key={file.id} className="table-row" style={{ borderBottom: i < files.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                            <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                              {file.file_name}
                            </a>
                          </div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          {file.projects?.name || "—"}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {getInitials(file.users?.name || null, file.users?.email || null)}
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{file.users?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.875rem 1rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                          {new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                            <form action={deleteFile}>
                            <input type="hidden" name="id" value={file.id} />
                            <input type="hidden" name="project_id" value={file.project_id} />
                            <input type="hidden" name="file_url" value={file.file_url} />
                            <button type="submit" className="btn btn-danger" style={{ padding: "0.3rem 0.625rem", fontSize: "0.75rem", fontWeight: 600 }}>
                              Delete
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
