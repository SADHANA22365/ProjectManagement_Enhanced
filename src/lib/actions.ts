"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createSupabaseServerActionClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

const isNextRedirectError = (error: unknown): error is { digest: string } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
};

export const signIn = async (formData: FormData) => {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const supabase = await createSupabaseServerActionClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const message = error.message === "Email not confirmed"
        ? "Please confirm your email from your inbox, then sign in."
        : error.message;
      redirect(`/login?error=${encodeURIComponent(message)}`);
    }
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Unknown error";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }
  redirect("/dashboard");
};

export const signUp = async (formData: FormData) => {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const fullName = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "client").trim();
  const validRole = role === "admin" ? "admin" : "client";

  const supabase = await createSupabaseServerActionClient();
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: validRole },
      },
    });
    if (error) {
      redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }
    // Upsert the user profile with the chosen role
    if (data.user) {
      const supabaseAdmin: any = await createSupabaseServerClient();
      await supabaseAdmin.from("users").upsert({
        id: data.user.id,
        name: fullName,
        email: email,
        role: validRole,
      });
    }
  } catch (error) {
    if (isNextRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "Unknown error";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }
  redirect("/dashboard");
};

export const signOut = async () => {
  const supabase = await createSupabaseServerActionClient();
  await supabase.auth.signOut();
  redirect("/login");
};

export const updateUserProfile = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const redirectTo = String(formData.get("redirect_to") || "/dashboard");

  const updates: Record<string, string> = { name };
  if (phone) updates.phone = phone;
  if (bio) updates.bio = bio;

  // Try updating the users table; if a column referenced in `updates` doesn't exist
  // (e.g., `phone` column not present in some schemas), strip that key and retry.
  let { error } = await supabase.from("users").update(updates).eq("id", auth.user.id);
  if (error) {
    const msg = String(error.message || "").toLowerCase();
    const missingColumnMatch = msg.match(/could not find the '([a-z0-9_]+)' column/);
    if (missingColumnMatch && missingColumnMatch[1]) {
      const col = missingColumnMatch[1];
      // remove the missing column from updates and retry
      if (col in updates) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete updates[col];
        const retry = await supabase.from("users").update(updates).eq("id", auth.user.id);
        if (retry.error) {
          redirect(`${redirectTo}?error=${encodeURIComponent(retry.error.message)}`);
        }
      } else {
        redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
      }
    } else {
      redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Update auth email if changed
  if (email && email !== auth.user.email) {
    await supabase.auth.updateUser({ email });
    await supabase.from("users").update({ email }).eq("id", auth.user.id);
  }

  revalidatePath("/admin");
  revalidatePath("/client");
  revalidatePath("/dashboard");
  redirect(`${redirectTo}?success=Profile+updated+successfully`);
};

export const createProject = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const payload = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    client_id: String(formData.get("client_id") || "").trim(),
    start_date: String(formData.get("start_date") || "").trim(),
    deadline: String(formData.get("deadline") || "").trim(),
    status: String(formData.get("status") || "In Progress"),
  };
  if (!payload.name || !payload.client_id || !payload.start_date || !payload.deadline) {
    redirect("/admin/projects?error=Please+fill+all+required+project+fields");
  }
  const { error } = await supabase.from("projects").insert(payload);
  if (error) redirect(`/admin/projects?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
  redirect("/admin/projects?success=Project+created+successfully");
};

export const updateProject = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const id = String(formData.get("id") || "");
  const updates = {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    status: String(formData.get("status") || "In Progress"),
    deadline: String(formData.get("deadline") || ""),
  };
  await supabase.from("projects").update(updates).eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath(`/client/projects/${id}`);
};

export const deleteProject = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const id = String(formData.get("id") || "");
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
};

export const createTask = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const payload = {
    project_id: String(formData.get("project_id") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    status: String(formData.get("status") || "To Do"),
    assigned_to: String(formData.get("assigned_to") || "").trim() || null,
    deadline: String(formData.get("deadline") || "").trim() || null,
  };
  if (!payload.project_id || !payload.title) {
    redirect("/admin/tasks?error=Project+and+task+title+are+required");
  }
  const { error } = await supabase.from("tasks").insert(payload);
  if (error) redirect(`/admin/tasks?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/projects/${payload.project_id}`);
  revalidatePath(`/client/projects/${payload.project_id}`);
  redirect("/admin/tasks?success=Task+created+successfully");
};

export const updateTask = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const id = String(formData.get("id") || "");
  const projectId = String(formData.get("project_id") || "");
  const updates = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    status: String(formData.get("status") || "To Do"),
    assigned_to: String(formData.get("assigned_to") || "") || null,
    deadline: String(formData.get("deadline") || "") || null,
  };
  await supabase.from("tasks").update(updates).eq("id", id);
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/client/projects/${projectId}`);
};

