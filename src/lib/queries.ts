import { createSupabaseServerClient } from "@/lib/supabase/server";

export const fetchProjectsForAdmin = async () => {
  const supabase: any = await createSupabaseServerClient();
  return supabase
    .from("projects")
    .select("*, users(name, email), tasks(status)")
    .order("deadline", { ascending: true });
};

export const fetchProjectsForClient = async (userId: string) => {
  const supabase: any = await createSupabaseServerClient();
  return supabase
    .from("projects")
    .select("*")
    .eq("client_id", userId)
    .order("deadline", { ascending: true });
};

export const fetchProjectDetails = async (projectId: string) => {
  const supabase: any = await createSupabaseServerClient();

  const project = await supabase
    .from("projects")
    .select("*, users(name, email)")
    .eq("id", projectId)
    .single();

  const tasks = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("deadline", { ascending: true });

  const updates = await supabase
    .from("updates")
    .select("*, users(name, role, email), comments(*, users(name, role, email))")
    .eq("project_id", projectId)
    .order("timestamp", { ascending: false });

  const files = await supabase
    .from("files")
    .select("*, users(name, role, email)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const clientNotes = await supabase
    .from("client_notes")
    .select("*, users(name, role, email)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  const audit = await supabase
    .from("task_status_audit")
    .select("*, tasks(title), users(name, role, email)")
    .eq("project_id", projectId)
    .order("changed_at", { ascending: false });

  return { project, tasks, updates, files, clientNotes, audit };
};

export const fetchDashboardCounts = async () => {
  const supabase: any = await createSupabaseServerClient();
  const response:
    | { data: { status: string }[] | null }
    | null = await supabase.from("projects").select("id, status");
  const all = response?.data ?? null;
  const total = all?.length ?? 0;
  const active = all?.filter((item) => item.status === "In Progress").length ?? 0;
  const completed =
    all?.filter((item) => item.status === "Completed").length ?? 0;
  return { total, active, completed };
};

export const fetchRecentAudit = async () => {
  const supabase: any = await createSupabaseServerClient();
  return supabase
    .from("task_status_audit")
    .select("*, tasks(title), users(name, role, email)")
    .order("changed_at", { ascending: false })
    .limit(8);
};
