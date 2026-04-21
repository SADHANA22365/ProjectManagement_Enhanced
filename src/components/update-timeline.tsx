"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdateTimelineRealtime({
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
        .channel(`project-updates-${projectId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "updates", filter: `project_id=eq.${projectId}` },
          () => router.refresh(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "comments" },
          () => router.refresh(),
        )
        .subscribe();

      return () => {
        try {
          void supabase.removeChannel(channel);
        } catch {}
      };
    } catch (err) {
      // If env vars are missing (deployed without NEXT_PUBLIC_SUPABASE_*), avoid crashing the page.
      // No-op: realtime updates won't work until env is configured.
      return;
    }
  }, [projectId, router]);

  return <div>{children}</div>;
}
