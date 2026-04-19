export type UserRole = "admin" | "client";
export type ProjectStatus = "In Progress" | "Completed" | "Delayed";
export type TaskStatus = "To Do" | "In Progress" | "Completed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: UserRole;
          phone?: string | null;
          bio?: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: UserRole;
          phone?: string | null;
          bio?: string | null;
        };
        Update: {
          name?: string | null;
          email?: string | null;
          role?: UserRole;
          phone?: string | null;
          bio?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client_id: string;
          start_date: string;
          deadline: string;
          status: ProjectStatus;
        };
        Insert: {
          name: string;
          description?: string | null;
          client_id: string;
          start_date: string;
          deadline: string;
          status?: ProjectStatus;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          client_id: string;
          start_date: string;
          deadline: string;
          status: ProjectStatus;
        }>;
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          assigned_to: string | null;
          deadline: string | null;
        };
        Insert: {
          project_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          assigned_to?: string | null;
          deadline?: string | null;
        };
        Update: Partial<{
          title: string;
          description: string | null;
          status: TaskStatus;
          assigned_to: string | null;
          deadline: string | null;
        }>;
      };
      updates: {
        Row: {
          id: string;
          project_id: string;
          content: string;
          created_by: string;
          timestamp: string;
        };
        Insert: {
          project_id: string;
          content: string;
          created_by: string;
        };
        Update: Partial<{ content: string }>;
      };
      comments: {
        Row: {
          id: string;
          update_id: string;
          user_id: string;
          comment: string;
          timestamp: string;
        };
        Insert: { update_id: string; user_id: string; comment: string };
        Update: Partial<{ comment: string }>;
      };
      files: {
        Row: {
          id: string;
          project_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
        };
        Update: Partial<{ file_url: string; file_name: string }>;
      };
      client_notes: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          note: string;
          created_at: string;
        };
        Insert: { project_id: string; user_id: string; note: string };
        Update: Partial<{ note: string }>;
      };
      task_status_audit: {
        Row: {
          id: string;
          task_id: string;
          project_id: string;
          old_status: TaskStatus;
          new_status: TaskStatus;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          task_id: string;
          project_id: string;
          old_status: TaskStatus;
          new_status: TaskStatus;
          changed_by?: string | null;
        };
        Update: Partial<{ old_status: TaskStatus; new_status: TaskStatus }>;
      };
    };
    Views: {};
    Functions: {};
  };
}
