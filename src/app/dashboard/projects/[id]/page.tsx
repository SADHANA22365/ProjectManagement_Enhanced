import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardProjectRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const current = await requireUser();
  const { id } = await params;

  if (current.profile?.role === "admin") {
    redirect(`/admin/projects/${id}`);
  }

  redirect(`/client/projects/${id}`);
}
