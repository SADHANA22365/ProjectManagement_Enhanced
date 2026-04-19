import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/db";

export const getCurrentUser = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) return null;

  const profileResponse = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", authData.user.id)
    .single();

  const profile = profileResponse.data as {
    id: string;
    name: string | null;
    email: string | null;
    role: UserRole;
  } | null;

  return { auth: authData.user, profile };
};

export const requireUser = async () => {
  const current = await getCurrentUser();
  if (!current?.auth || !current.profile) redirect("/login");
  return current;
};

export const requireRole = async (role: UserRole) => {
  const current = await requireUser();
  if (current.profile?.role !== role) {
    redirect(current.profile?.role === "admin" ? "/admin" : "/client");
  }
  return current;
};
