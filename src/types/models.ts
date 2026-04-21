import type { Database } from "@/types/db";

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type UpdateRow = Database["public"]["Tables"]["updates"]["Row"];
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type FileRow = Database["public"]["Tables"]["files"]["Row"];
export type ClientNoteRow = Database["public"]["Tables"]["client_notes"]["Row"];
export type TaskStatusAuditRow =
  Database["public"]["Tables"]["task_status_audit"]["Row"];

export type ProjectWithClient = ProjectRow & {
  users?: Pick<UserProfile, "name" | "email"> | null;
  tasks?: Pick<TaskRow, "status">[];
};

export type TaskWithProject = TaskRow & {
  projects?: Pick<ProjectRow, "name"> | null;
};

export type UpdateWithMeta = UpdateRow & {
  users?: Pick<UserProfile, "name" | "role" | "email"> | null;
  projects?: Pick<ProjectRow, "name" | "status"> | null;
  comments?: (CommentRow & {
    users?: Pick<UserProfile, "name" | "role" | "email"> | null;
  })[];
};

export type FileWithMeta = FileRow & {
  users?: Pick<UserProfile, "name" | "role" | "email"> | null;
  projects?: Pick<ProjectRow, "name"> | null;
};

export type ClientNoteWithUser = ClientNoteRow & {
  users?: Pick<UserProfile, "name" | "role" | "email"> | null;
};

export type TaskStatusAuditWithUser = TaskStatusAuditRow & {
  tasks?: Pick<TaskRow, "title"> | null;
  users?: Pick<UserProfile, "name" | "role" | "email"> | null;
};
