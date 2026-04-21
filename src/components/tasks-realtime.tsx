"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function TasksRealtime({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      const channel = supabase
        .channel(`project-tasks-${projectId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
          () => router.refresh(),
        )
        .subscribe();

      return () => {
        try {
          void supabase.removeChannel(channel);
        } catch {}
      };
    } catch (err) {
      // Missing env; skip realtime subscription to avoid client crash
      return;
    }
  }, [projectId, router]);

  return <div>{children}</div>;
}
