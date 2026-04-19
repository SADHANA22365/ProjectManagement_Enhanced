"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { insertFileRecord } from "@/lib/actions";

export default function FileUploader({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "project-files";
    const supabase = createSupabaseBrowserClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be signed in to upload files.");
      setUploading(false);
      return;
    }

    const safeProjectId = projectId.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "");
    const safeFileName = file.name.split("/").pop()?.replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
    const filePath = `${user.id}/${safeProjectId}/${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.set("project_id", projectId);
    formData.set("file_url", filePath);
    formData.set("file_name", file.name);

    await insertFileRecord(formData);
    setUploading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  };

  return (
    <div>
      <label style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.625rem",
        padding: "1.5rem",
        border: "2px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-2)",
        cursor: uploading ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        textAlign: "center",
      }}
        onMouseEnter={e => { if (!uploading) { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-muted)"; (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
      >
        {uploading ? (
          <>
            <div style={{ width: 32, height: 32, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--muted)" }}>Uploading…</p>
          </>
        ) : success ? (
          <>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--success)" }}>Uploaded!</p>
          </>
        ) : (
          <>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text)" }}>Click to upload file</p>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.125rem" }}>Any file type supported</p>
            </div>
          </>
        )}
        <input type="file" style={{ display: "none" }} onChange={handleUpload} disabled={uploading} />
      </label>
      {error && (
        <div className="alert alert-error" style={{ marginTop: "0.625rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