export const deleteTask = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const id = String(formData.get("id") || "");
  const projectId = String(formData.get("project_id") || "");
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/projects/${projectId}`);
};

export const updateTaskStatus = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "To Do");
  const projectId = String(formData.get("project_id") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("id, role").eq("id", auth.user.id).single();

  if (profile?.role !== "admin") {
    const { data: project } = await supabase
      .from("projects").select("client_id").eq("id", projectId).single();
    if (!project || project.client_id !== auth.user.id) redirect("/dashboard/client");
  }

  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) {
    const base = profile?.role === "admin" ? "/admin/projects" : "/client/projects";
    redirect(`${base}/${projectId}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/client/projects/${projectId}`);
};

export const createUpdate = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const project_id = String(formData.get("project_id") || "");
  const content = String(formData.get("content") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  await supabase.from("updates").insert({ project_id, content, created_by: auth.user.id });
  revalidatePath(`/admin/projects/${project_id}`);
  revalidatePath(`/client/projects/${project_id}`);
  revalidatePath("/admin/updates");
};

export const createComment = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerActionClient();
  const update_id = String(formData.get("update_id") || "");
  const comment = String(formData.get("comment") || "");
  const project_id = String(formData.get("project_id") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  await supabase.from("comments").insert({ update_id, user_id: auth.user.id, comment });
  revalidatePath(`/admin/projects/${project_id}`);
  revalidatePath(`/client/projects/${project_id}`);
};

export const insertFileRecord = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerClient();
  const project_id = String(formData.get("project_id") || "");
  const file_url = String(formData.get("file_url") || "");
  const file_name = String(formData.get("file_name") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  await supabase.from("files").insert({ project_id, file_url, file_name, uploaded_by: auth.user.id });
  revalidatePath(`/admin/projects/${project_id}`);
  revalidatePath(`/client/projects/${project_id}`);
  revalidatePath("/admin/files");
};

export const deleteFile = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerClient();
  const fileId = String(formData.get("id") || "");
  const projectId = String(formData.get("project_id") || "");
  const fileUrl = String(formData.get("file_url") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("id, role").eq("id", auth.user.id).single();
  if (profile?.role !== "admin") {
    const { data: project } = await supabase.from("projects").select("client_id").eq("id", projectId).single();
    if (!project || project.client_id !== auth.user.id) redirect("/dashboard/client");
  }
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "project-files";
  if (fileUrl) await supabase.storage.from(bucketName).remove([fileUrl]);
  await supabase.from("files").delete().eq("id", fileId);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/client/projects/${projectId}`);
  revalidatePath("/admin/files");
};

export const createClientNote = async (formData: FormData) => {
  const supabase: any = await createSupabaseServerClient();
  const project_id = String(formData.get("project_id") || "");
  const note = String(formData.get("note") || "");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  await supabase.from("client_notes").insert({ project_id, user_id: auth.user.id, note });
  revalidatePath(`/admin/projects/${project_id}`);
  revalidatePath(`/client/projects/${project_id}`);
};
